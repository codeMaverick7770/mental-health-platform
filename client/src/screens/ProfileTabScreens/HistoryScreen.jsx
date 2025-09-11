import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'

import { Calendar } from 'react-native-calendars';
import SectionList from '../../lists/SectionList';

const arr = [
    {
        _id: 1,
        listName: "My History",
        type: "single",
        data: [
            {
                _id: 1,
                img: "https://images.pexels.com/photos/3756724/pexels-photo-3756724.jpeg",
                title: "Morning Motivation",
                length: "4 mins",
            },
            {
                _id: 2,
                img: "https://images.pexels.com/photos/3727165/pexels-photo-3727165.jpeg",
                title: "Mindfulness Talk",
                length: "51 mins",
            },
            {
                _id: 3,
                img: "https://images.pexels.com/photos/1557238/pexels-photo-1557238.jpeg",
                title: "Mind Relaxation",
                length: "12 mins",
            },
            {
                _id: 4,
                img: "https://images.pexels.com/photos/3759657/pexels-photo-3759657.jpeg",
                title: "Deep Breathing",
                length: "16 mins",
            },
        ]
    }
]

const HistoryScreen = () => {
    const renderItem = ({ item }) => {
        return (
            <SectionList section={item} />
        )
    }
    return (
        <View style={styles.main} >
            <FlatList
                data={arr}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                ListHeaderComponent={() => {
                    return (
                        <>
                            <Text style={styles.header}>My Calendar</Text>
                            <Calendar
                                style={styles.calendar}
                                theme={{
                                    calendarBackground: '#2d2d2d',
                                    monthTextColor: '#ffffff',
                                    arrowColor: '#FF9500',
                                    textDisabledColor: '#5a5a5a',
                                }}
                            />
                        </>
                    )
                }}
            />
        </View>
    )
}

export default HistoryScreen

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#034b3ed5",
    },
    header: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginLeft: 24,
        marginVertical: 8,
    },
    calendar: {
        margin: 10,
        borderRadius: 10,
    },
})