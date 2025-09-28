import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import BackButton from './BackButton';

const { width } = Dimensions.get('window');

const SharedHeader = ({ title = '', leftComponent = null }) => {

    return (
        <View
            style={
                styles.header}
        >
            <BackButton />
            <Text style={styles.headerText}>{title}</Text>
        </View>
    );
};

export default SharedHeader;

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        zIndex: 10,
        height: 60,
        width: width,
        backgroundColor: '#1e1e1ea7',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        gap: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#034b3ed5',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
});