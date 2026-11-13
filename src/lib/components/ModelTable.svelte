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
      <span class="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-xs font-medium text-emerald-800">
        <span class="h-1.5 w-1.5 rounded-full bg-[#006241]"></span>
        Champion Model: LightGBM
      </span>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
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
            <tr class={`transition-colors hover:bg-neutral-50/60 ${m.isChampion ? 'bg-emerald-50/30 font-medium' : ''}`}>
              <td class="py-3 px-3">
                <span class="font-semibold text-neutral-900">{m.name}</span>
                {#if m.isChampion}
                  <span class="ml-2 rounded-md bg-[#006241] px-1.5 py-0.5 font-mono text-[10px] text-white font-medium">
                    CHAMPION
                  </span>
                {/if}
              </td>
              <td class="py-3 px-3 text-neutral-500">{m.trainType}</td>
              <td class="py-3 px-3 text-right font-mono tabular-nums text-neutral-800">{(m.accuracy * 100).toFixed(2)}%</td>
              <td class="py-3 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900">{(m.f1Score * 100).toFixed(2)}%</td>
              <td class="py-3 px-3 text-right font-mono tabular-nums font-semibold text-[#006241]">{(m.rocAuc).toFixed(4)}</td>
              <td class="py-3 px-3 text-right font-mono tabular-nums text-neutral-500">{m.trainTimeSec}s</td>
              <td class="py-3 px-3 text-right">
                {#if m.isChampion}
                  <span class="rounded-md bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                    นำไปใช้จริง
                  </span>
                {:else}
                  <span class="text-neutral-400">Baseline</span>
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
      <div class="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-neutral-700">
          การตรวจสอบ Overfitting (Train vs Test Gap)
        </h3>
        <span class="rounded-md bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
          ผ่านการตรวจ
        </span>
      </div>
      <div class="space-y-2 text-xs text-neutral-600">
        <div class="flex justify-between py-1 border-b border-neutral-100/70">
          <span>Train Set ROC-AUC</span>
          <span class="font-mono font-medium text-neutral-900 tabular-nums">0.8759</span>
        </div>
        <div class="flex justify-between py-1 border-b border-neutral-100/70">
          <span>Unseen Test Set ROC-AUC</span>
          <span class="font-mono font-medium text-[#006241] tabular-nums">0.8593</span>
        </div>
        <div class="flex justify-between py-1 border-b border-neutral-100/70">
          <span>ผลต่าง (Train-Test Gap)</span>
          <span class="font-mono font-medium text-[#006241] tabular-nums">0.0167</span>
        </div>
      </div>
      <p class="mt-3 text-[11px] text-neutral-600 leading-relaxed">
        ผลต่าง Gap 0.0167 ต่ำกว่าเพดาน 0.05 ยืนยันว่าโมเดลเรียนรู้รูปแบบทั่วไปได้สมบูรณ์ ไม่มีการท่องจำข้อมูล
      </p>
    </div>

    <!-- Box 2: Optimal Threshold Tuning -->
    <div class="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div class="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-neutral-700">
          การจูน Optimal Threshold เพื่อผลกำไรสูงสุด
        </h3>
        <span class="rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-[11px] font-medium text-neutral-700">
          F1-Score
        </span>
      </div>
      <div class="space-y-2 text-xs text-neutral-600">
        <div class="flex justify-between py-1 border-b border-neutral-100/70">
          <span>เกณฑ์ตั้งต้นมาตรฐาน (Default)</span>
          <span class="font-mono text-neutral-500 tabular-nums">0.50 (50%)</span>
        </div>
        <div class="flex justify-between py-1 border-b border-neutral-100/70">
          <span>เกณฑ์ที่จูนดีที่สุด (Optimal Cut-off)</span>
          <span class="font-mono font-medium text-[#006241] tabular-nums">0.41 (41%)</span>
        </div>
        <div class="flex justify-between py-1 border-b border-neutral-100/70">
          <span>F1-Score สูงสุด</span>
          <span class="font-mono font-medium text-[#006241] tabular-nums">0.8102 (+0.0087 จาก 0.8015 ที่เกณฑ์ 0.50)</span>
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
      <span class="rounded-md bg-neutral-100 px-2.5 py-1 font-mono text-[11px] font-medium text-neutral-700 self-start sm:self-auto">
        importance_type = split
      </span>
    </div>

    <div class="space-y-3">
      {#each FEATURE_IMPORTANCES as item, idx}
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2 min-w-0">
              <span class="font-mono text-[11px] text-neutral-400 w-4 shrink-0">#{idx + 1}</span>
              <span class="font-medium text-neutral-800 truncate">{item.label}</span>
              <span class="hidden sm:inline-block rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                {item.category}
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0 font-mono tabular-nums text-xs">
              <span class="text-neutral-500">{item.splits} splits</span>
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