# Starbucks Offer ML Dashboard

เว็บแดชบอร์ดทำนายการตอบรับโปรโมชัน Starbucks (BOGO และ Discount) พัฒนาด้วย SvelteKit และ Tailwind CSS โดยเชื่อมต่อกับโมเดล **LightGBM** จริง (`model/starbucks_offer_model.pkl`) ผ่าน Python Runtime แบบเรียลไทม์

## Credit

- **Machine Learning Model & Data Pipeline:** [Jao07Nxne](https://github.com/Jao07Nxne)  
  พัฒนาสคริปต์ทำความสะอาดข้อมูล, Temporal Matching, เทรนโมเดล (LightGBM, Random Forest, Logistic Regression) และจูนเกณฑ์ตัดสินใจ (Optimal Threshold 0.41)

## เส้นทางหน้าเว็บ (Routes)

- `/` — หน้าฟอร์มกรอกข้อมูลลูกค้าและทำนายผลการตอบรับโปรโมชันแบบ Real-time พร้อมคำนวณรายได้คาดการณ์และ Key Drivers จาก SHAP (`pred_contrib=True`)
- `/models` — ตารางเปรียบเทียบประสิทธิภาพของโมเดลทั้ง 3 ตัว, ผลตรวจ Train vs Test Gap (Overfitting Audit) และกราฟ Global Feature Importance (Top 10 Splits)
- `/samples` — ตารางสุ่ม 10 ตัวอย่างจริงจาก Unseen Test Set สำหรับตรวจทานความแม่นยำ

## การติดตั้งและใช้งาน

```bash
# 1. ติดตั้ง Node.js dependencies
npm install

# 2. ติดตั้ง Python dependencies สำหรับรันโมเดล
python -m pip install -r model/requirements.txt

# 3. รันโหมด development (http://localhost:5173)
npm run dev

# ตรวจสอบ type และ syntax
npm run check

# บิลด์สำหรับ production
npm run build
```

## สถาปัตยกรรมไฟล์

- `model/starbucks_offer_model.pkl` — ไฟล์โมเดล LightGBM ที่เทรนแล้ว (Artifact บรรจุโมเดล, รายชื่อ 25 Features และ Threshold 0.41)
- `model/predict.py` — สคริปต์ Python Runtime โหลด `starbucks_offer_model.pkl`, คำนวณ `predict_proba()` และ SHAP (`pred_contrib=True`) ส่งค่าผ่าน JSON
- `model/requirements.txt` — รายการ Python packages ที่จำเป็น (`joblib`, `numpy`, `scikit-learn`, `lightgbm`)
- `model/ml.py` — สคริปต์ Python Pipeline ต้นฉบับ (การคลีนข้อมูล, As-Of Matching, เทรน LightGBM/RF/LR และจูน Threshold)
- `src/routes/api/predict/+server.ts` — SvelteKit API Endpoint เรียกใช้ Python Model แบบเรียลไทม์
- `src/routes/+layout.svelte` — Layout หลัก (Navbar, Container, Footer)
- `src/routes/+page.svelte` — หน้าทำนายผล (`/`) พร้อม Skeleton Loading UI ขณะรอผลจากโมเดล
- `src/routes/models/+page.svelte` — หน้าเปรียบเทียบโมเดล (`/models`)
- `src/routes/samples/+page.svelte` — หน้าตัวอย่างข้อมูลทดสอบ (`/samples`)
- `src/lib/components/PredictorForm.svelte` — ฟอร์มกรอกข้อมูลและแสดงผลการตัดสินใจจากโมเดลจริง
- `src/lib/components/ModelTable.svelte` — ตารางเปรียบเทียบผลโมเดล
- `src/lib/components/SampleData.svelte` — ตารางแสดงตัวอย่างข้อมูลทดสอบ
- `docs/PROJECT_DOCUMENTATION.md` — เอกสารอธิบายการทำงานและตรรกะการคำนวณอย่างละเอียด
