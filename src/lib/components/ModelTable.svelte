<script lang="ts">
  import { MODEL_METRICS, FEATURE_IMPORTANCES } from '../data/mlData';
</script>

<div class="space-y-4">
  <!-- Model Comparison Card -->
  <div class="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-100 pb-3 mb-4">
      <div>
        <h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-700">
          เปรียบเทียบประสิทธิภาพโมเดล (Model Benchmark)
        </h2>
        <p class="mt-1 text-xs text-neutral-500">
          ประเมินผลบน Validation Set แบ่งชุดข้อมูลแบบ Customer-Disjoint (70/15/15)
        </p>
      </div>
      <span class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-xs font-medium text-emerald-800">
        <span class="h-1.5 w-1.5 rounded-full bg-[#006241]"></span>
        Champion Model: LightGBM
      </span>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full whitespace-nowrap text-left text-xs">
        <thead class="border-b border-neutral-200 bg-neutral-50/75 text-neutral-600 font-medium">
          <tr>
            <th class="py-2.5 px-3">โมเดล</th>
            <th class="py-2.5 px-3">ประเภทอัลกอริทึม</th>
            <th class="py-2.5 px-3 text-right">Accuracy</th>
            <th class="py-2.5 px-3 text-right">F1-Score</th>
            <th class="py-2.5 px-3 text-right">ROC-AUC</th>
            <th class="py-2.5 px-3 text-right">เวลาเทรน</th>
            <th class="py-2.5 px-3 text-right">สถานะ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          {#each MODEL_METRICS as m}
            <tr class={`transition-colors ${m.isChampion ? 'bg-emerald-50/70 hover:bg-emerald-50' : 'text-neutral-500 hover:bg-neutral-50/60'}`}>
              <td class={`py-3.5 px-3 ${m.isChampion ? 'border-l-4 border-[#006241]' : 'border-l-4 border-transparent'}`}>
                <span class={m.isChampion ? 'font-bold text-[#1E3932] text-[13px]' : 'font-medium text-neutral-600'}>{m.name}</span>
                {#if m.isChampion}
                  <span class="ml-2 inline-flex items-center gap-1 rounded-md bg-[#006241] px-1.5 py-0.5 font-mono text-[10px] text-white font-semibold">
                    <svg class="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" /></svg>
                    CHAMPION
                  </span>
                {/if}
              </td>
              <td class={`py-3.5 px-3 ${m.isChampion ? 'text-neutral-700' : 'text-neutral-400'}`}>{m.trainType}</td>
              <td class={`py-3.5 px-3 text-right font-mono tabular-nums ${m.isChampion ? 'font-semibold text-neutral-900' : 'text-neutral-500'}`}>{(m.accuracy * 100).toFixed(2)}%</td>
              <td class={`py-3.5 px-3 text-right font-mono tabular-nums ${m.isChampion ? 'font-bold text-neutral-900' : 'text-neutral-500'}`}>{(m.f1Score * 100).toFixed(2)}%</td>
              <td class={`py-3.5 px-3 text-right font-mono tabular-nums ${m.isChampion ? 'font-bold text-[#006241] text-[13px]' : 'text-neutral-500'}`}>{(m.rocAuc).toFixed(4)}</td>
              <td class="py-3.5 px-3 text-right font-mono tabular-nums text-neutral-400">{m.trainTimeSec}s</td>
              <td class="py-3.5 px-3 text-right">
                {#if m.isChampion}
                  <span class="rounded-md bg-[#006241] px-2 py-0.5 text-[11px] font-medium text-white">
                    นำไปใช้จริง
                  </span>
                {:else}
                  <span class="rounded-md border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-400">Baseline</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Validation & Threshold Tuning Boxes -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Box 1: Overfitting Verification -->
    <div class="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div class="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3 mb-3">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-neutral-700">
          การตรวจสอบ Overfitting (Train vs Test Gap)
        </h3>
        <span class="shrink-0 whitespace-nowrap rounded-md bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
          ผ่านการตรวจ
        </span>
      </div>
      <div class="flex items-end gap-3 mb-4">
        <span class="font-mono text-5xl font-bold tracking-tight tabular-nums text-[#006241] leading-none">0.0167</span>
        <div class="pb-1 whitespace-nowrap text-xs text-neutral-500 leading-tight">
          Train-Test Gap<br /><span class="text-neutral-400">เพดาน &lt; 0.05</span>
        </div>
      </div>
      <div class="mb-4 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden" title="0.0167 / 0.05">
        <div class="h-full rounded-full bg-[#006241]" style="width: {(0.0167 / 0.05) * 100}%"></div>
      </div>
      <div class="space-y-2 text-xs text-neutral-600">
        <div class="flex items-baseline justify-between gap-3 py-1 border-b border-neutral-100/70">
          <span class="whitespace-nowrap">Train Set ROC-AUC</span>
          <span class="font-mono font-medium text-neutral-900 tabular-nums">0.8759</span>
        </div>
        <div class="flex items-baseline justify-between gap-3 py-1 border-b border-neutral-100/70">
          <span class="whitespace-nowrap">Unseen Test Set ROC-AUC</span>
          <span class="font-mono font-medium text-[#006241] tabular-nums">0.8593</span>
        </div>
      </div>
      <p class="mt-3 text-[11px] text-neutral-600 leading-relaxed">
        ผลต่าง Gap 0.0167 ต่ำกว่าเพดาน 0.05 ยืนยันว่าโมเดลเรียนรู้รูปแบบทั่วไปได้สมบูรณ์ ไม่มีการท่องจำข้อมูล
      </p>
    </div>

    <!-- Box 2: Optimal Threshold Tuning -->
    <div class="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div class="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3 mb-3">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-neutral-700">
          การจูน Optimal Threshold เพื่อผลกำไรสูงสุด
        </h3>
        <span class="shrink-0 whitespace-nowrap rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-[11px] font-medium text-neutral-700">
          F1-Score
        </span>
      </div>
      <div class="flex items-end gap-3 mb-4">
        <span class="font-mono text-5xl font-bold tracking-tight tabular-nums text-[#006241] leading-none">0.41</span>
        <div class="pb-1 whitespace-nowrap text-xs text-neutral-500 leading-tight">
          Optimal Threshold (41%)<br /><span class="text-neutral-400">จากค่าเริ่มต้น 0.50</span>
        </div>
      </div>
      <div class="relative mb-4 h-1.5 w-full rounded-full bg-neutral-100" title="0.41 vs 0.50">
        <div class="h-full rounded-full bg-[#006241]" style="width: 41%"></div>
        <div class="absolute top-[-3px] bottom-[-3px] w-px bg-neutral-400" style="left: 50%"></div>
      </div>
      <div class="space-y-2 text-xs text-neutral-600">
        <div class="flex items-baseline justify-between gap-3 py-1 border-b border-neutral-100/70">
          <span class="whitespace-nowrap">เกณฑ์ตั้งต้นมาตรฐาน (Default)</span>
          <span class="font-mono text-neutral-500 tabular-nums">0.50 (50%)</span>
        </div>
        <div class="flex items-baseline justify-between gap-3 py-1 border-b border-neutral-100/70">
          <span class="shrink-0 whitespace-nowrap">F1-Score สูงสุด</span>
          <span class="text-right font-mono font-medium text-[#006241] tabular-nums">0.8102 (+0.0087 จาก 0.8015 ที่เกณฑ์ 0.50)</span>
        </div>
      </div>
      <p class="mt-3 text-[11px] text-neutral-600 leading-relaxed">
        การปรับจุดตัดเป็น 0.41 ช่วยเพิ่ม Recall บน Test Set เป็น 86.89% และทำ F1-Score สูงสุด (0.8102 บน Validation Set)
      </p>
    </div>
  </div>

  <!-- Global Feature Importance Visualization (from starbucks_offer_model.pkl) -->
  <div class="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-100 pb-3 mb-4">
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-wider text-neutral-700">
          ความสำคัญของตัวแปร (Global Feature Importance — Top 10)
        </h3>
        <p class="mt-1 text-xs text-neutral-500">
          จำนวนครั้งที่ต้นไม้ LightGBM (starbucks_offer_model.pkl) เลือกใช้แต่ละฟีเจอร์ในการแตกกิ่งตัดสินใจ (รวม 2,950 Splits)
        </p>
      </div>
      <span class="shrink-0 whitespace-nowrap rounded-md bg-neutral-100 px-2.5 py-1 font-mono text-[11px] font-medium text-neutral-700 self-start sm:self-auto">
        importance_type = split
      </span>
    </div>

    <div class="space-y-3">
      {#each FEATURE_IMPORTANCES as item, idx}
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2 min-w-0">
              <span class="font-mono text-[11px] text-neutral-400 w-4 shrink-0">#{idx + 1}</span>
              <span class="font-medium text-neutral-800 truncate">{item.label}</span>
              <span class="hidden sm:inline-block shrink-0 whitespace-nowrap rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                {item.category}
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0 font-mono tabular-nums text-xs">
              <span class="whitespace-nowrap text-neutral-500">{item.splits} splits</span>
              <span class="font-semibold text-[#006241] w-12 text-right">{item.pct.toFixed(1)}%</span>
            </div>
          </div>
          <div class="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div
              class="h-full rounded-full bg-[#006241] transition-all duration-300"
              style={`width: ${(item.pct / 12.6) * 100}%`}
            ></div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>