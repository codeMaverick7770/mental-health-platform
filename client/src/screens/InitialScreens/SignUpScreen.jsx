import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'

import { SafeAreaView } from 'react-native-safe-area-context';

import FormInput from '../../components/FormInput'
import FormButton from '../../components/FormButton'
import baseServer from '../../utils/config';

const SignUpScreen = ({ navigation }) => {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();

    const signUpHandler = async () => {
        //return navigation.navigate("MainTab");
        if (!email || !password) {
            Alert.alert("All fields are mandatory.");
            return;
        }

        if (password.length < 8) {
            Alert.alert("Password must contain alteast 8 characters.");
            return;
        }

        try {
            const response = await axios.post(`${baseServer}`, {
                email,
                password,
            });

            if (response.data.success) {
                navigation.navigate("OtpScreen", {
                    email,
                    counter: 1
                });
            }
            else {
                Alert.alert("Something Went Wrong!");
                console.log(response.data.message);
            }

        } catch (err) {
            Alert.alert('Sign Up Failed!!',
                err.response?.data?.message || 'Error'
            );
        }
    };

    return (
        <SafeAreaView style={styles.Container}>
            <View style={styles.card}>
                <Text style={styles.HeaderTxt}>Create an account</Text>
                <FormInput
                    iconType='Feather'
                    iconName='user'
                    iconSize={17}
                    placeholderText={'University Name'}
                    labelValue={name}
                    onChangeText={(name) => setName(name)}
                    autoCorrect={false}
                />
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
                <FormInput
                    iconType='EvilIcons'
                    iconName='lock'
                    iconSize={25}
                    placeholderText={'Confirm Password'}
                    labelValue={confirmPassword}
                    onChangeText={(confirmPassword) => setConfirmPassword(confirmPassword)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                />
                <FormButton
                    buttonTitle={'Sign Up'}
                    onPress={signUpHandler}
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
            <View style={styles.TCcontainer}>
                <Text style={styles.TCtxt}>
                    By registering, you confirm that you have accepted our
                </Text>
                <TouchableOpacity>
                    <Text style={[styles.TCtxt, { color: '#ffc400ff' }]} onPress={() => { navigation.navigate("SignIn") }}>Terms of service</Text>
                </TouchableOpacity>
                <Text style={styles.TCtxt}> and </Text>
                <TouchableOpacity>
                    <Text style={[styles.TCtxt, { color: '#ffc400ff' }]} onPress={() => { navigation.navigate("SignIn") }}>Privacy policy</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default SignUpScreen

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
    },
    TCcontainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        marginVertical: 35,
        flexWrap: "wrap",
    },
    TCtxt: {
        fontSize: 13,
        fontWeight: '400',
        color: 'white',
    },
})