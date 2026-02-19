// src/screens/patient/WaitingScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';
import { subscribeToQueueItem, cancelQueue } from '../../services/queueService';
import CustomButton from '../../components/common/CustomButton';
import { useNavigation, useRoute } from '@react-navigation/native';

const WaitingScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { queueId, symptom } = route.params || {};

    const [queueData, setQueueData] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const matchedRef = useRef(false); // track matched status synchronously

    // Animation: pulse effect
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Pulse animation loop
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    // ฟังสถานะคิวแบบ Real-time
    useEffect(() => {
        if (!queueId) return;

        const unsubscribe = subscribeToQueueItem(queueId, (data) => {
            setQueueData(data);

            // ถ้าหมอรับแล้ว → ไปหน้าแชท (ตั้ง ref ก่อน replace เพื่อให้ beforeRemove ปล่อยผ่าน)
            if (data.status === 'matched') {
                matchedRef.current = true;
                navigation.replace(ROUTES.CHAT, {
                    roomId: queueId,
                    chatPartnerName: data.doctorName || 'แพทย์',
                    patientId: data.patientId,
                    queueId: queueId,
                });
            }
        });

        return () => unsubscribe();
    }, [queueId]);

    // ดักการกดปุ่มกลับ → ถามยืนยันก่อนยกเลิก
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // ถ้ากำลัง cancel อยู่แล้ว หรือหมอรับแล้ว ปล่อยผ่าน
            if (cancelling || matchedRef.current) return;

            e.preventDefault();

            Alert.alert(
                'ยกเลิกคิว?',
                'ถ้าออกจากหน้านี้ คิวของคุณจะถูกยกเลิก',
                [
                    { text: 'รอต่อ', style: 'cancel' },
                    {
                        text: 'ยกเลิกคิว',
                        style: 'destructive',
                        onPress: async () => {
                            setCancelling(true);
                            try {
                                await cancelQueue(queueId);
                            } catch (err) {
                                console.error('Cancel failed:', err);
                            }
                            navigation.dispatch(e.data.action);
                        },
                    },
                ]
            );
        });

        return () => unsubscribe();
    }, [navigation, cancelling, queueData]);

    const handleCancel = () => {
        Alert.alert(
            'ยกเลิกคิว?',
            'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการรอพบแพทย์?',
            [
                { text: 'รอต่อ', style: 'cancel' },
                {
                    text: 'ยกเลิกคิว',
                    style: 'destructive',
                    onPress: async () => {
                        setCancelling(true);
                        try {
                            await cancelQueue(queueId);
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert('Error', 'ไม่สามารถยกเลิกคิวได้');
                            setCancelling(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* ส่วนบน — สถานะ */}
                <View style={styles.content}>
                    <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
                        <Ionicons name="hourglass-outline" size={60} color={COLORS.primary} />
                    </Animated.View>

                    <Text style={styles.title}>กำลังรอพบแพทย์...</Text>
                    <Text style={styles.subtitle}>ระบบกำลังจับคู่คุณกับแพทย์ที่พร้อม{'\n'}กรุณารอสักครู่</Text>

                    {/* การ์ดสรุปข้อมูล */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.infoLabel}>อาการเบื้องต้น</Text>
                        </View>
                        <Text style={styles.infoValue}>{symptom || 'ไม่ระบุ'}</Text>

                        <View style={[styles.infoRow, { marginTop: 15 }]}>
                            <Ionicons name="time-outline" size={20} color={COLORS.warning} />
                            <Text style={styles.infoLabel}>สถานะ</Text>
                        </View>
                        <View style={styles.statusBadge}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>
                                {queueData?.status === 'waiting' ? 'กำลังรอจับคู่แพทย์...' : 'กำลังดำเนินการ...'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ปุ่มยกเลิก */}
                <View style={styles.bottomSection}>
                    <CustomButton
                        title="ยกเลิกคิว"
                        onPress={handleCancel}
                        type="danger"
                        isLoading={cancelling}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    safeArea: { flex: 1 },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SIZES.padding,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    title: {
        fontSize: SIZES.h1,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    infoCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
        marginLeft: 8,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        marginLeft: 28,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 28,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.success,
        marginRight: 8,
    },
    statusText: {
        fontSize: SIZES.body,
        color: COLORS.success,
        fontWeight: '500',
    },
    bottomSection: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: 20,
    },
});

export default WaitingScreen;
