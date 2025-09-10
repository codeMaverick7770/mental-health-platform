import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const FormButton = ({ buttonTitle, ...rest }) => {
    return (
        <View>
            <TouchableOpacity style={styles.buttonContainer} onPress={rest.onPress}>
                <Text style={styles.buttonText}>{buttonTitle}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default FormButton

const styles = StyleSheet.create({
    buttonContainer: {
        backgroundColor: '#2e64e5',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        marginHorizontal: width * 0.20,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        fontFamily: 'Lato-Regular',
    },
})