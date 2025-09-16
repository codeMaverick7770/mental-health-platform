import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ChatBubble = ({ item }) => {
    const isMe = item.isMe;
    return (
        <View
            style={[
                styles.messageContainer,
                isMe ? styles.rightAlign : styles.leftAlign,
            ]}
        >
            {!isMe && (
                <View style={styles.avatarWrapper}>
                    <Image source={{ uri: item.avatar }} style={styles.avatar} />
                </View>
            )}
            <View style={[
                styles.bubble,
                isMe ? styles.myBubble : styles.theirBubble,
            ]}>
                <Text style={[styles.text, isMe && styles.myText]}>{item.message}</Text>
                <Text style={[styles.time, isMe && styles.myText]}>{item.time}</Text>
            </View>
        </View>
    );
}

export default ChatBubble

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    leftAlign: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignSelf: 'flex-start',
    },
    rightAlign: {
        flexDirection: 'row-reverse',
        justifyContent: 'flex-end',
        alignSelf: 'flex-end',
    },
    bubble: {
        padding: 10,
        borderRadius: 16,
        maxWidth: '75%',
        marginHorizontal: 4,
    },
    theirBubble: {
        backgroundColor: '#e6e6eb',
    },
    myBubble: {
        backgroundColor: '#007aff',
    },
    text: {
        fontSize: 16,
    },
    myText: {
        color: 'white',
    },
    avatarWrapper: {
        marginHorizontal: 2,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 30,
    },
    time: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
})