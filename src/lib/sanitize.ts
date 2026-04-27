/**
 * Validação de magic bytes para garantir que o arquivo é mesmo uma imagem,
 * independente do MIME declarado pelo cliente.
 */
const SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF (WEBP completo: RIFF....WEBP)
};

export const verifyImageMagicBytes = async (file: File): Promise<boolean> => {
  const buf = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const sigs = SIGNATURES[file.type];
  if (!sigs) return false;

  const matches = sigs.some((sig) => sig.every((b, i) => buf[i] === b));
  if (!matches) return false;

  // Para WEBP, valida adicionalmente o marker "WEBP" no offset 8
  if (file.type === "image/webp") {
    const marker = String.fromCharCode(buf[8], buf[9], buf[10], buf[11]);
    return marker === "WEBP";
  }

  return true;
};

/**
 * Remove caracteres de controle e limita comprimento para inputs textuais
 * que serão exibidos em interpolações de string (ex: WhatsApp, alt text).
 */
export const sanitizeText = (input: string, maxLength = 500): string =>
  input
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1f\x7f]/g, "")
    .trim()
    .slice(0, maxLength);
