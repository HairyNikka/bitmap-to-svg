
# 🖼️ Bitmap to SVG Converter (React + Django REST API)

เว็บแอปแปลงภาพ Bitmap เป็น SVG รองรับการล็อกอิน / สมัครสมาชิก

---

## 🧰 วิธีติดตั้งและรันโปรเจกต์ (กรณีดาวน์โหลดไฟล์ .zip มาเอง)

### ✅ ขั้นตอนที่ 1: ติดตั้ง Python & Django (ฝั่ง Backend)

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

4. รัน frontend:
   ```bash
   npm run dev
   ```

---

## 🔐 จุดเด่นของระบบ

- สมัครสมาชิก (Register) พร้อมตรวจสอบ username/email ซ้ำ
- Login ด้วย JWT
- Navbar แสดงชื่อผู้ใช้และปุ่ม Logout
- หน้าแปลงภาพแบบอินเทอร์แอคทีฟ รองรับการซูม ขยับ เปรียบเทียบภาพก่อน-หลัง
- รองรับภาพ SVG ลื่นไหลแบบ Vector Magic

---

## 📝 หมายเหตุ

- เปิด Backend ที่ http://localhost:8000
- เปิด Frontend ที่ http://localhost:5173
- หาก frontend และ backend อยู่ต่าง port อย่าลืมตั้งค่า CORS (`django-cors-headers`)

---

หากมีปัญหา ให้ติดต่อเจ้าของโปรเจกต์ 😎
