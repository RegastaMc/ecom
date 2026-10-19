"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import { toast } from "react-toastify";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  single?: boolean;
};

export function ImageUploaderMulti({
  value,
  onChange,
  max = 8,
  single = false,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const canAddMore = single ? value.length === 0 : value.length < max;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const uploads = Array.from(files).map(async (file) => {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: form,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.url as string;
      });

      const urls = await Promise.all(uploads);
      const next = single ? [urls[0]] : [...value, ...urls];
      onChange(next);
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(index: number) {
    const url = value[index];
    if (!url) return;

    // Try to delete from Cloudinary
    try {
      const parts = url.split("/upload/");
      if (parts.length === 2) {
        const pathParts = parts[1].split("/");
        const vIdx = pathParts.findIndex((p) => p.startsWith("v"));
        const startIdx = vIdx !== -1 ? vIdx + 1 : 0;
        const publicId = pathParts
          .slice(startIdx)
          .join("/")
          .replace(/\.[^/.]+$/, "");

        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId }),
        });
      }
    } catch (err) {
      console.error("Cloudinary delete failed:", err);
    }

    const next = value.filter((_, i) => i !== index);
    onChange(next);
    toast.success("Image removed");
  }

  return (
    <div className="space-y-4">
      {/* Previews */}
      {value.length > 0 && (
        <div
          className={
            single ?
              "relative aspect-video w-full max-w-md overflow-hidden rounded-xl border"
            : "grid grid-cols-2 gap-4 md:grid-cols-4"
          }
        >
          {value.map((url, i) =>
            single ?
              <div key={i} className="relative size-full">
                <Image
                  src={url}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="400px"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition hover:bg-red-600"
                >
                  <X className="size-3" />
                </button>
              </div>
            : <div key={i} className="group relative">
                <div className="relative aspect-square overflow-hidden rounded-xl border">
                  <Image
                    src={url}
                    alt={`Upload ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition group-hover:opacity-100 hover:bg-red-600"
                >
                  <X className="size-3" />
                </button>
              </div>,
          )}
        </div>
      )}

      {/* Dropzone */}
      {canAddMore && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#F5EBE0] p-8 text-center transition hover:border-[#DBA39A]/60 hover:bg-[#F5EBE0]/20"
        >
          {uploading ?
            <>
              <div className="size-6 animate-spin rounded-full border-2 border-[#DBA39A] border-t-transparent" />
              <p className="text-sm text-[#3d2c28]/60">Uploading…</p>
            </>
          : <>
              <ImageIcon className="size-10 text-[#b8a69c]" />
              <div className="text-sm text-[#3d2c28]/70">
                <span className="font-medium text-[#DBA39A]">
                  Click to upload
                </span>{" "}
                or drag and drop
              </div>
              <p className="text-xs text-[#b8a69c]">
                PNG, JPG, WEBP up to 10MB
                {single ? "" : ` · up to ${max} images`}
              </p>
            </>
          }
          <input
            ref={inputRef}
            type="file"
            multiple={!single}
            accept="image/*"
            hidden
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}
    </div>
  );
}
