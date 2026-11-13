<script lang="ts">
  import { MODEL_METRICS, FEATURE_IMPORTANCES } from '../data/mlData';
</script>

<!-- Minimal Frameless Page Title (1 line on warm cream background) -->
<div class="mb-5">
  <h1 class="text-lg sm:text-xl font-bold tracking-tight text-[#1E3932]">
    ผลลัพธ์โมเดลและการตรวจสอบความแม่นยำ (Model Benchmark & Audit)
  </h1>
</div>

<div class="space-y-5">
  <!-- Model Comparison Card -->
  <div class="rounded-2xl border border-[#1E3932]/10 bg-white p-5 sm:p-6 shadow-[0_2px_10px_-2px_rgba(30,57,50,0.06)]">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-100 pb-3.5 mb-4">
      <div>
        <h2 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E3932]">
          เปรียบเทียบประสิทธิภาพโมเดล (Model Benchmark)
        </h2>
        <p class="mt-1 text-xs text-neutral-500">
          ประเมินผลบน Validation Set (6,499 แถว) แบ่งชุดข้อมูลแบบ Customer-Disjoint (70/15/15)
        </p>
      </div>
      <span class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#1E3932] px-3 py-1 text-xs font-semibold text-[#CBA258]">
        <span class="h-1.5 w-1.5 rounded-full bg-[#CBA258]"></span>
        Champion Model: LightGBM
      </span>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full whitespace-nowrap text-left text-xs">
        <thead class="border-b border-neutral-200 bg-[#F7F5F0] text-[#1E3932] font-semibold">
          <tr>
            <th class="py-3 px-3.5 rounded-tl-lg">โมเดล</th>
            <th class="py-3 px-3.5">ประเภทอัลกอริทึม</th>
            <th class="py-3 px-3.5 text-right">Accuracy</th>
            <th class="py-3 px-3.5 text-right">F1-Score</th>
            <th class="py-3 px-3.5 text-right">ROC-AUC</th>
            <th class="py-3 px-3.5 text-right">เวลาเทรน</th>
            <th class="py-3 px-3.5 text-right rounded-tr-lg">สถานะ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          {#each MODEL_METRICS as m}
            <tr class={`transition-colors ${m.isChampion ? 'bg-emerald-50/75 hover:bg-emerald-50' : 'text-neutral-500 hover:bg-neutral-50/60'}`}>
              <td class={`py-3.5 px-3.5 ${m.isChampion ? 'border-l-4 border-[#006241]' : 'border-l-4 border-transparent'}`}>
                <span class={m.isChampion ? 'font-bold text-[#1E3932] text-[13px]' : 'font-medium text-neutral-600'}>{m.name}</span>
                {#if m.isChampion}
                  <span class="ml-2 inline-flex items-center gap-1 rounded-md bg-[#006241] px-1.5 py-0.5 font-mono text-[10px] text-white font-semibold">
                    <svg class="h-2.5 w-2.5 fill-current text-[#CBA258]" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" /></svg>
                    CHAMPION
                  </span>
                {/if}
              </td>
              <td class={`py-3.5 px-3.5 ${m.isChampion ? 'text-neutral-700 font-medium' : 'text-neutral-400'}`}>{m.trainType}</td>
              <td class={`py-3.5 px-3.5 text-right font-mono tabular-nums ${m.isChampion ? 'font-bold text-neutral-900' : 'text-neutral-500'}`}>{(m.accuracy * 100).toFixed(2)}%</td>
              <td class={`py-3.5 px-3.5 text-right font-mono tabular-nums ${m.isChampion ? 'font-bold text-neutral-900' : 'text-neutral-500'}`}>{(m.f1Score * 100).toFixed(2)}%</td>
              <td class={`py-3.5 px-3.5 text-right font-mono tabular-nums ${m.isChampion ? 'font-bold text-[#006241] text-[13px]' : 'text-neutral-500'}`}>{(m.rocAuc).toFixed(4)}</td>
              <td class="py-3.5 px-3.5 text-right font-mono tabular-nums text-neutral-400">{m.trainTimeSec}s</td>
              <td class="py-3.5 px-3.5 text-right">
                {#if m.isChampion}
                  <span class="rounded-md bg-[#006241] px-2.5 py-0.5 text-[11px] font-semibold text-white">
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
  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <!-- Box 1: Overfitting Verification -->
    <div class="rounded-2xl border border-[#1E3932]/10 bg-white p-5 sm:p-6 shadow-[0_2px_10px_-2px_rgba(30,57,50,0.06)]">
      <div class="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3 mb-4">
        <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E3932]">
          การตรวจสอบ Overfitting (Train vs Test Gap)
        </h3>
        <span class="shrink-0 whitespace-nowrap rounded-md bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-[#006241]">
          ผ่านการตรวจ
        </span>
      </div>
      <div class="flex items-end gap-3 mb-4">
        <span class="font-mono text-5xl font-bold tracking-tight tabular-nums text-[#006241] leading-none">0.0167</span>
        <div class="pb-1 whitespace-nowrap text-xs text-neutral-500 leading-tight">
          Train-Test Gap<br /><span class="text-neutral-400">เพดานมาตรฐาน &lt; 0.05</span>
        </div>
      </div>
      <div class="mb-4 h-2 w-full rounded-full bg-[#F3F1EC] overflow-hidden" title="0.0167 / 0.05">
        <div class="h-full rounded-full bg-[#006241]" style="width: {(0.0167 / 0.05) * 100}%"></div>
      </div>
      <div class="space-y-2 text-xs text-neutral-600">
        <div class="flex items-baseline justify-between gap-3 py-1 border-b border-neutral-100/70">
          <span class="whitespace-nowrap">Train Set ROC-AUC</span>
          <span class="font-mono font-semibold text-neutral-900 tabular-nums">0.8759</span>
        </div>
        <div class="flex items-baseline justify-between gap-3 py-1 border-b border-neutral-100/70">
          <span class="whitespace-nowrap">Unseen Test Set ROC-AUC</span>
          <span class="font-mono font-bold text-[#006241] tabular-nums">0.8593</span>
        </div>
      </div>
      <p class="mt-3 text-[11px] text-neutral-600 leading-relaxed">
        ผลต่าง Gap 0.0167 ต่ำกว่าเพดาน 0.05 ยืนยันว่าโมเดลเรียนรู้รูปแบบทั่วไปได้สมบูรณ์ ไม่มีการท่องจำข้อมูล
      </p>
    </div>

    <!-- Box 2: Optimal Threshold Tuning -->
    <div class="rounded-2xl border border-[#1E3932]/10 bg-white p-5 sm:p-6 shadow-[0_2px_10px_-2px_rgba(30,57,50,0.06)]">
      <div class="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3 mb-4">
        <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E3932]">
          การจูน Optimal Threshold เพื่อผลกำไรสูงสุด
        </h3>
        <span class="shrink-0 whitespace-nowrap rounded-md bg-[#1E3932] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#CBA258]">
          F1-Score
        </span>
      </div>
      <div class="flex items-end gap-3 mb-4">
        <span class="font-mono text-5xl font-bold tracking-tight tabular-nums text-[#006241] leading-none">0.41</span>
        <div class="pb-1 whitespace-nowrap text-xs text-neutral-500 leading-tight">
          Optimal Threshold (41%)<br /><span class="text-neutral-400">จากค่าเริ่มต้น 0.50</span>
        </div>
      </div>
      <div class="relative mb-4 h-2 w-full rounded-full bg-[#F3F1EC]" title="0.41 vs 0.50">
        <div class="h-full rounded-full bg-[#006241]" style="width: 41%"></div>
        <div class="absolute top-[-3px] bottom-[-3px] w-0.5 bg-[#CBA258]" style="left: 50%"></div>
      </div>
      <div class="space-y-2 text-xs text-neutral-600">
        <div class="flex items-baseline justify-between gap-3 py-1 border-b border-neutral-100/70">
          <span class="whitespace-nowrap">เกณฑ์ตั้งต้นมาตรฐาน (Default)</span>
          <span class="font-mono text-neutral-500 tabular-nums">0.50 (50%)</span>
        </div>
        <div class="flex items-baseline justify-between gap-3 py-1 border-b border-neutral-100/70">
          <span class="shrink-0 whitespace-nowrap">F1-Score สูงสุด</span>
          <span class="text-right font-mono font-bold text-[#006241] tabular-nums">0.8102 (+0.0087 จาก 0.8015 ที่เกณฑ์ 0.50)</span>
        </div>
      </div>
      <p class="mt-3 text-[11px] text-neutral-600 leading-relaxed">
        การปรับจุดตัดเป็น 0.41 ช่วยเพิ่ม Recall บน Test Set เป็น 86.89% และทำ F1-Score สูงสุด (0.8102 บน Validation Set)
      </p>
    </div>
  </div>

  <!-- Production Data Science Visualizations: ROC Curve + Confusion Matrix 2x2 -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
    <!-- Card A: Multi-Model ROC Curve Comparison -->
    <div class="rounded-2xl border border-[#1E3932]/10 bg-white p-5 sm:p-6 shadow-[0_2px_10px_-2px_rgba(30,57,50,0.06)] flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3 mb-4">
          <div>
            <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E3932]">
              กราฟเปรียบเทียบ ROC Curve ทั้ง 3 โมเดล
            </h3>
            <p class="mt-0.5 text-xs text-neutral-500">
              อัตราส่วน True Positive Rate (TPR) ต่อ False Positive Rate (FPR)
            </p>
          </div>
          <span class="shrink-0 whitespace-nowrap rounded-md bg-[#F3F1EC] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#1E3932]">
            AUC = 0.8597
          </span>
        </div>

        <!-- SVG ROC Plot -->
        <div class="relative mx-auto w-full max-w-[380px]">
          <svg viewBox="0 0 320 235" class="w-full overflow-visible">
            <defs>
              <linearGradient id="lgbmRocArea" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#006241" stop-opacity="0.22" />
                <stop offset="100%" stop-color="#006241" stop-opacity="0.0" />
              </linearGradient>
            </defs>

            <!-- Plot Grid (Plot area: x=44..294 (250px), y=16..196 (180px)) -->
            <rect x="44" y="16" width="250" height="180" fill="#F7F5F0" rx="6" />
            {#each [0.25, 0.5, 0.75] as tick}
              <line
                x1={44 + tick * 250}
                y1="16"
                x2={44 + tick * 250}
                y2="196"
                stroke="#E5E2DC"
                stroke-dasharray="3 3"
              />
              <line
                x1="44"
                y1={196 - tick * 180}
                x2="294"
                y2={196 - tick * 180}
                stroke="#E5E2DC"
                stroke-dasharray="3 3"
              />
            {/each}

            <!-- Random Guess Diagonal (AUC 0.5000) -->
            <line
              x1="44"
              y1="196"
              x2="294"
              y2="16"
              stroke="#9CA3AF"
              stroke-width="1.25"
              stroke-dasharray="4 4"
            />

            <!-- Area Under Champion LightGBM Curve -->
            <path
              d="M 44 196 C 58 68, 118 26, 294 16 L 294 196 Z"
              fill="url(#lgbmRocArea)"
            />

            <!-- Logistic Regression Curve (AUC 0.8220) -->
            <path
              d="M 44 196 C 72 92, 142 42, 294 16"
              fill="none"
              stroke="#9CA3AF"
              stroke-width="2"
              stroke-linecap="round"
            />

            <!-- Random Forest Curve (AUC 0.8525) -->
            <path
              d="M 44 196 C 63 76, 126 31, 294 16"
              fill="none"
              stroke="#CBA258"
              stroke-width="2.25"
              stroke-linecap="round"
            />

            <!-- LightGBM Champion Curve (AUC 0.8597) -->
            <path
              d="M 44 196 C 58 68, 118 26, 294 16"
              fill="none"
              stroke="#006241"
              stroke-width="3"
              stroke-linecap="round"
            />

            <!-- Optimal Threshold Operating Point @ 0.41 (FPR ~0.342, TPR ~0.869) -->
            <circle cx="129.5" cy="39.6" r="5" fill="#006241" stroke="#ffffff" stroke-width="2" />
            <rect x="137" y="31" width="112" height="18" rx="4" fill="#1E3932" />
            <text x="193" y="43" text-anchor="middle" class="fill-[#CBA258] font-mono text-[9.5px] font-bold">
              Cut-off 0.41 (TPR 86.9%)
            </text>

            <!-- Axes Labels -->
            <text x="44" y="212" text-anchor="middle" class="fill-neutral-400 font-mono text-[10px]">0.0</text>
            <text x="169" y="212" text-anchor="middle" class="fill-neutral-400 font-mono text-[10px]">0.5</text>
            <text x="294" y="212" text-anchor="middle" class="fill-neutral-400 font-mono text-[10px]">1.0</text>
            <text x="169" y="228" text-anchor="middle" class="fill-neutral-600 text-[10px] font-semibold">
              False Positive Rate (FPR)
            </text>

            <text x="36" y="199" text-anchor="end" class="fill-neutral-400 font-mono text-[10px]">0.0</text>
            <text x="36" y="109" text-anchor="end" class="fill-neutral-400 font-mono text-[10px]">0.5</text>
            <text x="36" y="20" text-anchor="end" class="fill-neutral-400 font-mono text-[10px]">1.0</text>
            <text
              x="14"
              y="106"
              text-anchor="middle"
              transform="rotate(-90 14 106)"
              class="fill-neutral-600 text-[10px] font-semibold"
            >
              True Positive Rate (TPR)
            </text>
          </svg>
        </div>
      </div>

      <!-- Legend -->
      <div class="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-neutral-100 text-xs">
        <div class="flex items-center justify-between sm:justify-start gap-2 rounded-lg bg-emerald-50/70 px-2.5 py-1.5 border border-[#006241]/20">
          <span class="inline-flex items-center gap-1.5 font-semibold text-[#1E3932]">
            <span class="h-2.5 w-2.5 rounded-full bg-[#006241]"></span>LightGBM
          </span>
          <span class="font-mono font-bold text-[#006241] tabular-nums">0.8597</span>
        </div>
        <div class="flex items-center justify-between sm:justify-start gap-2 rounded-lg bg-[#F7F5F0] px-2.5 py-1.5">
          <span class="inline-flex items-center gap-1.5 font-medium text-neutral-700">
            <span class="h-2.5 w-2.5 rounded-full bg-[#CBA258]"></span>Random Forest
          </span>
          <span class="font-mono font-semibold text-neutral-700 tabular-nums">0.8525</span>
        </div>
        <div class="flex items-center justify-between sm:justify-start gap-2 rounded-lg bg-[#F7F5F0] px-2.5 py-1.5">
          <span class="inline-flex items-center gap-1.5 font-medium text-neutral-600">
            <span class="h-2.5 w-2.5 rounded-full bg-neutral-400"></span>Logistic Reg.
          </span>
          <span class="font-mono font-semibold text-neutral-600 tabular-nums">0.8220</span>
        </div>
      </div>
    </div>

    <!-- Card B: Confusion Matrix 2x2 (Unseen Test Set @ Threshold 0.41) -->
    <div class="rounded-2xl border border-[#1E3932]/10 bg-white p-5 sm:p-6 shadow-[0_2px_10px_-2px_rgba(30,57,50,0.06)] flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3 mb-4">
          <div>
            <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E3932]">
              ตาราง Confusion Matrix (Unseen Test Set)
            </h3>
            <p class="mt-0.5 text-xs text-neutral-500">
              ผลทำนายจริงบนชุดทดสอบ 6,603 รายการ ที่จุดตัด Optimal Threshold 0.41
            </p>
          </div>
          <span class="shrink-0 whitespace-nowrap rounded-md bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 font-mono text-[11px] font-semibold text-[#006241]">
            Recall 86.89%
          </span>
        </div>

        <!-- Column Headers -->
        <div class="grid grid-cols-[auto_1fr_1fr] gap-2.5 items-center text-center text-xs">
          <div></div>
          <div class="rounded-lg bg-[#F7F5F0] py-1.5 px-2 font-semibold text-[#1E3932] whitespace-nowrap">
            ทำนาย: ซื้อสำเร็จ (1)
          </div>
          <div class="rounded-lg bg-[#F7F5F0] py-1.5 px-2 font-semibold text-neutral-600 whitespace-nowrap">
            ทำนาย: ไม่ซื้อ (0)
          </div>

          <!-- Row 1: Actual Positive (3,584) -->
          <div class="rounded-lg bg-[#F7F5F0] py-4 px-2.5 font-semibold text-[#1E3932] text-left whitespace-nowrap">
            <span class="block text-[10px] uppercase tracking-wider text-neutral-400">ผลจริง</span>
            ซื้อสำเร็จ (1)
          </div>
          <!-- TP -->
          <div class="rounded-xl bg-[#006241] text-white p-3.5 shadow-xs">
            <div class="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#CBA258] font-bold">
              <span>True Positive (TP)</span>
              <span>47.2%</span>
            </div>
            <div class="mt-1 font-mono text-2xl sm:text-3xl font-bold tabular-nums leading-none">
              3,114
            </div>
            <div class="mt-1 text-[11px] text-white/80 whitespace-nowrap">
              ส่งโปรและลูกค้าซื้อจริง
            </div>
          </div>
          <!-- FN -->
          <div class="rounded-xl border border-rose-200/80 bg-rose-50/60 text-rose-950 p-3.5">
            <div class="flex items-center justify-between text-[10px] uppercase tracking-wider text-rose-600 font-bold">
              <span>False Negative (FN)</span>
              <span>7.1%</span>
            </div>
            <div class="mt-1 font-mono text-2xl sm:text-3xl font-bold tabular-nums leading-none text-rose-700">
              470
            </div>
            <div class="mt-1 text-[11px] text-rose-700/80 whitespace-nowrap">
              พลาดโอกาสส่งโปร
            </div>
          </div>

          <!-- Row 2: Actual Negative (3,019) -->
          <div class="rounded-lg bg-[#F7F5F0] py-4 px-2.5 font-semibold text-neutral-600 text-left whitespace-nowrap">
            <span class="block text-[10px] uppercase tracking-wider text-neutral-400">ผลจริง</span>
            ไม่ซื้อ (0)
          </div>
          <!-- FP -->
          <div class="rounded-xl border border-amber-200/80 bg-amber-50/60 text-amber-950 p-3.5">
            <div class="flex items-center justify-between text-[10px] uppercase tracking-wider text-amber-700 font-bold">
              <span>False Positive (FP)</span>
              <span>15.6%</span>
            </div>
            <div class="mt-1 font-mono text-2xl sm:text-3xl font-bold tabular-nums leading-none text-amber-800">
              1,033
            </div>
            <div class="mt-1 text-[11px] text-amber-800/80 whitespace-nowrap">
              ส่งโปรแต่ลูกค้าไม่ใช้
            </div>
          </div>
          <!-- TN -->
          <div class="rounded-xl border border-[#006241]/25 bg-emerald-50/70 text-[#1E3932] p-3.5">
            <div class="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#006241] font-bold">
              <span>True Negative (TN)</span>
              <span>30.1%</span>
            </div>
            <div class="mt-1 font-mono text-2xl sm:text-3xl font-bold tabular-nums leading-none text-[#1E3932]">
              1,986
            </div>
            <div class="mt-1 text-[11px] text-[#006241] whitespace-nowrap">
              ประหยัดงบโปรโมชัน
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Metrics Footer -->
      <div class="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-neutral-100 text-center text-xs">
        <div class="rounded-lg bg-[#F7F5F0] py-1.5 px-2">
          <span class="block text-[10px] text-neutral-500 uppercase">Test Accuracy</span>
          <span class="font-mono font-bold text-[#1E3932] tabular-nums">77.24%</span>
        </div>
        <div class="rounded-lg bg-[#F7F5F0] py-1.5 px-2">
          <span class="block text-[10px] text-neutral-500 uppercase">Test Precision</span>
          <span class="font-mono font-bold text-[#1E3932] tabular-nums">75.09%</span>
        </div>
        <div class="rounded-lg bg-emerald-50/70 py-1.5 px-2 border border-[#006241]/20">
          <span class="block text-[10px] text-[#006241] uppercase font-semibold">Test Recall</span>
          <span class="font-mono font-bold text-[#006241] tabular-nums">86.89%</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Global Feature Importance Visualization -->
  <div class="rounded-2xl border border-[#1E3932]/10 bg-white p-5 sm:p-6 shadow-[0_2px_10px_-2px_rgba(30,57,50,0.06)]">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-100 pb-3.5 mb-4">
      <div>
        <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E3932]">
          ความสำคัญของตัวแปร (Global Feature Importance — Top 10)
        </h3>
        <p class="mt-1 text-xs text-neutral-500">
          จำนวนครั้งที่ต้นไม้ LightGBM (starbucks_offer_model.pkl) เลือกใช้แต่ละฟีเจอร์ในการแตกกิ่งตัดสินใจ (รวม 2,950 Splits)
        </p>
      </div>
      <span class="shrink-0 whitespace-nowrap rounded-md bg-[#F3F1EC] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#1E3932] self-start sm:self-auto">
        importance_type = split
      </span>
    </div>

    <div class="space-y-3">
      {#each FEATURE_IMPORTANCES as item, idx}
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2 min-w-0">
              <span class="font-mono text-[11px] font-bold text-[#CBA258] w-5 shrink-0">#{idx + 1}</span>
              <span class="font-semibold text-[#1E3932] truncate">{item.label}</span>
              <span class="hidden sm:inline-block shrink-0 whitespace-nowrap rounded-md bg-[#F3F1EC] px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                {item.category}
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0 font-mono tabular-nums text-xs">
              <span class="whitespace-nowrap text-neutral-500">{item.splits} splits</span>
              <span class="font-bold text-[#006241] w-12 text-right">{item.pct.toFixed(1)}%</span>
            </div>
          </div>
          <div class="h-2.5 w-full rounded-full bg-[#F3F1EC] overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-[#1E3932] to-[#006241] transition-all duration-300"
              style={`width: ${(item.pct / 12.6) * 100}%`}
            ></div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
