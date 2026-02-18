// src/screens/patient/PatientProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import InputBox from '../../components/common/InputBox';
import { updateUserProfile } from '../../services/userService';

const PatientProfileScreen = () => {
    const { user, userData, logout, refreshUserData } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [allergies, setAllergies] = useState('');
    const [chronicDisease, setChronicDisease] = useState('');
    const [address, setAddress] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setFullName(userData.fullName || '');
            setPhoneNumber(userData.phoneNumber || '');
            setAllergies(userData.allergies || '');
            setChronicDisease(userData.chronicDisease || '');
            setAddress(userData.address || '');
            setProfileImage(userData.profileImage || null);
        }
    }, [userData]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('ขออภัย', 'ต้องอนุญาตเข้าถึงคลังภาพเพื่อเลือกรูปโปรไฟล์');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.3,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setProfileImage(base64Uri);
            try {
                await updateUserProfile(user.uid, { profileImage: base64Uri });
                await refreshUserData();
                Alert.alert('สำเร็จ', 'อัปเดตรูปโปรไฟล์แล้ว');
            } catch (error) {
                Alert.alert('Error', 'อัปโหลดรูปไม่สำเร็จ');
            }
        }
    };

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Error', 'กรุณากรอกชื่อ-นามสกุล');
            return;
        }

        setIsLoading(true);
        try {
            await updateUserProfile(user.uid, {
                fullName,
                phoneNumber,
                allergies,
                chronicDisease,
                address,
            });
            await refreshUserData();
            Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย');
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Error', 'บันทึกไม่สำเร็จ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('ยืนยัน', 'ต้องการออกจากระบบใช่หรือไม่?', [
            { text: 'ยกเลิก', style: 'cancel' },
            { text: 'ตกลง', onPress: logout, style: 'destructive' },
        ]);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (userData) {
            setFullName(userData.fullName || '');
            setPhoneNumber(userData.phoneNumber || '');
            setAllergies(userData.allergies || '');
            setChronicDisease(userData.chronicDisease || '');
            setAddress(userData.address || '');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header + Avatar */}
            <View style={styles.headerSection}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerRow}>
                        <Text style={styles.headerTitle}>โปรไฟล์ของฉัน</Text>
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                            <Ionicons name="log-out-outline" size={22} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.avatarWrapper}>
                        <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                            <View style={styles.avatar}>
                                {profileImage ? (
                                    <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                                ) : (
                                    <Ionicons name="person" size={50} color={COLORS.white} />
                                )}
                            </View>
                            <View style={styles.cameraBadge}>
                                <Ionicons name="camera" size={16} color={COLORS.white} />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.avatarName}>{fullName || 'ยังไม่ได้ตั้งชื่อ'}</Text>
                        <Text style={styles.avatarEmail}>{user?.email}</Text>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Personal Info Card */}
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.sectionTitle}>ข้อมูลส่วนตัว</Text>
                        </View>
                        {!isEditing && (
                            <TouchableOpacity style={styles.editBadge} onPress={() => setIsEditing(true)}>
                                <Ionicons name="create-outline" size={14} color={COLORS.primary} />
                                <Text style={styles.editBadgeText}>แก้ไข</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <InfoRow icon="person-outline" label="ชื่อ-นามสกุล"
                        value={fullName} isEditing={isEditing}
                        onChangeText={setFullName} placeholder="ชื่อ-นามสกุล" />

                    <InfoRow icon="call-outline" label="เบอร์โทรศัพท์"
                        value={phoneNumber} isEditing={isEditing}
                        onChangeText={setPhoneNumber} placeholder="0xx-xxx-xxxx"
                        keyboardType="phone-pad" />

                    <InfoRow icon="mail-outline" label="อีเมล"
                        value={user?.email} isEditing={false} readOnly />

                    <InfoRow icon="location-outline" label="ที่อยู่จัดส่งยา"
                        value={address} isEditing={isEditing}
                        onChangeText={setAddress} placeholder="เช่น 123/4 ถ.สุขุมวิท แขวงคลองตัน เขตคลองเตย กทม. 10110"
                        multiline />

                    {isEditing && (
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, isLoading && { opacity: 0.6 }]}
                                onPress={handleSave}
                                disabled={isLoading}
                            >
                                <Ionicons name="checkmark" size={18} color={COLORS.white} />
                                <Text style={styles.saveButtonText}>
                                    {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Medical Info Card */}
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="medkit-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.sectionTitle}>ข้อมูลทางการแพทย์</Text>
                        </View>
                        {!isEditing && (
                            <TouchableOpacity style={styles.editBadge} onPress={() => setIsEditing(true)}>
                                <Ionicons name="create-outline" size={14} color={COLORS.primary} />
                                <Text style={styles.editBadgeText}>แก้ไข</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <InfoRow icon="alert-circle-outline" label="ยาที่แพ้"
                        value={allergies} isEditing={isEditing}
                        onChangeText={setAllergies} placeholder="เช่น แอสไพริน, เพนนิซิลิน" />

                    <InfoRow icon="heart-outline" label="โรคประจำตัว"
                        value={chronicDisease} isEditing={isEditing}
                        onChangeText={setChronicDisease} placeholder="เช่น เบาหวาน, ความดัน" />
                </View>

                {/* App Version */}
                <Text style={styles.versionText}>TeleMedApp v1.0.0</Text>
            </ScrollView>
        </View>
    );
};

// Component แสดงข้อมูลแต่ละแถว
const InfoRow = ({ icon, label, value, isEditing, onChangeText, placeholder, keyboardType, readOnly, multiline }) => (
    <View style={infoStyles.row}>
        <View style={infoStyles.labelRow}>
            <Ionicons name={icon} size={16} color={COLORS.textSecondary} />
            <Text style={infoStyles.label}>{label}</Text>
        </View>
        {isEditing && !readOnly ? (
            <InputBox
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType}
                multiline={multiline}
            />
        ) : (
            <Text style={[infoStyles.value, readOnly && { color: COLORS.textSecondary }]}>
                {value || '-'}
            </Text>
        )}
    </View>
);

const infoStyles = StyleSheet.create({
    row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    label: { fontSize: SIZES.caption, color: COLORS.textSecondary },
    value: { fontSize: SIZES.body, color: COLORS.textPrimary, fontWeight: '500', paddingLeft: 22 },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Header
    headerSection: {
        backgroundColor: COLORS.primary,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingTop: 10,
    },
    headerTitle: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.white },
    logoutBtn: { padding: 5 },
    avatarWrapper: { alignItems: 'center', marginTop: 15 },
    avatar: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
        overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    cameraBadge: {
        position: 'absolute', bottom: 2, right: 2,
        backgroundColor: COLORS.primary, padding: 6,
        borderRadius: 15, borderWidth: 2, borderColor: COLORS.white,
    },
    avatarName: { marginTop: 10, fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.white },
    avatarEmail: { fontSize: SIZES.caption, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

    // Content
    content: { padding: SIZES.padding, paddingBottom: 100 },
    card: {
        backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: 18,
        marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 5, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    sectionTitle: { fontSize: SIZES.body, fontWeight: 'bold', color: COLORS.textPrimary },
    editBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F2FD',
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, gap: 4,
    },
    editBadgeText: { color: COLORS.primary, fontWeight: '600', fontSize: SIZES.small },

    // Buttons
    buttonRow: { flexDirection: 'row', marginTop: 20, gap: 10 },
    cancelButton: {
        flex: 1, backgroundColor: '#f0f0f0', padding: 13,
        borderRadius: SIZES.radius, alignItems: 'center',
    },
    cancelButtonText: { color: COLORS.textSecondary, fontWeight: 'bold', fontSize: SIZES.caption },
    saveButton: {
        flex: 1, flexDirection: 'row', backgroundColor: COLORS.primary, padding: 13,
        borderRadius: SIZES.radius, alignItems: 'center', justifyContent: 'center', gap: 5,
    },
    saveButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: SIZES.caption },

    versionText: { textAlign: 'center', marginTop: 20, color: COLORS.textSecondary, fontSize: SIZES.small },
});

export default PatientProfileScreen;