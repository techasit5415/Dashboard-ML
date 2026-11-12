<script lang="ts">
  import { page } from '$app/state';
</script>

<header class="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/95 backdrop-blur-xs">
  <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
    <!-- Brand Mark & Title -->
    <a href="/" class="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#006241] text-white">
        <svg class="h-4 w-4 fill-current" viewBox="0 0 24 24">
          <path d="M2 21h19a1 1 0 0 0 1-1v-1a5 5 0 0 0-5-5h-1V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v15a1 1 0 0 0 1 1zm2-16h11v9H4V5zm13 9h1a3 3 0 0 1 3 3v2h-4v-5zM4 16h11v3H4v-3z"/>
        </svg>
      </div>
      <div>
        <span class="text-sm font-semibold tracking-tight text-neutral-900">
          Starbucks ML Studio
        </span>
      </div>
    </a>

    <!-- Segmented Navigation Links -->
    <nav class="flex items-center gap-1 rounded-lg bg-neutral-100 p-1 border border-neutral-200/60">
      <a
        href="/"
        class={`rounded-md px-3 py-1 text-xs font-medium transition-all duration-150 ${
          page.url.pathname === '/' || page.url.pathname === '/predict'
            ? 'bg-white text-neutral-900 shadow-xs'
            : 'text-neutral-600 hover:text-neutral-900'
        }`}
      >
        ทำนายผลโปรโมชัน
      </a>

      <a
        href="/models"
        class={`rounded-md px-3 py-1 text-xs font-medium transition-all duration-150 ${
          page.url.pathname === '/models'
            ? 'bg-white text-neutral-900 shadow-xs'
            : 'text-neutral-600 hover:text-neutral-900'
        }`}
      >
        ผลลัพธ์โมเดล
      </a>

      <a
        href="/samples"
        class={`rounded-md px-3 py-1 text-xs font-medium transition-all duration-150 ${
          page.url.pathname === '/samples'
            ? 'bg-white text-neutral-900 shadow-xs'
            : 'text-neutral-600 hover:text-neutral-900'
        }`}
      >
        ชุดข้อมูลทดสอบ
      </a>
    </nav>
  </div>
</header>