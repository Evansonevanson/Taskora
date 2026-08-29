'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  Download,
  Paperclip,
  Image as ImageIcon,
  Loader2,
  Globe,
} from 'lucide-react';
import type { PortalClientInfo, PortalTaskItem } from '@/lib/data/portal';
import type { CommentItem } from '@/lib/data/comments';
import type { TaskAttachment } from '@/lib/data/attachments';
import { getAttachmentSignedUrl } from '@/lib/actions/attachments';
import { CommentThread } from '@/components/comments/comment-thread';

export interface PortalJobDetailViewProps {
  client: PortalClientInfo;
  task: PortalTaskItem;
  comments: CommentItem[];
  attachments?: TaskAttachment[];
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function PortalJobDetailView({
  client,
  task,
  comments,
  attachments = [],
}: PortalJobDetailViewProps) {
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const formattedCompletedDate = React.useMemo(() => {
    if (!task.completedAt) return 'Delivered';
    try {
      return new Date(task.completedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Delivered';
    }
  }, [task.completedAt]);

  const formattedDueDate = React.useMemo(() => {
    if (!task.dueDate) return null;
    try {
      return new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  }, [task.dueDate]);

  const priorityVariant = (
    ['low', 'medium', 'high'].includes(task.priority.toLowerCase())
      ? task.priority.toLowerCase()
      : 'medium'
  ) as 'low' | 'medium' | 'high';

  const handleAccessAttachment = async (
    attachmentId: string,
    mode: 'preview' | 'download',
  ) => {
    setActionError(null);
    setDownloadingId(attachmentId);

    try {
      const res = await getAttachmentSignedUrl(attachmentId);
      if (!res.success || !res.data?.signedUrl) {
        setActionError(res.error || 'Unable to access deliverable file.');
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
      setActionError('An error occurred while loading the deliverable.');
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

  const hasDeliverables = Boolean(task.projectUrl || attachments.length > 0);

  return (
    <div className="space-y-6">
      {/* Back Navigation Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/portal/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Deliverables</span>
        </Link>
        <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
          {client.companyName || client.displayName}
        </span>
      </div>

      {/* Main Deliverable Header Card */}
      <div className="space-y-4 rounded-2xl border border-stone-200/80 bg-white/80 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="work"
              className="text-[10px] tracking-wider uppercase"
            >
              {task.category || 'Work'}
            </Badge>
            <Badge variant={priorityVariant} className="text-[10px]">
              {task.priority} Priority
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {task.needsRevision ? (
              <Badge
                variant="urgent"
                className="flex items-center gap-1.5 border-amber-300 bg-amber-50 px-2.5 py-1 text-xs text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/60 dark:text-amber-300"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Revision Requested</span>
              </Badge>
            ) : (
              <Badge
                variant="completed"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Delivered & Ready</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-100">
            {task.title}
          </h1>

          {/* Timestamps */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-600 dark:text-stone-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Delivered on {formattedCompletedDate}</span>
            </div>

            {formattedDueDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                <span>Target Due: {formattedDueDate}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
              <span>Status: Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deliverable Outputs Section (Project Link & Attachments) */}
      {hasDeliverables && (
        <div className="space-y-4 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white/80 to-white/80 p-6 shadow-sm dark:border-indigo-500/30 dark:bg-gradient-to-br dark:from-indigo-950/20 dark:via-stone-900/60 dark:to-stone-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-indigo-700 uppercase dark:text-indigo-300">
              <Paperclip className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Deliverable Files & Links</span>
            </div>
            {attachments.length > 0 && (
              <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800 dark:bg-stone-800 dark:text-stone-300">
                {attachments.length}{' '}
                {attachments.length === 1 ? 'file' : 'files'}
              </span>
            )}
          </div>

          {actionError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Project Link Banner */}
          {task.projectUrl && (
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 transition-colors hover:border-indigo-300 sm:flex-row sm:items-center dark:border-indigo-500/20 dark:bg-indigo-950/30 dark:hover:border-indigo-500/40">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-white text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    External Project Destination
                  </p>
                  <p className="truncate text-[11px] text-stone-600 dark:text-stone-400">
                    {task.projectUrl}
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="primary"
                size="sm"
                className="shrink-0 gap-2 text-xs font-medium shadow-sm shadow-indigo-500/20"
              >
                <a
                  href={task.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Open Project</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          )}

          {/* Deliverable Files List */}
          {attachments.length > 0 && (
            <div className="space-y-2 pt-1">
              {attachments.map((file) => {
                const isProcessing = downloadingId === file.id;

                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white/80 p-3 text-xs transition-colors hover:border-stone-300 dark:border-stone-800/80 dark:bg-stone-950/60 dark:hover:border-stone-700"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
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
                          {formatBytes(file.file_size)} • Uploaded{' '}
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleAccessAttachment(file.id, 'preview')
                        }
                        disabled={isProcessing}
                        className="gap-1.5 text-xs text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <ExternalLink className="h-3.5 w-3.5" />
                        )}
                        <span>Preview</span>
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleAccessAttachment(file.id, 'download')
                        }
                        disabled={isProcessing}
                        className="gap-1.5 text-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Deliverable Notes & Specifications */}
      <div className="space-y-3 rounded-2xl border border-stone-200/80 bg-white/80 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/40">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-stone-800 uppercase dark:text-stone-300">
          <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Deliverable Details & Notes</span>
        </div>

        {task.notes ? (
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 text-xs leading-relaxed font-normal whitespace-pre-wrap text-stone-800 dark:border-stone-800/80 dark:bg-stone-950/40 dark:text-stone-300">
            {task.notes}
          </div>
        ) : (
          <p className="text-xs text-stone-500 italic dark:text-stone-400">
            No specific notes or descriptions were attached to this deliverable.
          </p>
        )}
      </div>

      {/* Feedback & Revision Flow */}
      <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/40">
        <CommentThread
          taskId={task.id}
          comments={comments}
          currentUserRole="client"
        />
      </div>
    </div>
  );
}
