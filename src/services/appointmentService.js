import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    onSnapshot,
    orderBy,
} from 'firebase/firestore';

// สร้างนัดหมายใหม่
export const createAppointment = async (data) => {
    try {
        const docRef = await addDoc(collection(db, 'appointments'), {
            ...data,
            status: 'upcoming', // upcoming, completed, cancelled
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating appointment:', error);
        throw error;
    }
};

// ดึงรายการนัดหมายของคนไข้แบบ real-time
export const subscribeToAppointments = (patientId, callback) => {
    const q = query(
        collection(db, 'appointments'),
        where('patientId', '==', patientId),
        orderBy('appointmentDate', 'asc'),
    );

    return onSnapshot(q, (snapshot) => {
        const appointments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        callback(appointments);
    });
};
