import { Alert, Keyboard, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useState } from 'react'
import ChatList from '../../lists/ChatList'
import { SafeAreaView } from 'react-native-safe-area-context'
import SharedHeader from '../../components/SharedHeader'

const ChatScreen = ({ route }) => {
    const {communityName} = route.params;

    const [text, setText] = useState('');
    const sendMessage = () => {
        if (text.trim() !== '') {
            Alert.alert(text);
            setText("");
        }
    };
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.innerContainer}>
                        <SharedHeader title={communityName}/>
                        <View style={{ flex: 1 }}>
                            <ChatList />
                        </View>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                value={text}
                                onChangeText={setText}
                                placeholder={"Message..."}
                                placeholderTextColor="#888"
                            />
                            <TouchableOpacity style={styles.buttonContainer} onPress={sendMessage}>
                                <Text style={styles.buttonText}>SEND</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default ChatScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#034b3ed5',
    },
    innerContainer: {
        flex: 1,
        //padding: 10,
        margin: 5,
    },
    inputRow: {
        position: 'absolute',
        bottom: 5, // ⬅️ Distance from the bottom
        left: 10,   // ⬅️ Optional: distance from left
        right: 10,  // ⬅️ Optional: distance from right
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 25,
        elevation: 7,
        marginBottom: 10,
    },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 15,
        marginRight: 10,
        backgroundColor: '#f9f9f9',
    },
    buttonContainer: {
        backgroundColor: "#4CAF50",
        paddingVertical: 9,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 17,
        fontWeight: 500,
    },
})