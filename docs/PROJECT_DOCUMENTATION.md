# Starbucks ML Studio — สถาปัตยกรรมระบบและเอกสารประกอบโครงการ (Project Architecture & Documentation)

> **เอกสารสังเคราะห์ความร่วมมือโดย:** Multi-Agent Consensus (OpenAI Codex, DeepSeek R1, และ Gemini)  
> **เป้าหมาย:** อธิบายโครงสร้าง สถาปัตยกรรม Data Flow ตรรกะคณิตศาสตร์ Machine Learning การนำหลักการ Unslop Design System ไปประยุกต์ใช้ และคู่มือนักพัฒนาอย่างละเอียดรายไฟล์

---

## สารบัญ (Table of Contents)
1. [ภาพรวมของระบบ (System Overview)](#1-ภาพรวมของระบบ-system-overview)
2. [สถาปัตยกรรมและแผนภาพการไหลของข้อมูล (Data Flow Architecture)](#2-สถาปัตยกรรมและแผนภาพการไหลของข้อมูล-data-flow-architecture)
3. [คำอธิบายโครงสร้างและหน้าที่รายไฟล์ (File-by-File Breakdown)](#3-คำอธิบายโครงสร้างและหน้าที่รายไฟล์-file-by-file-breakdown)
   - [3.1 `src/lib/data/mlData.ts`](#31-srclibdatamldatats)
   - [3.2 `src/lib/components/PredictorForm.svelte`](#32-srclibcomponentspredictorformsvelte)
   - [3.3 `src/lib/components/ModelTable.svelte`](#33-srclibcomponentsmodeltablesvelte)
   - [3.4 `src/lib/components/SampleData.svelte`](#34-srclibcomponentssampledatasvelte)
   - [3.5 `src/lib/components/Navbar.svelte`](#35-srclibcomponentsnavbarsvelte)
   - [3.6 `src/routes/+layout.svelte`](#36-srcrouteslayoutsvelte)
   - [3.7 `src/routes/+page.svelte` (Path `/`)](#37-srcroutespagesvelte-path-)
   - [3.8 `src/routes/models/+page.svelte` (Path `/models`)](#38-srcroutesmodelspagesvelte-path-models)
   - [3.9 `src/routes/samples/+page.svelte` (Path `/samples`)](#39-srcroutessamplespagesvelte-path-samples)
4. [ตรรกะคณิตศาสตร์และการคำนวณ Machine Learning (Mathematical & Business Formulas)](#4-ตรรกะคณิตศาสตร์และการคำนวณ-machine-learning)
5. [การนำหลักการ Unslop Design System ไปใช้จริง (Unslop Implementation)](#5-การนำหลักการ-unslop-design-system-ไปใช้จริง)
6. [แนวทางปฏิบัติที่ดีที่สุดและการบำรุงรักษา (Best Practices & Production Guidelines)](#6-แนวทางปฏิบัติที่ดีที่สุดและการบำรุงรักษา)

---

## 1. ภาพรวมของระบบ (System Overview)

**Starbucks ML Studio** เป็นระบบสนับสนุนการตัดสินใจทางการตลาด (Decision Support & Campaign Targeting System) ที่พัฒนาขึ้นด้วย **SvelteKit 2 + Svelte 5 (Runes Mode)** และ **Tailwind CSS v4** โดยถอดแบบสถาปัตยกรรม Feature Engineering และ Benchmark Metrics จากโมเดล **LightGBM Classifier** ของชุดข้อมูล Starbucks Customer Capstone

### ปัญหาทางธุรกิจที่แก้ไข (Business Problem)
การส่งโปรโมชันส่วนลดหรือ BOGO (Buy One Get One) แบบเหวี่ยงแหส่งผลให้:
1. **Discount Cannibalization:** ลูกค้ากลุ่มที่มีกำลังซื้อสูงและตั้งใจซื้ออยู่แล้ว ได้รับส่วนลดโดยที่แบรนด์สูญเสีย Margin ไปฟรีๆ
2. **Budget Waste:** ส่งข้อเสนอที่มีเงื่อนไขยอดซื้อขั้นต่ำ (Difficulty) สูงเกินไปให้กลุ่มลูกค้าที่คำนึงถึงราคา ส่งผลให้ไม่เกิด Conversion แต่เสียต้นทุนการสื่อสาร

ระบบนี้ทำหน้าที่ประเมิน **ความน่าจะเป็นที่ลูกค้าแต่ละคนจะตอบรับโปรโมชัน (Offer Completion Probability)** แบบ Real-time พร้อมทั้งคำนวณ **ผลตอบแทนคาดการณ์ทางการเงิน (Expected ROI & Net Profit)** เพื่อช่วยให้นักการตลาดเลือกว่า "ควรส่งโปรโมชัน (SEND OFFER)" หรือ "ระงับการส่ง (DO NOT SEND)"

---

## 2. สถาปัตยกรรมและแผนภาพการไหลของข้อมูล (Data Flow Architecture)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                            │
│  [Persona Preset] ──► [Form Inputs (Profile, Offer, History)] ──► [Threshold Slider] │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Reactive State ($state / $derived)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      DATA SANITIZATION LAYER                           │
│  cleanNumber() & toNum():                                              │
│  - แปลงเลขไทย (๐-๙) เป็นอารบิก (0-9)                                   │
│  - กรองอักขระแปลกปลอม ป้องกัน null / undefined / NaN Coercion Crash    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Sanitized Raw Parameters
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      ML INFERENCE ENGINE (mlData.ts)                   │
│  1. Baseline Log-Odds: -0.45                                           │
│  2. Demographic Factors (Income, Age, Gender, Tenure)                  │
│  3. Offer Characteristics (Difficulty/Reward Ratio, Duration, Channels)│
│  4. Behavior Signals (Historical Completion Ratio, Ticket vs Gap)      │
│  5. Sigmoid Transformation: P = 1 / (1 + exp(-score))                  │
│  6. ROI & Financial Expectation Modeling                               │
│  7. Feature Explainability Extraction (Key Drivers)                    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ PredictionResult Contract
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION & ACTION                           │
│  - Verdict Banner: SEND vs DO NOT SEND (SVG Badges)                    │
│  - Gauge Progress Track + Visual Cut-off Line Tick                     │
│  - Financial Matrix: Expected Revenue / Reward Cost / Net Profit       │
│  - Explainable Insights (+ / - Factor Pills)                           │
│  - Mobile Sticky Bar for Compact Viewports                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. คำอธิบายโครงสร้างและหน้าที่รายไฟล์ (File-by-File Breakdown)

### 3.1 `src/lib/data/mlData.ts`
*หัวใจหลักด้านข้อมูล ตรรกะการคำนวณ และโมเดลจำลอง (Data Repository & Inference Engine)*

- **หน้าที่หลัก:**
  1. บรรจุข้อเสนอโปรโมชันมาตรฐาน 8 รายการของสตาร์บัคส์ (`STARBUCKS_PORTFOLIO`) ทั้งแบบ BOGO และ Discount
  2. กำหนดกลุ่มลูกค้าต้นแบบ 4 กลุ่ม (`CUSTOMER_PRESETS`) เพื่อการทดสอบ What-If Analysis
  3. บันทึกผล Benchmark ทางสถิติของ 3 โมเดล (`MODEL_METRICS`): Logistic Regression, Random Forest, และ LightGBM
  4. บันทึกกระบวนการทำงาน 5 ขั้นตอนของ Data Pipeline (`PIPELINE_STAGES`)
  5. บรรจุชุดข้อมูลทดสอบ 10 ตัวอย่าง (`SAMPLE_TEST_CASES`) จาก Unseen Test Set
  6. ฟังก์ชันอนุมานผล `predictOfferCompletion()` ทำหน้าที่แปลงพฤติกรรมลูกค้าเป็นความน่าจะเป็นและประมาณการผลกำไร

- **ความปลอดภัยของระบบ (Safety Guardrails):**
  - มีฟังก์ชันย่อย `toNum()` แปลงเลขไทย `[๐-๙]` สกัดเฉพาะตัวเลข และตั้ง Fallback อัตโนมัติ ป้องกันไม่ให้เกิดข้อผิดพลาดประเภท `TypeError: Cannot read properties of null` หรือ `NaN` ในการคำนวณอย่างเด็ดขาด

---

### 3.2 `src/lib/components/PredictorForm.svelte`
*คอมโพเนนต์ฟอร์มป้อนข้อมูลและกล่องแสดงผลการทำนาย (Interactive Predictor & Decision Card)*

- **หน้าที่หลัก:**
  1. **Persona Bar:** ให้ผู้ใช้เลือกกลุ่มลูกค้าต้นแบบ พร้อมระบบตรวจจับ `isCustomized` แสดงป้ายกำกับ `"ปรับแต่งเอง"` ทันทีเมื่อมีการแก้ตัวเลข
  2. **Three-Section Form Inputs:**
     - ข้อมูลลูกค้า (Customer Demographics): อายุ, เพศ, รายได้, ปีที่เริ่มเป็นสมาชิก
     - ข้อมูลโปรโมชัน (Promotional Offer): ชนิดโปร, ยอดซื้อขั้นต่ำ, รางวัลตอบแทน, อายุโปรโมชัน และช่องทางการส่ง (Email, Mobile, Social, Web)
     - ประวัติพฤติกรรม (Historical Behavior): จำนวนบิลในอดีต, ยอดใช้จ่ายรวม, ประวัติการตอบรับโปรโมชัน
  3. **Prediction Verdict Card:**
     - สรุปคำตัดสิน (SEND OFFER vs DO NOT SEND) ด้วยไอคอน SVG และข้อความกำกับชัดเจน
     - **Probability Gauge พร้อม Cut-off Line Tick:** แสดงแถบระดับความน่าจะเป็นและมีขีดบอกตำแหน่งเกณฑ์ตัดสินใจ (Threshold Tick Marker) บนแถบ
     - ประมาณการผลลัพธ์ทางการเงิน (ยอดซื้อคาดการณ์, ต้นทุน, กำไรส่วนเพิ่ม)
     - อธิบายปัจจัยจำแนก (Explainable Key Drivers) ด้วยสัญลักษณ์ `+` และ `-`
  4. **Decision Threshold Slider:** ปรับระดับเกณฑ์ตัดสินใจ (0.20 – 0.80) พร้อมปุ่มรีเซ็ตกลับเป็นค่าแนะนำที่จูนแล้ว (58%)
  5. **Mobile Sticky Bar:** แถบสรุปผลลัพธ์แบบลอยตัวด้านล่างจอเมื่อใช้งานบนสมาร์ตโฟน

---

### 3.3 `src/lib/components/ModelTable.svelte`
*คอมโพเนนต์ตารางเปรียบเทียบประสิทธิภาพโมเดลและการตรวจสอบ Overfitting*

- **หน้าที่หลัก:**
  1. **Benchmark Comparison Table:** ตารางเปรียบเทียบค่า Accuracy, F1-Score, ROC-AUC, และเวลาในการเทรน ระหว่าง Logistic Regression, Random Forest และ LightGBM
  2. **Overfitting Audit Card:** แสดงผลการตรวจสอบ Train AUC (0.8424) เทียบกับ Test AUC (0.8214) โดยมีส่วนต่าง Gap = 0.0210 ซึ่งต่ำกว่าเพดาน 0.05 ยืนยันว่าโมเดลไม่มีการท่องจำข้อมูล
  3. **Optimal Threshold Tuning Card:** อธิบายเหตุผลที่ระบบเลื่อนจุดตัดจาก 0.50 ไปเป็น 0.58 เพื่อเพิ่มค่า F1-Score สูงสุดที่ 0.7584

---

### 3.4 `src/lib/components/SampleData.svelte`
*คอมโพเนนต์ตรวจสอบชุดข้อมูลทดสอบ 10 ตัวอย่างจริงจาก Unseen Test Set*

- **หน้าที่หลัก:**
  1. แสดงตารางข้อมูลลูกค้า 10 รายการ เปรียบเทียบผลจริง (Actual 0/1) กับผลการทำนายของโมเดล (Prediction 0/1)
  2. มีระบบค้นหาตามรหัส (Search Input) และตัวกรองคัดแยก (`ทั้งหมด`, `เฉพาะที่ตรงจริง`, `เฉพาะที่คลาดเคลื่อน`)
  3. ใช้ Badge กำกับผลตรวจทานแบบเป็นทางการ (`ตรงจริง` / `คลาดเคลื่อน`) ปราศจาก Emoji

---

### 3.5 `src/lib/components/Navbar.svelte`
*ส่วนหัวของระบบและแท็บสลับหน้าจอ (Segmented Navigation Header)*

- **หน้าที่หลัก:**
  1. แสดงสัญลักษณ์แบรนด์ Starbucks ML Studio และโลโก้ SVG
  2. Segmented Pill Control สำหรับสลับโหมดการทำงาน 3 มุมมอง:
     - `ทำนายผลโปรโมชัน` (PredictorForm)
     - `ผลลัพธ์โมเดล` (ModelTable)
     - `ชุดข้อมูลทดสอบ` (SampleData)
  3. รองรับการใช้งานแบบ Sticky Header ติดด้านบนหน้าจอตลอดการเลื่อนดูข้อมูล

---

### 3.6 `src/routes/+layout.svelte`
*แม่แบบโครงสร้างถาวรและตัวจัดวาง Workspace Canvas (Persistent Root Layout)*

- **หน้าที่หลัก:**
  1. บรรจุ `Navbar` และ `Footer` ไว้อย่างถาวร เพื่อให้ผู้ใช้ไม่ต้องโหลด Navbar ใหม่เวลากดเปลี่ยนเส้นทาง
  2. จัดโครงสร้าง Layout แบบ Flex Column ครอบด้วย `min-h-screen bg-[#f7f7f6]`
  3. แสดงผลหน้าจอย่อยผ่าน Runes Snippet `{@render children()}` ของ Svelte 5

---

### 3.7 `src/routes/+page.svelte` (Path `/`)
*หน้าจอทำนายผลข้อเสนอโปรโมชันรายบุคคล (Offer Predictor Route)*

- **หน้าที่หลัก:**
  1. เรนเดอร์ `<PredictorForm />` ซึ่งบรรจุเครื่องมือจำลองพฤติกรรมลูกค้าและการทำนายผล Real-time
  2. กำหนด `<svelte:head><title>ทำนายผลโปรโมชัน — Starbucks ML Studio</title></svelte:head>` เฉพาะหน้านี้

---

### 3.8 `src/routes/models/+page.svelte` (Path `/models`)
*หน้าจอเปรียบเทียบโมเดลและการตรวจสอบ Overfitting (Model Benchmark Route)*

- **หน้าที่หลัก:**
  1. เรนเดอร์ `<ModelTable />` แสดงตารางเปรียบเทียบสถิติและผลการตรวจสอบ Overfit Gap
  2. มี URL ตรงคือ `/models` สามารถคั่นหน้า (Bookmark) หรือแชร์ลิงก์ได้ทันที

---

### 3.9 `src/routes/samples/+page.svelte` (Path `/samples`)
*หน้าจอตรวจสอบชุดข้อมูลทดสอบ 10 ตัวอย่างจริง (Test Set Verification Route)*

- **หน้าที่หลัก:**
  1. เรนเดอร์ `<SampleData />` แสดงชุดข้อมูล 10 ตัวอย่างจริงจาก Unseen Test Set
  2. มี URL ตรงคือ `/samples` รองรับการย้อนกลับด้วยปุ่ม Back/Forward ของเบราว์เซอร์อย่างเป็นธรรมชาติ

---

## 4. ตรรกะคณิตศาสตร์และการคำนวณ Machine Learning

### 4.1 ฟังก์ชันคะแนนและ Sigmoid Transformation
ระบบคำนวณคะแนน Log-Odds จากน้ำหนักตัวแปร (Feature Coefficients):

$$\text{Log-Odds (Score)} = \beta_0 + \sum_{i=1}^{k} \beta_i \cdot x_i$$

- **จุดเริ่มต้น (Base Intercept $\beta_0$):** `-0.45`
- **รายได้ (Income Normalized):** $\frac{\text{income} - 65000}{25000} \times 0.42$
- **อายุ (Age Normalized):** $\frac{\text{age} - 54}{18} \times 0.18$
- **เพศ (Gender):** หญิง $+0.22$, อื่นๆ $+0.15$, ชาย $-0.10$
- **ความคุ้มค่าข้อเสนอ:** $(\frac{\text{reward}}{\text{difficulty}} - 0.40) \times 0.55$
- **ประวัติการตอบรับเดิม (Completion Ratio):** $\frac{\text{completed}}{\text{received}} \times 1.15$
- **แปลงเป็นความน่าจะเป็นด้วยฟังก์ชัน Sigmoid:**
  $$P(\text{completed} = 1) = \frac{1}{1 + e^{-\text{Score}}}$$

### 4.2 ตรรกะการประเมินผลกำไรสุทธิ (Expected ROI & Profit Model)
- **ยอดซื้อคาดการณ์ (Expected Spend):**  
  หากทำนายว่าซื้อ ($P \ge \text{Threshold}$):  
  $$\text{Spend} = \max(\text{difficulty}, \text{pastAverageSpend} \times 1.25)$$  
  หากทำนายว่าไม่ซื้อ: $\text{pastAverageSpend} \times 0.30$
- **ต้นทุน (Expected Cost):**  
  $$\text{Cost} = \text{reward} + \$0.15 \text{ (Communication Fee)}$$
- **กำไรสุทธิส่วนเพิ่ม (Expected Net Profit):**  
  $$\text{Profit} = (\text{Spend} \times 0.65 \text{ [Gross Margin]}) - \text{Cost}$$

---

## 5. การนำหลักการ Unslop Design System ไปใช้จริง

ตามแนวทาง **heydamir/unslop** โปรเจกต์นี้ยึดถือมาตรฐานอย่างเข้มงวด:

1. **Zero Emojis:** ตัดสัญลักษณ์รูปการ์ตูนออกทั้งหมด 100% แทนที่ด้วย SVG เวกเตอร์คมชัด 1px
2. **One Bright Element:** มีสีเขียวสตาร์บัคส์ `#006241` เป็นจุดเด่นเพียงจุดเดียวบนหน้าจอ ส่วนข้อมูลอื่นเป็นสีโทน Neutral
3. **Typography & Tabular Numbers:**
   - ขยายขนาดข้อความภาษาไทยเป็น `text-sm` (14px) เพื่อให้อ่านสระและวรรณยุกต์ได้สบายตา
   - ตัวเลขทุกตำแหน่งกำกับด้วย `font-mono tabular-nums` เพื่อให้จัดหลักตรงกันในแนวตั้ง
4. **Visual Cut-off Line on Gauge:** วางเส้นขีดมาร์กเกอร์สีเข้มบอกตำแหน่งเกณฑ์ 58% บนแท่ง Gauge ทำให้เปรียบเทียบค่าความน่าจะเป็นได้ในพริบตา
5. **Form Safety:** มีระบบแปลงเลขไทย `๐-๙` และดักจับค่าว่าง ป้องกันระบบแครชสมบูรณ์แบบ

---

## 6. แนวทางปฏิบัติที่ดีที่สุดและการบำรุงรักษา

1. **การปรับแต่งโมเดลในอนาคต (Retraining):**
   - หากมีการเทรนโมเดล LightGBM ใหม่ด้วยไฟล์ Python ให้ส่งออกสัมประสิทธิ์ Feature Importance และอัปเดตลงในฟังก์ชัน `predictOfferCompletion` ในไฟล์ `mlData.ts`
2. **การทดสอบความถูกต้อง (Quality Assurance):**
   - รันคำสั่ง `npm run check` เป็นประจำ ต้องได้ `0 errors, 0 warnings` เสมอ
   - รัน `npm run build` เพื่อตรวจสอบว่าระบบคอมไพล์สำหรับ Production ได้ในเวลาน้อยกว่า 300ms
3. **การเข้าถึง (Accessibility a11y):**
   - รักษาความเชื่อมโยงระหว่าง `<label for="...">` และ `<input id="...">` ให้ครบทุกจุด
   - รักษาอัตราส่วน Contrast ของสีตัวอักษรต่อพื้นหลังไม่ให้ต่ำกว่า 4.5:1 ตามมาตรฐาน WCAG 2.1 AA

---
*เอกสารนี้จัดทำขึ้นเพื่อเป็นมาตรฐานอ้างอิงของ Starbucks ML Studio Project*