// src/screens/consultation/ChatListScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { subscribeToMyChats } from '../../services/queueService';
import { useNavigation } from '@react-navigation/native';

const ChatListScreen = () => {
    const navigation = useNavigation();
    const { user, userData } = useAuth();
    const [chatList, setChatList] = useState([]);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToMyChats(user.uid, (chats) => {
            // เรียงลำดับตามข้อความล่าสุด (lastMessageTime) ก่อน ถ้าไม่มีใช้ acceptedAt
            const sorted = [...chats].sort((a, b) => {
                const aTime = a.lastMessageTime?.toMillis?.() || a.acceptedAt?.toMillis?.() || 0;
                const bTime = b.lastMessageTime?.toMillis?.() || b.acceptedAt?.toMillis?.() || 0;
                return bTime - aTime; // ใหม่สุดอยู่บน
            });
            setChatList(sorted);
        });
        return () => unsubscribe();
    }, [user]);

    // หาชื่อคู่สนทนา
    const getPartnerName = (item) => {
        if (item.doctorId === user.uid) {
            return item.patientName || 'คนไข้';
        }
        return item.doctorName || 'แพทย์';
    };

    const getPartnerRole = (item) => {
        return item.doctorId === user.uid ? 'คนไข้' : 'แพทย์';
    };

    // ตรวจสอบว่ามีข้อความที่ยังไม่ได้อ่าน
    const hasUnread = (item) => {
        // ถ้าไม่มี lastSenderId หรือฉันเป็นคนส่งเอง → ไม่มี unread
        if (!item.lastSenderId || item.lastSenderId === user.uid) return false;

        // เปรียบเทียบ lastMessageTime กับ lastReadBy_{myUid}
        const lastMsgTime = item.lastMessageTime?.toMillis?.() || 0;
        const lastReadTime = item[`lastReadBy_${user.uid}`]?.toMillis?.() || 0;

        return lastMsgTime > lastReadTime;
    };

    const formatTime = (timestamp) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        if (isToday) {
            return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    };

    const handleOpenChat = (item) => {
        navigation.navigate(ROUTES.CHAT, {
            roomId: item.id,
            chatPartnerName: getPartnerName(item),
            patientId: item.patientId,
            queueId: item.id,
        });
    };

    const renderChatItem = ({ item }) => {
        const unread = hasUnread(item);
        const displayTime = item.lastMessageTime || item.acceptedAt;

        return (
            <TouchableOpacity style={[styles.chatCard, unread && styles.chatCardUnread]} onPress={() => handleOpenChat(item)}>
                <View style={styles.avatarWrapper}>
                    <View style={[styles.avatar, unread && styles.avatarUnread]}>
                        <Ionicons
                            name={item.doctorId === user.uid ? 'person' : 'medkit'}
                            size={24}
                            color={COLORS.white}
                        />
                    </View>
                    {/* จุดสีเขียว online indicator (ถ้า matched) */}
                    {item.status === 'matched' && (
                        <View style={styles.onlineDot} />
                    )}
                </View>

                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={[styles.partnerName, unread && styles.partnerNameUnread]}>
                            {getPartnerName(item)}
                        </Text>
                        <Text style={[styles.timeText, unread && styles.timeTextUnread]}>
                            {formatTime(displayTime)}
                        </Text>
                    </View>

                    <View style={styles.previewRow}>
                        <View style={{ flex: 1 }}>
                            {item.lastMessage ? (
                                <Text style={[styles.lastMessage, unread && styles.lastMessageUnread]} numberOfLines={1}>
                                    {item.lastSenderId === user.uid ? 'คุณ: ' : ''}
                                    {item.lastMessage}
                                </Text>
                            ) : (
                                <Text style={styles.symptomPreview} numberOfLines={1}>
                                    อาการ: {item.symptom || 'ไม่ระบุ'}
                                </Text>
                            )}
                        </View>

                        {/* Unread badge */}
                        {unread && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadBadgeText}>ใหม่</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerBar}>
                <SafeAreaView>
                    <Text style={styles.headerTitle}>แชทของฉัน</Text>
                </SafeAreaView>
            </View>

            {chatList.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="chatbubbles-outline" size={60} color={COLORS.textSecondary} />
                    <Text style={styles.emptyText}>ยังไม่มีการสนทนา</Text>
                    <Text style={styles.emptySubText}>เมื่อจับคู่กับแพทย์แล้ว{'\n'}ห้องแชทจะแสดงที่นี่</Text>
                </View>
            ) : (
                <FlatList
                    data={chatList}
                    renderItem={renderChatItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: SIZES.padding }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    headerBar: {
        backgroundColor: COLORS.primary,
        paddingBottom: 15,
        paddingHorizontal: SIZES.padding,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.white,
        marginTop: 10,
    },

    // Chat Card
    chatCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: 15,
        marginBottom: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    chatCardUnread: {
        backgroundColor: '#F0F7FF', // พื้นหลังฟ้าอ่อนเมื่อมีข้อความใหม่
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },

    // Avatar
    avatarWrapper: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarUnread: {
        backgroundColor: COLORS.secondary,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: COLORS.white,
    },

    chatInfo: { flex: 1 },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    partnerName: {
        fontSize: SIZES.body,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    partnerNameUnread: {
        fontWeight: 'bold',
    },
    timeText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    timeTextUnread: {
        color: COLORS.primary,
        fontWeight: '600',
    },

    // Preview
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    lastMessage: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
    },
    lastMessageUnread: {
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    symptomPreview: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
    },

    // Unread Badge
    unreadBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        marginLeft: 8,
    },
    unreadBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },

    // Empty
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: 15,
    },
    emptySubText: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
});

export default ChatListScreen;
