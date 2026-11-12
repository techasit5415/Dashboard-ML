<script lang="ts">
  import { cn } from '../../utils';
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'emerald';
  type Size = 'default' | 'sm' | 'lg' | 'icon';

  interface Props extends HTMLButtonAttributes {
    class?: string;
    variant?: Variant;
    size?: Size;
    children?: Snippet;
  }

  let {
    class: className,
    variant = 'default',
    size = 'default',
    children,
    type = 'button',
    ...restProps
  }: Props = $props();

  const variantClasses: Record<Variant, string> = {
    default: 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm focus-visible:ring-emerald-700',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-sm dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
    ghost: 'hover:bg-slate-100 text-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
    destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-600',
    emerald: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
  };

  const sizeClasses: Record<Size, string> = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-11 rounded-md px-8 text-base',
    icon: 'h-9 w-9 p-0'
  };
</script>

<button
  {type}
  class={cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
    variantClasses[variant],
    sizeClasses[size],
    className
  )}
  {...restProps}
>
  {@render children?.()}
</button>
