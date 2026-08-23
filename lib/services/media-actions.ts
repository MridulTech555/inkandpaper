"use server";

import { randomUUID } from "node:crypto";
import path from "node:path";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/permissions/check";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
  extensionForMimeType,
  isAllowedImageMimeType,
  sniffImageMimeType,
} from "@/lib/validation/media";

export interface MediaActionState {
  error?: string;
}

// Uploaded files are written to public/uploads on the local filesystem.
// That's fine for local development, but most production hosts (serverless
// functions, containers redeployed on every push) don't have a persistent
// filesystem — swap this for real object storage (S3, R2, Cloudinary, ...)
// behind the same action signature before shipping.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function sanitizeFilename(name: string): string {
  const withoutExtension = name.replace(/\.[^.]*$/, "");
  return (
    withoutExtension.replace(/[^a-zA-Z0-9-]/g, "-").slice(-100) || "upload"
  );
}

export async function uploadMediaAction(
  _prevState: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const user = await requireUser();

  if (!checkRateLimit(`media-upload:${user.id}`, 20, 60_000)) {
    return { error: "Too many uploads. Please try again in a minute." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { error: "File is too large. Maximum size is 5MB." };
  }

  if (!isAllowedImageMimeType(file.type)) {
    return {
      error: `Unsupported file type. Allowed: ${ALLOWED_IMAGE_MIME_TYPES.join(", ")}.`,
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // The browser-supplied `file.type` is just a client-side guess — verify
  // the actual bytes match a real image before writing anything to disk.
  const sniffedType = sniffImageMimeType(buffer);
  if (!sniffedType || !isAllowedImageMimeType(sniffedType)) {
    return { error: "That file doesn't look like a valid image." };
  }

  const extension = extensionForMimeType(sniffedType) ?? "bin";
  await mkdir(UPLOAD_DIR, { recursive: true });

  const safeName = sanitizeFilename(file.name || "upload");
  const storedFilename = `${randomUUID()}-${safeName}.${extension}`;
  await writeFile(path.join(UPLOAD_DIR, storedFilename), buffer);

  await prisma.media.create({
    data: {
      url: `/uploads/${storedFilename}`,
      filename: file.name || storedFilename,
      mimeType: sniffedType,
      size: file.size,
      uploadedBy: user.id,
    },
  });

  revalidatePath("/author/media");
  return {};
}

export async function deleteMediaAction(
  mediaId: string,
): Promise<MediaActionState> {
  const user = await requireUser();

  const media = await prisma.media.findFirst({
    where: { id: mediaId, uploadedBy: user.id },
    select: { id: true, url: true },
  });
  if (!media) {
    return { error: "You can only delete your own media." };
  }

  await prisma.media.delete({ where: { id: media.id } });

  if (media.url.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", media.url)).catch(() => {});
  }

  revalidatePath("/author/media");
  return {};
}
