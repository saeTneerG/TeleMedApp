import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InputBox from '../../components/common/InputBox';
import CustomButton from '../../components/common/CustomButton';
import { COLORS, SIZES } from '../../constants/theme';
import { registerPatient } from '../../services/authService';

const RegisterScreen = ({ navigation }) => {
    const [form, setForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phoneNumber: '',
        allergies: '',      // ข้อมูลการแพ้
        chronicDisease: ''  // ข้อมูลโรคประจำตัว
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        // 1. Validation เบื้องต้น
        if (!form.email || !form.password || !form.fullName) {
            Alert.alert('Error', 'กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบ');
            return;
        }
        if (form.password !== form.confirmPassword) {
            Alert.alert('Error', 'รหัสผ่านไม่ตรงกัน');
            return;
        }

        setLoading(true);
        try {
            await registerPatient(form.email, form.password, form);
            Alert.alert('Success', 'สมัครสมาชิกสำเร็จ!', [
                { text: 'OK', onPress: () => navigation.goBack() } // กลับไปหน้า Login
            ]);
        } catch (error) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.header}>ลงทะเบียนคนไข้ใหม่</Text>

                {/* ข้อมูล Login */}
                <Text style={styles.sectionHeader}>ข้อมูลบัญชี</Text>
                <InputBox label="อีเมล *" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} keyboardType="email-address" />
                <InputBox label="รหัสผ่าน *" value={form.password} onChangeText={(t) => setForm({ ...form, password: t })} secureTextEntry />
                <InputBox label="ยืนยันรหัสผ่าน *" value={form.confirmPassword} onChangeText={(t) => setForm({ ...form, confirmPassword: t })} secureTextEntry />

                {/* ข้อมูลส่วนตัว */}
                <Text style={styles.sectionHeader}>ข้อมูลส่วนตัว</Text>
                <InputBox label="ชื่อ-นามสกุล *" value={form.fullName} onChangeText={(t) => setForm({ ...form, fullName: t })} />
                <InputBox label="เบอร์โทรศัพท์" value={form.phoneNumber} onChangeText={(t) => setForm({ ...form, phoneNumber: t })} keyboardType="phone-pad" />

                {/* ข้อมูลสุขภาพ */}
                <Text style={styles.sectionHeader}>ข้อมูลสุขภาพ (สำหรับการรักษา)</Text>
                <InputBox
                    label="ประวัติการแพ้ยา/อาหาร"
                    value={form.allergies}
                    onChangeText={(t) => setForm({ ...form, allergies: t })}
                    placeholder="เช่น แพ้เพนิซิลลิน, แพ้กุ้ง (ถ้าไม่มีให้เว้นว่าง)"
                />
                <InputBox
                    label="โรคประจำตัว"
                    value={form.chronicDisease}
                    onChangeText={(t) => setForm({ ...form, chronicDisease: t })}
                    placeholder="เช่น ความดัน, เบาหวาน"
                />

                <CustomButton title="ยืนยันการสมัคร" onPress={handleRegister} isLoading={loading} />

                <CustomButton
                    title="ยกเลิก"
                    type="outline"
                    onPress={() => navigation.goBack()}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { padding: SIZES.padding },
    header: { fontSize: SIZES.h1, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
    sectionHeader: { fontSize: SIZES.h3, fontWeight: '600', color: COLORS.textSecondary, marginTop: 15, marginBottom: 10 },
});

export default RegisterScreen;