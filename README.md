# 🎨 Bitmap to Vector Converter (React + Django REST API)

เว็บแอปพลิเคชันแปลงภาพ Bitmap เป็น Vector Graphics แบบครบครัน รองรับการล็อกอิน/สมัครสมาชิก พร้อมระบบ Export หลากหลายรูปแบบ

---

## ✨ ฟีเจอร์หลัก

### 🖼️ **การประมวลผลภาพ**
- **อัปโหลดแบบ Drag & Drop** - ลากวางไฟล์ได้ง่าย พร้อมการตรวจสอบไฟล์
- **รองรับหลายรูปแบบ** - BMP, PNG, JPEG, JPG
- **ตัวอย่างแบบ Real-time** - เปรียบเทียบภาพต้นฉบับกับผลลัพธ์
- **ซูมและเลื่อนดู** - ระบบ Interactive พร้อมรองรับ Touch

### ⚙️ **พารามิเตอร์ขั้นสูง (9 ตัว)**
จากเดิมที่มีแค่ 4 พารามิเตอร์ ตอนนี้เพิ่มเป็น 9 ตัว แบ่งเป็นกลุ่ม:

#### 🌟 **คุณภาพและรายละเอียด**
- `pathomit` - ละเส้นเล็ก (ค่าสูง = ไฟล์เล็กลง)
- `ltres` - ความละเอียดเส้น (ค่าสูง = เส้นเรียบขึ้น)
- `qtres` - ความโค้งของเส้น (ค่าสูง = เส้นโค้งนุ่มนวล)

#### 🎨 **สีและการจัดการสี**
- `numberofcolors` - จำนวนสีสูงสุดที่ใช้
- `mincolorratio` - กรองสีที่ใช้น้อย (ค่าสูง = กรองสีพื้นที่น้อย)

#### ✨ **เอฟเฟกต์และการปรับแต่ง**
- `strokewidth` - ความหนาของเส้นขอบ
- `blur` - เบลอภาพก่อนแปลง

#### 🔧 **ตัวเลือกขั้นสูง**
- `linefilter` - กรองเส้นซ้ำซ้อน (Checkbox)
- `rightangle` - บังคับมุมฉาก (Checkbox)

### 🎯 **พรีเซ็ตอัจฉริยะ (6 แบบ)**
เปลี่ยนจากปุ่ม 3 ปุ่มเป็น **Dropdown** ที่มี 6 ตัวเลือก:

#### **คุณภาพทั่วไป**
- **ต่ำ** - ไฟล์เล็ก ประมวลผลเร็ว
- **ปานกลาง** - สมดุลระหว่างคุณภาพและขนาด
- **สูง** - คุณภาพสูง รายละเอียดมาก

#### **ประเภทภาพ**  
- **โลโก้/ไอคอน** - เส้นคมชัด สีน้อย มุมฉาก
- **ภาพถ่าย** - รายละเอียดสูง สีเยอะ เหมาะสำหรับรูปจริง
- **ภาพวาด/อาร์ต** - เส้นนุ่มนวล เหมาะสำหรับงานศิลปะ

### 📦 **การส่งออกหลากหลาย**
- **PNG** - ส่งออกไม่จำกัด (รูปแบบ Raster)
- **SVG** - กราฟิกเวกเตอร์ขยายได้
- **PDF** - เอกสาร PDF (Vector แท้)
- **EPS** - Encapsulated PostScript

### 🔐 **ระบบจัดการผู้ใช้**
- **สมัครสมาชิก/เข้าสู่ระบบ** - ระบบ JWT Authentication
- **จำกัดการใช้งาน** - Guest: 3 ครั้ง/วัน, สมาชิก: 10 ครั้ง/วัน
- **บันทึกประวัติ** - Log การอัปโหลด แปลง และส่งออก

---

## 🏗️ โครงสร้างโปรเจกต์

```
project-root/
├── backend/                    # Django REST API
│   ├── accounts/              # ระบบ Login/Register + Limits
│   ├── core/                  # การตั้งค่าหลัก
│   ├── manage.py
│   └── requirements.txt
├── src/                       # React Frontend
│   ├── components/
│   │   ├── UploadImage/       # ระบบอัปโหลดแยกแล้ว
│   │   │   ├── UploadImage.jsx
│   │   │   ├── ParameterControls.jsx
│   │   │   └── PresetButtons.jsx
│   │   ├── ExportPreview/     # ระบบส่งออกแยกแล้ว
│   │   │   ├── ExportPreview.jsx
│   │   │   ├── ExportLimitsInfo.jsx
│   │   │   └── useExportLogic.js
│   │   └── SvgPreview/
│   │       ├── SvgPreview.jsx
│   │       └── ImageComparisonView.jsx
│   └── ...
└── README.md
```

