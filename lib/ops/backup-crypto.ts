import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
const MAGIC = Buffer.from("NXBACKUP1");
const AAD = Buffer.from("naksharix/postgresql/recovery/v1");
export const MAX_BACKUP_BYTES = 64 * 1024 * 1024;
function keyOf(value: string) {
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new Error("BACKUP_KEY_INVALID");
  return Buffer.from(value, "hex");
}
export function backupChecksum(value: Uint8Array) { return createHash("sha256").update(value).digest("hex"); }
export function sealBackup(plain: Buffer, keyHex: string) {
  if (plain.length < 5 || plain.length > MAX_BACKUP_BYTES || plain.subarray(0,5).toString() !== "PGDMP")
    throw new Error("BACKUP_ARCHIVE_INVALID");
  const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", keyOf(keyHex), iv);
  cipher.setAAD(AAD);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([MAGIC, iv, cipher.getAuthTag(), ciphertext]);
}
export function openBackup(encrypted: Buffer, keyHex: string) {
  if (encrypted.length > MAX_BACKUP_BYTES + 64 || !encrypted.subarray(0,MAGIC.length).equals(MAGIC))
    throw new Error("BACKUP_ENVELOPE_INVALID");
  const start=MAGIC.length;
  const decipher=createDecipheriv("aes-256-gcm",keyOf(keyHex),encrypted.subarray(start,start+12));
  decipher.setAAD(AAD);decipher.setAuthTag(encrypted.subarray(start+12,start+28));
  const result=Buffer.concat([decipher.update(encrypted.subarray(start+28)),decipher.final()]);
  if(result.subarray(0,5).toString()!=="PGDMP")throw new Error("BACKUP_ARCHIVE_INVALID");
  return result;
}
