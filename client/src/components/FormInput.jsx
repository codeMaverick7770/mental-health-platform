import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'

import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const ICON_SETS = {
    AntDesign,
    Feather,
    Entypo,
    FontAwesome,
    Ionicons,
    MaterialIcons,
    EvilIcons,
};

const FormInput = ({ iconType, iconName, iconSize, labelValue, placeholderText, ...rest }) => {
    const IconComponent = ICON_SETS[iconType];

    if (!IconComponent) {
        console.warn(`Invalid iconType "${iconType}" passed to CustomIcon`);
        return null;
    }
    return (
        <View style={styles.ContainerStyle}>
            <View style={styles.IconStyle}>
                <IconComponent name={iconName} size={iconSize} color='#666' />
            </View>
            <TextInput
                style={styles.InputStyle}
                placeholder={placeholderText}
                placeholderTextColor='#666'
                value={labelValue}
                numberOfLines={1}
                {...rest}
            />
        </View>
    )
}

export default FormInput

const styles = StyleSheet.create({
    ContainerStyle: {
        marginTop: 5,
        marginBottom: 10,
        width: '100%',
        height: height / 15,
        borderColor: '#ccc',
        borderRadius: 3,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    IconStyle: {
        padding: 10,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRightColor: '#ccc',
        borderRightWidth: 1,
        width: 50,
    },
    InputStyle: {
        padding: 10,
        flex: 1,
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    }
})