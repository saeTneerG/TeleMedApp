// src/screens/patient/PatientHomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import DoctorCard from '../../components/specific/DoctorCard';
import { joinQueue } from '../../services/queueService';

const PatientHomeScreen = ({ navigation }) => {
    const { userData } = useAuth(); // ดึงชื่อคนไข้มาแสดง

    // Mock Data หมอ (เดี๋ยวเปลี่ยนเป็นดึงจาก Firebase ในส่วนหลังๆ)
    const recentDoctors = [
        { id: 1, name: 'สมชาย ใจดี', specialty: 'อายุรแพทย์', isOnline: true },
        { id: 2, name: 'วิภา รักษา', specialty: 'กุมารแพทย์', isOnline: false },
    ];

    return (
        <View style={styles.container}>
            {/* Header สีฟ้าโค้งๆ */}
            <View style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.welcomeText}>สวัสดี,</Text>
                            <Text style={styles.userName}>คุณ {userData?.fullName || 'คนไข้'}</Text>
                        </View>
                        <Ionicons name="notifications" size={24} color={COLORS.white} />
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Banner เข้าคิวปรึกษา (ปุ่มใหญ่) */}
                <View style={styles.bannerContainer}>
                    <Image
                        source={{ uri: 'https://img.freepik.com/free-vector/doctor-consultation-concept-illustration_114360-1495.jpg' }} // รูปตัวอย่าง
                        style={styles.bannerImage}
                    />
                    <Text style={styles.bannerTitle}>เจ็บป่วยไม่สบาย?</Text>
                    <Text style={styles.bannerSubtitle}>ปรึกษาแพทย์ออนไลน์ได้ทันที ไม่ต้องรอคิว</Text>

                    <TouchableOpacity
                        style={styles.queueButton}
                        onPress={async () => {
                            try {
                                await joinQueue(userData.uid, userData.fullName, 'ปวดหัว ตัวร้อน (ทดสอบ)');
                                alert('จองคิวสำเร็จ! รอหมอกดรับนะครับ');
                            } catch (e) {
                                alert('จองคิวไม่สำเร็จ');
                            }
                        }}

                    >
                        <Text style={styles.queueButtonText}>เข้าห้องตรวจ (จับคู่หมอ)</Text>
                    </TouchableOpacity>
                </View>

                {/* เมนูทางลัด (Grid) */}
                <Text style={styles.sectionTitle}>บริการของเรา</Text>
                <View style={styles.gridMenu}>
                    <MenuButton icon="document-text" title="ประวัติการรักษา" color="#FF9500" />
                    <MenuButton icon="medkit" title="สั่งยา/รีฟิล" color="#34C759" />
                    <MenuButton icon="calendar" title="นัดหมายแพทย์" color="#5856D6" />
                    <MenuButton icon="person" title="ข้อมูลส่วนตัว" color="#AF52DE" />
                </View>

                {/* หมอที่เคยรักษา (Recent) */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>หมอที่ดูแลคุณ</Text>
                    <TouchableOpacity><Text style={{ color: COLORS.primary }}>ดูทั้งหมด</Text></TouchableOpacity>
                </View>

                {
                    recentDoctors.map(doc => (
                        <DoctorCard key={doc.id} doctor={doc} onPress={() => { }} />
                    ))
                }

                <View style={{ height: 100 }} />
            </ScrollView >
        </View >
    );
};

// Component ปุ่มเมนูย่อย
const MenuButton = ({ icon, title, color }) => (
    <TouchableOpacity style={styles.menuButton}>
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <Text style={styles.menuText}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.primary,
        paddingBottom: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    headerContent: {
        paddingHorizontal: SIZES.padding,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10
    },
    welcomeText: { color: COLORS.white, fontSize: SIZES.body, opacity: 0.9 },
    userName: { color: COLORS.white, fontSize: SIZES.h2, fontWeight: 'bold' },

    content: { flex: 1, padding: SIZES.padding },

    bannerContainer: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    bannerImage: { width: 150, height: 100, marginBottom: 10, resizeMode: 'contain' },
    bannerTitle: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.textPrimary },
    bannerSubtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 15 },
    queueButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
    },
    queueButtonText: { color: COLORS.white, fontSize: SIZES.h3, fontWeight: 'bold' },

    sectionTitle: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 10 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 10 },

    gridMenu: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    menuButton: {
        width: '48%',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginBottom: 15,
        // Shadow
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    iconBox: {
        width: 50, height: 50, borderRadius: 25,
        justifyContent: 'center', alignItems: 'center', marginBottom: 8
    },
    menuText: { fontSize: SIZES.body, color: COLORS.textPrimary, fontWeight: '500' },
});

export default PatientHomeScreen;