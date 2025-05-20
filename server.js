import express from "express";
import bodyParser from "body-parser";
import { getStudentById, db } from "./firebase.js"; // 🔁 getStudentById와 db 둘 다 export 되어야 함

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

// 🔸 학번으로 학생 정보 조회
app.get("/api/student/:studentId", async (req, res) => {
  const student = await getStudentById(req.params.studentId);
  if (!student) return res.status(404).json({ error: "등록되지 않은 학번입니다." });

  res.json({
    name: student.name,
    department: student.department,
    gender: student.gender,
    payment: student.payment ? "납부자" : "미납부자",
    status: student.status ? "재학생" : "휴학생"
  });
});

// 🔸 주문 저장 (Firestore로 저장)
app.post("/api/save", async (req, res) => {
  try {
    const newOrder = {
      ...req.body,
      timestamp: new Date() // 저장 시점 추가
    };
    await db.collection("orders").add(newOrder);
    res.status(200).json({ message: "저장 완료 (Firestore)" });
  } catch (err) {
    console.error("Firestore 저장 실패:", err);
    res.status(500).json({ error: "저장 실패" });
  }
});

// 🔸 주문 전체 조회 (Firestore에서 조회)
app.get("/api/orders", async (req, res) => {
  try {
    const snapshot = await db.collection("orders").get();
    const orders = snapshot.docs.map(doc => doc.data());
    res.json(orders);
  } catch (err) {
    console.error("Firestore 조회 실패:", err);
    res.status(500).json({ error: "조회 실패" });
  }
});

// 🔸 아크릴 키링 이벤트 수량 집계
app.get("/api/acrylic-event-count", async (req, res) => {
  try {
    const snapshot = await db.collection("orders").get();
    let totalCount = 0;

    snapshot.docs.forEach(doc => {
      const order = doc.data();
      order.items?.forEach(item => {
        if (item.name.includes("아크릴 키링") && item.unitPrice === 0) {
          totalCount += item.count;
        }
      });
    });

    res.json({ acrylicEventTotal: totalCount });
  } catch (err) {
    console.error("Firestore 이벤트 수량 조회 실패:", err);
    res.status(500).json({ error: "조회 실패" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
