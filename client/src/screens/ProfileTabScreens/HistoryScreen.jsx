import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'

import { Calendar } from 'react-native-calendars';

const HistoryScreen = () => {
    return (
        <ScrollView style={styles.main} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
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
        </ScrollView>
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