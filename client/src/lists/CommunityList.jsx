import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'

import CommunityCard from '../components/CommunityCard'

const arr = [
    {
        _id: 1,
        img: "https://images.pexels.com/photos/1557238/pexels-photo-1557238.jpeg",
        communityName: "Happiness",
        membersCount: 200
    },
    {
        _id: 2,
        img: "https://images.pexels.com/photos/3756724/pexels-photo-3756724.jpeg",
        communityName: "Yapping",
        membersCount: 351
    },
    {
        _id: 3,
        img: "https://images.pexels.com/photos/3759657/pexels-photo-3759657.jpeg",
        communityName: "Mind Relaxation",
        membersCount: 3168
    },
    {
        _id: 4,
        img: "https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg",
        communityName: "Sleep & Calm",
        membersCount: 27
    },
    {
        _id: 5,
        img: "https://images.pexels.com/photos/1557238/pexels-photo-1557238.jpeg",
        communityName: "Happiness",
        membersCount: 200
    },
    {
        _id: 6,
        img: "https://images.pexels.com/photos/3756724/pexels-photo-3756724.jpeg",
        communityName: "Yapping",
        membersCount: 351
    },
    {
        _id: 7,
        img: "https://images.pexels.com/photos/3759657/pexels-photo-3759657.jpeg",
        communityName: "Mind Relaxation",
        membersCount: 3168
    },
    {
        _id: 8,
        img: "https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg",
        communityName: "Sleep & Calm",
        membersCount: 27
    }
];

const CommunityList = ({ListHeader}) => {
    const renderItem = ({item}) => {
        return (
            <CommunityCard item={item} />
        )
    }
    return (
        <FlatList
            data={arr}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            ListHeaderComponent={ListHeader}
        />
    )
}

export default CommunityList

const styles = StyleSheet.create({})