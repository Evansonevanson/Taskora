'use client';

import * as React from 'react';
import {
  Paperclip,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  uploadTaskAttachment,
  deleteTaskAttachment,
  getAttachmentSignedUrl,
  type TaskAttachmentRow,
} from '@/lib/actions/attachments';
import {
  ALLOWED_MIME_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  type AllowedMimeType,
} from '@/lib/validation/attachment';
import { cn } from '@/lib/utils';

export interface TaskAttachmentsManagerProps {
  taskId: string;
  initialAttachments?: TaskAttachmentRow[];
  canEdit?: boolean;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function TaskAttachmentsManager({
  taskId,
  initialAttachments = [],
  canEdit = true,
}: TaskAttachmentsManagerProps) {
  const [attachments, setAttachments] =
    React.useState<TaskAttachmentRow[]>(initialAttachments);
  const [isUploading, setIsUploading] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const file = files[0];

    // Client-side validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg('File exceeds 20MB limit. Please upload a smaller file.');
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
      setErrorMsg(
        'Invalid file type. Only JPG, PNG, WEBP, and PDF files are allowed.',
      );
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await uploadTaskAttachment(taskId, formData);
      if (!res.success || !res.data) {
        setErrorMsg(res.error || 'Failed to upload attachment');
        return;
      }

      setAttachments((prev) => [...prev, res.data as TaskAttachmentRow]);
      setSuccessMsg(`"${file.name}" uploaded successfully.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      setErrorMsg('An unexpected error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string, fileName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to remove "${fileName}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setDeletingId(attachmentId);

    try {
      const res = await deleteTaskAttachment(attachmentId);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to delete attachment');
        return;
      }

      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      setSuccessMsg(`"${fileName}" removed.`);
    } catch {
      setErrorMsg('An unexpected error occurred while deleting attachment.');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreviewOrDownload = async (
    attachmentId: string,
    mode: 'preview' | 'download',
  ) => {
    setErrorMsg(null);
    setDownloadingId(attachmentId);

    try {
      const res = await getAttachmentSignedUrl(attachmentId);
      if (!res.success || !res.data?.signedUrl) {
        setErrorMsg(res.error || 'Failed to generate access link');
        return;
      }

      if (mode === 'preview') {
        window.open(res.data.signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        const link = document.createElement('a');
        link.href = res.data.signedUrl;
        link.download = res.data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      setErrorMsg('Failed to open deliverable file.');
    } finally {
      setDownloadingId(null);
    }
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith('image/')) {
      return (
        <ImageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      );
    }
    if (mime === 'application/pdf') {
      return <FileText className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
    }
    return (
      <Paperclip className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-stone-300">
          <Paperclip className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Deliverable Files</span>
          <span className="rounded-md bg-stone-200 px-1.5 py-0.5 text-[10px] text-stone-700 dark:bg-stone-800 dark:text-stone-400">
            {attachments.length}
          </span>
        </div>
        <span className="text-[11px] text-stone-500 dark:text-stone-400">
          Max 20MB (JPG, PNG, WEBP, PDF)
        </span>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Dropzone (Admin Only) */}
      {canEdit && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center transition-colors duration-150',
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-stone-300 bg-stone-50/50 hover:border-stone-400 hover:bg-stone-100/50 dark:border-stone-800 dark:bg-stone-900/30 dark:hover:border-stone-700 dark:hover:bg-stone-900/50',
            isUploading && 'pointer-events-none opacity-60',
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_FILE_EXTENSIONS.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading deliverable...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 transition-transform group-hover:scale-105 dark:border-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-400">
                <UploadCloud className="h-4 w-4" />
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300">
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  Click to upload
                </span>{' '}
                or drag and drop deliverable
              </p>
            </div>
          )}
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file) => {
            const isDeleting = deletingId === file.id;
            const isDownloading = downloadingId === file.id;

            return (
              <div
                key={file.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white/80 p-2.5 text-xs transition-colors hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900/60 dark:hover:border-stone-700"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-950">
                    {getFileIcon(file.mime_type)}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="truncate font-medium text-stone-900 dark:text-stone-200"
                      title={file.file_name}
                    >
                      {file.file_name}
                    </p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {formatBytes(file.file_size)} •{' '}
                      {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreviewOrDownload(file.id, 'preview')}
                    disabled={isDownloading || isDeleting}
                    className="h-7 w-7 p-0 text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                    title="Preview file"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5" />
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreviewOrDownload(file.id, 'download')}
                    disabled={isDownloading || isDeleting}
                    className="h-7 w-7 p-0 text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                    title="Download file"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>

                  {canEdit && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file.id, file.file_name)}
                      disabled={isDeleting || isDownloading}
                      className="h-7 w-7 p-0 text-stone-500 hover:bg-red-50 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400"
                      title="Remove deliverable"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600 dark:text-red-400" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