---

## 🧰 วิธีติดตั้งและรันโปรเจกต์

### ✅ ขั้นตอนที่ 1: ติดตั้ง Python & Django (Backend)

1. ติดตั้ง **Python 3.8+** และเปิด Terminal
2. ไปที่โฟลเดอร์ `backend/`:
   ```bash
   cd backend/
   ```

3. สร้าง virtual environment:
   ```bash
   python -m venv env
   ```

4. เปิดใช้งาน venv:
   - **Windows:**
     ```bash
     .\env\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source env/bin/activate
     ```

5. ติดตั้ง dependencies:
   ```bash
   pip install -r requirements.txt
   ```

6. รัน backend:
   ```bash
   python manage.py runserver
   ```

---

### ✅ ขั้นตอนที่ 2: ติดตั้ง React (Frontend)

1. ติดตั้ง **Node.js** และ npm
2. ไปที่โฟลเดอร์ root (ที่มี `package.json`):
   ```bash
   npm install
   ```

3. รัน frontend:
   ```bash
   npm run dev
   ```

---

### ⚠️ สำคัญ! ติดตั้งเพิ่มสำหรับ PDF Export

PDF export ต้องใช้ `cairosvg` ซึ่งต้องการ GTK Runtime:

#### **Windows:**
1. ดาวน์โหลด GTK Runtime:
   👉 [GTK for Windows](https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases)

2. ติดตั้งและ **ติ๊ก "Add to PATH"**

3. ทดสอบ:
   ```bash
   python -c "import cairosvg; print('PDF Export Ready!')"
   ```

#### **macOS:**
```bash
brew install cairo pango gdk-pixbuf libffi
```

#### **Ubuntu/Debian:**
```bash
sudo apt-get install libcairo2-dev libpango1.0-dev libgdk-pixbuf2.0-dev libffi-dev
```

---

## 🚀 จุดเด่นที่พัฒนาใหม่

### 🎨 **UI/UX ที่ปรับปรุง**
- **แยก Components** - โค้ดเป็นระเบียบ บำรุงรักษาง่าย
- **Fixed Controls** - ปุ่มสำคัญอยู่ด้านบนไม่เลื่อน
- **FontAwesome Icons** - ไอคอนสวยงาม แทน emoji
- **Responsive Design** - รองรับหน้าจอทุกขนาด

### ⚙️ **ระบบพารามิเตอร์ขั้นสูง**
- **เพิ่มจาก 4 เป็น 9 พารามิเตอร์** - ควบคุมได้ละเอียดกว่า Vector Magic
- **จัดกลุ่มอย่างเป็นระบบ** - แยกตามหน้าที่การใช้งาน
- **Real-time Sync** - Preset เปลี่ยน Slider ก็เปลี่ยนตาม

### 📊 **ระบบจำกัดการใช้งาน**
- **Guest Limits** - จำกัด 3 ครั้ง/วัน สำหรับ SVG, PDF, EPS
- **Member Benefits** - เพิ่มเป็น 10 ครั้ง/วัน เมื่อสมัครสมาชิก
- **PNG Unlimited** - ส่งออก PNG ได้ไม่จำกัดสำหรับทุกคน

---

## 🔗 URL และพอร์ต

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Admin Panel:** http://localhost:8000/admin

---

## 🐛 การแก้ไขปัญหา

### **ปัญหา PDF Export**
- ตรวจสอบการติดตั้ง GTK Runtime
- ลองรัน `python -c "import cairosvg"` ใน virtualenv

### **ปัญหา CORS**
- ตรวจสอบว่า `django-cors-headers` ติดตั้งแล้ว
- ตรวจสอบ `CORS_ALLOWED_ORIGINS` ใน `settings.py`

### **ปัญหา JWT Token**
- ตรวจสอบว่า token ไม่หมดอายุ
- ลองล็อกอินใหม่

---

## 💡 การใช้งาน

1. **อัปโหลดรูป** - ลากวางหรือคลิกเลือกไฟล์
2. **เลือกพรีเซ็ต** - เลือกตามประเภทภาพ
3. **ปรับพารามิเตอร์** - Fine-tune ตามต้องการ  
4. **กดแปลง** - รอผลลัพธ์
5. **ส่งออก** - เลือกรูปแบบที่ต้องการ

---

**หากมีปัญหาหรือข้อสงสัย ติดต่อเจ้าของโปรเจกต์** 😊