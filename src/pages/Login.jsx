import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/api/token/", {
        username: form.username,
        password: form.password,
      });

      localStorage.setItem("accessToken", res.data.access);
      localStorage.setItem("refreshToken", res.data.refresh);

      // ✅ ไปหน้าอื่นหลัง login (หรือหน้า home)
      navigate("/");
    } catch (err) {
      setError("❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "30px auto", padding: "20px", border: "1px solid #ccc" }}>
      <h2>เข้าสู่ระบบ</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="ชื่อผู้ใช้" value={form.username} onChange={handleChange} required />
        <input type="password" name="password" placeholder="รหัสผ่าน" value={form.password} onChange={handleChange} required />
        <button type="submit">เข้าสู่ระบบ</button>
      </form>

      <p style={{ marginTop: "10px" }}>
        ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
      </p>
      <p style={{ marginTop: '10px' }}>
        <Link to="/">⬅️ กลับหน้าแรก</Link>
      </p>
    </div>
  );
}
