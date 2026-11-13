<script lang="ts">
  import { onMount } from 'svelte';
  import { STARBUCKS_PORTFOLIO, CUSTOMER_PRESETS } from '../data/mlData';
  import type { CustomerProfile, OfferDetails, CustomerHistory, PredictionResult } from '../types/ml';

  // Helper to parse numbers safely and convert Thai digits (๐-๙) to Arabic digits
  function cleanNumber(val: any, fallback: number = 0): number {
    if (typeof val === 'number') return isNaN(val) ? fallback : val;
    if (!val) return fallback;
    const str = String(val).replace(/[๐-๙]/g, (d) => String('๐๑๒๓๔๕๖๗๘๙'.indexOf(d))).replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(str);
    return isNaN(parsed) ? fallback : parsed;
  }

  // Preset tracking
  let selectedPresetIdx = $state<number | null>(null);
  let isCustomized = $state<boolean>(false);

  // State: Profile
  let profile = $state<CustomerProfile>({
    age: 48,
    gender: 'F',
    income: 78000,
    becameMemberOnYear: 2016,
    becameMemberOnMonth: 7
  });

  // State: Offer
  let selectedOfferId = $state<string>(STARBUCKS_PORTFOLIO[0].id);
  let offer = $state<OfferDetails>({ ...STARBUCKS_PORTFOLIO[0] });

  // State: History
  let history = $state<CustomerHistory>({
    pastTransactionCount: 9,
    pastTotalSpend: 135.0,
    pastAverageSpend: 15.0,
    pastCompletedCount: 3,
    pastReceivedCount: 4
  });

  // Threshold
  let threshold = $state<number>(0.58);

  // Python Model Inference State
  let isLoading = $state<boolean>(true);
  let result = $state<any>({
    status: 'loading',
    engine: 'Python LightGBM Runtime',
    probability: 0.50,
    threshold: 0.58,
    isPositive: false,
    confidenceScore: 0,
    recommendationTitle: 'กำลังเตรียมโมเดล...',
    recommendationReason: 'กำลังโหลดข้อมูลและเชื่อมต่อ Python Model',
    roiEstimate: {
      expectedSpend: 0,
      expectedCost: 0,
      expectedProfit: 0,
      roiPercentage: 0
    },
    keyDrivers: []
  });

  let debounceTimer: any = null;

  async function callPythonModel() {
    isLoading = true;
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          offer,
          history,
          threshold
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      result = data;
    } catch (err: any) {
      console.error('Python inference error:', err);
      result = {
        status: 'error',
        engine: 'Python Error',
        probability: 0.50,
        threshold: threshold,
        isPositive: false,
        confidenceScore: 0,
        recommendationTitle: 'การเชื่อมต่อ Python ขัดข้อง',
        recommendationReason: err?.message || 'ไม่สามารถเรียก model/predict.py ได้',
        roiEstimate: {
          expectedSpend: 0,
          expectedCost: 0,
          expectedProfit: 0,
          roiPercentage: 0
        },
        keyDrivers: []
      };
    } finally {
      isLoading = false;
    }
  }

  function requestPrediction(delayMs = 250) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      callPythonModel();
    }, delayMs);
  }

  onMount(() => {
    callPythonModel();
  });

  function handlePresetChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    if (val === '') {
      selectedPresetIdx = null;
      isCustomized = false;
      return;
    }
    const idx = parseInt(val, 10);
    const p = CUSTOMER_PRESETS[idx];
    if (p) {
      selectedPresetIdx = idx;
      isCustomized = false;
      profile = { ...p.profile };
      history = { ...p.history };
      requestPrediction(50);
    }
  }

  function markCustomized() {
    if (selectedPresetIdx !== null) {
      isCustomized = true;
    }
    requestPrediction(300);
  }

  function handleOfferChange(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    selectedOfferId = id;
    const found = STARBUCKS_PORTFOLIO.find((o) => o.id === id);
    if (found) {
      offer = { ...found, channels: { ...found.channels } };
      requestPrediction(50);
    }
  }

  function updateAverageSpend() {
    const count = cleanNumber(history.pastTransactionCount, 0);
    const spend = cleanNumber(history.pastTotalSpend, 0);
    if (count > 0 && spend > 0) {
      history.pastAverageSpend = Math.round((spend / count) * 100) / 100;
    } else {
      history.pastAverageSpend = 0;
    }
  }

  const probabilityPercent = $derived<number>(
    Math.min(100, Math.max(0, cleanNumber(result?.probability, 0.5) * 100))
  );

  const thresholdPercent = $derived<number>(
    Math.round(cleanNumber(threshold, 0.58) * 100)
  );

  function scrollToVerdict() {
    const el = document.getElementById('verdict-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-12 pb-16 lg:pb-0">
  <!-- Left Side: Clean Café Form (7 Columns) -->
  <div class="space-y-4 lg:col-span-7">
    <!-- Persona Selector (Quiet neutral bar) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div class="flex items-center gap-2">
        <svg class="h-4 w-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <label for="persona-preset" class="text-sm font-medium text-neutral-800">กลุ่มลูกค้าตัวอย่าง</label>
        {#if isCustomized}
          <span class="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 border border-neutral-200/60">
            ปรับแต่งเอง
          </span>
        {/if}
      </div>
      <select
        id="persona-preset"
        onchange={handlePresetChange}
        class="h-9 rounded-lg border border-neutral-300/80 bg-neutral-50 px-3 text-xs sm:text-sm font-medium text-neutral-800 transition-colors focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006241]"
      >
        <option value="">เลือกกลุ่มลูกค้าเพื่อทดสอบ</option>
        {#each CUSTOMER_PRESETS as p, i}
          <option value={i}>{p.name} · ${p.profile.income.toLocaleString()} ({p.profile.gender})</option>
        {/each}
      </select>
    </div>

    <!-- 1. Customer Demographics Card -->
    <div class="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div class="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-700">
          1. ข้อมูลลูกค้า (Customer Demographics)
        </h2>
        <span class="font-mono text-[11px] text-neutral-400">profile.json</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div>
          <label for="profile-age" class="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            อายุ (ปี)
          </label>
          <input
            id="profile-age"
            type="text"
            inputmode="numeric"
            value={profile.age ?? ''}
            oninput={(e) => {
              profile.age = cleanNumber(e.currentTarget.value, 0);
              markCustomized();
            }}
            class="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm tabular-nums text-neutral-900 transition-colors focus:border-[#006241] focus:outline-none focus:ring-1 focus:ring-[#006241]"
          />
        </div>

        <div>
          <label for="profile-gender" class="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            เพศ
          </label>
          <select
            id="profile-gender"
            bind:value={profile.gender}
            onchange={markCustomized}
            class="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-900 transition-colors focus:border-[#006241] focus:outline-none focus:ring-1 focus:ring-[#006241]"
          >
            <option value="F">หญิง (Female)</option>
            <option value="M">ชาย (Male)</option>
            <option value="O">อื่นๆ (Other)</option>
            <option value="Unknown">ไม่ระบุ (Unknown)</option>
          </select>
        </div>

        <div>
          <label for="profile-income" class="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            รายได้ต่อปี ($)
          </label>
          <input
            id="profile-income"
            type="text"
            inputmode="numeric"
            value={profile.income ?? ''}
            oninput={(e) => {
              profile.income = cleanNumber(e.currentTarget.value, 0);
              markCustomized();
            }}
            class="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm tabular-nums text-neutral-900 transition-colors focus:border-[#006241] focus:outline-none focus:ring-1 focus:ring-[#006241]"
          />
        </div>

        <div>
          <label for="profile-member-year" class="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            สมาชิกตั้งแต่ปี
          </label>
          <select
            id="profile-member-year"
            bind:value={profile.becameMemberOnYear}
            onchange={markCustomized}
            class="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm text-neutral-900 transition-colors focus:border-[#006241] focus:outline-none focus:ring-1 focus:ring-[#006241]"
          >
            <option value={2013}>2013 (5+ ปี)</option>
            <option value={2014}>2014</option>
            <option value={2015}>2015</option>
            <option value={2016}>2016</option>
            <option value={2017}>2017</option>
            <option value={2018}>2018</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 2. Promotional Offer Specs -->
    <div class="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div class="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-700">
          2. ข้อเสนอโปรโมชัน (Promotional Offer)
        </h2>
        <span class="font-mono text-[11px] text-neutral-400">portfolio.json</span>
      </div>

      <!-- Portfolio Dropdown -->
      <div class="mb-4">
        <label for="offer-catalog" class="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
          เลือกข้อเสนอจาก Portfolio
        </label>
        <select
          id="offer-catalog"
          bind:value={selectedOfferId}
          onchange={handleOfferChange}
          class="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-900 transition-colors focus:border-[#006241] focus:outline-none focus:ring-1 focus:ring-[#006241]"
        >
          {#each STARBUCKS_PORTFOLIO as pOffer}
            <option value={pOffer.id}>
              [{pOffer.offerType.toUpperCase()}] {pOffer.name}
            </option>
          {/each}
        </select>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div>
          <span class="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            ประเภทโปรโมชัน
          </span>
          <div class="flex h-10 rounded-lg border border-neutral-300 bg-neutral-100 p-0.5">
            <button
              type="button"
              onclick={() => {
                offer.offerType = 'bogo';
                requestPrediction(50);
              }}
              class={`flex-1 rounded-md text-xs sm:text-sm font-medium transition-all ${
                offer.offerType === 'bogo'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              BOGO
            </button>
            <button
              type="button"
              onclick={() => {
                offer.offerType = 'discount';
                requestPrediction(50);
              }}
              class={`flex-1 rounded-md text-xs sm:text-sm font-medium transition-all ${
                offer.offerType === 'discount'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Discount
            </button>
          </div>
        </div>

        <div>
          <label for="offer-difficulty" class="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            ยอดซื้อขั้นต่ำ ($)
          </label>
          <input
            id="offer-difficulty"
            type="text"
            inputmode="numeric"
            value={offer.difficulty ?? ''}
            oninput={(e) => {
              offer.difficulty = cleanNumber(e.currentTarget.value, 0);
              requestPrediction(300);
            }}
            class="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm tabular-nums text-neutral-900 transition-colors focus:border-[#006241] focus:outline-none focus:ring-1 focus:ring-[#006241]"
          />
        </div>

        <div>
          <label for="offer-reward" class="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            รางวัลตอบแทน ($)
          </label>
          <input
            id="offer-reward"
            type="text"
            inputmode="numeric"
            value={offer.reward ?? ''}
            oninput={(e) => {
              offer.reward = cleanNumber(e.currentTarget.value, 0);
              requestPrediction(300);
            }}
            class="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm tabular-nums text-neutral-900 transition-colors focus:border-[#006241] focus:outline-none focus:ring-1 focus:ring-[#006241]"
          />
        </div>

        <div>
          <label for="offer-duration" class="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            อายุโปรโมชัน (วัน)
          </label>
          <input
            id="offer-duration"
            type="text"
            inputmode="numeric"
            value={Math.round((offer.durationHours || 120) / 24)}
            oninput={(e) => {
              offer.durationHours = cleanNumber(e.currentTarget.value, 5) * 24;
              requestPrediction(300);
            }}
            class="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm tabular-nums text-neutral-900 transition-colors focus:border-[#006241] focus:outline-none focus:ring-1 focus:ring-[#006241]"
          />
        </div>
      </div>

      <!-- Channels Selector -->
      <div class="mt-4 pt-3.5 border-t border-neutral-100">
        <span class="block text-xs sm:text-sm font-medium text-neutral-700 mb-2">ช่องทางการส่งข้อเสนอ</span>
        <div class="flex flex-wrap gap-2 text-xs sm:text-sm">
          <label class="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-1.5 cursor-pointer text-neutral-700 transition-colors hover:bg-neutral-100">
            <input type="checkbox" bind:checked={offer.channels.email} onchange={() => requestPrediction(100)} class="rounded border-neutral-300 text-[#006241] focus:ring-0" />
            <span>Email</span>
          </label>
          <label class="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-1.5 cursor-pointer text-neutral-700 transition-colors hover:bg-neutral-100">
            <input type="checkbox" bind:checked={offer.channels.mobile} onchange={() => requestPrediction(100)} class="rounded border-neutral-300 text-[#006241] focus:ring-0" />
            <span>Mobile App</span>
          </label>
          <label class="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-1.5 cursor-pointer text-neutral-700 transition-colors hover:bg-neutral-100">
            <input type="checkbox" bind:checked={offer.channels.social} onchange={() => requestPrediction(100)} class="rounded border-neutral-300 text-[#006241] focus:ring-0" />
            <span>Social Media</span>
          </label>
          <label class="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-1.5 cursor-pointer text-neutral-700 transition-colors hover:bg-neutral-100">
            <input type="checkbox" bind:checked={offer.channels.web} onchange={() => requestPrediction(100)} class="rounded border-neutral-300 text-[#006241] focus:ring-0" />
            <span>Web Platform</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 3. Customer History Signals -->
    <div class="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div class="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-700">
          3. ประวัติพฤติกรรมในอดีต (Historical Behavior)
        </h2>
        <span class="font-mono text-[11px] text-neutral-400">transcript.json</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div>
          <label for="history-tx-count" class="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            จำนวนบิลที่เคยซื้อ
          </label>
          <input
            id="history-tx-count"
            type="text"
            inputmode="numeric"
            value={history.pastTransactionCount ?? ''}
            oninput={(e) => {
              history.pastTransactionCount = cleanNumber(e.currentTarget.value, 0);
              updateAverageSpend();
              markCustomized();
            }}
            class="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm tabular-nums text-neutral-900 transition-colors focus:border-[#006241] focus:outline-none focus:ring-1 focus:ring-[#006241]"
          />
        </div>

        <div>
          <label for="history-total-spend" class="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            ยอดซื้อรวม ($)
          </label>
          <input
            id="history-total-spend"
            type="text"
            inputmode="numeric"
            value={history.pastTotalSpend ?? ''}
            oninput={(e) => {
              history.pastTotalSpend = cleanNumber(e.currentTarget.value, 0);
              updateAverageSpend();
              markCustomized();
            }}
            class="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm tabular-nums text-neutral-900 transition-colors focus:border-[#006241] focus:outline-none focus:ring-1 focus:ring-[#006241]"
          />
        </div>

        <div>
          <label for="history-completed-count" class="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            ทำโปรสำเร็จ (ครั้ง)
          </label>
          <input
            id="history-completed-count"
            type="text"
            inputmode="numeric"
            value={history.pastCompletedCount ?? ''}
            oninput={(e) => {
              history.pastCompletedCount = cleanNumber(e.currentTarget.value, 0);
              markCustomized();
            }}
            class="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm tabular-nums text-neutral-900 transition-colors focus:border-[#006241] focus:outline-none focus:ring-1 focus:ring-[#006241]"
          />
        </div>

        <div>
          <label for="history-received-count" class="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            โปรที่เคยได้รับ (ครั้ง)
          </label>
          <input
            id="history-received-count"
            type="text"
            inputmode="numeric"
            value={history.pastReceivedCount ?? ''}
            oninput={(e) => {
              history.pastReceivedCount = cleanNumber(e.currentTarget.value, 0);
              markCustomized();
            }}
            class="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm tabular-nums text-neutral-900 transition-colors focus:border-[#006241] focus:outline-none focus:ring-1 focus:ring-[#006241]"
          />
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between rounded-lg bg-neutral-50 px-3.5 py-2.5 text-xs sm:text-sm border border-neutral-200/60">
        <span class="text-neutral-600">ยอดซื้อเฉลี่ยต่อบิล (Avg Ticket):</span>
        <span class="font-mono font-medium text-neutral-900 tabular-nums">
          ${cleanNumber(history.pastAverageSpend, 0).toFixed(2)} / รายการ
        </span>
      </div>
    </div>
  </div>

  <!-- Right Side: Clean Prediction Verdict Card (5 Columns) -->
  <div class="space-y-4 lg:col-span-5">
    <!-- Main Verdict Box -->
    <div id="verdict-card" class="rounded-xl border border-neutral-200/90 bg-white p-5 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] min-h-[380px]">
      
      {#if isLoading}
        <!-- ============================================== -->
        <!-- SKELETON LOADING STATE (WHILE CALLING PYTHON) -->
        <!-- ============================================== -->
        <div class="space-y-4 animate-pulse">
          <div class="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div class="h-4 w-28 bg-neutral-200 rounded"></div>
            <div class="h-5 w-28 bg-neutral-200 rounded"></div>
          </div>

          <div class="my-4 space-y-2">
            <div class="flex items-center gap-2.5">
              <div class="h-7 w-7 rounded-full bg-neutral-200 shrink-0"></div>
              <div class="h-6 w-48 bg-neutral-200 rounded"></div>
            </div>
            <div class="h-4 w-3/4 bg-neutral-100 rounded mt-2"></div>
          </div>

          <div class="rounded-lg border border-neutral-200/80 bg-neutral-50 p-4 space-y-3">
            <div class="flex justify-between items-center">
              <div class="h-4 w-36 bg-neutral-200 rounded"></div>
              <div class="h-7 w-16 bg-neutral-200 rounded"></div>
            </div>
            <div class="h-3 w-full bg-neutral-200 rounded-full"></div>
            <div class="flex justify-between">
              <div class="h-3 w-8 bg-neutral-200 rounded"></div>
              <div class="h-3 w-32 bg-neutral-200 rounded"></div>
              <div class="h-3 w-8 bg-neutral-200 rounded"></div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2.5">
            <div class="h-16 rounded-lg bg-neutral-100"></div>
            <div class="h-16 rounded-lg bg-neutral-100"></div>
            <div class="h-16 rounded-lg bg-neutral-100"></div>
          </div>

          <div class="space-y-2 pt-2">
            <div class="h-10 rounded-lg bg-neutral-100"></div>
            <div class="h-10 rounded-lg bg-neutral-100"></div>
          </div>

          <div class="flex items-center justify-center gap-2 text-xs text-neutral-500 pt-2 border-t border-neutral-100">
            <span class="inline-block h-2 w-2 rounded-full bg-[#006241] animate-ping"></span>
            <span>กำลังประมวลผลผ่าน Python Model (LightGBM)...</span>
          </div>
        </div>
      {:else}
        <!-- ============================================== -->
        <!-- REAL PREDICTION RESULT (FROM PYTHON)           -->
        <!-- ============================================== -->
        <!-- Section Header -->
        <div class="flex items-center justify-between border-b border-neutral-100 pb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            ผลลัพธ์การทำนาย
          </span>
          <span class={`rounded-md px-2.5 py-0.5 font-mono text-xs font-medium tabular-nums ${
            result.isPositive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'bg-neutral-100 text-neutral-700'
          }`}>
            {result.engine || 'Python LightGBM'}
          </span>
        </div>

        <!-- Verdict Heading Banner (SVG icons without emoji) -->
        <div class="my-4">
          <div class="flex items-center gap-2.5">
            {#if result.isPositive}
              <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#006241] text-white">
                <svg class="h-4 w-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <h3 class="text-base sm:text-lg font-semibold text-neutral-900">
                {result.recommendationTitle || 'ควรส่งโปรโมชัน (SEND OFFER)'}
              </h3>
            {:else}
              <span class="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-neutral-600">
                <svg class="h-4 w-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </span>
              <h3 class="text-base sm:text-lg font-semibold text-neutral-900">
                {result.recommendationTitle || 'ระงับการส่ง (DO NOT SEND)'}
              </h3>
            {/if}
          </div>
          <p class="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
            {result.recommendationReason}
          </p>
        </div>

        <!-- Probability Gauge Box with Visual Cut-off Marker -->
        <div class="rounded-lg border border-neutral-200/80 bg-neutral-50 p-4">
          <div class="flex items-baseline justify-between mb-2">
            <span class="text-xs sm:text-sm font-medium text-neutral-700">โอกาสซื้อสำเร็จ (Probability)</span>
            <div class="text-right">
              <span class="font-mono text-2xl font-semibold tabular-nums text-neutral-900">
                {probabilityPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          <!-- Solid Progress Track with Visual Threshold Cut-off Tick Marker -->
          <div class="relative h-3 w-full rounded-full bg-neutral-200/80 overflow-visible my-3">
            <!-- Filled probability track -->
            <div
              class={`h-full rounded-full transition-all duration-300 ${
                result.isPositive ? 'bg-[#006241]' : 'bg-neutral-400'
              }`}
              style="width: {probabilityPercent}%"
            ></div>

            <!-- Cut-off Line Indicator -->
            <div
              class="absolute top-[-3px] bottom-[-3px] w-0.5 bg-neutral-800 z-10"
              style="left: {thresholdPercent}%"
              title="เกณฑ์ตัดสินใจ: {thresholdPercent}%"
            ></div>
          </div>

          <!-- Metric comparison label -->
          <div class="flex items-center justify-between font-mono text-xs tabular-nums text-neutral-500 pt-1">
            <span>0%</span>
            <span class="text-center font-sans">
              เกณฑ์ตัดสินใจ: <strong class="text-neutral-900 font-mono font-semibold">{thresholdPercent}%</strong>
              <span class="text-[11px] text-neutral-400 ml-1">
                ({probabilityPercent >= thresholdPercent ? 'ผ่านเกณฑ์' : 'ต่ำกว่าเกณฑ์'})
              </span>
            </span>
            <span>100%</span>
          </div>
        </div>

        <!-- Financial Projections Table -->
        <div class="mt-4">
          <span class="block text-xs sm:text-sm font-medium text-neutral-700 mb-2">ประมาณการผลลัพธ์ทางการเงิน (ROI Forecast)</span>
          <div class="grid grid-cols-3 gap-2.5 text-center">
            <div class="rounded-lg border border-neutral-200/70 bg-neutral-50 p-2.5">
              <span class="block text-[11px] text-neutral-500 uppercase font-medium">ยอดซื้อคาดการณ์</span>
              <div class="mt-1 font-mono text-sm sm:text-base font-semibold tabular-nums text-neutral-900">
                ${cleanNumber(result.roiEstimate?.expectedSpend, 0).toFixed(1)}
              </div>
            </div>
            <div class="rounded-lg border border-neutral-200/70 bg-neutral-50 p-2.5">
              <span class="block text-[11px] text-neutral-500 uppercase font-medium">ต้นทุนรางวัล</span>
              <div class="mt-1 font-mono text-sm sm:text-base font-semibold tabular-nums text-neutral-700">
                ${cleanNumber(result.roiEstimate?.expectedCost, 0).toFixed(1)}
              </div>
            </div>
            <div class="rounded-lg border border-neutral-200/70 bg-neutral-50 p-2.5">
              <span class="block text-[11px] text-neutral-500 uppercase font-medium">กำไรส่วนเพิ่ม</span>
              <div class="mt-1 font-mono text-sm sm:text-base font-semibold tabular-nums text-[#006241]">
                +${cleanNumber(result.roiEstimate?.expectedProfit, 0).toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        <!-- Key Driving Factors -->
        <div class="mt-4 border-t border-neutral-100 pt-3.5">
          <span class="block text-xs sm:text-sm font-medium text-neutral-700 mb-2.5">ปัจจัยสำคัญที่มีผลต่อผลลัพธ์ (Key Drivers)</span>
          <div class="space-y-2">
            {#each (result.keyDrivers || []) as driver}
              <div class="flex items-start gap-2.5 rounded-lg border border-neutral-200/70 bg-neutral-50/50 p-2.5 text-xs sm:text-sm">
                <span class={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-mono font-bold ${
                  driver.impact === 'positive'
                    ? 'bg-emerald-100 text-[#006241]'
                    : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {driver.impact === 'positive' ? '+' : '-'}
                </span>
                <div>
                  <span class="font-medium text-neutral-900">{driver.name}</span>
                  <p class="text-neutral-500 text-xs sm:text-sm mt-0.5 leading-relaxed">{driver.description}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Threshold Adjustment Slider -->
    <div class="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div class="flex justify-between items-center mb-1.5">
        <div>
          <span class="text-xs sm:text-sm font-medium text-neutral-800">เกณฑ์ตัดสินใจ (Decision Threshold)</span>
          <p class="text-xs text-neutral-500">ปรับระดับความเข้มงวดในการส่งข้อเสนอ</p>
        </div>
        <span class="rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-xs sm:text-sm font-semibold tabular-nums text-neutral-800 border border-neutral-200/50">
          {thresholdPercent}% ({cleanNumber(threshold, 0.58).toFixed(2)})
        </span>
      </div>

      <input
        type="range"
        min="0.20"
        max="0.80"
        step="0.01"
        bind:value={threshold}
        oninput={() => requestPrediction(150)}
        class="mt-2.5 w-full accent-[#006241] cursor-pointer"
      />

      <div class="mt-2 flex items-center justify-between text-xs text-neutral-500">
        <span>20% (ส่งบ่อยขึ้น)</span>
        <button
          type="button"
          onclick={() => {
            threshold = 0.58;
            requestPrediction(50);
          }}
          class="font-medium text-[#006241] hover:underline cursor-pointer"
        >
          รีเซ็ตเป็นค่าแนะนำ (58%)
        </button>
        <span>80% (เข้มงวดสูง)</span>
      </div>
    </div>
  </div>
</div>

<!-- Mobile Sticky Bottom Summary Bar (Only visible on small screens < 1024px) -->
<div class="fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t border-neutral-200 bg-white/95 backdrop-blur-xs px-4 py-2.5 shadow-lg flex items-center justify-between">
  <div class="flex items-center gap-2">
    {#if isLoading}
      <span class="inline-block h-2 w-2 rounded-full bg-[#006241] animate-ping"></span>
      <span class="text-xs font-medium text-neutral-600">กำลังคำนวณผ่าน Python...</span>
    {:else}
      {#if result.isPositive}
        <span class="h-2.5 w-2.5 rounded-full bg-[#006241]"></span>
        <span class="text-xs font-semibold text-neutral-900">ควรส่ง (SEND)</span>
      {:else}
        <span class="h-2.5 w-2.5 rounded-full bg-neutral-400"></span>
        <span class="text-xs font-semibold text-neutral-700">ระงับ (HOLD)</span>
      {/if}
      <span class="font-mono text-xs font-medium text-neutral-500">
        ({probabilityPercent.toFixed(1)}% / {thresholdPercent}%)
      </span>
    {/if}
  </div>
  <button
    type="button"
    onclick={scrollToVerdict}
    class="rounded-md bg-neutral-900 text-white px-3 py-1 text-xs font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
  >
    ดูผลลัพธ์
  </button>
</div>
