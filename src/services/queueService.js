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

// 4. (คนไข้) ยกเลิกคิว
export const cancelQueue = async (queueId) => {
    try {
        const queueRef = doc(db, 'queues', queueId);
        await updateDoc(queueRef, {
            status: 'cancelled',
        });
        return true;
    } catch (error) {
        console.error("Error cancelling queue:", error);
        throw error;
    }
};

// 5. (คนไข้) ฟังสถานะคิวของตัวเอง (Real-time) — ใช้ในหน้ารอ
export const subscribeToQueueItem = (queueId, callback) => {
    const queueRef = doc(db, 'queues', queueId);
    const unsubscribe = onSnapshot(queueRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() });
        }
    });
    return unsubscribe;
};

// 6. ฟังรายการแชทของฉัน (ทั้งคนไข้และหมอ)
export const subscribeToMyChats = (userId, callback) => {
    // Query 1: คิวที่ฉันเป็นคนไข้
    const patientQuery = query(
        collection(db, 'queues'),
        where('patientId', '==', userId),
        where('status', '==', 'matched'),
    );

    // Query 2: คิวที่ฉันเป็นหมอ
    const doctorQuery = query(
        collection(db, 'queues'),
        where('doctorId', '==', userId),
        where('status', '==', 'matched'),
    );

    let patientResults = [];
    let doctorResults = [];

    const mergeAndCallback = () => {
        // รวมและเรียงตามเวลา
        const merged = [...patientResults, ...doctorResults];
        merged.sort((a, b) => {
            const aTime = a.acceptedAt?.toMillis?.() || 0;
            const bTime = b.acceptedAt?.toMillis?.() || 0;
            return bTime - aTime; // ใหม่สุดก่อน
        });
        callback(merged);
    };

    const unsub1 = onSnapshot(patientQuery, (snapshot) => {
        patientResults = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        mergeAndCallback();
    });

    const unsub2 = onSnapshot(doctorQuery, (snapshot) => {
        doctorResults = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        mergeAndCallback();
    });

    return () => { unsub1(); unsub2(); };
};

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