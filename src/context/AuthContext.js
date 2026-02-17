// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase'; // ดึง config ที่เราทำไว้

// สร้าง Context
const AuthContext = createContext({});

// สร้าง Provider เพื่อคลุมทั้งแอพ
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);       // เก็บข้อมูล User จาก Firebase Auth
    const [userData, setUserData] = useState(null); // เก็บข้อมูลเพิ่มเติมจาก Firestore (เช่น role, ชื่อ, นามสกุล)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ฟังก์ชันนี้จะทำงานอัตโนมัติเมื่อสถานะ Login เปลี่ยน (เช่น เปิดแอพมาแล้วเคย Login ไว้)
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchUserData(currentUser.uid); // ไปดึงข้อมูล Role
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // ฟังก์ชันดึงข้อมูล User จาก Firestore (เพื่อเช็คว่าเป็น หมอ หรือ คนไข้)
    const fetchUserData = async (uid) => {
        try {
            const docRef = doc(db, 'users', uid); // สมมติว่าเก็บใน Collection 'users'
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserData(docSnap.data());
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    // ฟังก์ชัน Login
    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged จะทำงานต่อเองอัตโนมัติ
        } catch (error) {
            throw error; // ส่ง Error ไปให้หน้า UI จัดการ (เช่น แจ้งเตือนรหัสผิด)
        }
    };

    // ฟังก์ชัน Logout
    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,       // ตัวตนจาก Auth (uid, email)
            userData,   // ข้อมูลจาก DB (role, name, etc.)
            loading,    // สถานะโหลด
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook สำหรับเรียกใช้ในหน้าอื่นง่ายๆ
export const useAuth = () => useContext(AuthContext);