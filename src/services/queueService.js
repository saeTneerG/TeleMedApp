// src/services/queueService.js
import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    updateDoc,
    doc,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';

// 1. (คนไข้) ฟังก์ชันเข้าคิว
export const joinQueue = async (patientId, patientName, symptom) => {
    try {
        const queueRef = collection(db, 'queues');
        const docRef = await addDoc(queueRef, {
            patientId: patientId,
            patientName: patientName,
            symptom: symptom || 'ไม่ระบุอาการ',
            status: 'waiting', // waiting, matched, completed, cancelled
            createdAt: serverTimestamp(),
        });
        return docRef.id; // คืนค่า ID ของคิวกลับไป
    } catch (error) {
        console.error("Error joining queue:", error);
        throw error;
    }
};

// 2. (หมอ) ฟังก์ชันดึงรายชื่อคนรอคิว (Real-time)
export const subscribeToQueue = (callback) => {
    const q = query(
        collection(db, 'queues'),
        where('status', '==', 'waiting'),
        orderBy('createdAt', 'asc') // คนมาก่อนได้ก่อน
    );

    // onSnapshot จะทำงานทุกครั้งที่มีข้อมูลเปลี่ยนใน DB (Real-time update)
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const queueList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(queueList);
    });

    return unsubscribe; // ส่งฟังก์ชันยกเลิกการฟังกลับไป
};

// 3. (หมอ) ฟังก์ชันกดรับเคส
export const acceptPatient = async (queueId, doctorId, doctorName) => {
    try {
        const queueRef = doc(db, 'queues', queueId);

        // อัปเดตสถานะคิวเป็น 'matched' และใส่ชื่อหมอที่รับ
        await updateDoc(queueRef, {
            status: 'matched',
            doctorId: doctorId,
            doctorName: doctorName,
            acceptedAt: serverTimestamp()
        });

        // (Optional) ตรงนี้จริงๆ ควรสร้าง Chat Room ใหม่ด้วย แต่เดี๋ยวเราไปทำในส่วนที่ 5
        return true;
    } catch (error) {
        console.error("Error accepting patient:", error);
        throw error;
    }
};