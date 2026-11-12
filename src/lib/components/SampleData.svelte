<script lang="ts">
  import { SAMPLE_TEST_CASES } from '../data/mlData';
  import type { SampleTestCase } from '../types/ml';

  let filter = $state<'all' | 'correct' | 'incorrect'>('all');
  let search = $state<string>('');

  const filtered = $derived<SampleTestCase[]>(
    SAMPLE_TEST_CASES.filter((item) => {
      if (filter === 'correct' && !item.isCorrect) return false;
      if (filter === 'incorrect' && item.isCorrect) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.person.toLowerCase().includes(q) ||
          item.offerType.toLowerCase().includes(q)
        );
      }
      return true;
    })
  );
</script>

<div class="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-100 pb-3 mb-4">
    <div>
      <h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-700">
        ตัวอย่างสุ่ม 10 รายการจาก Unseen Test Set
      </h2>
      <p class="mt-1 text-xs text-neutral-500">
        เปรียบเทียบผลการทำนายของโมเดลกับผลพฤติกรรมจริงของลูกค้าในชุดทดสอบ
      </p>
    </div>

    <!-- Filter & Search Controls -->
    <div class="flex items-center gap-2">
      <input
        type="text"
        placeholder="ค้นหารหัส หรือ ประเภท..."
        bind:value={search}
        class="h-8 rounded-lg border border-neutral-300/80 bg-neutral-50 px-3 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006241]"
      />
      <select
        bind:value={filter}
        class="h-8 rounded-lg border border-neutral-300/80 bg-neutral-50 px-2.5 text-xs font-medium text-neutral-800 focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006241]"
      >
        <option value="all">ทั้งหมด (All)</option>
        <option value="correct">เฉพาะที่ตรงจริง (Correct)</option>
        <option value="incorrect">เฉพาะที่คลาดเคลื่อน (Mismatch)</option>
      </select>
    </div>
  </div>

  <div class="overflow-x-auto">
    <table class="w-full text-left text-xs">
      <thead class="border-b border-neutral-200 bg-neutral-50/75 text-neutral-600 font-medium">
        <tr>
          <th class="py-2.5 px-3">รหัสอ้างอิง</th>
          <th class="py-2.5 px-3">ข้อมูลลูกค้า</th>
          <th class="py-2.5 px-3">ข้อเสนอโปรโมชัน</th>
          <th class="py-2.5 px-3 text-center">ผลจริง</th>
          <th class="py-2.5 px-3 text-right">ความน่าจะเป็น</th>
          <th class="py-2.5 px-3 text-center">คำสั่งโมเดล</th>
          <th class="py-2.5 px-3 text-right">ผลตรวจทาน</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-neutral-100">
        {#each filtered as c}
          <tr class="transition-colors hover:bg-neutral-50/60">
            <td class="py-3 px-3 font-mono font-medium text-neutral-900">{c.id}</td>
            <td class="py-3 px-3 text-neutral-700">
              {c.gender}, {c.age} ปี <span class="font-mono text-neutral-500 tabular-nums">(${(c.income || 0).toLocaleString()})</span>
            </td>
            <td class="py-3 px-3">
              <span class="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-neutral-700">
                {c.offerType}
              </span>
              <span class="text-neutral-500 ml-1.5 font-mono tabular-nums">
                ${c.difficulty} รับ ${c.reward}
              </span>
            </td>
            <td class="py-3 px-3 text-center">
              {#if c.actual === 1}
                <span class="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                  ซื้อสำเร็จ
                </span>
              {:else}
                <span class="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                  ไม่ซื้อ
                </span>
              {/if}
            </td>
            <td class="py-3 px-3 text-right font-mono font-semibold tabular-nums text-neutral-900">
              {(c.predictedProb * 100).toFixed(1)}%
            </td>
            <td class="py-3 px-3 text-center">
              {#if c.decision === 1}
                <span class="font-medium text-[#006241]">ส่งโปร</span>
              {:else}
                <span class="text-neutral-400">ไม่ส่ง</span>
              {/if}
            </td>
            <td class="py-3 px-3 text-right">
              {#if c.isCorrect}
                <span class="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                  ตรงจริง
                </span>
              {:else}
                <span class="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                  คลาดเคลื่อน
                </span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>