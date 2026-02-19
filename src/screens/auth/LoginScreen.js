import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InputBox from '../../components/common/InputBox';
import CustomButton from '../../components/common/CustomButton';
import { COLORS, SIZES } from '../../constants/theme';
import { loginUser } from '../../services/authService';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';

const LoginScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
            return;
        }
        setLoading(true);
        try {
            await loginUser(email, password);
        } catch (error) {
            Alert.alert('ไม่สามารถเข้าสู่ระบบได้', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>เข้าสู่ระบบ Telemedicine</Text>
                    <Text style={styles.subtitle}>ระบบให้คำปรึกษาทางการแพทย์ออนไลน์</Text>
                </View>

                <InputBox
                    label="อีเมล"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@email.com"
                    keyboardType="email-address"
                />
                <InputBox
                    label="รหัสผ่าน"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="กรอกรหัสผ่านของคุณ"
                    secureTextEntry
                />

                <CustomButton
                    title="เข้าสู่ระบบ"
                    onPress={handleLogin}
                    isLoading={loading}
                />

                <View style={styles.footer}>
                    <Text style={styles.text}>ยังไม่มีบัญชีผู้ป่วย? </Text>
                    <Text
                        style={styles.link}
                        onPress={() => navigation.navigate(ROUTES.REGISTER)}
                    >
                        ลงทะเบียนใช้งาน
                    </Text>
                </View>

                <View style={styles.forgotWrap}>
                    <Text
                        style={[styles.link, styles.forgotLink]}
                        onPress={() => Alert.alert('แจ้งเตือน', 'ระบบกู้คืนรหัสผ่านจะเปิดให้ใช้งานเร็วๆ นี้')}
                    >
                        ลืมรหัสผ่าน?
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SIZES.padding, flex: 1, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 40 },
    title: { fontSize: SIZES.h1, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
    subtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20
    },
    forgotWrap: { marginTop: 10, alignItems: 'center' },
    text: { color: COLORS.textSecondary },
    link: { color: COLORS.primary, fontWeight: 'bold' },
    forgotLink: { fontSize: 14, color: COLORS.textSecondary }
});

export default LoginScreen;
