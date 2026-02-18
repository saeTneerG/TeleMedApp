// src/services/chatService.js
import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc
} from 'firebase/firestore';

// ฟังข้อความในห้องแชทแบบ Real-time
export const subscribeToMessages = (roomId, callback) => {
    const messagesRef = collection(db, 'chat_rooms', roomId, 'messages');

    const q = query(
        messagesRef,
        orderBy('createdAt', 'desc') // เรียงจากใหม่ไปเก่า
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => {
            const firebaseData = doc.data();

            // แปลงข้อมูลให้ตรง Format ของ GiftedChat
            const data = {
                _id: doc.id,
                text: firebaseData.text,
                createdAt: firebaseData.createdAt ? firebaseData.createdAt.toDate() : new Date(),
                user: firebaseData.user,
                image: firebaseData.image || null, // รองรับส่งรูป
            };
            return data;
        });
        callback(messages);
    });

    return unsubscribe;
};

// ส่งข้อความ
export const sendMessage = async (roomId, text, user) => {
    try {
        const messagesRef = collection(db, 'chat_rooms', roomId, 'messages');
        await addDoc(messagesRef, {
            text,
            user, // { _id: uid, name: name, avatar: url }
            createdAt: serverTimestamp(),
        });

        // อัปเดตข้อมูลข้อความล่าสุดใน queue document
        // เพื่อใช้แสดงใน ChatListScreen (เรียงลำดับ + แสดง badge)
        try {
            const queueRef = doc(db, 'queues', roomId);
            await updateDoc(queueRef, {
                lastMessage: text.length > 50 ? text.substring(0, 50) + '...' : text,
                lastMessageTime: serverTimestamp(),
                lastSenderId: user._id,
            });
        } catch (e) {
            // ไม่ต้อง throw ถ้าอัปเดต queue ไม่สำเร็จ (อาจไม่มี queue doc)
            console.warn("Could not update queue with last message:", e);
        }
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

// บันทึกว่าผู้ใช้อ่านแชทนี้แล้ว (เรียกเมื่อเปิดห้องแชท)
export const markChatAsRead = async (roomId, userId) => {
    try {
        const queueRef = doc(db, 'queues', roomId);
        await updateDoc(queueRef, {
            [`lastReadBy_${userId}`]: serverTimestamp(),
        });
    } catch (e) {
        console.warn("Could not mark chat as read:", e);
    }
};