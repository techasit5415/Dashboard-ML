<script lang="ts">
  import { page } from '$app/state';
</script>

<header class="sticky top-0 z-40 border-b border-[#1E3932]/10 bg-white/90 backdrop-blur-md">
  <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 h-14">
    <!-- Brand Mark & Title -->
    <a href="/" class="group flex shrink-0 items-center gap-2.5 whitespace-nowrap transition-opacity hover:opacity-90">
      <div class="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-[#006241]/20 shadow-xs overflow-hidden bg-white transition-transform duration-200 group-hover:scale-105">
        <img
          src="/Starbucks_Corporation_Logo_2011.svg.webp"
          alt="Starbucks Logo"
          class="h-full w-full object-contain"
        />
      </div>
      <span class="text-sm sm:text-[15px] font-bold tracking-tight text-[#1E3932]">
        Starbucks ML Studio
      </span>
    </a>

    <!-- Clean Text Navigation Links with Bottom Active Indicator -->
    <nav class="flex shrink-0 items-center gap-5 sm:gap-7 h-full whitespace-nowrap">
      <a
        href="/"
        class={`relative flex h-full items-center text-xs sm:text-sm font-medium transition-colors duration-150 ${
          page.url.pathname === '/' || page.url.pathname === '/predict'
            ? 'text-[#006241] font-semibold'
            : 'text-neutral-500 hover:text-[#1E3932]'
        }`}
      >
        <span>ทำนายผลโปรโมชัน</span>
        {#if page.url.pathname === '/' || page.url.pathname === '/predict'}
          <span class="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-[#006241]"></span>
        {/if}
      </a>

      <a
        href="/models"
        class={`relative flex h-full items-center text-xs sm:text-sm font-medium transition-colors duration-150 ${
          page.url.pathname === '/models'
            ? 'text-[#006241] font-semibold'
            : 'text-neutral-500 hover:text-[#1E3932]'
        }`}
      >
        <span>ผลลัพธ์โมเดล</span>
        {#if page.url.pathname === '/models'}
          <span class="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-[#006241]"></span>
        {/if}
      </a>

      <a
        href="/samples"
        class={`relative flex h-full items-center text-xs sm:text-sm font-medium transition-colors duration-150 ${
          page.url.pathname === '/samples'
            ? 'text-[#006241] font-semibold'
            : 'text-neutral-500 hover:text-[#1E3932]'
        }`}
      >
        <span>ชุดข้อมูลทดสอบ</span>
        {#if page.url.pathname === '/samples'}
          <span class="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-[#006241]"></span>
        {/if}
      </a>
    </nav>
  </div>
</header>
