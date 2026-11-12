<script lang="ts">
  import { cn } from '../../utils';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Variant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'starbucks';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    class?: string;
    variant?: Variant;
    children?: Snippet;
  }

  let { class: className, variant = 'default', children, ...restProps }: Props = $props();

  const variantClasses: Record<Variant, string> = {
    default: 'bg-slate-900 text-slate-50',
    secondary: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
    outline: 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    destructive: 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
    starbucks: 'bg-emerald-800 text-emerald-50 border border-emerald-700 shadow-xs'
  };
</script>

<span
  class={cn(
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
    variantClasses[variant],
    className
  )}
  {...restProps}
>
  {@render children?.()}
</span>
