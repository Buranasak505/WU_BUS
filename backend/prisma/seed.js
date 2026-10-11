const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

const toTime = (m) =>
  String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
const range = (from, to, step) => {
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  const out = [];
  for (let m = fh * 60 + fm; m <= th * 60 + tm; m += step) out.push(toTime(m));
  return out;
};

const routes = [
  {
    number: 1, name: "สาย 1 หอพัก-เขตการศึกษา", color: "#ef4444",
    distanceKm: 6, durationMin: 12, busCount: 5, busNote: null,
    frequencyMin: 5, firstTrip: "07:00", lastTrip: "20:30",
    times: [
      ...range("07:00", "08:15", 5),
      ...range("08:30", "11:30", 15),
      ...range("11:40", "13:00", 10),
      ...range("13:15", "18:00", 15),
      ...range("18:30", "20:30", 30),
    ],
    outbound: ["หอพัก Residence", "หอพักลักษณานิเวศ 18", "หอพักลักษณานิเวศ 5", "อาคารกิจกรรมนักศึกษา", "ศูนย์รวมรถ", "อาคารสถาปัตยกรรมฯ", "อาคารเรียนรวม 3", "อาคารไทยบุรี", "อาคาร ST", "อาคารบริหาร"],
    inbound: ["โรงพยาบาลสัตว์ใหญ่", "อาคารวิชาการ 5", "ครัวโปรเฟซ", "อาคารกายวิภาค", "อาคารสถาปัตยกรรมฯ", "ศูนย์รวมรถ", "อาคารกิจกรรมนักศึกษา", "หอพักลักษณานิเวศ 5", "หอพัก Residence"],
  },
  {
    number: 2, name: "สาย 2 หอพัก-สนามกีฬาตุมปัง", color: "#3b82f6",
    distanceKm: 7, durationMin: 10, busCount: 1, busNote: "หลัง 18:00 น. ใช้ 2 คัน (รถจากสาย 1)",
    frequencyMin: 40, firstTrip: "07:40", lastTrip: "20:30",
    times: [
      ...range("07:40", "17:40", 40),
      ...range("18:00", "20:30", 30),
    ],
    outbound: ["ป้ายตรงข้ามอาคารกิจกรรมฯ", "หอพักลักษณานิเวศ 5", "หอพัก Residence", "หอพักลักษณานิเวศ 18", "ทางออกประตู 2", "สนามแบดมินตัน", "อาคารพลศึกษา", "สระว่ายน้ำ", "สนามเทนนิส", "สนามกีฬากลางตุมปัง"],
    inbound: ["สนามเทนนิส", "สระว่ายน้ำ", "อาคารพลศึกษา", "สนามแบดมินตัน", "ทางเข้าประตู 2", "หอพัก Residence", "หอพักลักษณานิเวศ 18", "หอพักลักษณานิเวศ 5", "อาคารกิจกรรมฯ"],
  },
  {
    number: 3, name: "สาย 3 หอพัก-หน้ามหาวิทยาลัย", color: "#22c55e",
    distanceKm: 12, durationMin: 30, busCount: 3, busNote: null,
    frequencyMin: 15, firstTrip: "07:00", lastTrip: "20:10",
    times: [
      ...range("07:00", "08:30", 15),
      "09:15", "10:00", "10:45", "11:15", "11:45", "12:15", "12:45", "13:15", "14:00", "14:45", "15:30", "16:15",
      ...range("17:00", "20:00", 30),
      "20:10",
    ],
    outbound: ["แยกลักษณานิเวศ 14", "อาคารกิจกรรมนักศึกษา", "ศูนย์รวมรถ", "อาคารสถาปัตยกรรมฯ", "อาคารเรียนรวม 3", "อาคารไทยบุรี", "อาคาร ST", "อาคารบริหาร", "สวนวลัยลักษณ์ 1", "สวนวลัยลักษณ์ 2", "7-Eleven คุ้มสวัสดิ์", "โตลิสท่าศาลา"],
    inbound: ["ศาลารอรถทางเข้ามหาวิทยาลัย", "7-Eleven (ขาเข้า)", "ศูนย์การแพทย์ มวล.", "อาคาร ดร.วิจิตร ศรีสะอ้าน", "อาคาร ST", "อาคารไทยบุรี", "อาคารเรียนรวม 3", "อาคารสถาปัตยกรรมฯ", "ศูนย์รวมรถ", "อาคารกิจกรรมนักศึกษา", "แยกลักษณานิเวศ 14"],
  },
];

async function main() {
  await prisma.busStop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.user.deleteMany();

  for (const r of routes) {
    const route = await prisma.route.create({
      data: {
        number: r.number, name: r.name, color: r.color,
        distanceKm: r.distanceKm, durationMin: r.durationMin,
        busCount: r.busCount, busNote: r.busNote,
        frequencyMin: r.frequencyMin, firstTrip: r.firstTrip, lastTrip: r.lastTrip,
        departureTimes: r.times,
      },
    });
    const mk = (names, direction) =>
      names.map((name, i) => ({ name, order: i + 1, direction, transferRoutes: [], routeId: route.id }));
    await prisma.busStop.createMany({
      data: [...mk(r.outbound, "OUTBOUND"), ...mk(r.inbound, "INBOUND")],
    });
    console.log(`สาย ${r.number}: ${r.times.length} เที่ยว, ${r.outbound.length + r.inbound.length} ป้าย`);
  }

  await prisma.user.createMany({
    data: [
      { username: "admin", password: await bcrypt.hash("admin1234", 10), name: "ผู้ดูแลระบบ", role: "ADMIN" },
      { username: "user", password: await bcrypt.hash("user1234", 10), name: "ผู้ใช้ทั่วไป", role: "USER" },
    ],
  });
  console.log("สร้างผู้ใช้เรียบร้อย (admin/admin1234)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
