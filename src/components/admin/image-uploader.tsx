"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload`,
        { method: "POST", body: form },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Upload failed");
      onChange(data.secure_url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (value) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-lg border">
        <Image
          src={value}
          alt="Category"
          fill
          className="object-cover"
          sizes="300px"
        />
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-60"
    >
      {uploading ?
        <Loader2 className="size-6 animate-spin" />
      : <>
          <Upload className="size-6" />
          <span className="text-xs font-medium">Click to upload</span>
        </>
      }
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </button>
  );
}
