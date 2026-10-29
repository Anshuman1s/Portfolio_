"use client";

import { ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/project-images";
import { buttonSecondary } from "./styles";

type ImageUploadProps = {
  /** Id of the file input, matching the surrounding Field. */
  id: string;
  initialUrl: string | null;
  invalid?: boolean;
};

/**
 * Screenshot picker. Sends the chosen file as `imageFile`; `imageUrl` carries the
 * current screenshot (empty once removed) so saving without a new file keeps it.
 */
export function ImageUpload({ id, initialUrl, invalid = false }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Release the object URL when it's replaced or the form unmounts.
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  // React resets the form after a submission, which clears the chosen file.
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onReset = () => setPreview(null);
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  const clearFile = () => {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    if (!file) return clearFile();

    if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      setError("Only PNG or JPG images are allowed.");
      return clearFile();
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`That file is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 4 MB.`);
      return clearFile();
    }
    setPreview(URL.createObjectURL(file));
  };

  const remove = () => {
    clearFile();
    setCurrentUrl(null);
    setError(null);
  };

  const shown = preview ?? currentUrl;

  return (
    <div className="space-y-3">
      <input type="hidden" name="imageUrl" value={currentUrl ?? ""} />

      <div className="relative aspect-[16/10] w-full max-w-sm overflow-hidden rounded-lg border border-ink/15 bg-white/60">
        {shown ? (
          <Image src={shown} alt="Screenshot preview" fill sizes="384px" unoptimized className="object-cover object-top" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted">
            <ImageIcon size={24} strokeWidth={1.5} aria-hidden />
            <span className="text-[11px]">No screenshot</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className={`${buttonSecondary} cursor-pointer focus-within:ring-2 focus-within:ring-emerald-400/40`}>
          <Upload size={14} aria-hidden />
          {shown ? "Replace" : "Choose file"}
          <input
            ref={inputRef}
            id={id}
            name="imageFile"
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
            onChange={onChange}
            aria-invalid={invalid || Boolean(error)}
            aria-describedby={`${id}-desc`}
            className="sr-only"
          />
        </label>
        {shown && (
          <button type="button" onClick={remove} className={buttonSecondary}>
            <X size={14} aria-hidden />
            Remove
          </button>
        )}
        {preview && <span className="text-[11px] text-muted">New file — saved when you submit.</span>}
      </div>

      {error && (
        <p role="alert" className="text-[11px] font-medium text-accent-hover">
          {error}
        </p>
      )}
    </div>
  );
}
