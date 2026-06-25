import crypto from "node:crypto";

/**
 * Cifrado simétrico para la bóveda de credenciales (AES-256-GCM).
 * La clave se deriva de HUB_VAULT_KEY (env, fuera de la DB). NO es zero-knowledge:
 * el servidor puede descifrar. El acceso a descifrado exige re-login + se audita.
 */

let cachedKey: Buffer | null = null;

function key(): Buffer | null {
  if (cachedKey) return cachedKey;
  const secret = process.env.HUB_VAULT_KEY;
  if (!secret || secret.length < 16) return null;
  // Deriva una clave estable de 32 bytes (salt fijo: la clave real es HUB_VAULT_KEY).
  cachedKey = crypto.scryptSync(secret, "run72-hub-vault", 32);
  return cachedKey;
}

export function vaultReady(): boolean {
  return key() !== null;
}

/** Cifra un texto. Devuelve "iv:tag:ciphertext" en base64, o null si no hay clave. */
export function encrypt(plain: string): string | null {
  const k = key();
  if (!k) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", k, iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${ct.toString("base64")}`;
}

/** Descifra "iv:tag:ciphertext". Devuelve "" si falla o no hay clave. */
export function decrypt(payload: string | null | undefined): string {
  const k = key();
  if (!k || !payload) return "";
  try {
    const [ivB, tagB, ctB] = payload.split(":");
    const iv = Buffer.from(ivB, "base64");
    const tag = Buffer.from(tagB, "base64");
    const ct = Buffer.from(ctB, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", k, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}
