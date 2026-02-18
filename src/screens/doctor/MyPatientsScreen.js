// src/screens/doctor/MyPatientsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { subscribeToMyPatients } from '../../services/patientService';
import { useNavigation } from '@react-navigation/native';

const STATUS_MAP = {
    matched: { label: 'กำลังรักษา', color: COLORS.primary, icon: 'pulse' },
    completed: { label: 'รักษาเสร็จ', color: '#4CAF50', icon: 'checkmark-circle' },
    cancelled: { label: 'ยกเลิก', color: '#9E9E9E', icon: 'close-circle' },
};

const MyPatientsScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        if (!user) return;
        const unsub = subscribeToMyPatients(user.uid, (data) => {
            setPatients(data);
        });
        return () => unsub();
    }, [user]);

    const handleOpenPatient = (patient) => {
        navigation.navigate('PatientDetailScreen', {
            patientId: patient.patientId,
            patientName: patient.patientName,
        });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
        } catch { return '-'; }
    };

    const renderPatientItem = ({ item }) => {
        const statusInfo = STATUS_MAP[item.status] || STATUS_MAP.matched;
        return (
            <TouchableOpacity style={styles.card} onPress={() => handleOpenPatient(item)} activeOpacity={0.7}>
                <View style={styles.cardRow}>
                    {/* Avatar */}
                    <View style={styles.avatarCircle}>
                        <Ionicons name="person" size={26} color={COLORS.white} />
                    </View>

                    {/* Info */}
                    <View style={styles.cardInfo}>
                        <Text style={styles.patientName}>{item.patientName || 'ไม่ทราบชื่อ'}</Text>
                        <View style={styles.symptomRow}>
                            <Ionicons name="fitness-outline" size={13} color={COLORS.textSecondary} />
                            <Text style={styles.symptomText} numberOfLines={1}>{item.symptom || 'ไม่ระบุอาการ'}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaText}>มาพบ {item.visitCount} ครั้ง</Text>
                            <Text style={styles.metaDot}>·</Text>
                            <Text style={styles.metaText}>{formatDate(item.lastVisit)}</Text>
                        </View>
                    </View>

                    {/* Status + Arrow */}
                    <View style={styles.cardRight}>
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '18' }]}>
                            <Ionicons name={statusInfo.icon} size={12} color={statusInfo.color} />
                            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} style={{ marginTop: 8 }} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>คนไข้ของฉัน</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{patients.length}</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            {/* Content */}
            {patients.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="people-outline" size={50} color={COLORS.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>ยังไม่มีคนไข้</Text>
                    <Text style={styles.emptySubtitle}>เมื่อคุณรับเคสคนไข้ รายชื่อจะแสดงที่นี่</Text>
                </View>
            ) : (
                <FlatList
                    data={patients}
                    renderItem={renderPatientItem}
                    keyExtractor={item => item.patientId}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

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
        paddingTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    countBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    countText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: SIZES.caption,
    },
    list: {
        padding: SIZES.padding,
        paddingBottom: 100,
    },

    // Card
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 12,
    },
    patientName: {
        fontSize: SIZES.body,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    symptomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 3,
    },
    symptomText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        flex: 1,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 3,
    },
    metaText: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    metaDot: {
        color: COLORS.textSecondary,
        fontSize: 11,
    },
    cardRight: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },

    // Empty
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#E8F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    emptySubtitle: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 8,
    },
});

export default MyPatientsScreen;
