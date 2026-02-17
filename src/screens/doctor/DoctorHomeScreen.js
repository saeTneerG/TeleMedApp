// src/screens/doctor/DoctorHomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { subscribeToQueue, acceptPatient } from '../../services/queueService';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';

const DoctorHomeScreen = () => {
    const { userData, user } = useAuth();
    const navigation = useNavigation();

    const [isOnline, setIsOnline] = useState(false); // สถานะเปิดรับงาน
    const [queueList, setQueueList] = useState([]);  // รายชื่อคนรอ

    useEffect(() => {
        // ฟังการเปลี่ยนแปลงของคิวแบบ Real-time
        const unsubscribe = subscribeToQueue((data) => {
            setQueueList(data);
        });

        // คืนค่าฟังก์ชันเมื่อปิดหน้าจอนี้ (Cleanup)
        return () => unsubscribe();
    }, []);

    const handleAcceptCase = async (item) => {
        if (!isOnline) {
            Alert.alert('แจ้งเตือน', 'กรุณาเปิดสถานะ "ออนไลน์" ก่อนรับเคส');
            return;
        }

        try {
            await acceptPatient(item.id, user.uid, userData.fullName);
            Alert.alert('สำเร็จ', 'รับเคสเรียบร้อย เตรียมเข้าห้องตรวจ...');

            // ส่งไปห้องแชท/วิดีโอ (ส่วนที่ 5)
            // navigation.navigate(ROUTES.CHAT, { queueId: item.id, patientId: item.patientId });
        } catch (error) {
            Alert.alert('Error', 'เกิดข้อผิดพลาดในการรับเคส');
        }
    };

    // UI การ์ดคนไข้ที่รออยู่
    const renderQueueItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="person-circle" size={40} color={COLORS.secondary} />
                    <View style={{ marginLeft: 10 }}>
                        <Text style={styles.patientName}>{item.patientName}</Text>
                        <Text style={styles.timestamp}>รอเมื่อ: {new Date(item.createdAt?.toDate()).toLocaleTimeString()}</Text>
                    </View>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>รอจับคู่</Text>
                </View>
            </View>

            <Text style={styles.symptomTitle}>อาการเบื้องต้น:</Text>
            <Text style={styles.symptomText}>{item.symptom}</Text>

            <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptCase(item)}
            >
                <Text style={styles.acceptButtonText}>รับเคสนี้</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.greeting}>สวัสดี, นพ.{userData?.fullName}</Text>
                            <Text style={styles.subGreeting}>พร้อมดูแลคนไข้หรือยังครับ?</Text>
                        </View>
                        {/* Toggle Online/Offline */}
                        <View style={{ alignItems: 'center' }}>
                            <Switch
                                value={isOnline}
                                onValueChange={setIsOnline}
                                trackColor={{ false: "#767577", true: COLORS.success }}
                                thumbColor={COLORS.white}
                            />
                            <Text style={{ color: COLORS.white, fontSize: 10 }}>
                                {isOnline ? 'ONLINE' : 'OFFLINE'}
                            </Text>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>คิวรอรับบริการ ({queueList.length})</Text>
                    <TouchableOpacity><Text style={{ color: COLORS.primary }}>ดูทั้งหมด</Text></TouchableOpacity>
                </View>

                {queueList.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="happy-outline" size={60} color={COLORS.textSecondary} />
                        <Text style={{ color: COLORS.textSecondary, marginTop: 10 }}>ยังไม่มีคนไข้รอคิวครับ</Text>
                    </View>
                ) : (
                    <FlatList
                        data={queueList}
                        renderItem={renderQueueItem}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { backgroundColor: COLORS.primary, paddingBottom: 20, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
    headerContent: { paddingHorizontal: SIZES.padding, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    greeting: { color: COLORS.white, fontSize: SIZES.h2, fontWeight: 'bold' },
    subGreeting: { color: COLORS.white, opacity: 0.8 },

    content: { flex: 1, padding: SIZES.padding },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.textPrimary },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },

    // Card Styles
    card: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: 15, marginBottom: 15, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    patientName: { fontSize: SIZES.body, fontWeight: 'bold', color: COLORS.textPrimary },
    timestamp: { fontSize: SIZES.small, color: COLORS.textSecondary },
    badge: { backgroundColor: COLORS.warning, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
    symptomTitle: { fontSize: SIZES.caption, color: COLORS.textSecondary },
    symptomText: { fontSize: SIZES.body, color: COLORS.textPrimary, marginBottom: 15 },
    acceptButton: { backgroundColor: COLORS.success, padding: 10, borderRadius: SIZES.radius, alignItems: 'center' },
    acceptButtonText: { color: COLORS.white, fontWeight: 'bold' },
});

export default DoctorHomeScreen;