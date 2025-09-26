import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, FlatList, Dimensions, PermissionsAndroid } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import SharedHeader from '../../components/SharedHeader'
import ChatBubble from '../../components/ChatBubble'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Voice from '@react-native-voice/voice'
import TTS from 'react-native-tts'

const { width } = Dimensions.get('window');

function useVoiceAssistantApi() {
    const baseUrl = useMemo(() => {
        if (global?.VA_BASE_URL) return global.VA_BASE_URL;
        if (Platform.OS === 'android') return 'http://10.130.86.124:3000';
        return 'http://localhost:3000';
    }, []);
    const startSession = async (locale = 'en-IN') => {
        try {
            const r = await fetch(`${baseUrl}/api/session/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locale })
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const j = await r.json();
            return j.sessionId;
        } catch (e) {
            console.warn('startSession failed:', e?.message || String(e));
            return null;
        }
    };
    const sendTurn = async ({ sessionId, userText }) => {
        try {
            const r = await fetch(`${baseUrl}/api/session/turn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, userText })
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return await r.json();
        } catch (e) {
            console.warn('sendTurn failed:', e?.message || String(e));
            return { error: e?.message || String(e) };
        }
    };
    const endSession = async (sessionId) => {
        try {
            await fetch(`${baseUrl}/api/session/end`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });
        } catch { }
    };
    return { startSession, sendTurn, endSession };
}

const BOT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png';

