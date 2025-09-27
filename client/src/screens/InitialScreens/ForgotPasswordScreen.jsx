import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import axios from 'axios'

import { SafeAreaView } from 'react-native-safe-area-context'
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import baseServer from '../../utils/config';

const ForgotPasswordScreen = ({navigation}) => {
    const [email, setEmail] = useState();

    const forgotPasswordHandler = async () => {
        if (!email) {
            Alert.alert("Email is required.");
            return;
        }

        try {
            const response = await axios.post(`${baseServer}/api/v1/auth/forgot-password`, {
                email,
            });

            if (response.data.success) {
                navigation.navigate("OtpScreen", {
                    email,
                    counter: 0
                });
            }
            else {
                Alert.alert("Something Went Wrong!");
                console.log(response.data.message);
            }

        } catch (err) {
            Alert.alert('Forgot Password Failed!!',
                err.response?.data?.message || 'Error'
            );
        }
    };

    return (
        <SafeAreaView style={styles.Container}>
            <View style={styles.card}>
                <Text style={styles.HeaderTxt}>Forgot password!</Text>
                <FormInput
                    iconType='Feather'
                    iconName='user'
                    iconSize={17}
                    placeholderText={'University Mail ID'}
                    labelValue={email}
                    onChangeText={(email) => setEmail(email)}
                    keyboardType='email-address'
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <FormButton
                    buttonTitle='Send OTP'
                    onPress={forgotPasswordHandler}
                />
                <View style={styles.SignInContainer}>
                    <Text style={styles.SignInTxt}>
                        Already have an Account?
                    </Text>
                    <TouchableOpacity>
                        <Text style={[styles.SignInTxt, { color: '#2e64e5' }]} onPress={() => { navigation.navigate("SignIn") }}>Sign In!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default ForgotPasswordScreen

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#034b3ed5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 4,
        alignItems: 'center',
    },
    HeaderTxt: {
        fontSize: 25,
        fontWeight: 'bold',
        fontFamily: 'Lato-Regular',
        color: '#333',
        marginBottom: 10,
    },
    SignInContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 15,
        gap: 5,
    },
    SignInTxt: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
    },
})