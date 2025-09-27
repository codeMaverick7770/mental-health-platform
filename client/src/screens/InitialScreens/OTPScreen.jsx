import { Alert, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import baseServer from '../../utils/config';

const OTP_LENGTH = 6;

const OtpScreen = ({ navigation, route }) => {
    const { email, counter } = route.params;
    const [OTP, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const inputs = useRef([]);
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();

    const [count, setCount] = useState(60);

    useEffect(() => {
        if (count === 0) return;

        const timer = setInterval(() => {
            setCount(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [count]);

    const handleChange = (text, index) => {
        if (isNaN(text)) return;

        const newOtp = [...OTP];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < OTP_LENGTH - 1) {
            inputs.current[index + 1].focus();
        }
    };

    const handleBackspace = (key, index) => {
        if (key === 'Backspace' && OTP[index] === '' && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const otpValidate = async () => {
        const otp = OTP.join('');

        if (!email) {
            Alert.alert("Email is required.");
            return;
        }

        if (!counter && (!password || password.length < 8)) {
            Alert.alert("Password must contain at least 8 characters.");
            return;
        }

        try {
            let response;
            if(!counter){
                // For forgot password flow
                response = await axios.post(`${baseServer}/api/v1/auth/reset-password`, {
                    email,
                    password,
                    otp
                });
            }
            else{
                // For email verification flow
                response = await axios.post(`${baseServer}/api/v1/auth/verify-email`, {
                    email,
                    otp
                });
            }
            
            if (response.data.success) {
                navigation.navigate('SignIn');
            }
            else {
                Alert.alert("Something Went Wrong!");
                console.log(response.data.message);
            }

        } catch (err) {
            Alert.alert('OTP Verification Failed!!',
                err.response?.data?.message || 'Error'
            );
        }
    };

    const handleResend = () => {
        setCount(60);
    }

    return (
        <View style={styles.Container}>
            <View style={styles.card}>
                <Text style={styles.title}>OTP Verification</Text>
                {!counter && (
                    <>
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
                    </>
                )}
                <View style={styles.otpView}>
                    {OTP.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={ref => inputs.current[index] = ref}
                            style={[styles.inputView, { borderColor: digit ? 'royalblue' : 'grey' }]}
                            keyboardType="number-pad"
                            maxLength={1}
                            placeholder="-"
                            value={digit}
                            onChangeText={text => handleChange(text, index)}
                            onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
                        />
                    ))}
                </View>
                <View style={styles.resendBtn}>
                    <Text
                        style={{
                            fontSize: 15,
                            fontWeight: "700",
                            color: count === 0 ? 'royalblue' : 'grey'
                        }}
                        onPress={count === 0 ? handleResend : null}
                    >
                        Resend OTP
                    </Text>
                    {count > 0 && (
                        <Text style={{ marginLeft: 10, fontSize: 15 }}>{count + ' seconds'}</Text>
                    )}
                </View>
                <FormButton
                    buttonTitle={'Verify'}
                    onPress={otpValidate}
                />
            </View>
        </View>
    );
};

export default OtpScreen;

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
    title: {
        alignSelf: 'center',
        marginTop: 10,
        fontWeight: '700',
        fontSize: 28,
        color: '#333',
        marginBottom: 10,
    },
    otpView: {
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 40,
        marginBottom: 10,
    },
    inputView: {
        width: 45,
        height: 45,
        borderWidth: 3,
        borderRadius: 10,
        marginHorizontal: 2,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: "700",
        backgroundColor: '#f5f5f5',
    },
    resendBtn: {
        flexDirection: "row",
        alignSelf: 'center',
        marginTop: 30,
        marginBottom: 10,
    }
});
