# Starbucks ML Studio ☕📊

> **ระบบวิเคราะห์และทำนายการตอบรับโปรโมชันรายบุคคล (Customer Offer Personalization & Optimization System)**  
> พัฒนาด้วย **SvelteKit 2 + Svelte 5 (Runes Mode)** และ **Tailwind CSS v4** จำลองและขยายผลจากสถาปัตยกรรม Machine Learning (LightGBM Pipeline) ของชุดข้อมูล Starbucks Customer Capstone

[![Svelte v5](https://img.shields.io/badge/Svelte-5.57.2-orange.svg)](https://svelte.dev)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-3.0-FF3E00.svg)](https://kit.svelte.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org)
[![Design Style](https://img.shields.io/badge/Design-Unslop_Craft-006241.svg)](https://github.com/heydamir/unslop)

---

## 🎖️ เครดิตผู้พัฒนาโมเดล (Credits & Attribution)

- **Machine Learning Model, Feature Engineering & Data Pipeline:**  
  พัฒนาและออกแบบโดยคุณ **[@Jao07Nxne](https://github.com/Jao07Nxne)**  
  *(สคริปต์การคลีนข้อมูล, As-Of Temporal Matching ป้องกัน Data Leakage, การฝึกสอนโมเดล LightGBM/Random Forest/Logistic Regression และการจูน Optimal Threshold 0.58)*
- **UI/UX & Design System Reference:**
  - [VoltAgent/awesome-design-md (Starbucks Design Specification)](https://github.com/VoltAgent/awesome-design-md)
  - [heydamir/unslop (Quiet Utility Craft & Zero AI Fluff Guidelines)](https://github.com/heydamir/unslop)
- **Multi-Agent Evaluation & Review:**  
  วิเคราะห์และตรวจสอบร่วมกันโดย **OpenAI Codex**, **DeepSeek R1**, และ **Gemini** ผ่าน Proxmox Multi-Agent Bridge

---

## 🌟 ฟีเจอร์หลักของระบบ (Key Features)

### 1. เครื่องยนต์ทำนายผลแบบเรียลไทม์ (Real-time Inference Engine)
- ทำนายความน่าจะเป็นที่ลูกค้าจะซื้อสินค้าตามเงื่อนไขโปรโมชัน (`BOGO` หรือ `Discount`) ทันทีที่ปรับค่า
- วิเคราะห์ปัจจัยขับเคลื่อนรายบุคคล (Explainable Key Drivers) ระบุจุดเด่นจุดด้อย เช่น ประวัติการซื้อเดิม, ระดับรายได้ และช่องทางการสื่อสาร

### 2. โมเดลประเมินความคุ้มค่าทางการเงิน (Expected ROI & Profit Model)
- คำนวณ **ยอดซื้อคาดการณ์ (Expected Spend)**, **ต้นทุนส่วนลดและการสื่อสาร (Expected Cost)** และ **ผลกำไรสุทธิส่วนเพิ่ม (Expected Net Profit)**
- ป้องกันปัญหา *Discount Cannibalization* (การแจกส่วนลดให้ลูกค้าที่ตั้งใจจะซื้อราคาเต็มอยู่แล้ว)

### 3. เกณฑ์ตัดสินใจทางธุรกิจ (Optimal Decision Threshold: 0.58)
- ยกระดับเกณฑ์ตัดสินใจจากค่ามาตรฐาน 0.50 ขึ้นเป็น **0.58 (58%)** เพื่อคัดกรองเฉพาะกลุ่มที่สร้างยอดซื้อเพิ่มจริง
- **Visual Cut-off Line Marker:** มีขีดบอกตำแหน่งเกณฑ์บนแถบ Gauge ทำให้ตรวจสอบได้ด้วยสายตาทันที

### 4. การออกแบบตามหลักการ Unslop (Quiet Utility Design)
- **Zero Emojis:** ตัดการ์ตูนและอีโมจิออก 100% แทนที่ด้วย SVG Icons และป้ายกำกับที่เป็นทางการ
- **One Bright Element:** ควบคุมโทนสีส่วนใหญ่เป็น Neutral Grays โดยมีสีเขียวสตาร์บัคส์ `#006241` เป็นจุดดึงดูดสายตาเพียงจุดเดียว
- **Tabular Figures:** ตัวเลขทุกตำแหน่งใช้ `font-mono tabular-nums` นิ่งสนิท ไม่แกว่งเวลาเลื่อนสไลเดอร์
- **Thai Typography Ergonomics:** ปรับขนาดตัวอักษรภาษาไทยเป็น 14px (`text-sm`) เพื่อให้อ่านสระและวรรณยุกต์ได้อย่างสบายตา

### 5. ความปลอดภัยของข้อมูล (Thai Numeral & Input Safety Guardrails)
- รองรับการกรอกเลขไทย `๐–๙` โดยแปลงเป็นตัวเลขอารบิกอัตโนมัติ
- ระบบ Sanitize ข้อมูล ป้องกัน `null`, `undefined` หรือ `NaN` ปิดโอกาส 500 Internal Error อย่างสิ้นเชิง

---

## 🗺️ แผนผังเส้นทางของระบบ (SvelteKit Routes)

ระบบถูกออกแบบแยกเส้นทางแบบ File-based Routing อย่างชัดเจน:

| URL Path | ไฟล์ Component | หน้าที่การทำงาน |
|---|---|---|
| **`/`** | `src/routes/+page.svelte` | **หน้าทำนายผลโปรโมชัน (Predictor Form):** ป้อนข้อมูลลูกค้า, คำนวณความน่าจะเป็น, ตรวจสอบ ROI และปรับค่า Threshold |
| **`/models`** | `src/routes/models/+page.svelte` | **หน้าผลลัพธ์โมเดล (Model Benchmark):** เปรียบเทียบ 3 โมเดล, รายงาน Overfitting Audit (Train AUC 0.8424 vs Test AUC 0.8214) |
| **`/samples`** | `src/routes/samples/+page.svelte` | **หน้าชุดข้อมูลทดสอบ (Unseen Test Set):** ตรวจสอบ 10 ตัวอย่างจริงจากชุดทดสอบ พร้อมระบบค้นหาและตัวกรองความแม่นยำ |

---

## 📁 โครงสร้างโปรเจกต์ (Project Directory Tree)

```
starbucks-ml-dashboard/
├── docs/
│   └── PROJECT_DOCUMENTATION.md   # เอกสารสถาปัตยกรรมและการคำนวณอย่างละเอียด (490+ บรรทัด)
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Navbar.svelte        # Navigation Bar แสดง Brand และ Active Links
│   │   │   ├── PredictorForm.svelte # ฟอร์ม What-If Simulation และการ์ดผลทำนาย
│   │   │   ├── ModelTable.svelte    # ตาราง Benchmark 3 โมเดล และ Overfit Audit
│   │   │   └── SampleData.svelte    # ตารางสุ่ม 10 เคสจริงจาก Unseen Test Set
│   │   ├── data/
│   │   │   └── mlData.ts            # ข้อมูล Portfolio, Presets และฟังก์ชันคำนวณ ML
│   │   └── types/
│   │       └── ml.ts                # TypeScript Interfaces สัญญาข้อมูล
│   └── routes/
│       ├── +layout.svelte           # Persistent Root Layout (Navbar + Footer)
│       ├── +page.svelte             # Route '/' (หน้าทำนายผล)
│       ├── models/
│       │   └── +page.svelte         # Route '/models' (หน้าผลลัพธ์โมเดล)
│       ├── samples/
│       │   └── +page.svelte         # Route '/samples' (หน้าชุดข้อมูลทดสอบ)
│       └── layout.css               # การกำหนดค่า Tailwind CSS v4 Theme
├── package.json
└── vite.config.ts
```

---

## 🚀 การติดตั้งและเริ่มใช้งาน (Getting Started)

### ความต้องการของระบบ (Prerequisites)
- [Node.js](https://nodejs.org/) เวอร์ชั่น 18.0 ขึ้นไป
- `npm` หรือ `pnpm`

### ขั้นตอนการรัน
```bash
# 1. โคลนคลังโค้ด
git clone https://github.com/techasit5415/Dashboard-ML.git
cd Dashboard-ML

# 2. ติดตั้ง dependencies
npm install

# 3. รันในโหมด Development
npm run dev
# เข้าใช้งานผ่านเว็บเบราว์เซอร์ที่ http://localhost:5173/

# 4. ตรวจสอบโค้ดและ Type ด้วย Svelte-Check (ต้องได้ 0 errors, 0 warnings)
npm run check

# 5. บิลด์สำหรับ Production
npm run build
```

---

## 📖 เอกสารเชิงลึกเพิ่มเติม
อ่านสถาปัตยกรรม Data Flow, ตรรกะคณิตศาสตร์ Log-Odds, Sigmoid และ Best Practices ทั้งหมดได้ในไฟล์:  
👉 **[docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)**

---

## 📄 ใบอนุญาต (License)
โครงการนี้จัดทำขึ้นเพื่อการศึกษาและการวิเคราะห์ข้อมูล Machine Learning — อ้างอิงชุดข้อมูลจำลองพฤติกรรมลูกค้าของ Starbucks Coffee Company
