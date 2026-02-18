import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import DoctorCard from '../../components/specific/DoctorCard';
import InputBox from '../../components/common/InputBox';
import CustomButton from '../../components/common/CustomButton';
import { joinQueue, subscribeToMyChats } from '../../services/queueService';
import { ROUTES } from '../../constants/routes';

const PatientHomeScreen = ({ navigation }) => {
    const { userData, user } = useAuth();

    const [modalVisible, setModalVisible] = useState(false);
    const [symptom, setSymptom] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeDoctors, setActiveDoctors] = useState([]);
    const [showAllDoctors, setShowAllDoctors] = useState(false);

    const MAX_DOCTORS_PREVIEW = 3;

    // ดึงรายการหมอที่กำลังดูแลอยู่แบบ real-time (ไม่ซ้ำ)
    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToMyChats(user.uid, (chats) => {
            // กรองหมอไม่ให้ซ้ำ โดยใช้ doctorId เป็น key
            const doctorMap = {};
            chats.forEach(chat => {
                const docId = chat.doctorId;
                if (!docId) return;
                // เก็บแค่รายการล่าสุดของหมอแต่ละคน
                const existingTime = doctorMap[docId]?.acceptedAt?.toMillis?.() || 0;
                const newTime = chat.acceptedAt?.toMillis?.() || 0;
                if (!doctorMap[docId] || newTime > existingTime) {
                    doctorMap[docId] = chat;
                }
            });

            const doctors = Object.values(doctorMap).map(chat => ({
                id: chat.doctorId,
                name: chat.doctorName || 'แพทย์',
                specialty: 'แพทย์ทั่วไป',
                isOnline: true,
                roomId: chat.id,
            }));
            setActiveDoctors(doctors);
        });
        return () => unsubscribe();
    }, [user]);

    // แสดงแค่ 3 คน หรือทั้งหมด
    const displayedDoctors = showAllDoctors ? activeDoctors : activeDoctors.slice(0, MAX_DOCTORS_PREVIEW);

    const handleJoinQueue = async () => {
        if (!symptom.trim()) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกอาการเบื้องต้นก่อนครับ');
            return;
        }
        setLoading(true);
        try {
            const queueId = await joinQueue(user.uid, userData.fullName, symptom.trim());
            setModalVisible(false);
            setSymptom('');
            navigation.navigate(ROUTES.WAITING_ROOM, { queueId, symptom: symptom.trim() });
        } catch (e) {
            Alert.alert('ผิดพลาด', 'ไม่สามารถเข้าคิวได้ กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

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
                        source={{ uri: 'https://img.freepik.com/free-vector/doctor-consultation-concept-illustration_114360-1495.jpg' }}
                        style={styles.bannerImage}
                    />
                    <Text style={styles.bannerTitle}>เจ็บป่วยไม่สบาย?</Text>
                    <Text style={styles.bannerSubtitle}>ปรึกษาแพทย์ออนไลน์ได้ทันที ไม่ต้องรอคิว</Text>

                    <TouchableOpacity
                        style={styles.queueButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.queueButtonText}>เข้าห้องตรวจ (จับคู่หมอ)</Text>
                    </TouchableOpacity>
                </View>

                {/* เมนูทางลัด (Grid) */}
                <Text style={styles.sectionTitle}>บริการของเรา</Text>
                <View style={styles.gridMenu}>
                    <MenuButton icon="document-text" title="ประวัติการรักษา" color="#FF9500" onPress={() => navigation.navigate('MedicalHistoryScreen')} />
                    <MenuButton icon="medkit" title="ใบสั่งยา" color="#34C759" onPress={() => navigation.navigate('MyPrescriptionsScreen')} />
                    <MenuButton icon="calendar" title="นัดหมายแพทย์" color="#5856D6" onPress={() => navigation.navigate('MainApp', { screen: ROUTES.MY_APPOINTMENTS })} />
                    <MenuButton icon="person" title="ข้อมูลส่วนตัว" color="#AF52DE" onPress={() => navigation.navigate('MainApp', { screen: ROUTES.PATIENT_PROFILE })} />
                </View>

                {/* หมอที่กำลังดูแล */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>หมอที่ดูแลคุณ</Text>
                    {activeDoctors.length > MAX_DOCTORS_PREVIEW && (
                        <TouchableOpacity onPress={() => setShowAllDoctors(!showAllDoctors)}>
                            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
                                {showAllDoctors ? 'ย่อ' : `ดูทั้งหมด (${activeDoctors.length})`}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {displayedDoctors.length > 0 ? (
                    displayedDoctors.map(doc => (
                        <DoctorCard
                            key={doc.id}
                            doctor={doc}
                            onPress={() => navigation.navigate(ROUTES.CHAT, {
                                roomId: doc.roomId,
                                chatPartnerName: doc.name,
                            })}
                        />
                    ))
                ) : (
                    <View style={styles.emptyDoctorCard}>
                        <Ionicons name="medkit-outline" size={30} color={COLORS.textSecondary} />
                        <Text style={styles.emptyDoctorText}>ยังไม่มีแพทย์ที่ดูแลคุณ</Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Modal กรอกอาการ */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>บอกอาการเบื้องต้น</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>กรุณาอธิบายอาการของคุณเพื่อให้แพทย์เตรียมตัวล่วงหน้า</Text>

                        <InputBox
                            label="อาการเบื้องต้น"
                            placeholder="เช่น ปวดหัว มีไข้ ตัวร้อน..."
                            value={symptom}
                            onChangeText={setSymptom}
                            multiline={true}
                        />

                        <CustomButton
                            title="ยืนยันเข้าคิว"
                            onPress={handleJoinQueue}
                            isLoading={loading}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// Component ปุ่มเมนูย่อย
const MenuButton = ({ icon, title, color, onPress }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress} activeOpacity={0.7}>
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

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: SIZES.padding,
        paddingTop: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    modalSubtitle: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
        marginBottom: 20,
    },
    emptyDoctorCard: {
        backgroundColor: COLORS.white,
        padding: 25,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    emptyDoctorText: {
        marginTop: 8,
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
    },
});

export default PatientHomeScreen;