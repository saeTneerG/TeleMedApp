// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

// Import Stacks
import AuthStack from './AuthStack';
import PatientTabs from './PatientTabs';
// import DoctorTabs from './DoctorTabs'; // (ส่วนที่ 4 เดี๋ยวมาทำต่อ)

const AppNavigator = () => {
    const { user, userData, loading } = useAuth();

    // 1. ระหว่างรอโหลดสถานะ Login ให้หมุนๆ รอไปก่อน
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {!user ? (
                // 2. ถ้าไม่มี User -> ไปหน้า Login
                <AuthStack />
            ) : (
                // 3. ถ้ามี User -> เช็ค Role
                userData?.role === 'doctor' ? (
                    // <DoctorTabs /> // เดี๋ยวเปิดใช้ในส่วนที่ 4
                    <View><ActivityIndicator /></View> // Placeholder ไว้ก่อน
                ) : (
                    <PatientTabs /> // ถ้าเป็น patient หรือ role อื่นๆ ให้ไปหน้าคนไข้
                )
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;