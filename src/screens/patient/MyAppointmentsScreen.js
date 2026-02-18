// src/screens/patient/MyAppointmentsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { subscribeToAppointments } from '../../services/appointmentService';

const MyAppointmentsScreen = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToAppointments(user.uid, (data) => {
            setAppointments(data);
        });
        return () => unsubscribe();
    }, [user]);

    const formatAppointmentDate = (date) => {
        if (!date) return 'ไม่ระบุ';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatShortDate = (date) => {
        if (!date) return { day: '--', month: '' };
        const d = date.toDate ? date.toDate() : new Date(date);
        return {
            day: d.getDate().toString(),
            month: d.toLocaleDateString('th-TH', { month: 'short' }),
            weekday: d.toLocaleDateString('th-TH', { weekday: 'short' }),
        };
    };

    const formatAppointmentTime = (date) => {
        if (!date) return '';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'upcoming':
                return { label: 'รอพบแพทย์', color: COLORS.primary, bgColor: '#E8F2FD', icon: 'time-outline' };
            case 'completed':
                return { label: 'เสร็จสิ้น', color: COLORS.success, bgColor: '#E8F8EC', icon: 'checkmark-circle-outline' };
            case 'cancelled':
                return { label: 'ยกเลิก', color: COLORS.danger, bgColor: '#FDECEB', icon: 'close-circle-outline' };
            default:
                return { label: status, color: COLORS.textSecondary, bgColor: '#F2F2F7', icon: 'help-circle-outline' };
        }
    };

    const renderItem = ({ item }) => {
        const statusInfo = getStatusInfo(item.status);
        const shortDate = formatShortDate(item.appointmentDate);

        return (
            <View style={styles.card}>
                {/* แถบสีด้านซ้าย */}
                <View style={[styles.cardAccent, { backgroundColor: statusInfo.color }]} />

                <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                        {/* วันที่แบบกล่อง */}
                        <View style={[styles.dateBox, { backgroundColor: statusInfo.bgColor }]}>
                            <Text style={[styles.dateDay, { color: statusInfo.color }]}>{shortDate.day}</Text>
                            <Text style={[styles.dateMonth, { color: statusInfo.color }]}>{shortDate.month}</Text>
                        </View>

                        {/* ข้อมูลนัด */}
                        <View style={styles.appointmentInfo}>
                            <Text style={styles.dateText}>{formatAppointmentDate(item.appointmentDate)}</Text>
                            <View style={styles.timeRow}>
                                <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                                <Text style={styles.timeText}>{formatAppointmentTime(item.appointmentDate)} น.</Text>
                            </View>
                        </View>

                        {/* สถานะ */}
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                            <Ionicons name={statusInfo.icon} size={12} color={statusInfo.color} />
                            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                        </View>
                    </View>

                    {/* แพทย์ + วินิจฉัย */}
                    <View style={styles.doctorSection}>
                        <View style={styles.doctorAvatar}>
                            <Ionicons name="person" size={16} color={COLORS.white} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.doctorName}>นพ. {item.doctorName}</Text>
                            {item.diagnosis ? (
                                <View style={styles.diagnosisRow}>
                                    <Ionicons name="medkit-outline" size={12} color={COLORS.textSecondary} />
                                    <Text style={styles.diagnosis} numberOfLines={1}>{item.diagnosis}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header สไตล์เดียวกับหน้าอื่นๆ */}
            <View style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerIcon}>
                            <Ionicons name="calendar" size={22} color={COLORS.white} />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>การนัดหมาย</Text>
                            <Text style={styles.headerSubtitle}>
                                {appointments.length > 0
                                    ? `${appointments.length} นัดหมาย`
                                    : 'ยังไม่มีนัดหมาย'}
                            </Text>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <FlatList
                data={appointments}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="calendar-outline" size={50} color={COLORS.primary} />
                        </View>
                        <Text style={styles.emptyText}>ยังไม่มีการนัดหมาย</Text>
                        <Text style={styles.emptySubText}>
                            เมื่อแพทย์นัดหมายครั้งถัดไป{'\n'}รายการจะแสดงที่นี่
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // --- Header (สไตล์เดียวกับ PatientHomeScreen) ---
    header: {
        backgroundColor: COLORS.primary,
        paddingBottom: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingTop: 10,
        gap: 12,
    },
    headerIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: SIZES.caption,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },

    // --- List ---
    listContent: {
        padding: SIZES.padding,
        paddingTop: 20,
        paddingBottom: 100,
    },

    // --- Card ---
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        marginBottom: 14,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    cardAccent: {
        width: 5,
    },
    cardContent: {
        flex: 1,
        padding: 14,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    // --- Date box ---
    dateBox: {
        width: 48,
        height: 52,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateDay: {
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 24,
    },
    dateMonth: {
        fontSize: SIZES.small,
        fontWeight: '600',
    },

    // --- Appointment info ---
    appointmentInfo: {
        flex: 1,
    },
    dateText: {
        fontSize: SIZES.caption,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 3,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },

    // --- Status badge ---
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },

    // --- Doctor section ---
    doctorSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 10,
    },
    doctorAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doctorName: {
        fontSize: SIZES.caption,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    diagnosisRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    diagnosis: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        flex: 1,
    },

    // --- Empty state ---
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E8F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    emptySubText: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default MyAppointmentsScreen;