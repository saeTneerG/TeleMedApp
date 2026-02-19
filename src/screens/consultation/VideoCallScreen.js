// src/screens/consultation/VideoCallScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { createRoom } from '../../services/MeteredService';
import { COLORS } from '../../constants/theme';

const VideoCallScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userData } = useAuth();
    const { partnerName, roomId, patientId, queueId } = route.params || { partnerName: 'Doctor' };

    const [roomUrl, setRoomUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const hasExitedRef = useRef(false);
    const participantName = String(
        userData?.fullName || userData?.name || userData?.displayName || ''
    ).trim();

    const normalizePath = (path) => (path || '').replace(/\/+$/, '');

    const isInMeetingPath = useCallback((currentUrl) => {
        if (!roomUrl || !currentUrl) return true;

        try {
            const meeting = new URL(roomUrl);
            const current = new URL(currentUrl);
            if (meeting.origin !== current.origin) return false;
            return normalizePath(meeting.pathname) === normalizePath(current.pathname);
        } catch (_) {
            return currentUrl === roomUrl;
        }
    }, [roomUrl]);

    const exitToApp = useCallback(() => {
        if (hasExitedRef.current) return;
        hasExitedRef.current = true;
        navigation.goBack();
    }, [navigation]);

    const handlePotentialLeave = useCallback((url) => {
        if (!url) return;
        if (!isInMeetingPath(url)) {
            exitToApp();
        }
    }, [isInMeetingPath, exitToApp]);

    const injectedBridgeJs = `
        (function () {
            var desiredName = ${JSON.stringify(participantName)};
            var post = function (type) {
                try {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: type,
                        url: window.location.href
                    }));
                } catch (e) {}
            };
            window.addEventListener('beforeunload', function () { post('beforeunload'); });
            window.addEventListener('pagehide', function () { post('pagehide'); });
            window.addEventListener('hashchange', function () { post('hashchange'); });
            window.addEventListener('popstate', function () { post('popstate'); });

            var hasSentEnded = false;
            var hasFilledName = false;
            var hasHiddenInviteCard = false;

            var fillParticipantName = function () {
                if (hasFilledName || !desiredName) return;
                try {
                    var selectors = [
                        'input[name="name"]',
                        'input[placeholder="Enter your name"]',
                        'input[placeholder="Name"]'
                    ];

                    var input = null;
                    for (var i = 0; i < selectors.length; i++) {
                        var found = document.querySelector(selectors[i]);
                        if (found) {
                            input = found;
                            break;
                        }
                    }

                    if (!input) return;

                    input.focus();
                    input.value = desiredName;
                    input.setAttribute('value', desiredName);
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    hasFilledName = true;
                    post('name-filled');
                } catch (e) {}
            };

            var detectEndedScreen = function () {
                if (hasSentEnded) return;
                try {
                    var text = (document.body && document.body.innerText ? document.body.innerText : '').toLowerCase();
                    if (text.indexOf('thanks for using metered video for your meeting') !== -1) {
                        hasSentEnded = true;
                        post('metered-ended');
                    }
                } catch (e) {}
            };

            var hideElement = function (el) {
                if (!el || el.__inviteHidden) return;
                el.style.display = 'none';
                el.__inviteHidden = true;
            };

            var hideInviteInstructions = function () {
                if (hasHiddenInviteCard) return;
                try {
                    var nodes = document.querySelectorAll('div, section, article, p, span, h1, h2, h3, h4, pre, code');
                    var hiddenCount = 0;

                    var markerPhrases = [
                        'invite instructions',
                        'share the meeting url with others'
                    ];

                    for (var i = 0; i < nodes.length; i++) {
                        var el = nodes[i];
                        var text = (el.innerText || '').trim().toLowerCase();
                        if (!text) continue;

                        // Never hide interactive blocks (controls bar/buttons/video area).
                        var hasInteractiveChild = !!el.querySelector('button, input, video, canvas, svg');
                        if (hasInteractiveChild) continue;

                        var isMarkerText = false;
                        for (var j = 0; j < markerPhrases.length; j++) {
                            if (text.indexOf(markerPhrases[j]) !== -1) {
                                isMarkerText = true;
                                break;
                            }
                        }

                        if (isMarkerText && text.length <= 300) {
                            hideElement(el);
                            hiddenCount++;
                            continue;
                        }

                        // Hide only invite URL text block, not containers.
                        var isStandaloneInviteUrl =
                            text.indexOf('https://') !== -1 &&
                            text.indexOf('metered.live/') !== -1 &&
                            text.length <= 300 &&
                            el.childElementCount <= 2;
                        if (isStandaloneInviteUrl) {
                            hideElement(el);
                            hiddenCount++;
                        }
                    }

                    if (hiddenCount > 0) {
                        hasHiddenInviteCard = true;
                        post('invite-hidden');
                    }
                } catch (e) {}
            };

            var observer = new MutationObserver(function () {
                fillParticipantName();
                detectEndedScreen();
                hideInviteInstructions();
            });
            if (document.documentElement) {
                observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
            }
            setInterval(function () {
                fillParticipantName();
                detectEndedScreen();
                hideInviteInstructions();
            }, 500);
            fillParticipantName();
            hideInviteInstructions();
            post('ready');
        })();
        true;
    `;

    useEffect(() => {
        const initializeCall = async () => {
            // Use deterministic id from queue/chat room to ensure doctor and patient join the same room.
            const stableRoomId = queueId || roomId || patientId;
            console.log('VideoCall params:', { queueId, roomId, patientId, stableRoomId });
            const url = await createRoom(stableRoomId);
            if (url) {
                console.log('VideoCall room URL:', url);
                setRoomUrl(url);
            } else {
                Alert.alert('Error', 'Failed to start video call');
                navigation.goBack();
            }
            setLoading(false);
        };

        initializeCall();
    }, [queueId, roomId, patientId, navigation]);

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
                    injectedJavaScript={injectedBridgeJs}
                    onLoadStart={(event) => console.log('WebView load start:', event?.nativeEvent?.url)}
                    onNavigationStateChange={(navState) => {
                        console.log('WebView nav:', navState?.url);
                        handlePotentialLeave(navState?.url);
                    }}
                    onMessage={(event) => {
                        try {
                            const payload = JSON.parse(event?.nativeEvent?.data || '{}');
                            if (payload?.type === 'metered-ended') {
                                exitToApp();
                                return;
                            }
                            handlePotentialLeave(payload?.url);
                        } catch (_) {}
                    }}
                    onHttpError={(event) => console.log('WebView HTTP error:', event?.nativeEvent?.statusCode, event?.nativeEvent?.url)}
                    onError={(event) => console.log('WebView error:', event?.nativeEvent)}
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
});

export default VideoCallScreen;
