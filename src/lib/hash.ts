import "server-only";
import { createHash } from "crypto";

/**
 * Server-side SHA-256 hex digest (Node crypto only).
 * Never trust a client-supplied hash for digital files stored in-system.
 */
export function computeSha256(buffer: Buffer | Uint8Array): string {
  return createHash("sha256").update(buffer).digest("hex");
}

/** @deprecated Prefer computeSha256 — kept as alias for existing call sites. */
export function sha256Hex(buffer: Buffer | Uint8Array): string {
  return computeSha256(buffer);
}

const SHA256_HEX = /^[a-fA-F0-9]{64}$/;

export function isValidSha256Hex(value: string): boolean {
  return SHA256_HEX.test(value.trim());
}

export function normalizeSha256Hex(value: string): string {
  return value.trim().toLowerCase();
}

export function hashesEqual(a: string, b: string): boolean {
  return normalizeSha256Hex(a) === normalizeSha256Hex(b);
}
