// src/services/patientService.js
import { db } from '../config/firebase';
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    getDoc,
    getDocs,
    orderBy,
} from 'firebase/firestore';

// ดึงรายชื่อคนไข้ของหมอ (Real-time) — ดูจาก queues ที่ doctorId ตรงกับหมอ
export const subscribeToMyPatients = (doctorId, callback) => {
    const q = query(
        collection(db, 'queues'),
        where('doctorId', '==', doctorId),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const queues = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // กรองคนไข้ที่ไม่ซ้ำ (กรณีหมอรับคนไข้คนเดียวกันหลายครั้ง)
        const patientMap = {};
        queues.forEach(q => {
            if (!q.patientId) return;
            if (!patientMap[q.patientId]) {
                patientMap[q.patientId] = {
                    patientId: q.patientId,
                    patientName: q.patientName,
                    lastVisit: q.acceptedAt || q.createdAt,
                    symptom: q.symptom,
                    status: q.status,
                    visitCount: 1,
                    queueIds: [q.id],
                };
            } else {
                patientMap[q.patientId].visitCount += 1;
                patientMap[q.patientId].queueIds.push(q.id);
                // อัปเดตข้อมูลล่าสุด
                const existingTime = patientMap[q.patientId].lastVisit?.toMillis?.() || 0;
                const newTime = (q.acceptedAt || q.createdAt)?.toMillis?.() || 0;
                if (newTime > existingTime) {
                    patientMap[q.patientId].lastVisit = q.acceptedAt || q.createdAt;
                    patientMap[q.patientId].symptom = q.symptom;
                    patientMap[q.patientId].status = q.status;
                }
            }
        });

        // เรียงตามเวลาล่าสุด
        const patients = Object.values(patientMap).sort((a, b) => {
            const aTime = a.lastVisit?.toMillis?.() || 0;
            const bTime = b.lastVisit?.toMillis?.() || 0;
            return bTime - aTime;
        });

        callback(patients);
    });

    return unsubscribe;
};

// ดึงข้อมูลโปรไฟล์คนไข้จาก users collection
export const getPatientProfile = async (patientId) => {
    try {
        const docRef = doc(db, 'users', patientId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching patient profile:", error);
        return null;
    }
};

// ดึงประวัติการสั่งยาของคนไข้ (โดยหมอคนนี้)
export const getPatientPrescriptions = async (patientId, doctorId) => {
    try {
        const q = query(
            collection(db, 'prescriptions'),
            where('patientId', '==', patientId),
            where('doctorId', '==', doctorId),
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error fetching prescriptions:", error);
        return [];
    }
};

// ดึงนัดหมายของคนไข้ (โดยหมอคนนี้)
export const getPatientAppointments = async (patientId, doctorId) => {
    try {
        const q = query(
            collection(db, 'appointments'),
            where('patientId', '==', patientId),
            where('doctorId', '==', doctorId),
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return [];
    }
};
