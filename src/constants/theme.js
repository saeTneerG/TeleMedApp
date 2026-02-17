// src/constants/theme.js

export const COLORS = {
    // สีหลัก (Primary Blue - ตามธีมแอพหมอ)
    primary: '#4A90E2',      // ฟ้าสดใส (ปุ่มหลัก, Header)
    secondary: '#5AC8FA',    // ฟ้าอ่อน

    // สีสถานะ
    success: '#4CD964',      // เขียว (ปุ่มยืนยัน, Online)
    danger: '#FF3B30',       // แดง (ปุ่มวางสาย, แจ้งเตือน)
    warning: '#FFCC00',      // เหลือง (รอคิว)

    // สีพื้นหลังและข้อความ
    white: '#FFFFFF',
    background: '#F2F2F7',   // เทาอ่อนมาก (พื้นหลังแอพ)
    textPrimary: '#000000',  // สีตัวหนังสือหลัก
    textSecondary: '#8E8E93',// สีตัวหนังสือรอง (สีเทา)
    border: '#E5E5EA',       // สีเส้นขอบ
};

export const SIZES = {
    // ขนาดตัวอักษร
    h1: 24,
    h2: 20,
    h3: 18,
    body: 16,
    caption: 14,
    small: 12,

    // ระยะห่าง (Padding/Margin)
    padding: 16,
    margin: 16,
    radius: 12, // ความโค้งของปุ่ม/การ์ด
};

export const FONTS = {
    // ถ้ามีการลงฟอนต์ไทยสวยๆ เช่น Kanit หรือ Prompt ให้แก้ชื่อตรงนี้
    regular: 'System',
    bold: 'System',    // ใน React Native 'System' จะเป็นฟอนต์มาตรฐานของเครื่อง (San Francisco บน iOS)
};