// src/screens/consultation/VideoCallScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { CameraView, useCameraPermissions } from 'expo-camera';

const VideoCallScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userData } = useAuth();
    const { partnerName, patientId, queueId } = route.params || { partnerName: 'Doctor' };

    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [facing, setFacing] = useState('front'); // กล้องหน้าสำหรับวิดีโอคอล
    const [duration, setDuration] = useState(0);
    const [permission, requestPermission] = useCameraPermissions();

    // จับเวลาการโทร
    useEffect(() => {
        const timer = setInterval(() => setDuration(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleEndCall = () => {
        if (userData?.role === 'doctor') {
            navigation.replace(ROUTES.PRESCRIPTION, {
                patientName: partnerName,
                patientId: patientId,
                queueId: queueId
            });
        } else {
            Alert.alert('วางสายแล้ว', 'ขอบคุณที่ใช้บริการครับ', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        }
    };

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    // กรณี permission ยังโหลดอยู่
    if (!permission) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>กำลังขอสิทธิ์กล้อง...</Text>
            </View>
        );
    }

    // กรณียังไม่ได้รับอนุญาต
    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Ionicons name="camera-outline" size={80} color={COLORS.primary} />
                <Text style={styles.permissionTitle}>ต้องการเข้าถึงกล้อง</Text>
                <Text style={styles.permissionMessage}>
                    กรุณาอนุญาตให้แอปเข้าถึงกล้องเพื่อใช้งานวิดีโอคอล
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>อนุญาตเข้าถึงกล้อง</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.goBackText}>ย้อนกลับ</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* 1. กล้องจริงเต็มจอ (แทนที่รูปจำลอง) */}
            {isCameraOff ? (
                <View style={styles.cameraOffContainer}>
                    <Ionicons name="videocam-off" size={80} color="#999" />
                    <Text style={styles.cameraOffText}>ปิดกล้องอยู่</Text>
                </View>
            ) : (
                <CameraView
                    style={styles.camera}
                    facing={facing}
                />
            )}

            {/* Overlay ข้อมูลด้านบน */}
            <View style={styles.topBar}>
                <View>
                    <Text style={styles.name}>{partnerName}</Text>
                    <Text style={styles.timer}>{formatTime(duration)}</Text>
                </View>
                <View style={styles.signalIcon}>
                    <Ionicons name="wifi" size={20} color={COLORS.success} />
                </View>
            </View>

            {/* 2. ปุ่มควบคุมด้านล่าง */}
            <View style={styles.controlsContainer}>
                {/* ปุ่มปิดไมค์ */}
                <TouchableOpacity
                    style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                    onPress={() => setIsMuted(!isMuted)}
                >
                    <Ionicons name={isMuted ? "mic-off" : "mic"} size={28} color={isMuted ? COLORS.primary : COLORS.white} />
                </TouchableOpacity>

                {/* ปุ่มสลับกล้อง หน้า/หลัง */}
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleCameraFacing}
                >
                    <Ionicons name="camera-reverse" size={28} color={COLORS.white} />
                </TouchableOpacity>

                {/* ปุ่มวางสาย */}
                <TouchableOpacity
                    style={[styles.controlButton, styles.hangupButton]}
                    onPress={handleEndCall}
                >
                    <Ionicons name="call" size={32} color={COLORS.white} />
                </TouchableOpacity>

                {/* ปุ่มปิด/เปิดกล้อง */}
                <TouchableOpacity
                    style={[styles.controlButton, isCameraOff && styles.controlButtonActive]}
                    onPress={() => setIsCameraOff(!isCameraOff)}
                >
                    <Ionicons name={isCameraOff ? "videocam-off" : "videocam"} size={28} color={isCameraOff ? COLORS.primary : COLORS.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    camera: { width: '100%', height: '100%' },

    // กรณีกล้องปิด
    cameraOffContainer: {
        flex: 1, backgroundColor: '#1a1a2e',
        justifyContent: 'center', alignItems: 'center',
    },
    cameraOffText: { color: '#999', fontSize: 16, marginTop: 10 },

    // Loading & Permission
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    loadingText: { color: COLORS.white, marginTop: 15, fontSize: 16 },

    permissionContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: COLORS.background, padding: 30,
    },
    permissionTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 20 },
    permissionMessage: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginTop: 10, marginBottom: 30 },
    permissionButton: {
        backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 40,
        borderRadius: SIZES.radius,
    },
    permissionButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
    goBackText: { color: COLORS.textSecondary, marginTop: 20, fontSize: 14 },

    // Top bar overlay
    topBar: {
        position: 'absolute', top: 50, left: 20, right: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    name: { color: COLORS.white, fontSize: SIZES.h2, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 5 },
    timer: { color: COLORS.white, fontSize: SIZES.body, marginTop: 5, textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 5 },
    signalIcon: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 20 },

    // Control buttons
    controlsContainer: {
        position: 'absolute', bottom: 40, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
    },
    controlButton: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center', alignItems: 'center',
    },
    controlButtonActive: { backgroundColor: COLORS.white },
    hangupButton: { backgroundColor: COLORS.danger, width: 70, height: 70, borderRadius: 35 },
});

export default VideoCallScreen;