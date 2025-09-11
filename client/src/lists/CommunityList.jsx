import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'

import CommunityCard from '../components/CommunityCard'

const arr = [];

const CommunityList = () => {
    const renderItem = ({item}) => {
        return (
            <CommunityCard />
        )
    }
    return (
        <FlatList
            data={arr}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
        />
    )
}

export default CommunityList

const styles = StyleSheet.create({})