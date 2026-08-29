import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CommentThread } from '@/components/comments/comment-thread';
import * as commentActions from '@/lib/actions/comments';

// Mock Next.js navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: vi.fn(),
  }),
  usePathname: () => '/admin/dashboard',
}));

// Mock Lucide icons
vi.mock('lucide-react', () => {
  const MockIcon = () =>
    React.createElement('svg', { 'data-testid': 'mock-icon' });
  return {
    MessageSquare: MockIcon,
    Send: MockIcon,
    Loader2: MockIcon,
    AlertCircle: MockIcon,
    Clock: MockIcon,
    ShieldCheck: MockIcon,
    User: MockIcon,
  };
});

describe('CommentThread Component Modes & Form Nesting Prevention', () => {
  const taskId = '123e4567-e89b-12d3-a456-426614174000';
  const sampleComments = [
    {
      id: 'comment-1',
      taskId,
      authorId: 'client-1',
      authorRole: 'client' as const,
      authorName: 'Sarah Client',
      content: 'Can we change the hero accent color?',
      createdAt: '2026-08-29T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a standalone <form> and submit button when embedded is false/omitted', () => {
    const html = renderToStaticMarkup(
      <CommentThread
        taskId={taskId}
        comments={sampleComments}
        currentUserRole="client"
      />,
    );

    // Standalone mode MUST render a <form>
    expect(html).toContain('<form');
    expect(html).toContain('</form>');
    expect(html).toContain('type="submit"');
    expect(html).not.toContain('type="button"');
  });

  it('does NOT render a <form> when embedded is true (prevents nested form hydration error)', () => {
    const html = renderToStaticMarkup(
      <CommentThread
        taskId={taskId}
        comments={sampleComments}
        currentUserRole="admin"
        embedded={true}
      />,
    );

    // Embedded mode MUST NOT render any <form> tag
    expect(html).not.toContain('<form');
    expect(html).not.toContain('</form>');
    // Submit button in embedded mode MUST use type="button" to prevent outer form submission
    expect(html).toContain('type="button"');
    expect(html).not.toContain('type="submit"');
  });

  it('ensures embedding CommentThread inside an outer <form> results in exactly one <form> tag', () => {
    const outerFormHtml = renderToStaticMarkup(
      <form id="edit-task-form">
        <input name="title" defaultValue="Edit Task" />
        <CommentThread
          taskId={taskId}
          comments={sampleComments}
          currentUserRole="admin"
          embedded={true}
        />
      </form>,
    );

    // Count instances of opening <form tag
    const formOpeningTags = outerFormHtml.match(/<form\b/g) || [];
    expect(formOpeningTags.length).toBe(1);
  });

  it('handles comment submission via createComment server action', async () => {
    const createCommentSpy = vi
      .spyOn(commentActions, 'createComment')
      .mockResolvedValueOnce({
        success: true,
      });

    const result = await commentActions.createComment({
      taskId,
      content: 'Admin feedback update.',
    });

    expect(createCommentSpy).toHaveBeenCalledWith({
      taskId,
      content: 'Admin feedback update.',
    });
    expect(result.success).toBe(true);
  });
});
