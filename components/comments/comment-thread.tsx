'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  Clock,
  ShieldCheck,
  User,
} from 'lucide-react';
import { createComment } from '@/lib/actions/comments';
import type { CommentItem } from '@/lib/data/comments';

export interface CommentThreadProps {
  taskId: string;
  comments: CommentItem[];
  currentUserRole?: 'admin' | 'client' | string;
}

export function CommentThread({
  taskId,
  comments,
  currentUserRole = 'client',
}: CommentThreadProps) {
  const router = useRouter();
  const [content, setContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await createComment({
        taskId,
        content: content.trim(),
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to post comment.');
      } else {
        setContent('');
        router.refresh();
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isClient = currentUserRole === 'client';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-stone-300 uppercase">
          <MessageSquare className="h-4 w-4 text-indigo-400" />
          <span>Discussion & Revisions ({comments.length})</span>
        </div>

        <span className="text-[11px] text-stone-500">
          Comments are permanent and cannot be deleted
        </span>
      </div>

      {/* Comment List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-800 bg-stone-950/30 p-6 text-center">
            <MessageSquare className="mx-auto mb-2 h-6 w-6 text-stone-600" />
            <p className="text-xs font-medium text-stone-400">
              No comments yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-[11px] text-stone-500">
              {isClient
                ? 'Have feedback, questions, or revision requests? Leave a comment below to notify your project manager.'
                : 'Leave a reply or internal note for this deliverable.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => {
              const isAdmin = comment.authorRole === 'admin';
              let formattedDate = 'Recently';
              try {
                formattedDate = new Date(comment.createdAt).toLocaleString(
                  'en-US',
                  {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  },
                );
              } catch {
                formattedDate = 'Recently';
              }

              return (
                <div
                  key={comment.id}
                  className={`space-y-2 rounded-xl border p-4 transition-all ${
                    isAdmin
                      ? 'border-indigo-500/30 bg-indigo-950/20'
                      : 'border-stone-800 bg-stone-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                          isAdmin
                            ? 'bg-indigo-600 text-white'
                            : 'bg-stone-700 text-stone-200'
                        }`}
                      >
                        {isAdmin ? (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        ) : (
                          <User className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-stone-200">
                        {comment.authorName}
                      </span>
                      <Badge
                        variant={isAdmin ? 'primary' : 'secondary'}
                        className="px-1.5 py-0 text-[9px] font-medium uppercase"
                      >
                        {isAdmin ? 'Admin' : 'Client'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-stone-500">
                      <Clock className="h-3 w-3" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <p className="pl-8 text-xs leading-relaxed font-normal whitespace-pre-wrap text-stone-300">
                    {comment.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-2">
        {errorMessage && (
          <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl border p-3 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isClient
                ? 'Describe feedback or requested revisions for this deliverable...'
                : 'Write a response...'
            }
            className="min-h-[90px] resize-none text-xs"
            maxLength={2000}
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between px-1 text-[11px] text-stone-500">
            <span>
              {isClient &&
                'Note: Posting will automatically flag this deliverable for revision.'}
            </span>
            <span>{content.length}/2000</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>
                  {isClient ? 'Request Revision / Send' : 'Post Reply'}
                </span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
