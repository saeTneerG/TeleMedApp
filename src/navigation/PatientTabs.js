// src/navigation/PatientTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { ROUTES } from '../constants/routes';

// Import Screens (สร้างไฟล์เปล่าๆ รอไว้ก่อนได้ครับถ้ายังไม่มี)
import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import PatientProfileScreen from '../screens/patient/PatientProfileScreen';
import MyAppointmentsScreen from '../screens/patient/MyAppointmentsScreen';
import ChatListScreen from '../screens/consultation/ChatListScreen';


const Tab = createBottomTabNavigator();

const PatientTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === ROUTES.PATIENT_HOME) iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === ROUTES.MY_APPOINTMENTS) iconName = focused ? 'calendar' : 'calendar-outline';
                    else if (route.name === 'ChatTab') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    else if (route.name === ROUTES.PATIENT_PROFILE) iconName = focused ? 'person' : 'person-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name={ROUTES.PATIENT_HOME}
                component={PatientHomeScreen}
                options={{ tabBarLabel: 'หน้าหลัก' }}
            />
            <Tab.Screen
                name={ROUTES.MY_APPOINTMENTS}
                component={MyAppointmentsScreen}
                options={{ tabBarLabel: 'นัดหมาย' }}
            />
            <Tab.Screen
                name="ChatTab"
                component={ChatListScreen}
                options={{ tabBarLabel: 'แชท' }}
            />
            <Tab.Screen
                name={ROUTES.PATIENT_PROFILE}
                component={PatientProfileScreen}
                options={{ tabBarLabel: 'โปรไฟล์' }}
            />
        </Tab.Navigator>
    );
};

export default PatientTabs;