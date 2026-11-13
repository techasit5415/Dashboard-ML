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
  let threshold = $state<number>(0.41);

  // Python Model Inference State
  let isLoading = $state<boolean>(true);
  let result = $state<any>({
    status: 'loading',
    engine: 'Python LightGBM Runtime',
    probability: 0.50,
    threshold: 0.41,
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

  function selectPreset(idx: number) {
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
    Math.round(cleanNumber(threshold, 0.41) * 100)
  );

  // UI-only: scale for the diverging SHAP bar chart
  const maxDriverWeight = $derived<number>(
    Math.max(0, ...((result?.keyDrivers || []) as any[]).map((d) => Math.abs(cleanNumber(d?.weight, 0))))
  );

  // UI-only: SVG Semi-Circle Gauge geometry (center 110,100; radius 78; arc length = PI * 78 = 245.04)
  const gaugeRadius = 78;
  const gaugeArcLength = Math.PI * gaugeRadius;
  const gaugeDashOffset = $derived<number>(
    gaugeArcLength * (1 - probabilityPercent / 100)
  );
  const thresholdAngleRad = $derived<number>(
    Math.PI * (1 - thresholdPercent / 100)
  );
  const thresholdTick = $derived({
    x1: 110 + (gaugeRadius - 11) * Math.cos(thresholdAngleRad),
    y1: 100 - (gaugeRadius - 11) * Math.sin(thresholdAngleRad),
    x2: 110 + (gaugeRadius + 11) * Math.cos(thresholdAngleRad),
    y2: 100 - (gaugeRadius + 11) * Math.sin(thresholdAngleRad),
    lx: 110 + (gaugeRadius + 24) * Math.cos(thresholdAngleRad),
    ly: 100 - (gaugeRadius + 24) * Math.sin(thresholdAngleRad)
  });

  // UI-only: Short labels for the 4 Quick Chips
  const PRESET_CHIP_META = [
    { label: 'Loyal Spender', sub: 'F, 52 · $92k', badge: '~93%' },
    { label: 'New Member', sub: 'O, 23 · $38k', badge: '~73%' },
    { label: 'Borderline', sub: 'M, 28 · $45k', badge: '~38%' },
    { label: 'Low Responder', sub: 'M, 24 · $35k', badge: '~30%' }
  ];

  // UI-only: Active delivery channels list for Live Coupon Preview
  const activeChannelNames = $derived<string[]>(
    [
      offer.channels.email ? 'Email' : null,
      offer.channels.mobile ? 'Mobile App' : null,
      offer.channels.social ? 'Social Media' : null,
      offer.channels.web ? 'Web' : null
    ].filter(Boolean) as string[]
  );

  function scrollToVerdict() {
    const el = document.getElementById('verdict-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
</script>

<!-- Minimal Frameless Page Title (1 line on warm cream background) -->
<div class="mb-5">
  <h1 class="text-lg sm:text-xl font-bold tracking-tight text-[#1E3932]">
    จำลองและทำนายการตอบรับโปรโมชัน
  </h1>
</div>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-12 pb-16 lg:pb-0">
  <!-- Left Side: High-Craft Café Form (7 Columns) -->
  <div class="space-y-5 lg:col-span-7">
    <!-- Quick Chips Persona Selector (4 One-Click Buttons) -->
    <div class="rounded-2xl border border-[#1E3932]/10 bg-white p-4 shadow-[0_2px_10px_-2px_rgba(30,57,50,0.06)]">
      <div class="flex items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-2 whitespace-nowrap">
          <svg class="h-4 w-4 text-[#006241]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span class="text-xs sm:text-sm font-bold text-[#1E3932]">กลุ่มลูกค้าตัวอย่าง</span>
        </div>
        {#if isCustomized}
          <span class="rounded-full bg-[#CBA258]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#1E3932] border border-[#CBA258]/40">
            ปรับแต่งเอง
          </span>
        {:else if selectedPresetIdx !== null}
          <span class="text-[11px] text-neutral-400">คลิกเพื่อสลับโปรไฟล์ทันที</span>
        {:else}
          <span class="text-[11px] text-neutral-400">เลือกเคสตัวอย่าง</span>
        {/if}
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {#each CUSTOMER_PRESETS as p, i}
          {@const active = selectedPresetIdx === i && !isCustomized}
          {@const meta = PRESET_CHIP_META[i] || { label: p.name, sub: '', badge: '' }}
          <button
            type="button"
            onclick={() => selectPreset(i)}
            class={`group flex flex-col justify-between rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer ${
              active
                ? 'bg-[#006241] text-white shadow-xs ring-2 ring-[#006241]/25'
                : 'bg-[#F3F1EC] text-[#1E3932] hover:bg-[#EAE6DF]'
            }`}
          >
            <div class="flex items-center justify-between gap-1 w-full">
              <span class="text-xs font-bold truncate">{meta.label}</span>
              <span class={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums ${
                active
                  ? 'bg-white/20 text-white'
                  : 'bg-white/80 text-[#006241]'
              }`}>
                {meta.badge}
              </span>
            </div>
            <span class={`mt-1 text-[11px] font-mono tabular-nums truncate ${
              active ? 'text-white/80' : 'text-neutral-500'
            }`}>
              {meta.sub}
            </span>
          </button>
        {/each}
      </div>
    </div>

    <!-- 1. Customer Demographics Card -->
    <div class="rounded-2xl border border-[#1E3932]/10 bg-white p-5 sm:p-6 shadow-[0_2px_10px_-2px_rgba(30,57,50,0.06)] transition-shadow hover:shadow-[0_6px_20px_-4px_rgba(30,57,50,0.09)]">
      <div class="flex items-center justify-between gap-3 border-b border-neutral-100 pb-3.5 mb-5">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#1E3932] text-[11px] font-bold text-[#CBA258]">01</span>
          <h2 class="min-w-0 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E3932]">
            ข้อมูลลูกค้า
          </h2>
        </div>
        <span class="shrink-0 rounded-md bg-[#F3F1EC] px-2 py-0.5 font-mono text-[11px] font-medium text-neutral-500">profile.json</span>
      </div>

      <!-- Interactive Sliders Row: Age & Annual Income -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <!-- Age Field + Slider -->
        <div class="rounded-xl bg-[#F7F5F0]/70 border border-[#1E3932]/8 p-3.5 transition-colors hover:border-[#006241]/25">
          <div class="flex items-center justify-between gap-2 mb-2">
            <label for="profile-age" class="whitespace-nowrap text-xs sm:text-sm font-semibold text-[#1E3932]">
              อายุ (ปี)
            </label>
            <div class="flex items-center gap-1">
              <input
                id="profile-age"
                type="text"
                inputmode="numeric"
                value={profile.age ?? ''}
                oninput={(e) => {
                  profile.age = cleanNumber(e.currentTarget.value, 0);
                  markCustomized();
                }}
                class="h-8 w-16 rounded-lg bg-[#F3F1EC] px-2 text-right font-mono text-sm font-bold tabular-nums text-[#006241] border border-transparent transition-all focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006241]/20"
              />
              <span class="text-xs font-medium text-neutral-500">ปี</span>
            </div>
          </div>
          <input
            type="range"
            min="18"
            max="100"
            step="1"
            value={Math.min(100, Math.max(18, cleanNumber(profile.age, 48)))}
            oninput={(e) => {
              profile.age = cleanNumber(e.currentTarget.value, 48);
              markCustomized();
            }}
            aria-label="แถบเลื่อนอายุ"
            class="w-full h-1.5 rounded-lg cursor-pointer accent-[#006241]"
          />
          <div class="mt-1 flex justify-between font-mono text-[10px] text-neutral-400 tabular-nums">
            <span>18 ปี</span>
            <span>60 ปี</span>
            <span>100 ปี</span>
          </div>
        </div>

        <!-- Income Field + Slider -->
        <div class="rounded-xl bg-[#F7F5F0]/70 border border-[#1E3932]/8 p-3.5 transition-colors hover:border-[#006241]/25">
          <div class="flex items-center justify-between gap-2 mb-2">
            <label for="profile-income" class="whitespace-nowrap text-xs sm:text-sm font-semibold text-[#1E3932]">
              รายได้ต่อปี ($)
            </label>
            <div class="flex items-center gap-1">
              <span class="font-mono text-xs font-bold text-neutral-400">$</span>
              <input
                id="profile-income"
                type="text"
                inputmode="numeric"
                value={profile.income ?? ''}
                oninput={(e) => {
                  profile.income = cleanNumber(e.currentTarget.value, 0);
                  markCustomized();
                }}
                class="h-8 w-24 rounded-lg bg-[#F3F1EC] px-2 text-right font-mono text-sm font-bold tabular-nums text-[#006241] border border-transparent transition-all focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006241]/20"
              />
            </div>
          </div>
          <input
            type="range"
            min="30000"
            max="120000"
            step="1000"
            value={Math.min(120000, Math.max(30000, cleanNumber(profile.income, 78000)))}
            oninput={(e) => {
              profile.income = cleanNumber(e.currentTarget.value, 78000);
              markCustomized();
            }}
            aria-label="แถบเลื่อนรายได้ต่อปี"
            class="w-full h-1.5 rounded-lg cursor-pointer accent-[#006241]"
          />
          <div class="mt-1 flex justify-between font-mono text-[10px] text-neutral-400 tabular-nums">
            <span>$30k</span>
            <span>$75k</span>
            <span>$120k</span>
          </div>
        </div>
      </div>

      <!-- Secondary Demographic Fields (Gender, Member Year, Member Month) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 items-end gap-3.5">
        <div>
          <label for="profile-gender" class="block whitespace-nowrap text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            เพศ
          </label>
          <select
            id="profile-gender"
            bind:value={profile.gender}
            onchange={markCustomized}
            class="h-10 w-full rounded-xl bg-[#F3F1EC] px-3 text-sm font-medium text-neutral-900 border border-transparent transition-all hover:bg-[#EAE6DF] focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006241]/20 cursor-pointer"
          >
            <option value="F">หญิง (Female)</option>
            <option value="M">ชาย (Male)</option>
            <option value="O">อื่นๆ (Other)</option>
            <option value="Unknown">ไม่ระบุ (Unknown)</option>
          </select>
        </div>

        <div>
          <label for="profile-member-year" class="block whitespace-nowrap text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            สมาชิกตั้งแต่ปี
          </label>
          <select
            id="profile-member-year"
            bind:value={profile.becameMemberOnYear}
            onchange={markCustomized}
            class="h-10 w-full rounded-xl bg-[#F3F1EC] px-3 font-mono text-sm font-medium text-neutral-900 border border-transparent transition-all hover:bg-[#EAE6DF] focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006241]/20 cursor-pointer"
          >
            <option value={2013}>2013 (5+ ปี)</option>
            <option value={2014}>2014</option>
            <option value={2015}>2015</option>
            <option value={2016}>2016</option>
            <option value={2017}>2017</option>
            <option value={2018}>2018</option>
          </select>
        </div>

        <div>
          <label for="profile-member-month" class="block whitespace-nowrap text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            เดือนที่สมัคร
          </label>
          <select
            id="profile-member-month"
            bind:value={profile.becameMemberOnMonth}
            onchange={markCustomized}
            class="h-10 w-full rounded-xl bg-[#F3F1EC] px-3 font-mono text-sm font-medium text-neutral-900 border border-transparent transition-all hover:bg-[#EAE6DF] focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006241]/20 cursor-pointer"
          >
            <option value={1}>1 (ม.ค.)</option>
            <option value={2}>2 (ก.พ.)</option>
            <option value={3}>3 (มี.ค.)</option>
            <option value={4}>4 (เม.ย.)</option>
            <option value={5}>5 (พ.ค.)</option>
            <option value={6}>6 (มิ.ย.)</option>
            <option value={7}>7 (ก.ค.)</option>
            <option value={8}>8 (ส.ค.)</option>
            <option value={9}>9 (ก.ย.)</option>
            <option value={10}>10 (ต.ค.)</option>
            <option value={11}>11 (พ.ย.)</option>
            <option value={12}>12 (ธ.ค.)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 2. Promotional Offer Specs -->
    <div class="rounded-2xl border border-[#1E3932]/10 bg-white p-5 sm:p-6 shadow-[0_2px_10px_-2px_rgba(30,57,50,0.06)] transition-shadow hover:shadow-[0_6px_20px_-4px_rgba(30,57,50,0.09)]">
      <div class="flex items-center justify-between gap-3 border-b border-neutral-100 pb-3.5 mb-5">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#1E3932] text-[11px] font-bold text-[#CBA258]">02</span>
          <h2 class="min-w-0 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E3932]">
            ข้อเสนอโปรโมชัน (Promotional Offer)
          </h2>
        </div>
        <span class="shrink-0 rounded-md bg-[#F3F1EC] px-2 py-0.5 font-mono text-[11px] font-medium text-neutral-500">portfolio.json</span>
      </div>

      <!-- Portfolio Dropdown -->
      <div class="mb-4">
        <label for="offer-catalog" class="block whitespace-nowrap text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
          เลือกข้อเสนอจากแคมเปญมาตรฐาน
        </label>
        <select
          id="offer-catalog"
          bind:value={selectedOfferId}
          onchange={handleOfferChange}
          class="h-10 w-full rounded-xl bg-[#F3F1EC] px-3.5 text-sm font-semibold text-[#1E3932] border border-transparent transition-all hover:bg-[#EAE6DF] focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006241]/20 cursor-pointer"
        >
          {#each STARBUCKS_PORTFOLIO as pOffer}
            <option value={pOffer.id}>
              [{pOffer.offerType.toUpperCase()}] {pOffer.name}
            </option>
          {/each}
        </select>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 items-end gap-3.5">
        <div>
          <span class="block whitespace-nowrap text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
            ประเภทโปรโมชัน
          </span>
          <div class="flex h-10 rounded-xl bg-[#F3F1EC] p-1">
            <button
              type="button"
              onclick={() => {
                offer.offerType = 'bogo';
                requestPrediction(50);
              }}
              class={`flex-1 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                offer.offerType === 'bogo'
                  ? 'bg-[#006241] text-white shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-[#1E3932]'
              }`}
            >
              BOGO (1 แถม 1)
            </button>
            <button
              type="button"
              onclick={() => {
                offer.offerType = 'discount';
                requestPrediction(50);
              }}
              class={`flex-1 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                offer.offerType === 'discount'
                  ? 'bg-[#006241] text-white shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-[#1E3932]'
              }`}
            >
              Discount (ส่วนลด)
            </button>
          </div>
        </div>

        <div>
          <label for="offer-difficulty" class="block whitespace-nowrap text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
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
            class="h-10 w-full rounded-xl bg-[#F3F1EC] px-3.5 font-mono text-sm font-semibold tabular-nums text-neutral-900 border border-transparent transition-all hover:bg-[#EAE6DF] focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006241]/20"
          />
        </div>

        <div>
          <label for="offer-reward" class="block whitespace-nowrap text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
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
            class="h-10 w-full rounded-xl bg-[#F3F1EC] px-3.5 font-mono text-sm font-semibold tabular-nums text-neutral-900 border border-transparent transition-all hover:bg-[#EAE6DF] focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006241]/20"
          />
        </div>

        <div>
          <label for="offer-duration" class="block whitespace-nowrap text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
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
            class="h-10 w-full rounded-xl bg-[#F3F1EC] px-3.5 font-mono text-sm font-semibold tabular-nums text-neutral-900 border border-transparent transition-all hover:bg-[#EAE6DF] focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006241]/20"
          />
        </div>
      </div>

      <!-- Channels Selector -->
      <div class="mt-4 pt-3.5 border-t border-neutral-100">
        <span class="block text-xs sm:text-sm font-medium text-neutral-700 mb-2">ช่องทางการส่งข้อเสนอ (Delivery Channels)</span>
        <div class="flex flex-wrap gap-2 text-xs sm:text-sm">
          <label class={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 cursor-pointer font-medium transition-all ${offer.channels.email ? 'bg-[#006241]/10 text-[#1E3932] ring-1 ring-[#006241]/30' : 'bg-[#F3F1EC] text-neutral-600 hover:bg-[#EAE6DF]'}`}>
            <input type="checkbox" bind:checked={offer.channels.email} onchange={() => requestPrediction(100)} class="rounded border-neutral-300 text-[#006241] focus:ring-0" />
            <span>Email</span>
          </label>
          <label class={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 cursor-pointer font-medium transition-all ${offer.channels.mobile ? 'bg-[#006241]/10 text-[#1E3932] ring-1 ring-[#006241]/30' : 'bg-[#F3F1EC] text-neutral-600 hover:bg-[#EAE6DF]'}`}>
            <input type="checkbox" bind:checked={offer.channels.mobile} onchange={() => requestPrediction(100)} class="rounded border-neutral-300 text-[#006241] focus:ring-0" />
            <span>Mobile App</span>
          </label>
          <label class={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 cursor-pointer font-medium transition-all ${offer.channels.social ? 'bg-[#006241]/10 text-[#1E3932] ring-1 ring-[#006241]/30' : 'bg-[#F3F1EC] text-neutral-600 hover:bg-[#EAE6DF]'}`}>
            <input type="checkbox" bind:checked={offer.channels.social} onchange={() => requestPrediction(100)} class="rounded border-neutral-300 text-[#006241] focus:ring-0" />
            <span>Social Media</span>
          </label>
          <label class={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 cursor-pointer font-medium transition-all ${offer.channels.web ? 'bg-[#006241]/10 text-[#1E3932] ring-1 ring-[#006241]/30' : 'bg-[#F3F1EC] text-neutral-600 hover:bg-[#EAE6DF]'}`}>
            <input type="checkbox" bind:checked={offer.channels.web} onchange={() => requestPrediction(100)} class="rounded border-neutral-300 text-[#006241] focus:ring-0" />
            <span>Web Platform</span>
          </label>
        </div>
      </div>

      <!-- Live Coupon Preview Strip -->
      <div class="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-dashed border-[#006241]/35 bg-[#F7F5F0] px-4 py-3">
        <div class="flex items-center gap-3 min-w-0">
          <span class="shrink-0 rounded-lg bg-[#006241] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-white">
            {offer.offerType === 'bogo' ? 'BOGO' : 'DISCOUNT'}
          </span>
          <div class="min-w-0 text-xs sm:text-sm text-[#1E3932]">
            <span class="font-semibold">
              {offer.offerType === 'bogo'
                ? `ซื้อครบ $${cleanNumber(offer.difficulty, 0)} รับฟรีอีกแก้วมูลค่า $${cleanNumber(offer.reward, 0)}`
                : `ซื้อครบ $${cleanNumber(offer.difficulty, 0)} รับส่วนลดทันที $${cleanNumber(offer.reward, 0)}`}
            </span>
            <span class="text-neutral-500">
              · ภายใน {Math.round((offer.durationHours || 120) / 24)} วัน
            </span>
          </div>
        </div>
        <div class="shrink-0 text-[11px] font-medium text-neutral-500 whitespace-nowrap">
          ส่งผ่าน: <span class="font-semibold text-[#006241]">{activeChannelNames.length > 0 ? activeChannelNames.join(', ') : 'ไม่ได้เลือก'}</span>
        </div>
      </div>
    </div>

    <!-- 3. Customer History Signals -->
    <div class="rounded-2xl border border-[#1E3932]/10 bg-white p-5 sm:p-6 shadow-[0_2px_10px_-2px_rgba(30,57,50,0.06)] transition-shadow hover:shadow-[0_6px_20px_-4px_rgba(30,57,50,0.09)]">
      <div class="flex items-center justify-between gap-3 border-b border-neutral-100 pb-3.5 mb-5">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#1E3932] text-[11px] font-bold text-[#CBA258]">03</span>
          <h2 class="min-w-0 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E3932]">
            ประวัติพฤติกรรมในอดีต
          </h2>
        </div>
        <span class="shrink-0 rounded-md bg-[#F3F1EC] px-2 py-0.5 font-mono text-[11px] font-medium text-neutral-500">transcript.json</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 items-end gap-3.5">
        <div>
          <label for="history-tx-count" class="block whitespace-nowrap text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
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
            class="h-10 w-full rounded-xl bg-[#F3F1EC] px-3.5 font-mono text-sm font-semibold tabular-nums text-neutral-900 border border-transparent transition-all hover:bg-[#EAE6DF] focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006241]/20"
          />
        </div>

        <div>
          <label for="history-total-spend" class="block whitespace-nowrap text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
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
            class="h-10 w-full rounded-xl bg-[#F3F1EC] px-3.5 font-mono text-sm font-semibold tabular-nums text-neutral-900 border border-transparent transition-all hover:bg-[#EAE6DF] focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006241]/20"
          />
        </div>

        <div>
          <label for="history-completed-count" class="block whitespace-nowrap text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
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
            class="h-10 w-full rounded-xl bg-[#F3F1EC] px-3.5 font-mono text-sm font-semibold tabular-nums text-neutral-900 border border-transparent transition-all hover:bg-[#EAE6DF] focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006241]/20"
          />
        </div>

        <div>
          <label for="history-received-count" class="block whitespace-nowrap text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
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
            class="h-10 w-full rounded-xl bg-[#F3F1EC] px-3.5 font-mono text-sm font-semibold tabular-nums text-neutral-900 border border-transparent transition-all hover:bg-[#EAE6DF] focus:border-[#006241] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006241]/20"
          />
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 whitespace-nowrap rounded-xl bg-[#F7F5F0] px-4 py-2.5 text-xs sm:text-sm border border-[#1E3932]/10">
        <span class="text-neutral-600 font-medium">ยอดซื้อเฉลี่ยต่อบิล (Avg Ticket Size):</span>
        <span class="font-mono font-bold text-[#006241] tabular-nums">
          ${cleanNumber(history.pastAverageSpend, 0).toFixed(2)} / รายการ
        </span>
      </div>
    </div>
  </div>

  <!-- Right Side: Prediction Verdict & Analytics (5 Columns) -->
  <div class="space-y-5 lg:col-span-5">
    <!-- Main Verdict Box -->
    <div id="verdict-card" class="rounded-2xl border border-[#1E3932]/10 bg-white p-5 sm:p-6 transition-all shadow-[0_4px_20px_-4px_rgba(30,57,50,0.08)] min-h-[420px]">
      {#if isLoading}
        <!-- SKELETON LOADING STATE -->
        <div class="space-y-4 animate-pulse">
          <div class="h-32 rounded-xl bg-neutral-100"></div>
          <div class="h-44 rounded-xl bg-neutral-100"></div>
          <div class="grid grid-cols-3 gap-2.5">
            <div class="h-16 rounded-xl bg-neutral-100"></div>
            <div class="h-16 rounded-xl bg-neutral-100"></div>
            <div class="h-16 rounded-xl bg-neutral-100"></div>
          </div>
          <div class="space-y-2 pt-2">
            <div class="h-10 rounded-xl bg-neutral-100"></div>
            <div class="h-10 rounded-xl bg-neutral-100"></div>
          </div>
          <div class="flex items-center justify-center gap-2 text-xs text-neutral-500 pt-2 border-t border-neutral-100">
            <span class="inline-block h-2 w-2 rounded-full bg-[#006241] animate-ping"></span>
            <span>กำลังประมวลผลผ่าน Python Model (LightGBM)...</span>
          </div>
        </div>
      {:else}
        <!-- Hero Status Card -->
        <div
          class={`relative overflow-hidden rounded-xl p-5 transition-colors duration-300 ${
            result.status === 'error'
              ? 'bg-amber-50 border border-amber-200 text-amber-950'
              : result.isPositive
                ? 'bg-gradient-to-br from-[#1E3932] via-[#006241] to-[#00754A] text-white shadow-[0_10px_28px_-10px_rgba(0,98,65,0.65)]'
                : 'bg-gradient-to-br from-rose-50 to-rose-100/70 border border-rose-200 text-rose-950'
          }`}
        >
          <div class="flex items-center justify-between gap-3">
            <span class={`shrink-0 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.12em] ${result.isPositive && result.status !== 'error' ? 'text-[#CBA258]' : 'opacity-65'}`}>
              ผลลัพธ์การทำนาย
            </span>
            <span class={`min-w-0 truncate rounded-md px-2 py-0.5 font-mono text-[11px] font-medium ${
              result.isPositive && result.status !== 'error' ? 'bg-white/15 text-white border border-white/15' : 'bg-white/80 border border-black/5'
            }`}>
              {result.engine || 'Python LightGBM'}
            </span>
          </div>

          <div class="mt-4 flex items-end justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2.5">
                <span class={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  result.status === 'error'
                    ? 'bg-amber-200 text-amber-900'
                    : result.isPositive
                      ? 'bg-[#CBA258] text-[#1E3932]'
                      : 'bg-rose-200/80 text-rose-800'
                }`}>
                  {#if result.isPositive && result.status !== 'error'}
                    <svg class="h-4 w-4 stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  {:else if result.status === 'error'}
                    <svg class="h-4 w-4 stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><line x1="12" y1="7" x2="12" y2="13"></line><line x1="12" y1="17" x2="12" y2="17.01"></line></svg>
                  {:else}
                    <svg class="h-4 w-4 stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  {/if}
                </span>
                <span class="whitespace-nowrap text-xl sm:text-2xl font-bold tracking-tight leading-none">
                  {result.status === 'error' ? 'ERROR' : result.isPositive ? 'RECOMMENDED' : 'DO NOT SEND'}
                </span>
              </div>
              <h3 class="mt-2 text-sm font-semibold">
                {result.recommendationTitle || (result.isPositive ? 'ควรส่งโปรโมชัน (SEND OFFER)' : 'ระงับการส่ง (DO NOT SEND)')}
              </h3>
            </div>
            <div class="text-right shrink-0">
              <div class="whitespace-nowrap font-mono text-3xl font-bold tabular-nums leading-none">
                {probabilityPercent.toFixed(1)}<span class="text-lg">%</span>
              </div>
              <div class={`mt-1 whitespace-nowrap text-[11px] ${result.isPositive && result.status !== 'error' ? 'text-white/75' : 'opacity-65'}`}>
                vs เกณฑ์ {thresholdPercent}%
              </div>
            </div>
          </div>

          <p class={`mt-3 text-xs sm:text-sm leading-relaxed ${result.isPositive && result.status !== 'error' ? 'text-white/85' : 'opacity-80'}`}>
            {result.recommendationReason}
          </p>
        </div>

        <!-- SVG Semi-Circle Gauge with Threshold Marker -->
        <div class="mt-4 rounded-xl border border-[#1E3932]/10 bg-[#F7F5F0]/60 p-4">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="whitespace-nowrap text-xs sm:text-sm font-semibold text-[#1E3932]">โอกาสซื้อสำเร็จ (Conversion Gauge)</span>
            <span class={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${
              probabilityPercent >= thresholdPercent
                ? 'bg-[#006241]/12 text-[#006241]'
                : 'bg-neutral-200/80 text-neutral-600'
            }`}>
              {probabilityPercent >= thresholdPercent ? 'ผ่านเกณฑ์ตัดสินใจ' : 'ต่ำกว่าเกณฑ์ตัดสินใจ'}
            </span>
          </div>

          <div class="relative mx-auto flex flex-col items-center">
            <svg viewBox="0 0 220 122" class="w-full max-w-[260px] overflow-visible">
              <defs>
                <linearGradient id="sbGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#1E3932" />
                  <stop offset="60%" stop-color="#006241" />
                  <stop offset="100%" stop-color="#00754A" />
                </linearGradient>
              </defs>

              <!-- Background Track Arc -->
              <path
                d="M 32 100 A 78 78 0 0 1 188 100"
                fill="none"
                stroke="#E5E2DC"
                stroke-width="14"
                stroke-linecap="round"
              />

              <!-- Active Value Arc -->
              <path
                d="M 32 100 A 78 78 0 0 1 188 100"
                fill="none"
                stroke={result.isPositive ? 'url(#sbGaugeGrad)' : '#9CA3AF'}
                stroke-width="14"
                stroke-linecap="round"
                stroke-dasharray={gaugeArcLength}
                stroke-dashoffset={gaugeDashOffset}
                class="transition-all duration-500 ease-out"
              />

              <!-- Threshold Cut-off Tick Line -->
              <line
                x1={thresholdTick.x1}
                y1={thresholdTick.y1}
                x2={thresholdTick.x2}
                y2={thresholdTick.y2}
                stroke="#CBA258"
                stroke-width="3"
                stroke-linecap="round"
              />

              <!-- Threshold Label Badge -->
              <text
                x={thresholdTick.lx}
                y={thresholdTick.ly}
                text-anchor="middle"
                dominant-baseline="middle"
                class="fill-[#1E3932] font-mono text-[10px] font-bold"
              >
                {thresholdPercent}%
              </text>

              <!-- Center Readout -->
              <text
                x="110"
                y="84"
                text-anchor="middle"
                class="fill-[#1E3932] font-mono text-[26px] font-bold"
              >
                {probabilityPercent.toFixed(1)}%
              </text>
              <text
                x="110"
                y="102"
                text-anchor="middle"
                class="fill-neutral-500 text-[10px] font-medium"
              >
                เกณฑ์ตัดสินใจ {thresholdPercent}%
              </text>

              <!-- Min / Max Labels -->
              <text x="26" y="116" text-anchor="middle" class="fill-neutral-400 font-mono text-[10px]">0%</text>
              <text x="194" y="116" text-anchor="middle" class="fill-neutral-400 font-mono text-[10px]">100%</text>
            </svg>
          </div>
        </div>

        <!-- Financial Projections Table -->
        <div class="mt-4">
          <span class="block whitespace-nowrap text-xs sm:text-sm font-semibold text-[#1E3932] mb-2">ประมาณการผลลัพธ์ทางการเงิน (ROI Forecast)</span>
          <div class="grid grid-cols-3 gap-2.5 text-center">
            <div class="rounded-xl border border-[#1E3932]/10 bg-[#F7F5F0]/60 p-3">
              <span class="block whitespace-nowrap text-[11px] text-neutral-500 uppercase font-medium">ยอดซื้อคาดการณ์</span>
              <div class="mt-1 font-mono text-sm sm:text-base font-bold tabular-nums text-[#1E3932]">
                ${cleanNumber(result.roiEstimate?.expectedSpend, 0).toFixed(1)}
              </div>
            </div>
            <div class="rounded-xl border border-[#1E3932]/10 bg-[#F7F5F0]/60 p-3">
              <span class="block whitespace-nowrap text-[11px] text-neutral-500 uppercase font-medium">ต้นทุนรางวัล</span>
              <div class="mt-1 font-mono text-sm sm:text-base font-bold tabular-nums text-neutral-700">
                ${cleanNumber(result.roiEstimate?.expectedCost, 0).toFixed(1)}
              </div>
            </div>
            <div class="rounded-xl border border-[#006241]/20 bg-emerald-50/50 p-3">
              <span class="block whitespace-nowrap text-[11px] text-[#006241] uppercase font-semibold">กำไรส่วนเพิ่ม</span>
              <div class="mt-1 font-mono text-sm sm:text-base font-bold tabular-nums text-[#006241]">
                +${cleanNumber(result.roiEstimate?.expectedProfit, 0).toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        <!-- Key Driving Factors: Horizontal Diverging Bar Chart (SHAP) -->
        <div class="mt-4 border-t border-neutral-100 pt-4">
          <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 mb-3">
            <span class="whitespace-nowrap text-xs sm:text-sm font-semibold text-[#1E3932]">ปัจจัยสำคัญที่มีผลต่อผลลัพธ์ (Key Drivers · SHAP)</span>
            <div class="flex shrink-0 items-center gap-3 whitespace-nowrap text-[11px] text-neutral-500">
              <span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-sm bg-rose-400"></span>ลดโอกาส</span>
              <span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-sm bg-[#006241]"></span>เพิ่มโอกาส</span>
            </div>
          </div>
          {#if (result.keyDrivers || []).length === 0}
            <p class="text-xs text-neutral-400">ไม่มีปัจจัยที่มีผลเด่นชัด</p>
          {:else}
            <div class="space-y-2.5">
              {#each (result.keyDrivers || []) as driver}
                {@const w = cleanNumber(driver.weight, 0)}
                {@const pct = maxDriverWeight > 0 ? (Math.abs(w) / maxDriverWeight) * 50 : 0}
                <div>
                  <div class="flex items-center justify-between gap-2 text-xs mb-1">
                    <span class="min-w-0 font-medium text-neutral-800 truncate" title={driver.name}>{driver.name}</span>
                    <span class={`shrink-0 font-mono font-bold tabular-nums ${w >= 0 ? 'text-[#006241]' : 'text-rose-600'}`}>
                      {w >= 0 ? '+' : ''}{w.toFixed(3)}
                    </span>
                  </div>
                  <div class="relative h-2.5 w-full rounded-full bg-[#F3F1EC]">
                    <div class="absolute left-1/2 top-[-3px] bottom-[-3px] w-px bg-neutral-400"></div>
                    {#if w >= 0}
                      <div class="absolute left-1/2 top-0 h-full rounded-r-full bg-[#006241] transition-all duration-500" style="width: {pct}%"></div>
                    {:else}
                      <div class="absolute right-1/2 top-0 h-full rounded-l-full bg-rose-400 transition-all duration-500" style="width: {pct}%"></div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
            <div class="mt-2 flex justify-between font-mono text-[10px] text-neutral-400">
              <span>−{maxDriverWeight.toFixed(2)}</span>
              <span>0</span>
              <span>+{maxDriverWeight.toFixed(2)}</span>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Threshold Adjustment Slider -->
    <div class="rounded-2xl border border-[#1E3932]/10 bg-white p-5 shadow-[0_2px_10px_-2px_rgba(30,57,50,0.06)]">
      <div class="flex justify-between items-start gap-3 mb-1.5">
        <div class="min-w-0">
          <span class="block whitespace-nowrap text-xs sm:text-sm font-semibold text-[#1E3932]">เกณฑ์ตัดสินใจ (Decision Threshold)</span>
          <p class="text-xs text-neutral-500">ปรับระดับความเข้มงวดในการส่งข้อเสนอ</p>
        </div>
        <span class="shrink-0 whitespace-nowrap rounded-lg bg-[#1E3932] px-2.5 py-1 font-mono text-xs sm:text-sm font-bold tabular-nums text-[#CBA258]">
          {thresholdPercent}% ({cleanNumber(threshold, 0.41).toFixed(2)})
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

      <div class="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 whitespace-nowrap text-xs text-neutral-500">
        <span>20% (ส่งบ่อยขึ้น)</span>
        <button
          type="button"
          onclick={() => {
            threshold = 0.41;
            requestPrediction(50);
          }}
          class="font-semibold text-[#006241] hover:underline cursor-pointer"
        >
          รีเซ็ตเป็นค่าแนะนำ (41%)
        </button>
        <span>80% (เข้มงวดสูง)</span>
      </div>
    </div>
  </div>
</div>

<!-- Mobile Sticky Bottom Summary Bar -->
<div class="fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t border-neutral-200 bg-white/95 backdrop-blur-xs px-4 py-2.5 shadow-lg flex items-center justify-between">
  <div class="flex min-w-0 items-center gap-2 whitespace-nowrap">
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
    class="rounded-lg bg-[#1E3932] text-white px-3 py-1 text-xs font-medium hover:bg-[#006241] transition-colors cursor-pointer"
  >
    ดูผลลัพธ์
  </button>
</div>
