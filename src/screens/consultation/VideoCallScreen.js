// src/screens/consultation/VideoCallScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

const VideoCallScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userData } = useAuth();
    const { partnerName, patientId, queueId } = route.params || { partnerName: 'Doctor' };

    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [duration, setDuration] = useState(0);

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
        // ถ้าเป็นหมอ ให้ไปหน้าสั่งยา (Prescription)
        // ถ้าเป็นคนไข้ ให้กลับไปหน้า Chat หรือ Home
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

    return (
        <View style={styles.container}>
            {/* 1. ภาพคู่สนทนา (เต็มจอ) */}
            <Image
                source={{ uri: 'https://img.freepik.com/free-photo/doctor-offering-medical-teleconsultation_23-2149329007.jpg' }}
                style={styles.remoteVideo}
            />

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

            {/* 2. ภาพเรา (จอเล็ก มุมขวา) */}
            <View style={styles.localVideoContainer}>
                {isCameraOff ? (
                    <View style={[styles.localVideo, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="videocam-off" size={30} color="#fff" />
                    </View>
                ) : (
                    <Image
                        source={{ uri: 'https://ui-avatars.com/api/?name=' + (userData?.fullName || 'Me') }}
                        style={styles.localVideo}
                    />
                )}
            </View>

            {/* 3. ปุ่มควบคุมด้านล่าง */}
            <View style={styles.controlsContainer}>
                {/* ปุ่มปิดไมค์ */}
                <TouchableOpacity
                    style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                    onPress={() => setIsMuted(!isMuted)}
                >
                    <Ionicons name={isMuted ? "mic-off" : "mic"} size={28} color={isMuted ? COLORS.primary : COLORS.white} />
                </TouchableOpacity>

                {/* ปุ่มวางสาย (สีแดง ใหญ่หน่อย) */}
                <TouchableOpacity
                    style={[styles.controlButton, styles.hangupButton]}
                    onPress={handleEndCall}
                >
                    <Ionicons name="call" size={32} color={COLORS.white} />
                </TouchableOpacity>

                {/* ปุ่มปิดกล้อง */}
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
    remoteVideo: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.9 },

    topBar: {
        position: 'absolute', top: 50, left: 20, right: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    name: { color: COLORS.white, fontSize: SIZES.h2, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 5 },
    timer: { color: COLORS.white, fontSize: SIZES.body, marginTop: 5, textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 5 },
    signalIcon: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 20 },

    localVideoContainer: {
        position: 'absolute', right: 20, bottom: 150,
        width: 100, height: 140, borderRadius: 10,
        borderWidth: 2, borderColor: COLORS.white,
        overflow: 'hidden', elevation: 5
    },
    localVideo: { width: '100%', height: '100%', resizeMode: 'cover' },

    controlsContainer: {
        position: 'absolute', bottom: 40, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
    },
    controlButton: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center', alignItems: 'center',
        // backdropFilter ถูกลบแล้ว — ไม่รองรับใน React Native
    },
    controlButtonActive: { backgroundColor: COLORS.white },
    hangupButton: { backgroundColor: COLORS.danger, width: 70, height: 70, borderRadius: 35 },
});

export default VideoCallScreen;