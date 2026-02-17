import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// ฟังก์ชันสมัครสมาชิก (สำหรับคนไข้)
export const registerPatient = async (email, password, userData) => {
    try {
        // 1. สร้าง User ใน Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. เก็บข้อมูลเพิ่มเติมลง Firestore (ชื่อ, โรคประจำตัว, ฯลฯ)
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: email,
            role: 'patient', // บังคับเป็นคนไข้
            fullName: userData.fullName,
            phoneNumber: userData.phoneNumber,
            allergies: userData.allergies || '-', // แพ้ยา
            chronicDisease: userData.chronicDisease || '-', // โรคประจำตัว
            createdAt: new Date().toISOString(),
        });

        return user;
    } catch (error) {
        throw error;
    }
};

// ฟังก์ชัน Login (ใช้ของ Firebase โดยตรงได้เลย หรือจะห่อไว้ก็ได้)
export const loginUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
    return signOut(auth);
};