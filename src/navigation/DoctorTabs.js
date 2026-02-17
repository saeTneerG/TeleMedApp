// src/navigation/DoctorTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { ROUTES } from '../constants/routes';

// Screens
import DoctorHomeScreen from '../screens/doctor/DoctorHomeScreen';
import DoctorProfileScreen from '../screens/doctor/DoctorProfileScreen'; // สร้างไฟล์เปล่ารอไว้ก่อน

const Tab = createBottomTabNavigator();

const DoctorTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarStyle: { height: 60, paddingBottom: 10, paddingTop: 10 },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === ROUTES.DOCTOR_HOME) iconName = focused ? 'medkit' : 'medkit-outline';
                    else if (route.name === ROUTES.PATIENT_DETAIL) iconName = focused ? 'people' : 'people-outline'; // หน้ารายชื่อคนไข้ (Placeholder)
                    else iconName = focused ? 'person' : 'person-outline'; // Profile

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name={ROUTES.DOCTOR_HOME}
                component={DoctorHomeScreen}
                options={{ tabBarLabel: 'รับเคส' }}
            />
            {/* ใส่ Placeholder ไปก่อน */}
            <Tab.Screen
                name={ROUTES.PATIENT_DETAIL}
                component={DoctorProfileScreen}
                options={{ tabBarLabel: 'คนไข้ของฉัน' }}
            />
            <Tab.Screen
                name="DoctorProfile"
                component={DoctorProfileScreen}
                options={{ tabBarLabel: 'โปรไฟล์' }}
            />
        </Tab.Navigator>
    );
};

export default DoctorTabs;