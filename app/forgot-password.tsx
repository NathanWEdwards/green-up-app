import React, { useState, Fragment } from 'react';
import { Alert, StyleSheet, View, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { isValidEmail } from '@/libs/validators';
import { resetPassword } from '@/data-sources/firebase-data-layer';
import { defaultStyles } from '@/styles/default-styles';
import { PrimaryButton, SecondaryButton } from '@/components/button';

const myStyles = StyleSheet.create({
    input: {
        width: '100%',
        height: 48,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d0d0d0',
        backgroundColor: '#fbfbfb',
        marginBottom: 12,
        color: '#333'
    },
    messageContainer: {
        marginBottom: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 20,
        borderRadius: 8
    },
    messageText: {
        textAlign: 'center',
        color: '#FFF',
        fontSize: 16,
        lineHeight: 24
    }
});

const styles = StyleSheet.create({ ...defaultStyles, ...myStyles } as any);

const ForgotPasswordScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordResetSent, setPasswordResetSent] = useState(false);

    const onButtonPress = async () => {
        const trimmedEmail = email.trim();
        if (isValidEmail(trimmedEmail)) {
            try {
                setLoading(true);
                await resetPassword(trimmedEmail);
                setPasswordResetSent(true);
            } catch (error: any) {
                Alert.alert(
                    'Error',
                    error.message || 'Failed to send password reset email.',
                    [{ text: 'OK' }]
                );
            } finally {
                setLoading(false);
            }
        } else {
            Alert.alert('Invalid Email', 'Please enter a valid email address', [
                { text: 'OK' }
            ]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View
                style={{
                    paddingLeft: 20,
                    paddingRight: 20,
                    flex: 1,
                    paddingTop: 50
                }}
            >
                {passwordResetSent ? (
                    <Fragment>
                        <View style={styles.messageContainer}>
                            <Text style={styles.messageText}>
                                A link to reset your password has been sent to
                                your email.
                            </Text>
                        </View>
                        <View style={styles.formControl}>
                            <SecondaryButton onPress={() => router.back()}>
                                <Text
                                    style={{
                                        textAlign: 'center',
                                        color: '#FFF',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    RETURN TO LOGIN
                                </Text>
                            </SecondaryButton>
                        </View>
                    </Fragment>
                ) : (
                    <Fragment>
                        <View style={styles.formControl}>
                            <Text
                                style={[
                                    styles.label,
                                    { color: 'white', marginBottom: 10 }
                                ]}
                            >
                                Email Address
                            </Text>
                            <TextInput
                                style={styles.input}
                                autoCorrect={false}
                                value={email}
                                keyboardType="email-address"
                                placeholder="you@domain.com"
                                placeholderTextColor="#8b8b8b"
                                onChangeText={setEmail}
                                underlineColorAndroid="transparent"
                            />
                        </View>
                        <View style={styles.formControl}>
                            <PrimaryButton
                                onPress={onButtonPress}
                                disabled={loading}
                            >
                                <MaterialCommunityIcons
                                    name="account-convert"
                                    style={{ marginRight: 10 }}
                                    size={25}
                                    color="#555"
                                />
                                <Text
                                    style={{
                                        textAlign: 'center',
                                        color: '#555',
                                        fontFamily: 'Rubik-Regular',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {loading ? 'SENDING...' : 'RESET PASSWORD'}
                                </Text>
                            </PrimaryButton>
                        </View>
                    </Fragment>
                )}
            </View>
        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;
