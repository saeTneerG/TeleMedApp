// src/services/userService.js
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

// อัปเดตข้อมูลโปรไฟล์ผู้ใช้ (ทั้งหมอและคนไข้ใช้ได้)
export const updateUserProfile = async (uid, data) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            ...data,
            updatedAt: new Date(), // หรือ serverTimestamp() ก็ได้
        });
        return true;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};
