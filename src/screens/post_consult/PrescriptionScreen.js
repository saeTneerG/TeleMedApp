// src/screens/post_consult/PrescriptionScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import InputBox from '../../components/common/InputBox';
import CustomButton from '../../components/common/CustomButton';
import { COLORS, SIZES } from '../../constants/theme';
import { createPrescription } from '../../services/prescriptionService';
import { createAppointment } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';

const PrescriptionScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user, userData } = useAuth();

    const { patientName, patientId, queueId } = route.params || {};

    const [diagnosis, setDiagnosis] = useState('');
    const [medication, setMedication] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);

    // --- นัดหมายครั้งถัดไป ---
    const [hasFollowUp, setHasFollowUp] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setAppointmentDate(prev => {
                const updated = new Date(selectedDate);
                updated.setHours(prev.getHours(), prev.getMinutes());
                return updated;
            });
        }
    };

    const onTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setAppointmentDate(prev => {
                const updated = new Date(prev);
                updated.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                return updated;
            });
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSubmit = async () => {
        if (!diagnosis || !medication || !price) {
            Alert.alert('Error', 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        setLoading(true);
        try {
            // 1. สร้างใบสั่งยา
            await createPrescription({
                doctorId: user.uid,
                doctorName: userData.fullName,
                patientId: patientId || 'guest',
                patientName: patientName || 'คนไข้',
                queueId: queueId || null,
                diagnosis,
                medication,
                price: parseFloat(price),
            });

            // 2. สร้างนัดหมาย (ถ้าเลือก)
            if (hasFollowUp) {
                await createAppointment({
                    doctorId: user.uid,
                    doctorName: userData.fullName,
                    patientId: patientId || 'guest',
                    patientName: patientName || 'คนไข้',
                    queueId: queueId || null,
                    diagnosis,
                    appointmentDate: appointmentDate,
                });
            }

            Alert.alert(
                'เรียบร้อย',
                hasFollowUp
                    ? 'ส่งใบสั่งยาและนัดหมายครั้งถัดไปให้คนไข้แล้ว'
                    : 'ส่งใบสั่งยาให้คนไข้แล้ว',
                [{ text: 'กลับหน้าหลัก', onPress: () => navigation.navigate('MainApp') }]
            );
        } catch (error) {
            Alert.alert('Error', 'บันทึกไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: SIZES.padding }}>
                <Text style={styles.header}>สรุปผลการรักษา</Text>
                <Text style={styles.subHeader}>คนไข้: {patientName || 'ไม่ระบุ'}</Text>

                <View style={styles.card}>
                    <Text style={styles.label}>1. การวินิจฉัยโรค (Diagnosis)</Text>
                    <InputBox
                        placeholder="เช่น ไข้หวัดใหญ่, ภูมิแพ้อากาศ..."
                        value={diagnosis}
                        onChangeText={setDiagnosis}
                    />

                    <Text style={styles.label}>2. รายการยา (Medications)</Text>
                    <InputBox
                        placeholder="เช่น Paracetamol 500mg (2 แผง), ..."
                        value={medication}
                        onChangeText={setMedication}
                        multiline={true}
                    />

                    <Text style={styles.label}>3. ค่ารักษาและค่ายา (บาท)</Text>
                    <InputBox
                        placeholder="0.00"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                    />
                </View>

                {/* ส่วนนัดหมายครั้งถัดไป */}
                <View style={styles.card}>
                    <View style={styles.switchRow}>
                        <View style={styles.switchLabel}>
                            <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
                            <Text style={styles.switchText}>นัดหมายครั้งถัดไป</Text>
                        </View>
                        <Switch
                            value={hasFollowUp}
                            onValueChange={setHasFollowUp}
                            trackColor={{ false: '#ddd', true: COLORS.secondary }}
                            thumbColor={hasFollowUp ? COLORS.primary : '#f4f3f4'}
                        />
                    </View>

                    {hasFollowUp && (
                        <View style={styles.dateTimeSection}>
                            {/* เลือกวันที่ */}
                            <Text style={styles.dateTimeLabel}>วันที่นัด</Text>
                            <TouchableOpacity
                                style={styles.dateTimeButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar" size={20} color={COLORS.primary} />
                                <Text style={styles.dateTimeValue}>{formatDate(appointmentDate)}</Text>
                                <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
                            </TouchableOpacity>

                            {/* เลือกเวลา */}
                            <Text style={styles.dateTimeLabel}>เวลานัด</Text>
                            <TouchableOpacity
                                style={styles.dateTimeButton}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Ionicons name="time" size={20} color={COLORS.primary} />
                                <Text style={styles.dateTimeValue}>{formatTime(appointmentDate)}</Text>
                                <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
                            </TouchableOpacity>

                            {/* DateTimePicker (Android shows as dialog, iOS as inline) */}
                            {showDatePicker && (
                                <DateTimePicker
                                    value={appointmentDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    minimumDate={new Date()}
                                    onChange={onDateChange}
                                />
                            )}
                            {showTimePicker && (
                                <DateTimePicker
                                    value={appointmentDate}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onTimeChange}
                                />
                            )}
                        </View>
                    )}
                </View>

                <CustomButton
                    title="ยืนยันและส่งใบแจ้งหนี้"
                    onPress={handleSubmit}
                    isLoading={loading}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { fontSize: SIZES.h1, fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 },
    subHeader: { fontSize: SIZES.h3, color: COLORS.textSecondary, marginBottom: 20 },
    card: { backgroundColor: COLORS.white, padding: 20, borderRadius: SIZES.radius, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    label: { fontSize: SIZES.body, fontWeight: 'bold', marginBottom: 10, marginTop: 10, color: COLORS.textPrimary },
    // --- Switch row ---
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    switchLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    switchText: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    // --- Date/Time picker ---
    dateTimeSection: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },
    dateTimeLabel: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        marginBottom: 6,
        marginTop: 8,
    },
    dateTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: 14,
        borderRadius: SIZES.radius,
        gap: 10,
    },
    dateTimeValue: {
        flex: 1,
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
});

export default PrescriptionScreen;