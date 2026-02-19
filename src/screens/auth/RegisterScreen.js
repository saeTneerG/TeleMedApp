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
        allergies: '',
        chronicDisease: ''
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!form.email || !form.password || !form.fullName) {
            Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน');
            return;
        }
        if (form.password !== form.confirmPassword) {
            Alert.alert('รหัสผ่านไม่ตรงกัน', 'กรุณาตรวจสอบและกรอกรหัสผ่านอีกครั้ง');
            return;
        }

        setLoading(true);
        try {
            await registerPatient(form.email, form.password, form);
            Alert.alert('ลงทะเบียนสำเร็จ', 'สร้างบัญชีผู้ป่วยเรียบร้อยแล้ว', [
                { text: 'ตกลง', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('ไม่สามารถลงทะเบียนได้', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.header}>ลงทะเบียนผู้ป่วยใหม่</Text>

                <Text style={styles.sectionHeader}>ข้อมูลเข้าสู่ระบบ</Text>
                <InputBox label="อีเมล *" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} keyboardType="email-address" />
                <InputBox label="รหัสผ่าน *" value={form.password} onChangeText={(t) => setForm({ ...form, password: t })} secureTextEntry />
                <InputBox label="ยืนยันรหัสผ่าน *" value={form.confirmPassword} onChangeText={(t) => setForm({ ...form, confirmPassword: t })} secureTextEntry />

                <Text style={styles.sectionHeader}>ข้อมูลผู้ป่วย</Text>
                <InputBox label="ชื่อ-นามสกุล *" value={form.fullName} onChangeText={(t) => setForm({ ...form, fullName: t })} />
                <InputBox label="เบอร์โทรศัพท์" value={form.phoneNumber} onChangeText={(t) => setForm({ ...form, phoneNumber: t })} keyboardType="phone-pad" />

                <Text style={styles.sectionHeader}>ข้อมูลสุขภาพเบื้องต้น</Text>
                <InputBox
                    label="ประวัติการแพ้ยา/อาหาร"
                    value={form.allergies}
                    onChangeText={(t) => setForm({ ...form, allergies: t })}
                    placeholder="เช่น แพ้เพนิซิลลิน, แพ้อาหารทะเล"
                />
                <InputBox
                    label="โรคประจำตัว"
                    value={form.chronicDisease}
                    onChangeText={(t) => setForm({ ...form, chronicDisease: t })}
                    placeholder="เช่น เบาหวาน, ความดันโลหิตสูง"
                />

                <CustomButton title="ยืนยันการลงทะเบียน" onPress={handleRegister} isLoading={loading} />

                <CustomButton
                    title="กลับไปหน้าเข้าสู่ระบบ"
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
