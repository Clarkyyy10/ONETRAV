"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadSimple } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

type PersistState = { error?: string; ok?: boolean };

export function ImageUpload({
  bucket,
  folder,
  fieldName,
  extraFields = {},
  action,
  label = "Upload image",
}: {
  bucket: string;
  folder: string;
  fieldName: string;
  extraFields?: Record<string, string>;
  action: (prev: PersistState, fd: FormData) => Promise<PersistState>;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (upErr) {
      setError("Upload failed. Please try again.");
      setBusy(false);
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const fd = new FormData();
    for (const [k, v] of Object.entries(extraFields)) fd.append(k, v);
    fd.append(fieldName, data.publicUrl);
    const res = await action({}, fd);
    if (res?.error) {
      setError(res.error);
      setBusy(false);
      return;
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-pill bg-surface px-4 py-2 text-sm font-semibold text-text ring-1 ring-border-strong transition-colors hover:bg-surface-2 disabled:opacity-60"
      >
        <UploadSimple size={16} weight="bold" />
        {busy ? "Uploading..." : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
