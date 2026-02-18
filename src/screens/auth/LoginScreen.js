import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
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
            Alert.alert('Error', 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        setLoading(true);
        try {
            await loginUser(email, password);
            // ถ้า Login ผ่าน AuthContext จะทำงานเองอัตโนมัติ (เปลี่ยนหน้าให้)
        } catch (error) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Logo หรือ Icon แอพ */}
                <View style={styles.header}>
                    <Text style={styles.title}>เข้าสู่ระบบออฟฟิศ</Text>
                    <Text style={styles.subtitle}>รอยัลบัตรสมาชิก</Text>
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
                    placeholder="********"
                    secureTextEntry
                />

                <CustomButton
                    title="เข้าสู่ระบบ"
                    onPress={handleLogin}
                    isLoading={loading}
                />

                <View style={styles.footer}>
                    <Text style={styles.text}>ยังไม่มีบัญชี? </Text>
                    <Text
                        style={styles.link}
                        onPress={() => navigation.navigate(ROUTES.REGISTER)}
                    >
                        สมัครสมาชิก
                    </Text>
                </View>

                <View style={{ marginTop: 10, alignItems: 'center' }}>
                    <Text
                        style={[styles.link, { fontSize: 14, color: COLORS.textSecondary }]}
                        onPress={() => Alert.alert('แจ้งเตือน', 'ฟีเจอร์นี้ยังไม่พร้อมใช้งาน')}
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
    title: { fontSize: SIZES.h1, fontWeight: 'bold', color: COLORS.primary },
    subtitle: { fontSize: SIZES.h2, color: COLORS.textSecondary, marginTop: 5 },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20
    },
    text: { color: COLORS.textSecondary },
    link: { color: COLORS.primary, fontWeight: 'bold' },
});

export default LoginScreen;