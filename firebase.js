import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath =
  process.env.NODE_ENV === "production"
    ? "/etc/secrets/firebaseKey.json"
    : "./config/firebaseKey.json";

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = getFirestore();

// ✅ 함수 정의
const getStudentById = async (studentId) => {
  const doc = await db.collection("students").doc(studentId).get();
  return doc.exists ? doc.data() : null;
};

// ✅ export는 한 번만!
export { db, getStudentById };
