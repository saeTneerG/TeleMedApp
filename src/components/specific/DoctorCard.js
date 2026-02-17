// src/components/specific/DoctorCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

const DoctorCard = ({ doctor, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            {/* รูปหมอ (ถ้าไม่มีรูป ใช้ไอคอนแทน) */}
            <View style={styles.imageContainer}>
                {doctor.photoUrl ? (
                    <Image source={{ uri: doctor.photoUrl }} style={styles.image} />
                ) : (
                    <Ionicons name="person" size={24} color={COLORS.white} />
                )}
            </View>

            {/* ข้อมูลหมอ */}
            <View style={styles.info}>
                <Text style={styles.name}>นพ. {doctor.name}</Text>
                <Text style={styles.specialty}>{doctor.specialty || 'แพทย์ทั่วไป'}</Text>

                {/* สถานะ Online (ตัวอย่าง) */}
                <View style={styles.statusContainer}>
                    <View style={[styles.dot, { backgroundColor: doctor.isOnline ? COLORS.success : COLORS.textSecondary }]} />
                    <Text style={styles.statusText}>{doctor.isOnline ? 'พร้อมให้คำปรึกษา' : 'ออฟไลน์'}</Text>
                </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 12,
        borderRadius: SIZES.radius,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2, // เงาสำหรับ Android
    },
    imageContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    image: { width: 50, height: 50, borderRadius: 25 },
    info: { flex: 1 },
    name: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.textPrimary },
    specialty: { fontSize: SIZES.body, color: COLORS.textSecondary },
    statusContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    statusText: { fontSize: SIZES.small, color: COLORS.textSecondary }
});

export default DoctorCard;