// src/screens/patient/MedicalHistoryScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const STATUS_MAP = {
    matched: { label: 'กำลังรักษา', color: COLORS.primary, icon: 'pulse' },
    completed: { label: 'รักษาเสร็จ', color: '#4CAF50', icon: 'checkmark-circle' },
    cancelled: { label: 'ยกเลิก', color: '#9E9E9E', icon: 'close-circle' },
    waiting: { label: 'รอคิว', color: '#FF9500', icon: 'time' },
};

const MedicalHistoryScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'queues'),
            where('patientId', '==', user.uid),
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            // เรียงจากใหม่ไปเก่า
            data.sort((a, b) => {
                const aTime = (a.acceptedAt || a.createdAt)?.toMillis?.() || 0;
                const bTime = (b.acceptedAt || b.createdAt)?.toMillis?.() || 0;
                return bTime - aTime;
            });
            setRecords(data);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
        } catch { return '-'; }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    };

    const renderItem = ({ item }) => {
        const statusInfo = STATUS_MAP[item.status] || STATUS_MAP.waiting;
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.dateBadge}>
                        <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
                        <Text style={styles.dateText}>{formatDate(item.acceptedAt || item.createdAt)}</Text>
                        <Text style={styles.timeText}>{formatTime(item.acceptedAt || item.createdAt)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '18' }]}>
                        <Ionicons name={statusInfo.icon} size={12} color={statusInfo.color} />
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="medkit-outline" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.infoLabel}>แพทย์</Text>
                        <Text style={styles.infoValue}>{item.doctorName || 'รอจับคู่'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="fitness-outline" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.infoLabel}>อาการ</Text>
                        <Text style={styles.infoValue} numberOfLines={2}>{item.symptom || 'ไม่ระบุ'}</Text>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
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
                        <Text style={styles.headerTitle}>ประวัติการรักษา</Text>
                        <View style={{ width: 34 }} />
                    </View>
                </SafeAreaView>
            </View>

            {records.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="document-text-outline" size={50} color={COLORS.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>ยังไม่มีประวัติ</Text>
                    <Text style={styles.emptySubtitle}>เมื่อเข้ารับการรักษา ประวัติจะแสดงที่นี่</Text>
                </View>
            ) : (
                <FlatList
                    data={records}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

    header: {
        backgroundColor: COLORS.primary,
        paddingBottom: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    headerRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding, paddingTop: 10,
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.white },

    list: { padding: SIZES.padding, paddingBottom: 100 },

    card: {
        backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: 16,
        marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    dateBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F2FD',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4,
    },
    dateText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
    timeText: { fontSize: 11, color: COLORS.primary },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8,
        paddingVertical: 3, borderRadius: 10, gap: 3,
    },
    statusText: { fontSize: 10, fontWeight: '600' },

    cardBody: { gap: 8 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoLabel: { fontSize: SIZES.small, color: COLORS.textSecondary, width: 45 },
    infoValue: { fontSize: SIZES.body, color: COLORS.textPrimary, fontWeight: '500', flex: 1 },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyIcon: {
        width: 90, height: 90, borderRadius: 45, backgroundColor: '#E8F2FD',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    emptyTitle: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.textPrimary },
    emptySubtitle: { fontSize: SIZES.caption, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
});

export default MedicalHistoryScreen;
