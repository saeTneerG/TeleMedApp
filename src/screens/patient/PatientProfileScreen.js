// src/screens/patient/PatientProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import CustomButton from '../../components/common/CustomButton';

const PatientProfileScreen = () => {
    const { userData, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบใช่หรือไม่?', [
            { text: 'ยกเลิก', style: 'cancel' },
            { text: 'ยืนยัน', onPress: logout, style: 'destructive' }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: 'https://ui-avatars.com/api/?name=' + (userData?.fullName || 'User') + '&background=0D8ABC&color=fff' }}
                        style={styles.avatar}
                    />
                </View>
                <Text style={styles.name}>{userData?.fullName}</Text>
                <Text style={styles.email}>{userData?.email}</Text>
            </View>

            <View style={styles.infoSection}>
                <InfoRow label="เบอร์โทรศัพท์" value={userData?.phoneNumber} />
                <InfoRow label="แพ้ยา" value={userData?.allergies} />
                <InfoRow label="โรคประจำตัว" value={userData?.chronicDisease} />
            </View>

            <View style={{ padding: 20, marginTop: 'auto' }}>
                <CustomButton title="แก้ไขข้อมูลส่วนตัว" type="secondary" onPress={() => { }} />
                <CustomButton title="ออกจากระบบ" type="danger" onPress={handleLogout} />
            </View>
        </SafeAreaView>
    );
};

const InfoRow = ({ label, value }) => (
    <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || '-'}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { alignItems: 'center', padding: 30, backgroundColor: COLORS.white },
    avatarContainer: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: COLORS.secondary, marginBottom: 15,
        justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
    },
    avatar: { width: 100, height: 100 },
    name: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.textPrimary },
    email: { fontSize: SIZES.body, color: COLORS.textSecondary },

    infoSection: { marginTop: 20, backgroundColor: COLORS.white, padding: 20 },
    row: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border
    },
    label: { color: COLORS.textSecondary, fontSize: SIZES.body },
    value: { color: COLORS.textPrimary, fontSize: SIZES.body, fontWeight: '500' },
});

export default PatientProfileScreen;