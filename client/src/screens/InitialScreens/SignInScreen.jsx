import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'

import { SafeAreaView } from 'react-native-safe-area-context'

import FormInput from '../../components/FormInput'
import FormButton from '../../components/FormButton'

const SignInScreen = ({navigation}) => {

    const [email, setEmail] = useState();
    const [password, setPassword] = useState();

    const signInHandler = () => {
        navigation.navigate("AppStack")
    };

    return (
        <SafeAreaView style={styles.Container}>
            <View style={styles.card}>
                <Text style={{ fontSize: 25, fontWeight: 'bold', color: '#333', marginBottom: 10 }}>Sign In</Text>
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
                <FormInput
                    iconType='EvilIcons'
                    iconName='lock'
                    iconSize={25}
                    placeholderText={'Password'}
                    labelValue={password}
                    onChangeText={(password) => setPassword(password)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                />
                <FormButton
                    buttonTitle='Sign In'
                    onPress={signInHandler}
                />
                <TouchableOpacity style={styles.ForgetBtn} onPress={() => { navigation.navigate("ForgotPassword") }}>
                    <Text style={styles.ForgetBtnTxt} >Forgot Password?</Text>
                </TouchableOpacity>
                <View style={styles.SignUpContainer}>
                    <Text style={styles.SignUpTxt}>
                        Create a New Account?
                    </Text>
                    <TouchableOpacity onPress={() => { navigation.navigate("SignUp") }}>
                        <Text style={[styles.SignInTxt, { color: '#2e64e5' }]} >Sign Up!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default SignInScreen

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
    ForgetBtn: {
        marginTop: 15,
        alignItems: 'center',
    },
    ForgetBtnTxt: {
        fontSize: 14,
        color: '#2e64e5',
        fontFamily: 'Lato-Regular',
    },
    SignUpContainer: {
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