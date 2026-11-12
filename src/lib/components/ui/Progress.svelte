<script lang="ts">
  import { cn } from '../../utils';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    value?: number; //  0 - 100
    indicatorClass?: string;
  }

  let { class: className, value = 0, indicatorClass, ...restProps }: Props = $props();

  const clampedValue = $derived(Math.min(100, Math.max(0, value)));
</script>

<div
  role="progressbar"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={clampedValue}
  class={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800', className)}
  {...restProps}
>
  <div
    class={cn('h-full w-full flex-1 bg-emerald-600 transition-all duration-300 ease-in-out', indicatorClass)}
    style="transform: translateX(-{100 - clampedValue}%)"
  ></div>
</div>
