'use client';

import * as React from 'react';
import { Tag, Plus, Trash2, Lock, AlertCircle, Sparkles } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { CategoryItem } from '@/lib/data/settings';
import { categorySchema } from '@/lib/validation/settings';

interface CategoryManagementCardProps {
  categories: CategoryItem[];
  onAddCategory: (category: CategoryItem) => void;
  onRemoveCategory: (categoryId: string) => void;
}

const COLOR_OPTIONS: Array<{
  value: CategoryItem['color'];
  label: string;
  dotClass: string;
}> = [
  { value: 'indigo', label: 'Indigo', dotClass: 'bg-indigo-500' },
  { value: 'emerald', label: 'Emerald', dotClass: 'bg-emerald-500' },
  { value: 'amber', label: 'Amber', dotClass: 'bg-amber-500' },
  { value: 'rose', label: 'Rose', dotClass: 'bg-rose-500' },
  { value: 'sky', label: 'Sky', dotClass: 'bg-sky-500' },
  { value: 'purple', label: 'Purple', dotClass: 'bg-purple-500' },
  { value: 'stone', label: 'Stone', dotClass: 'bg-stone-500' },
];

export function CategoryManagementCard({
  categories,
  onAddCategory,
  onRemoveCategory,
}: CategoryManagementCardProps) {
  const [newLabel, setNewLabel] = React.useState('');
  const [selectedColor, setSelectedColor] =
    React.useState<CategoryItem['color']>('indigo');
  const [error, setError] = React.useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rawName = newLabel.trim().toLowerCase().replace(/\s+/g, '-');
    const validation = categorySchema.safeParse({
      name: rawName,
      label: newLabel.trim(),
      color: selectedColor,
      isSystem: false,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Invalid category name');
      return;
    }

    if (categories.some((c) => c.name.toLowerCase() === rawName)) {
      setError('A category with this name already exists.');
      return;
    }

    onAddCategory({
      id: rawName,
      name: rawName,
      label: newLabel.trim(),
      color: selectedColor,
      isSystem: false,
    });

    setNewLabel('');
    setSelectedColor('indigo');
  };

  return (
    <Card className="border-stone-200/80 bg-white/80 shadow-sm dark:border-stone-800 dark:bg-stone-900/40">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-400">
            <Tag className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base text-stone-900 dark:text-stone-100">
              Task Categories
            </CardTitle>
            <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
              Manage category tags available for organizing sprint tasks and
              deliverables.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Categories List */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-stone-800 dark:text-stone-300">
            Active Categories ({categories.length})
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50/70 p-3 transition-colors hover:border-stone-300 dark:border-stone-800 dark:bg-stone-950/40 dark:hover:border-stone-700"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      cat.color === 'rose'
                        ? 'urgent'
                        : cat.color === 'emerald'
                          ? 'personal'
                          : cat.color === 'amber'
                            ? 'shopping'
                            : cat.color === 'indigo'
                              ? 'work'
                              : 'general'
                    }
                    className="text-xs capitalize"
                  >
                    {cat.label}
                  </Badge>
                </div>

                {cat.isSystem ? (
                  <div
                    title="System default category"
                    className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500"
                  >
                    <Lock className="h-3 w-3" />
                    <span>System</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onRemoveCategory(cat.id)}
                    title="Remove custom category"
                    className="flex h-6 w-6 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-stone-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Category Form */}
        <form
          onSubmit={handleAdd}
          className="space-y-4 rounded-xl border border-stone-200/80 bg-stone-50/50 p-4 dark:border-stone-800/80 dark:bg-stone-900/60"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-900 dark:text-stone-200">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Create Custom Category</span>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="new-category-name"
                className="text-xs text-stone-700 dark:text-stone-300"
              >
                Category Label
              </Label>
              <Input
                id="new-category-name"
                placeholder="e.g. Marketing, Bug Fix, Roadmap"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-stone-700 dark:text-stone-300">
                Badge Color
              </Label>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                      selectedColor === c.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-white dark:ring-indigo-500'
                        : 'border-stone-300 bg-white text-stone-600 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${c.dotClass}`} />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              variant="primary"
              disabled={!newLabel.trim()}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Category</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
