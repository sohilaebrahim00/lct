import { supabase } from "@/integrations/supabase/client";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // matches the storage bucket's file_size_limit
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "text/csv",
]);

export interface UploadResult {
  ok: boolean;
  path?: string;
  error?: string;
}

/**
 * Uploads one application document to the private `applications` storage
 * bucket, namespaced `{folder}/{clientToken}/{fieldName}-{originalName}` so
 * one applicant's files can never collide with or be enumerated from
 * another's (folder + random per-submission token, checked against the
 * bucket's own INSERT policy — see the 2026-08-11 migration).
 */
export async function uploadApplicationFile(
  file: File,
  folder: "driver" | "company-partner",
  clientToken: string,
  fieldName: string,
): Promise<UploadResult> {
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: "File is too large (10 MB maximum)." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "Unsupported file type. Use PDF, DOC, DOCX, XLS, CSV, JPG, PNG, or GIF." };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  const path = `${folder}/${clientToken}/${fieldName}-${safeName}`;

  const { error } = await supabase.storage.from("applications").upload(path, file, {
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    return { ok: false, error: "Upload failed. Please try again." };
  }
  return { ok: true, path };
}
