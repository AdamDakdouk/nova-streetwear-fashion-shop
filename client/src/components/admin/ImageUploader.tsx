import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { uploadAdminImage } from "../../api/admin.api";
import { Spinner } from "../ui/Spinner";

interface ImageUploaderProps {
  images: string[];
  onChange: (next: string[]) => void;
  label?: string;
}

export function ImageUploader({ images, onChange, label = "Images" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    setIsUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(fileList)) {
        const url = await uploadAdminImage(file);
        uploaded.push(url);
      }
      onChange([...images, ...uploaded]);
    } catch {
      setError("Could not upload one or more images.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove(url: string) {
    onChange(images.filter((img) => img !== url));
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">{label}</p>
      <div className="flex flex-wrap gap-3">
        {images.map((url) => (
          <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-md border border-border bg-background">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              aria-label="Remove image"
              className="focus-ring absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="focus-ring flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted hover:border-ink hover:text-ink disabled:opacity-50"
        >
          {isUploading ? <Spinner className="h-5 w-5" /> : <ImagePlus className="h-5 w-5" aria-hidden="true" />}
          <span className="text-[10px] font-medium">{isUploading ? "Uploading" : "Add"}</span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
