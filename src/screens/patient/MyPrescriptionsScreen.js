// src/screens/patient/MyPrescriptionsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const MyPrescriptionsScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'prescriptions'),
            where('patientId', '==', user.uid),
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            // เรียงจากใหม่ไปเก่า
            data.sort((a, b) => {
                const aTime = a.createdAt?.toMillis?.() || 0;
                const bTime = b.createdAt?.toMillis?.() || 0;
                return bTime - aTime;
            });
            setPrescriptions(data);
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

    const handlePayment = (item) => {
        navigation.navigate(ROUTES.PAYMENT, {
            prescription: {
                id: item.id,
                doctorName: item.doctorName || 'แพทย์',
                diagnosis: item.diagnosis || '-',
                medication: item.medication || '-',
                price: item.price || 500,
            },
        });
    };

    const renderItem = ({ item }) => {
        const isPaid = item.paymentStatus === 'paid';

        return (
            <View style={styles.card}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.dateBadge}>
                        <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
                        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={styles.doctorBadge}>
                        <Ionicons name="medkit" size={12} color={COLORS.primary} />
                        <Text style={styles.doctorText}>{item.doctorName || 'แพทย์'}</Text>
                    </View>
                </View>

                {/* Diagnosis */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>
                        <Ionicons name="clipboard-outline" size={14} color={COLORS.textSecondary} /> การวินิจฉัย
                    </Text>
                    <Text style={styles.sectionValue}>{item.diagnosis || '-'}</Text>
                </View>

                {/* Medication */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>
                        <Ionicons name="medical-outline" size={14} color={COLORS.textSecondary} /> ยาที่สั่ง
                    </Text>
                    <View style={styles.medBox}>
                        <Text style={styles.medText}>{item.medication || '-'}</Text>
                    </View>
                </View>

                {/* Notes */}
                {item.notes ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>
                            <Ionicons name="document-text-outline" size={14} color={COLORS.textSecondary} /> หมายเหตุ
                        </Text>
                        <Text style={styles.notesText}>{item.notes}</Text>
                    </View>
                ) : null}

                {/* Appointment Info */}
                {item.appointmentDate ? (
                    <View style={styles.apptBanner}>
                        <Ionicons name="calendar" size={16} color={COLORS.primary} />
                        <Text style={styles.apptText}>นัดติดตาม: {formatDate(item.appointmentDate)}</Text>
                    </View>
                ) : null}

                {/* Payment Button */}
                <View style={styles.paymentSection}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>ค่ารักษา</Text>
                        <Text style={styles.priceValue}>{item.price || 500} ฿</Text>
                    </View>
                    {isPaid ? (
                        <View style={styles.paidBadge}>
                            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                            <Text style={styles.paidText}>ชำระแล้ว</Text>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.payButton} onPress={() => handlePayment(item)} activeOpacity={0.8}>
                            <Ionicons name="card-outline" size={18} color={COLORS.white} />
                            <Text style={styles.payButtonText}>จ่ายเงิน</Text>
                        </TouchableOpacity>
                    )}
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
                        <Text style={styles.headerTitle}>ใบสั่งยาของฉัน</Text>
                        <View style={{ width: 34 }} />
                    </View>
                </SafeAreaView>
            </View>

            {prescriptions.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="medkit-outline" size={50} color={COLORS.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>ยังไม่มีใบสั่งยา</Text>
                    <Text style={styles.emptySubtitle}>เมื่อแพทย์สั่งยาให้คุณ จะแสดงที่นี่</Text>
                </View>
            ) : (
                <FlatList
                    data={prescriptions}
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
        backgroundColor: COLORS.primary, paddingBottom: 20,
        borderBottomLeftRadius: 25, borderBottomRightRadius: 25,
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
        marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    dateBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F2FD',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4,
    },
    dateText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
    doctorBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
    },
    doctorText: { fontSize: SIZES.small, color: COLORS.primary, fontWeight: '600' },

    section: { marginBottom: 10 },
    sectionLabel: { fontSize: SIZES.small, color: COLORS.textSecondary, marginBottom: 4 },
    sectionValue: { fontSize: SIZES.body, color: COLORS.textPrimary, fontWeight: '500' },

    medBox: {
        backgroundColor: '#F0FAF0', padding: 10, borderRadius: 10,
        borderLeftWidth: 3, borderLeftColor: '#4CAF50',
    },
    medText: { fontSize: SIZES.body, color: '#2E7D32', fontWeight: '500' },

    notesText: { fontSize: SIZES.caption, color: COLORS.textSecondary, fontStyle: 'italic' },

    apptBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#E8F2FD', padding: 10, borderRadius: 10, marginTop: 5,
    },
    apptText: { fontSize: SIZES.caption, color: COLORS.primary, fontWeight: '600' },

    // Payment Section
    paymentSection: {
        marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0',
    },
    priceRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 10,
    },
    priceLabel: { fontSize: SIZES.body, color: COLORS.textSecondary },
    priceValue: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.textPrimary },
    payButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: SIZES.radius,
        gap: 6,
    },
    payButtonText: { color: COLORS.white, fontSize: SIZES.body, fontWeight: 'bold' },
    paidBadge: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#E8F5E9', paddingVertical: 10, borderRadius: SIZES.radius,
        gap: 6,
    },
    paidText: { color: '#4CAF50', fontSize: SIZES.body, fontWeight: 'bold' },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyIcon: {
        width: 90, height: 90, borderRadius: 45, backgroundColor: '#E8F2FD',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    emptyTitle: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.textPrimary },
    emptySubtitle: { fontSize: SIZES.caption, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
});

export default MyPrescriptionsScreen;
