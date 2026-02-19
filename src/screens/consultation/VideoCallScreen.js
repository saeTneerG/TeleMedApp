// src/screens/consultation/VideoCallScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { createRoom } from '../../services/MeteredService';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const VideoCallScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userData } = useAuth();
    const { partnerName, patientId, queueId } = route.params || { partnerName: 'Doctor' };

    const [roomUrl, setRoomUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeCall = async () => {
            // In a real app, the room URL might be passed via navigation or fetched from a booking
            // For this demo, we'll create a new room dynamically
            const url = await createRoom();
            if (url) {
                setRoomUrl(url);
            } else {
                Alert.alert('Error', 'Failed to start video call');
                navigation.goBack();
            }
            setLoading(false);
        };

        initializeCall();
    }, []);

    const handleEndCall = () => {
        Alert.alert('End Call', 'Are you sure you want to end the call?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'End',
                style: 'destructive',
                onPress: () => navigation.goBack()
            }
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Connecting to secure video room...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {roomUrl ? (
                <WebView
                    source={{ uri: roomUrl }}
                    style={styles.webview}
                    allowsInlineMediaPlayback
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled
                    domStorageEnabled
                    startInLoadingState
                    renderLoading={() => (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    )}
                    // Request camera and microphone permissions automatically
                    originWhitelist={['*']}
                    permissionGrantType="grantIfSameHostElsePrompt"
                />
            ) : (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Could not load video room.</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
                <Ionicons name="call" size={30} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    webview: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    loadingText: { color: COLORS.white, marginTop: 15, fontSize: 16 },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    errorText: { color: COLORS.error, fontSize: 16, marginBottom: 20 },
    closeButton: { padding: 10, backgroundColor: COLORS.primary, borderRadius: 5 },
    closeButtonText: { color: COLORS.white },
    endCallButton: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: COLORS.danger,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    }
});

export default VideoCallScreen;
