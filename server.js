const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== ข้อมูลตัวอย่าง: แก้เป็นของจริงตรงนี้ =====
const users = [
  { username: "admin", password: "1234", name: "ผู้ดูแลระบบ", role: "admin" },
  { username: "student", password: "1234", name: "นักศึกษา", role: "user" },
];

const stops = [
  { id: 1, name: "ประตูทางเข้าหลัก (ตัวอย่าง)" },
  { id: 2, name: "อาคารเรียนรวม (ตัวอย่าง)" },
  { id: 3, name: "หอสมุด (ตัวอย่าง)" },
  { id: 4, name: "โรงอาหารกลาง (ตัวอย่าง)" },
  { id: 5, name: "หอพักนักศึกษา (ตัวอย่าง)" },
  { id: 6, name: "ศูนย์กีฬา (ตัวอย่าง)" },
];

const routes = [
  { id: "A", name: "สายสีเขียว", color: "#16a34a", stops: [1, 2, 3, 4], pickups: [1, 3, 4] },
  { id: "B", name: "สายสีส้ม", color: "#ea580c", stops: [1, 4, 5, 6], pickups: [1, 5, 6] },
];

const buses = [
  { id: "EV-01", routeId: "A", status: "กำลังวิ่ง", seats: 14 },
  { id: "EV-02", routeId: "A", status: "จอดพัก", seats: 14 },
  { id: "EV-03", routeId: "B", status: "กำลังวิ่ง", seats: 14 },
];
// ===============================================

const sessions = {};

function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!sessions[token]) return res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" });
  req.user = sessions[token];
  next();
}

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const u = users.find((x) => x.username === username && x.password === password);
  if (!u) return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  sessions[token] = { name: u.name, role: u.role };
  res.json({ token, name: u.name, role: u.role });
});

app.get("/api/data", auth, (req, res) => {
  const fullRoutes = routes.map((r) => ({
    ...r,
    stopList: r.stops.map((id) => ({
      ...stops.find((s) => s.id === id),
      isPickup: r.pickups.includes(id),
    })),
    buses: buses.filter((b) => b.routeId === r.id),
  }));
  res.json({ routes: fullRoutes });
});

app.post("/api/bus/:id/status", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "ไม่มีสิทธิ์" });
  const bus = buses.find((b) => b.id === req.params.id);
  if (!bus) return res.status(404).json({ error: "ไม่พบรถ" });
  bus.status = req.body.status;
  res.json(bus);
});

app.listen(3000, () => console.log("เปิดเว็บที่ https://wu-bus-backend.onrender.com"));
