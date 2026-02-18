// src/navigation/DoctorTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { ROUTES } from '../constants/routes';

// Screens
import DoctorHomeScreen from '../screens/doctor/DoctorHomeScreen';
// src/screens/doctor/MyPatientsScreen.js
import MyPatientsScreen from '../screens/doctor/MyPatientsScreen';
import DoctorProfileScreen from '../screens/doctor/DoctorProfileScreen';
import ChatListScreen from '../screens/consultation/ChatListScreen';

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
                    else if (route.name === 'DoctorChatTab') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    else if (route.name === ROUTES.PATIENT_DETAIL) iconName = focused ? 'people' : 'people-outline';
                    else iconName = focused ? 'person' : 'person-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name={ROUTES.DOCTOR_HOME}
                component={DoctorHomeScreen}
                options={{ tabBarLabel: 'รับเคส' }}
            />
            <Tab.Screen
                name="DoctorChatTab"
                component={ChatListScreen}
                options={{ tabBarLabel: 'แชท' }}
            />
            {/* หน้าคนไข้ของฉัน */}
            <Tab.Screen
                name={ROUTES.PATIENT_DETAIL}
                component={MyPatientsScreen}
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