// src/screens/consultation/ChatScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, useWindowDimensions, Keyboard, Platform } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { subscribeToMessages, sendMessage, markChatAsRead } from '../../services/chatService';
import { ROUTES } from '../../constants/routes';

const SCREEN_HEIGHT = Dimensions.get('screen').height;

const ChatScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userData, user } = useAuth();

    const { roomId, chatPartnerName, patientId, queueId } = route.params || { roomId: 'test-room', chatPartnerName: 'คุณหมอ' };

    const [messages, setMessages] = useState([]);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    // คำนวณความสูงคีย์บอร์ดแบบ dynamic จาก screen vs window
    const { height: windowHeight } = useWindowDimensions();
    const keyboardOffsetFromWindow = Math.max(SCREEN_HEIGHT - windowHeight, 0);

    useEffect(() => {
        const applyKeyboardHeight = (event) => {
            const eventHeight = event?.endCoordinates?.height || 0;
            setIsKeyboardVisible(true);
            setKeyboardHeight(Math.max(eventHeight, keyboardOffsetFromWindow));
        };

        const hideKeyboard = () => {
            setIsKeyboardVisible(false);
            setKeyboardHeight(0);
        };

        const subscriptions = Platform.select({
            ios: [
                Keyboard.addListener('keyboardWillShow', applyKeyboardHeight),
                Keyboard.addListener('keyboardWillChangeFrame', applyKeyboardHeight),
                Keyboard.addListener('keyboardWillHide', hideKeyboard),
            ],
            default: [
                Keyboard.addListener('keyboardDidShow', applyKeyboardHeight),
                Keyboard.addListener('keyboardDidHide', hideKeyboard),
            ],
        });

        return () => subscriptions?.forEach((sub) => sub.remove());
    }, [keyboardOffsetFromWindow]);

    useEffect(() => {
        if (isKeyboardVisible && keyboardOffsetFromWindow > 0) {
            setKeyboardHeight((prev) => Math.max(prev, keyboardOffsetFromWindow));
        }
    }, [isKeyboardVisible, keyboardOffsetFromWindow]);

    useEffect(() => {
        // บันทึกว่าผู้ใช้เปิดอ่านแชทนี้แล้ว
        if (user?.uid && roomId) {
            markChatAsRead(roomId, user.uid);
        }

        const unsubscribe = subscribeToMessages(roomId, (newMessages) => {
            setMessages(newMessages);
            // อัปเดตเวลาอ่านล่าสุดทุกครั้งที่มีข้อความใหม่เข้ามาขณะอยู่ในห้อง
            if (user?.uid && roomId) {
                markChatAsRead(roomId, user.uid);
            }
        });
        return () => unsubscribe();
    }, [roomId]);

    const onSend = useCallback((messages = []) => {
        const { text } = messages[0];
        const currentUser = {
            _id: user.uid,
            name: userData?.fullName || 'User',
            avatar: 'https://ui-avatars.com/api/?name=' + (userData?.fullName || 'User'),
        };
        sendMessage(roomId, text, currentUser);
    }, [roomId, user, userData]);

    const renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: { backgroundColor: COLORS.primary },
                    left: { backgroundColor: COLORS.white },
                }}
                textStyle={{
                    right: { color: COLORS.white },
                    left: { color: COLORS.textPrimary },
                }}
            />
        );
    };

    const handleVideoCall = () => {
        navigation.navigate(ROUTES.VIDEO_CALL, {
            roomId,
            partnerName: chatPartnerName,
            patientId,
            queueId
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.white} />
                </TouchableOpacity>

                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>{chatPartnerName}</Text>
                    <Text style={styles.headerStatus}>กำลังสนทนา</Text>
                </View>

                <TouchableOpacity onPress={handleVideoCall} style={styles.videoButton}>
                    <Ionicons name="videocam" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Chat area — paddingBottom อ้างอิงจากความสูงจริงของคีย์บอร์ด */}
            <View style={{ flex: 1, paddingBottom: keyboardHeight }}>
                <GiftedChat
                    messages={messages}
                    onSend={messages => onSend(messages)}
                    user={{ _id: user.uid }}
                    renderBubble={renderBubble}
                    placeholder="พิมพ์ข้อความ..."
                    alwaysShowSend
                    scrollToBottom
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: COLORS.primary,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    headerTitle: { fontSize: SIZES.h3, color: COLORS.white, fontWeight: 'bold' },
    headerStatus: { fontSize: SIZES.small, color: COLORS.white, opacity: 0.8 },
    videoButton: {
        backgroundColor: COLORS.white,
        padding: 8,
        borderRadius: 20,
    }
});

export default ChatScreen;

