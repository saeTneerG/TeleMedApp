// src/services/prescriptionService.js
import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    serverTimestamp,
    updateDoc,
    doc
} from 'firebase/firestore';

// (หมอ) สร้างใบสั่งยา
export const createPrescription = async (data) => {
    try {
        // 1. บันทึกลง Collection 'prescriptions'
        const docRef = await addDoc(collection(db, 'prescriptions'), {
            ...data,
            status: 'pending_payment', // รอจ่ายเงิน
            createdAt: serverTimestamp(),
        });

        // 2. (Optional) อาจจะไปอัปเดตสถานะใน Queue ว่าจบงานแล้ว (completed)
        // await updateDoc(doc(db, 'queues', data.queueId), { status: 'completed' });

        return docRef.id;
    } catch (error) {
        console.error("Error creating prescription:", error);
        throw error;
    }
};

// (คนไข้) แจ้งชำระเงิน
export const processPayment = async (prescriptionId) => {
    try {
        const prescriptionRef = doc(db, 'prescriptions', prescriptionId);
        await updateDoc(prescriptionRef, {
            status: 'paid',
            paymentStatus: 'paid',
            paidAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        throw error;
    }
};