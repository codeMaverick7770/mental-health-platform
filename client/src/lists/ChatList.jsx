import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'

import ChatBubble from '../components/ChatBubble'

const arr = [
    {
        _id: '1',
        message: 'Hey there! How are you?',
        from: 'user1',
        isMe: false,
        time: '09:00',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
        _id: '2',
        message: 'I am good, thanks! And you?',
        from: 'user1',
        isMe: false,
        time: '09:01',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
        _id: '3',
        message: 'Doing well! Ready for the meeting?',
        from: 'user2',
        isMe: false,
        time: '09:02',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
    {
        _id: '4',
        message: 'Absolutely! Let’s go.',
        from: 'me',
        isMe: true,
        time: '09:03',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
    {
        _id: '5',
        message: 'Did you finish the report?',
        from: 'user2',
        isMe: false,
        time: '09:05',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
    {
        _id: '6',
        message: 'Yes, I sent it last night.',
        from: 'user2',
        isMe: false,
        time: '09:06',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
    {
        _id: '7',
        message: 'Awesome! Thanks for that.',
        from: 'user1',
        isMe: false,
        time: '09:07',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
        _id: '8',
        message: 'No problem. Are we meeting at 10?',
        from: 'user2',
        isMe: false,
        time: '09:08',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
    {
        _id: '9',
        message: 'Yes, see you in the conference room.',
        from: 'user1',
        isMe: false,
        time: '09:09',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
        _id: '10',
        message: 'Great, I’ll bring the slides.',
        from: 'me',
        isMe: true,
        time: '09:10',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
    {
        _id: '11',
        message: 'Perfect. Don’t forget the handouts.',
        from: 'user2',
        isMe: false,
        time: '09:11',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
    {
        _id: '12',
        message: 'Already printed them!',
        from: 'user1',
        isMe: false,
        time: '09:12',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
        _id: '13',
        message: 'You’re always prepared.',
        from: 'user1',
        isMe: false,
        time: '09:13',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
        _id: '14',
        message: 'Haha, thanks! See you soon.',
        from: 'me',
        isMe: true,
        time: '09:14',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
]

const ChatList = () => {
    return (
        <FlatList
            data={arr}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <ChatBubble item={item} />}
            inverted
            contentContainerStyle={{
                paddingBottom: 60,
                paddingTop: 80
            }}
        />
    )
}

export default ChatList

const styles = StyleSheet.create({})