import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const DoctorProfileScreen = () => {
    const { logout } = useAuth();
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ marginBottom: 20 }}>Doctor Profile</Text>
            <Button title="ออกจากระบบ" color="red" onPress={logout} />
        </SafeAreaView>
    );
};
export default DoctorProfileScreen;