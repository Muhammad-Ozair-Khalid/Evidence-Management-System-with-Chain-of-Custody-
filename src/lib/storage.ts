import "server-only";
import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export type StoredFile = {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
};

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
}

function s3Client() {
  const region = process.env.S3_REGION ?? "us-east-1";
  return new S3Client({
    region,
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials:
      process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

async function storeLocal(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<StoredFile> {
  const uploadsDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const safe = sanitizeFileName(originalName);
  const storedName = `${Date.now()}-${randomUUID().slice(0, 8)}-${safe}`;
  const absolute = path.join(uploadsDir, storedName);
  await writeFile(absolute, buffer);
  return {
    fileName: originalName,
    filePath: path.join("uploads", storedName).replace(/\\/g, "/"),
    fileSize: buffer.length,
    mimeType,
  };
}

async function storeS3(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<StoredFile> {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    throw new Error("S3_BUCKET is required when STORAGE_MODE=s3");
  }

  const key = `evidence/${new Date().getFullYear()}/${randomUUID()}-${sanitizeFileName(originalName)}`;
  const client = s3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return {
    fileName: originalName,
    filePath: `s3://${bucket}/${key}`,
    fileSize: buffer.length,
    mimeType,
  };
}

export async function storeEvidenceFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<StoredFile> {
  const mode = (process.env.STORAGE_MODE ?? "local").toLowerCase();
  if (mode === "s3") {
    return storeS3(buffer, originalName, mimeType);
  }
  return storeLocal(buffer, originalName, mimeType);
}

/** Re-read a previously stored evidence file for integrity re-hashing. */
export async function readEvidenceFile(filePath: string): Promise<Buffer> {
  if (filePath.startsWith("s3://")) {
    const without = filePath.slice("s3://".length);
    const slash = without.indexOf("/");
    if (slash < 0) throw new Error(`Invalid S3 path: ${filePath}`);
    const bucket = without.slice(0, slash);
    const key = without.slice(slash + 1);
    const client = s3Client();
    const result = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );
    const bytes = await result.Body?.transformToByteArray();
    if (!bytes) throw new Error(`Empty S3 object: ${filePath}`);
    return Buffer.from(bytes);
  }

  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  return readFile(absolute);
}
