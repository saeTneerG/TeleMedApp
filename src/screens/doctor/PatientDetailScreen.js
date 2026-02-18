// src/screens/doctor/PatientDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getPatientProfile, getPatientPrescriptions, getPatientAppointments } from '../../services/patientService';

const PatientDetailScreen = () => {
    const { user } = useAuth();
    const route = useRoute();
    const navigation = useNavigation();
    const { patientId, patientName } = route.params || {};

    const [profile, setProfile] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPatientData();
    }, []);

    const loadPatientData = async () => {
        setLoading(true);
        try {
            const [profileData, prescData, apptData] = await Promise.all([
                getPatientProfile(patientId),
                getPatientPrescriptions(patientId, user.uid),
                getPatientAppointments(patientId, user.uid),
            ]);
            setProfile(profileData);
            setPrescriptions(prescData);
            setAppointments(apptData);
        } catch (error) {
            console.error('Error loading patient data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
        } catch { return '-'; }
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return '-';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('th-TH', {
                day: 'numeric', month: 'short', year: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });
        } catch { return '-'; }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>กำลังโหลดข้อมูล...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle} numberOfLines={1}>ข้อมูลคนไข้</Text>
                        <View style={{ width: 34 }} />
                    </View>

                    {/* Patient Info in Header */}
                    <View style={styles.patientHeader}>
                        <View style={styles.avatarCircle}>
                            {profile?.profileImage ? (
                                <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
                            ) : (
                                <Ionicons name="person" size={40} color={COLORS.white} />
                            )}
                        </View>
                        <Text style={styles.patientHeaderName}>{patientName || profile?.fullName || 'ไม่ทราบชื่อ'}</Text>
                        {profile?.email && <Text style={styles.patientHeaderEmail}>{profile.email}</Text>}
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Info Card */}
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>ข้อมูลส่วนตัว</Text>
                    </View>
                    <DetailRow icon="person-outline" label="ชื่อ-นามสกุล" value={profile?.fullName || patientName || '-'} />
                    <DetailRow icon="mail-outline" label="อีเมล" value={profile?.email || '-'} />
                    <DetailRow icon="call-outline" label="เบอร์โทร" value={profile?.phoneNumber || '-'} />
                    <DetailRow icon="shield-checkmark-outline" label="บทบาท" value={profile?.role === 'patient' ? 'คนไข้' : (profile?.role || '-')} />
                </View>

                {/* Prescriptions Card */}
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>ประวัติการสั่งยา ({prescriptions.length})</Text>
                    </View>
                    {prescriptions.length === 0 ? (
                        <Text style={styles.emptyText}>ยังไม่มีประวัติการสั่งยา</Text>
                    ) : (
                        prescriptions.map((rx, index) => (
                            <View key={rx.id} style={[styles.historyItem, index < prescriptions.length - 1 && styles.historyItemBorder]}>
                                <View style={styles.historyItemHeader}>
                                    <View style={styles.historyDateBadge}>
                                        <Ionicons name="calendar-outline" size={12} color={COLORS.primary} />
                                        <Text style={styles.historyDateText}>{formatDate(rx.createdAt)}</Text>
                                    </View>
                                </View>
                                <Text style={styles.historyLabel}>การวินิจฉัย</Text>
                                <Text style={styles.historyValue}>{rx.diagnosis || '-'}</Text>
                                <Text style={styles.historyLabel}>ยาที่สั่ง</Text>
                                <Text style={styles.historyValue}>{rx.medication || '-'}</Text>
                                {rx.notes ? (
                                    <>
                                        <Text style={styles.historyLabel}>หมายเหตุ</Text>
                                        <Text style={styles.historyValue}>{rx.notes}</Text>
                                    </>
                                ) : null}
                            </View>
                        ))
                    )}
                </View>

                {/* Appointments Card */}
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>นัดหมาย ({appointments.length})</Text>
                    </View>
                    {appointments.length === 0 ? (
                        <Text style={styles.emptyText}>ยังไม่มีนัดหมาย</Text>
                    ) : (
                        appointments.map((appt, index) => {
                            const statusInfo = appt.status === 'completed' ? { label: 'เสร็จ', color: '#4CAF50' }
                                : appt.status === 'cancelled' ? { label: 'ยกเลิก', color: '#F44336' }
                                    : { label: 'รอพบ', color: COLORS.primary };
                            return (
                                <View key={appt.id} style={[styles.historyItem, index < appointments.length - 1 && styles.historyItemBorder]}>
                                    <View style={styles.historyItemHeader}>
                                        <View style={styles.historyDateBadge}>
                                            <Ionicons name="time-outline" size={12} color={COLORS.primary} />
                                            <Text style={styles.historyDateText}>{formatDateTime(appt.appointmentDate)}</Text>
                                        </View>
                                        <View style={[styles.apptStatusBadge, { backgroundColor: statusInfo.color + '18' }]}>
                                            <Text style={[styles.apptStatusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.historyLabel}>การวินิจฉัย</Text>
                                    <Text style={styles.historyValue}>{appt.diagnosis || '-'}</Text>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

// Component แสดงข้อมูลแถวเดียว
const DetailRow = ({ icon, label, value }) => (
    <View style={detailRowStyles.row}>
        <Ionicons name={icon} size={16} color={COLORS.textSecondary} />
        <View style={detailRowStyles.textCol}>
            <Text style={detailRowStyles.label}>{label}</Text>
            <Text style={detailRowStyles.value}>{value}</Text>
        </View>
    </View>
);

const detailRowStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        gap: 10,
    },
    textCol: { flex: 1 },
    label: { fontSize: SIZES.small, color: COLORS.textSecondary },
    value: { fontSize: SIZES.body, color: COLORS.textPrimary, fontWeight: '500', marginTop: 2 },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

    // Header
    header: {
        backgroundColor: COLORS.primary,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingTop: 10,
    },
    backBtn: { padding: 5 },
    headerTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    patientHeader: {
        alignItems: 'center',
        marginTop: 15,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
        overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    patientHeaderName: {
        marginTop: 10,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    patientHeaderEmail: {
        fontSize: SIZES.caption,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },

    // Content
    content: {
        padding: SIZES.padding,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: 18,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: SIZES.body,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        paddingVertical: 20,
        fontSize: SIZES.caption,
    },

    // History Items
    historyItem: {
        paddingVertical: 12,
    },
    historyItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    historyItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    historyDateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F2FD',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 4,
    },
    historyDateText: {
        fontSize: 11,
        color: COLORS.primary,
        fontWeight: '600',
    },
    apptStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    apptStatusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    historyLabel: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    historyValue: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        fontWeight: '500',
        marginTop: 2,
    },
});

export default PatientDetailScreen;