const AIScreen = () => {
    const { startSession, sendTurn, endSession } = useVoiceAssistantApi();
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState(() => {
        const t = new Date();
        return [
            {
                _id: `sys-${t.getTime()}`,
                message: 'Hi, I’m your AI counselor. How are you feeling today?',
                from: 'assistant',
                isMe: false,
                time: formatTime(t),
                avatar: BOT_AVATAR,
            },
        ];
    });
    const [text, setText] = useState('');
    const [typing, setTyping] = useState(false);
    const [recording, setRecording] = useState(false);
    const [ttsOn, setTtsOn] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');
    const [speechError, setSpeechError] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        let active = true;
        (async () => {
            const id = await startSession('en-IN');
            if (active) {
                setSessionId(id);
                if (!id) Alert.alert('AI unavailable', 'Could not connect to assistant server.');
            }
        })();
        return () => { active = false; };
    }, [startSession]);

    useEffect(() => {
        return () => { if (sessionId) endSession(sessionId); };
    }, [sessionId, endSession]);

    // Voice recognition handlers
    useEffect(() => {
        console.log('Voice Native Module:', Voice);
        Voice.onSpeechStart = () => {
            console.log('Speech recognition started');
            setIsListening(true);
            setSpeechError(null);
        };
        
        Voice.onSpeechEnd = () => {
            console.log('Speech recognition ended');
            setIsListening(false);
        };
        
        Voice.onSpeechResults = (e) => {
            console.log('Speech results:', e);
            const vals = e?.value || [];
            if (vals.length) {
                const recognized = vals[0];
                setRecognizedText(recognized);
                setText(recognized);
            }
        };
        
        Voice.onSpeechPartialResults = (e) => {
            console.log('Speech partial results:', e);
            const vals = e?.value || [];
            if (vals.length) {
                setRecognizedText(vals[0]);
            }
        };
        
        Voice.onSpeechError = (e) => {
            console.error('Speech error:', e);
            setSpeechError(e?.error || 'Speech recognition error');
            setRecording(false);
            setIsListening(false);
        };
        
        return () => {
            Voice.destroy().then(() => {
                Voice.removeAllListeners();
            }).catch(e => {
                console.warn('Error destroying Voice:', e);
            });
        };
    }, []);

    useEffect(() => {
        TTS.setDefaultLanguage('en-IN');
        TTS.setDucking(true);
        // Avoid calling Voice.isAvailable() which may be undefined on some builds
    }, []);

    const ensureMicPermission = async () => {
        if (Platform.OS !== 'android') return true;
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
                title: 'Microphone Permission',
                message: 'We need microphone access for voice input.',
                buttonPositive: 'OK',
            }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    };

    const startRecording = async () => {
        console.log('Starting recording...');

        // Basic readiness checks without invoking Voice.isAvailable()
        if (!Voice || typeof Voice.start !== 'function') {
            setSpeechError('Voice module not ready. Rebuild the app or reinstall dependencies.');
            return;
        }

        const ok = await ensureMicPermission();
        console.log('Microphone permission granted:', ok);
        if (!ok) {
            setSpeechError('Microphone permission denied');
            return;
        }

        try {
            setRecording(true);
            setRecognizedText('');
            setSpeechError(null);

            console.log('Starting Voice.start with en-IN...');
            await Voice.start('en-IN');
            console.log('Voice.start completed (en-IN)');
        } catch (e) {
            console.warn('Voice.start failed with en-IN, trying en-US. Error:', e);
            try {
                await Voice.start('en-US');
                console.log('Voice.start completed (en-US fallback)');
            } catch (e2) {
                console.error('startRecording error (fallback failed):', e2);
                setRecording(false);

                let errorMessage = 'Failed to start recording';
                const errText = e2?.message || String(e2);
                if (errText.includes('permission')) {
                    errorMessage = 'Microphone permission denied. Please grant permission and try again.';
                } else if (errText.includes('not available')) {
                    errorMessage = 'Voice recognition not available. Ensure Google app/ASR is enabled.';
                } else if (errText.includes('network')) {
                    errorMessage = 'Network error. Check your internet connection.';
                } else {
                    errorMessage = `Recording error: ${errText}`;
                }
                setSpeechError(errorMessage);
            }
        }
    };

    const stopRecording = async () => {
        try {
            await Voice.stop();
        } catch (e) {
            console.warn('stopRecording error', e);
        }
        setRecording(false);
        setIsListening(false);
    };

    const onQuickPrompt = (prompt) => {
        setText(prompt);
        requestAnimationFrame(() => { onSend(prompt); });
    };

    const onSend = async (overrideText) => {
        const userText = (overrideText ?? text).trim();
        if (!userText) return;
        if (!sessionId) {
            Alert.alert('AI not ready', 'Please wait a moment and try again.');
            return;
        }
        const now = new Date();
        const userMsg = {
            _id: `u-${now.getTime()}`,
            message: userText,
            from: 'me',
            isMe: true,
            time: formatTime(now),
            avatar: null,
        };
        setText('');
        setMessages(prev => [userMsg, ...prev]);
        setTyping(true);

        const { reply, error } = await sendTurn({ sessionId, userText });
        setTyping(false);

        if (error || !reply) {
            const errMsg = {
                _id: `e-${Date.now()}`,
                message: 'Sorry, I’m having trouble responding right now. Please try again.',
                from: 'assistant',
                isMe: false,
                time: formatTime(new Date()),
                avatar: BOT_AVATAR,
            };
            setMessages(prev => [errMsg, ...prev]);
            return;
        }

        const botMsg = {
            _id: `b-${Date.now()}`,
            message: reply,
            from: 'assistant',
            isMe: false,
            time: formatTime(new Date()),
            avatar: BOT_AVATAR,
        };
        setMessages(prev => [botMsg, ...prev]);

        if (ttsOn && reply) {
            try { await TTS.stop(); } catch { }
            TTS.speak(reply);
        }
    };

    const renderItem = ({ item }) => {
        if (item._type === 'typing') {
            return (
                <View style={styles.typingRow}>
                    <View style={styles.typingBubble}>
                        <Text style={styles.typingDots}>•••</Text>
                    </View>
                </View>
            );
        }
        return <ChatBubble item={item} />;
    };

    const data = useMemo(() => {
        if (!typing) return messages;
        return [{ _id: 'typing', _type: 'typing' }, ...messages];
    }, [messages, typing]);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.innerContainer}>
                        <SharedHeader title="AI Counselor" />
                        <View style={{ flex: 1, margin: 5 }}>
                            <FlatList
                                data={data}
                                keyExtractor={(item, index) => item._id ?? String(index)}
                                renderItem={renderItem}
                                inverted
                                contentContainerStyle={{ paddingBottom: 100, paddingTop: 80 }}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>

                        <View style={styles.quickRow}>
                            <QuickChip label="I'm feeling anxious" onPress={() => onQuickPrompt("I'm feeling anxious about exams.")} />
                            <QuickChip label="Trouble sleeping" onPress={() => onQuickPrompt("I'm having trouble sleeping.")} />
                            <QuickChip label="Motivation tips" onPress={() => onQuickPrompt("I need help with motivation.")} />
                        </View>

                        {/* Voice Recording Status */}
                        {(recording || isListening || speechError) && (
                            <View style={styles.voiceStatusContainer}>
                                <View style={styles.voiceStatusBar}>
                                    <View style={styles.voiceStatusContent}>
                                        <Icon 
                                            name={speechError ? 'error' : (isListening ? 'mic' : 'mic-none')} 
                                            size={16} 
                                            color={speechError ? '#ff4444' : (isListening ? '#4CAF50' : '#888')} 
                                        />
                                        <Text style={styles.voiceStatusText}>
                                            {speechError ? `Error: ${speechError}` : 
                                             isListening ? 'Listening...' : 
                                             recording ? 'Starting...' : ''}
                                        </Text>
                                    </View>
                                    {recognizedText && (
                                        <Text style={styles.recognizedText}>
                                            "{recognizedText}"
                                        </Text>
                                    )}
                                </View>
                            </View>
                        )}

                        <View style={styles.composeBar}>
                            <TouchableOpacity
                                style={[
                                    styles.roundBtn, 
                                    recording ? styles.roundBtnActive : null,
                                    isListening ? styles.roundBtnListening : null
                                ]}
                                onPress={recording ? stopRecording : startRecording}
                                activeOpacity={0.9}
                            >
                                <Icon 
                                    name={recording ? 'stop' : 'mic'} 
                                    size={22} 
                                    color={speechError ? '#ff4444' : '#fff'} 
                                />
                            </TouchableOpacity>

                            <TextInput
                                ref={inputRef}
                                style={styles.input}
                                value={text}
                                onChangeText={setText}
                                placeholder={"Message..."}
                                placeholderTextColor="#888"
                                multiline
                            />

                            <TouchableOpacity
                                style={[styles.roundBtn, styles.accentBtn]}
                                onPress={() => onSend()}
                                activeOpacity={0.9}
                            >
                                <Icon name="send" size={20} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.roundBtn}
                                onPress={() => setTtsOn(v => !v)}
                                activeOpacity={0.9}
                            >
                                <Icon name={ttsOn ? 'volume-up' : 'volume-off'} size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

