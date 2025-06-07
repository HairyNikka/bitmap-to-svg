# 🖼️ Bitmap to SVG Converter (React + Django REST API)

เว็บแอปแปลงภาพ Bitmap เป็น SVG รองรับการล็อกอิน / สมัครสมาชิก พร้อมดาวน์โหลด PDF/PNG ได้แบบ vector แท้

---

## 🧰 วิธีติดตั้งและรันโปรเจกต์ (กรณีดาวน์โหลดไฟล์ .zip มาเอง)

### ✅ ขั้นตอนที่ 1: ติดตั้ง Python & Django (ฝั่ง Backend)

🗂 **ควรอยู่ในโฟลเดอร์ `backend/`** ก่อนทำขั้นตอนต่อไปทั้งหมดนี้

1. ติดตั้ง **Python 3.8+** และเปิด Terminal (CMD หรือ VS Code)
2. ไปที่โฟลเดอร์โปรเจกต์ เช่น:

   ```bash
   cd path/to/your/project
   ```

3. สร้าง virtual environment:
   ```bash
   python -m venv env
   ```

4. เปิดใช้งาน venv:
   - Windows:
     ```bash
     .\env\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source env/bin/activate
     ```

5. ติดตั้ง dependencies:
   - ตรวจว่ามีไฟล์ `requirements.txt` อยู่ในโฟลเดอร์ `backend/`
   - แล้วติดตั้ง:
     ```bash
     pip install -r requirements.txt
     ```

   หากไม่มี `requirements.txt` หรือต้องการติดตั้งเอง:
     ```bash
     pip install django djangorestframework djangorestframework-simplejwt cairosvg django-cors-headers
     ```bash
   pip install -r requirements.txt
   ```

6. รัน backend:
   ```bash
   python manage.py runserver
   ```

---

### ✅ ขั้นตอนที่ 2: ติดตั้ง React (ฝั่ง Frontend)

1. ติดตั้ง **Node.js** และ npm ให้เรียบร้อย
2. ไปที่โฟลเดอร์ frontend (ที่มี `package.json`)
3. ติดตั้ง package:
   ```bash
   npm install
   ```

4. ถ้า `npm run dev` รัน backend พร้อมกัน ให้ติดตั้งเพิ่ม:
   ```bash
   npm install concurrently --save-dev
   ```

5. รัน frontend:
   ```bash
   npm run dev
   ```

---

### ⚠️ สำคัญ! สำหรับฟีเจอร์ PDF Export (Django + cairosvg)

PDF export ฝั่ง backend ต้องติดตั้ง library เพิ่มบน Windows:

#### ✅ ติดตั้ง GTK Runtime (เพื่อให้ `cairosvg` ใช้งานได้)

1. ดาวน์โหลด GTK Runtime สำหรับ Windows 64-bit:
   👉 [https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases/tag/2022-01-04](https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases/tag/2022-01-04)

   (กดโหลดตรง gtk3-runtime-3.24.31-2022-01-04-ts-win64.exe ที่มีขนาด 46.7 MB)


2. ติดตั้งตามขั้นตอน แล้ว **ติ๊ก “Add to PATH” ตอนติดตั้ง**
3. ปิดแล้วเปิด CMD ใหม่ แล้วทดสอบ:
   ```bash
   python -c "import cairosvg; print('ok')"
   ```

4. หากยังไม่ได้ ให้ตรวจว่าใช้ Python ใน virtualenv เดิมที่ติดตั้ง `cairosvg` แล้ว

---

## 🔐 จุดเด่นของระบบ

- สมัครสมาชิก (Register) พร้อมตรวจสอบ username/email ซ้ำ
- Login ด้วย JWT
- Navbar แสดงชื่อผู้ใช้และปุ่ม Logout
- หน้าแปลงภาพแบบอินเทอร์แอคทีฟ รองรับการซูม ขยับ เปรียบเทียบภาพก่อน-หลัง
- ดาวน์โหลด SVG, PNG, PDF (PDF เป็น vector แท้)

---

## 📝 หมายเหตุ

- Backend URL: http://localhost:8000
- Frontend URL: http://localhost:5173
- ระบบ export PDF ใช้ Django backend `/convert-pdf/` ซึ่งถูกยกเว้น CSRF (`@csrf_exempt`) แล้ว

---

หากมีปัญหา ให้ติดต่อเจ้าของโปรเจกต์ 😎
