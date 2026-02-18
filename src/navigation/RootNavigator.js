// src/navigation/RootNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

// Stacks เดิม
import AuthStack from './AuthStack';
import PatientTabs from './PatientTabs';
import DoctorTabs from './DoctorTabs';

// Screens ใหม่
import ChatScreen from '../screens/consultation/ChatScreen';
import VideoCallScreen from '../screens/consultation/VideoCallScreen';
import PrescriptionScreen from '../screens/post_consult/PrescriptionScreen'; // (ส่วนที่ 6)
import PaymentScreen from '../screens/post_consult/PaymentScreen';
import WaitingScreen from '../screens/patient/WaitingScreen';
import PatientDetailScreen from '../screens/doctor/PatientDetailScreen';
import MedicalHistoryScreen from '../screens/patient/MedicalHistoryScreen';
import MyPrescriptionsScreen from '../screens/patient/MyPrescriptionsScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const { user, userData } = useAuth();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                // 1. ยังไม่ Login
                <Stack.Screen name="Auth" component={AuthStack} />
            ) : (
                // 2. Login แล้ว
                <>
                    {/* Main Tabs (ตาม Role) */}
                    <Stack.Screen name="MainApp">
                        {() => userData?.role === 'doctor' ? <DoctorTabs /> : <PatientTabs />}
                    </Stack.Screen>

                    {/* Screens ที่ใช้ร่วมกัน (Chat/Video) */}
                    <Stack.Screen name={ROUTES.CHAT} component={ChatScreen} />
                    <Stack.Screen name={ROUTES.VIDEO_CALL} component={VideoCallScreen} />
                    <Stack.Screen name={ROUTES.PRESCRIPTION} component={PrescriptionScreen} />
                    <Stack.Screen name={ROUTES.PAYMENT} component={PaymentScreen} />
                    <Stack.Screen name={ROUTES.WAITING_ROOM} component={WaitingScreen} />
                    <Stack.Screen name="PatientDetailScreen" component={PatientDetailScreen} />
                    <Stack.Screen name="MedicalHistoryScreen" component={MedicalHistoryScreen} />
                    <Stack.Screen name="MyPrescriptionsScreen" component={MyPrescriptionsScreen} />
                </>
            )}
        </Stack.Navigator>
    );
};

export default RootNavigator;