function QuickChip({ label, onPress }) {
    return (
        <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.8}>
            <Text style={styles.chipText}>{label}</Text>
        </TouchableOpacity>
    );
}

function formatTime(d) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
}

export default AIScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#034b3ed5',
    },
    innerContainer: {
        flex: 1,
    },
    composeBar: {
        position: 'absolute',
        bottom: 8,
        left: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#303434c7',
        borderRadius: 25,
        elevation: 7,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        borderWidth: 0,
        borderColor: 'transparent',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 8,
        marginHorizontal: 8,
        backgroundColor: 'rgba(255,255,255,0.12)',
        color: '#fff',
    },
    roundBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#555a5fc7',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    roundBtnActive: {
        backgroundColor: '#c0392b',
    },
    roundBtnListening: {
        backgroundColor: '#4CAF50',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 8,
    },
    accentBtn: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: "white",
        fontSize: 17,
        fontWeight: '500',
    },
    typingRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    typingBubble: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 16,
        maxWidth: '75%',
        marginHorizontal: 4,
        backgroundColor: '#e6e6eb',
    },
    typingDots: {
        fontSize: 18,
        color: '#666',
        letterSpacing: 2,
    },
    quickRow: {
        position: 'absolute',
        bottom: 58,
        left: 10,
        right: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 2,
        justifyContent: 'flex-start',
    },
    chip: {
        backgroundColor: '#303434c7',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginRight: 6,
        marginBottom: 6,
    },
    chipText: {
        color: '#fff',
        fontSize: 13,
    },
    voiceStatusContainer: {
        position: 'absolute',
        bottom: 58,
        left: 10,
        right: 10,
        marginBottom: 8,
    },
    voiceStatusBar: {
        backgroundColor: '#303434c7',
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        elevation: 5,
    },
    voiceStatusContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    voiceStatusText: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 8,
        fontWeight: '500',
    },
    recognizedText: {
        color: '#4CAF50',
        fontSize: 13,
        fontStyle: 'italic',
        marginTop: 4,
    }
})