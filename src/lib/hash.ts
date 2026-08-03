/**
 * Server-side hashing helpers (Node crypto only).
 * Never trust a client-supplied hash for digital files stored in-system.
 * Do not import from Client Components — use Node/server actions only.
 */
import { createHash } from "crypto";

export type HashAlgorithm = "MD5" | "SHA-256";

export function computeSha256(buffer: Buffer | Uint8Array): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export function computeMd5(buffer: Buffer | Uint8Array): string {
  return createHash("md5").update(buffer).digest("hex");
}

/** @deprecated Prefer computeSha256 — kept as alias for existing call sites. */
export function sha256Hex(buffer: Buffer | Uint8Array): string {
  return computeSha256(buffer);
}

const MD5_HEX = /^[a-fA-F0-9]{32}$/;
const SHA256_HEX = /^[a-fA-F0-9]{64}$/;

export function normalizeHashHex(value: string): string {
  return value.trim().toLowerCase();
}

/** @deprecated Prefer normalizeHashHex */
export function normalizeSha256Hex(value: string): string {
  return normalizeHashHex(value);
}

export function detectHashAlgorithm(value: string): HashAlgorithm | null {
  const v = value.trim();
  if (SHA256_HEX.test(v)) return "SHA-256";
  if (MD5_HEX.test(v)) return "MD5";
  return null;
}

export function isValidSha256Hex(value: string): boolean {
  return SHA256_HEX.test(value.trim());
}

export function isValidMd5Hex(value: string): boolean {
  return MD5_HEX.test(value.trim());
}

/** Accept MD5 (32 hex) or SHA-256 (64 hex) from external forensic tools. */
export function isValidExternalHash(value: string): boolean {
  return detectHashAlgorithm(value) !== null;
}

export function hashesEqual(a: string, b: string): boolean {
  return normalizeHashHex(a) === normalizeHashHex(b);
}

/**
 * Safe upload detection — never use `instanceof File` (File may be undefined
 * in some Node/server runtimes and throws ReferenceError: File is not defined).
 */
export type UploadedBlob = {
  arrayBuffer: () => Promise<ArrayBuffer>;
  size: number;
  name?: string;
  type?: string;
};

export function isNonEmptyUpload(value: unknown): value is UploadedBlob {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.arrayBuffer !== "function") return false;
  if (typeof v.size !== "number" || !(v.size > 0)) return false;
  return true;
}

export type ResolveIntakeHashOk = {
  ok: true;
  hash: string;
  hashSource: "UPLOAD" | "EXTERNAL";
  algorithm: HashAlgorithm;
  fileMeta: {
    fileName: string;
    mimeType: string;
    size: number;
    buffer: Buffer;
  } | null;
};

export type ResolveIntakeHashErr = { ok: false; error: string };

/**
 * Either upload a file (server SHA-256) OR enter an external MD5/SHA-256 hash.
 * If both are present, the uploaded file wins (server-computed hash is trusted).
 */
export async function resolveIntakeHash(
  fileEntry: unknown,
  externalHashRaw: string
): Promise<ResolveIntakeHashOk | ResolveIntakeHashErr> {
  const external = externalHashRaw.trim();

  if (isNonEmptyUpload(fileEntry)) {
    const buffer = Buffer.from(await fileEntry.arrayBuffer());
    return {
      ok: true,
      hash: computeSha256(buffer),
      hashSource: "UPLOAD",
      algorithm: "SHA-256",
      fileMeta: {
        fileName: fileEntry.name || "upload.bin",
        mimeType: fileEntry.type || "application/octet-stream",
        size: buffer.length,
        buffer,
      },
    };
  }

  if (external) {
    const algorithm = detectHashAlgorithm(external);
    if (!algorithm) {
      return {
        ok: false,
        error:
          "External hash must be MD5 (32 hex chars) or SHA-256 (64 hex chars).",
      };
    }
    return {
      ok: true,
      hash: normalizeHashHex(external),
      hashSource: "EXTERNAL",
      algorithm,
      fileMeta: null,
    };
  }

  return {
    ok: false,
    error:
      "Provide a digital file upload or an externally computed hash (MD5 or SHA-256).",
  };
}
