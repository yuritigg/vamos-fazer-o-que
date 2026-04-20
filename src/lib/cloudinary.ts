import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadEventImage(imageBase64: string) {
  return cloudinary.uploader.upload(imageBase64, {
    folder: "vamos-fazer-o-que/eventos",
    resource_type: "image",
  });
}

export async function uploadFileToCloudinary(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
  return uploadEventImage(base64);
}
