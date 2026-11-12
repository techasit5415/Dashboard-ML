# Starbucks Offer ML Dashboard

เว็บแดชบอร์ดจำลองและทำนายการตอบรับโปรโมชัน Starbucks (BOGO และ Discount) พัฒนาด้วย SvelteKit และ Tailwind CSS โดยจำลองการทำงานจากโมเดล LightGBM ของชุดข้อมูล Starbucks Customer Capstone

## Credit

- **Machine Learning Model & Data Pipeline:** [Jao07Nxne](https://github.com/Jao07Nxne)  
  พัฒนาสคริปต์ทำความสะอาดข้อมูล, Temporal Matching, เทรนโมเดล (LightGBM, Random Forest, Logistic Regression) และจูนเกณฑ์ตัดสินใจ (Optimal Threshold 0.58)

## เส้นทางหน้าเว็บ (Routes)

- `/` — หน้าฟอร์มกรอกข้อมูลลูกค้าและทำนายผลการตอบรับโปรโมชันแบบ Real-time พร้อมคำนวณรายได้และต้นทุนคาดการณ์
- `/models` — ตารางเปรียบเทียบประสิทธิภาพของโมเดลทั้ง 3 ตัว พร้อมผลตรวจ Train vs Test Gap (Overfitting Audit)
- `/samples` — ตารางสุ่ม 10 ตัวอย่างจริงจาก Unseen Test Set สำหรับตรวจทานความแม่นยำ

## การติดตั้งและใช้งาน

```bash
# ติดตั้ง dependencies
npm install

# รันโหมด development (http://localhost:5173)
npm run dev

# ตรวจสอบ type และ syntax
npm run check

# บิลด์สำหรับ production
npm run build
```

## สถาปัตยกรรมไฟล์

- `src/routes/+layout.svelte` — Layout หลัก (Navbar, Container, Footer)
- `src/routes/+page.svelte` — หน้าทำนายผล (`/`)
- `src/routes/models/+page.svelte` — หน้าเปรียบเทียบโมเดล (`/models`)
- `src/routes/samples/+page.svelte` — หน้าตัวอย่างข้อมูลทดสอบ (`/samples`)
- `src/lib/data/mlData.ts` — ข้อมูล Portfolio โปรโมชัน, Presets ลูกค้า และฟังก์ชันคำนวณการทำนายผล
- `src/lib/components/PredictorForm.svelte` — ฟอร์มกรอกข้อมูลและแสดงผลการตัดสินใจ
- `src/lib/components/ModelTable.svelte` — ตารางเปรียบเทียบผลโมเดล
- `src/lib/components/SampleData.svelte` — ตารางแสดงตัวอย่างข้อมูลทดสอบ
- `docs/PROJECT_DOCUMENTATION.md` — เอกสารอธิบายการทำงานและตรรกะการคำนวณอย่างละเอียด
