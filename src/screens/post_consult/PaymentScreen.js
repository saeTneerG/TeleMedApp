// src/screens/post_consult/PaymentScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../../constants/theme';
import CustomButton from '../../components/common/CustomButton';
import { processPayment } from '../../services/prescriptionService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PaymentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { prescription } = route.params || {
        prescription: {
            id: 'test-id',
            doctorName: 'นพ.สมชาย',
            diagnosis: 'ไข้หวัด',
            price: 500
        }
    };

    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        // จำลองการจ่ายเงิน (Delay 2 วินาที)
        setTimeout(async () => {
            try {
                await processPayment(prescription.id);
                Alert.alert('ชำระเงินสำเร็จ!', 'ยาจะถูกจัดส่งไปยังที่อยู่ของคุณภายใน 2 วัน', [
                    { text: 'OK', onPress: () => navigation.navigate('MainApp') }
                ]);
            } catch (e) {
                Alert.alert('Error', 'การชำระเงินล้มเหลว');
            } finally {
                setLoading(false);
            }
        }, 2000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Ionicons name="receipt-outline" size={80} color={COLORS.primary} style={{ alignSelf: 'center' }} />
                <Text style={styles.title}>สรุปค่ารักษาพยาบาล</Text>

                <View style={styles.billCard}>
                    <View style={styles.row}>
                        <Text style={styles.label}>แพทย์ผู้รักษา:</Text>
                        <Text style={styles.value}>{prescription.doctorName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>การวินิจฉัย:</Text>
                        <Text style={styles.value}>{prescription.diagnosis}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.totalLabel}>ยอดชำระทั้งหมด</Text>
                        <Text style={styles.totalValue}>{prescription.price} THB</Text>
                    </View>
                </View>

                <Text style={styles.instruction}>กรุณาสแกน QR Code เพื่อชำระเงิน</Text>
                <Image
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg' }}
                    style={styles.qrCode}
                />

                <CustomButton
                    title="แจ้งชำระเงิน (จำลอง)"
                    onPress={handlePayment}
                    isLoading={loading}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.primary },
    content: {
        flex: 1, backgroundColor: COLORS.background,
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        padding: SIZES.padding, marginTop: 50
    },
    title: { fontSize: SIZES.h2, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
    billCard: { backgroundColor: COLORS.white, padding: 20, borderRadius: SIZES.radius, elevation: 3 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    label: { color: COLORS.textSecondary, fontSize: SIZES.body },
    value: { color: COLORS.textPrimary, fontSize: SIZES.body, fontWeight: '600' },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
    totalLabel: { fontSize: SIZES.h3, fontWeight: 'bold' },
    totalValue: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.primary },
    instruction: { textAlign: 'center', marginTop: 30, color: COLORS.textSecondary },
    qrCode: { width: 150, height: 150, alignSelf: 'center', marginVertical: 20 },
});

export default PaymentScreen;