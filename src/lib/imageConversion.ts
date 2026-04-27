const WEBP_QUALITY = 0.86;
const MAX_IMAGE_DIMENSION = 2400;

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível processar a imagem."));
    };
    img.src = url;
  });

export const convertImageToWebP = async (file: File): Promise<File> => {
  const img = await loadImage(file);
  if (img.naturalWidth < 1 || img.naturalHeight < 1) {
    throw new Error("Imagem inválida.");
  }

  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível converter a imagem.");

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY);
  });

  if (!blob) throw new Error("Não foi possível converter a imagem para WebP.");

  return new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
    type: "image/webp",
    lastModified: Date.now(),
  });
};
