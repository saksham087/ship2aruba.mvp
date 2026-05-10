import { useRef, useState } from "react";
import { cn } from "../lib/utils";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";

interface UploadZoneProps {
  onUpload: (fileUrl: string, fileName: string) => void;
  accept?: string;
  label?: string;
  className?: string;
}

export function UploadZone({ onUpload, accept = ".pdf,.jpg,.jpeg,.png", label = "Upload Invoice", className }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await api.upload.presign.$post({
        json: { filename: file.name, contentType: file.type },
      });
      const { url, fileUrl } = await res.json();

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      setUploadedFile(file.name);
      onUpload(fileUrl, file.name);
      toast.success("File uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload file");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className={className}>
      {uploadedFile ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-green-200 bg-green-50">
          <FileText size={20} className="text-green-600 flex-shrink-0" />
          <span className="text-sm font-medium text-green-700 flex-1 truncate">{uploadedFile}</span>
          <button
            onClick={() => setUploadedFile(null)}
            className="text-green-500 hover:text-green-700"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className={cn(
            "drop-zone border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
            isDragging ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50",
            isUploading && "pointer-events-none opacity-70"
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={32} className="text-orange-500 animate-spin" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Upload size={22} className="text-orange-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
              <p className="text-xs text-gray-400">Drag & drop or click to browse</p>
              <p className="text-xs text-gray-300 mt-1">{accept.replace(/\./g, "").toUpperCase()}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
