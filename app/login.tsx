import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useSession } from '@/components/providers/session-provider';
import { defaultStyles } from '@/styles/default-styles';

export default function SignIn() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { signIn } = useSession();

    return (

        <View testID='sign-in-view'
            style={styles.container}>
            <TextInput
                testID="email-input"
                placeholder="Email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#8b8b8b"
            />
            <TextInput
                testID="password-input"
                placeholder="Password"
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry={true}
                style={styles.input}
                placeholderTextColor="#8b8b8b"
            />
            <TouchableOpacity
                testID="submit-button"
                style={styles.button}
                onPress={async () => {
                    try {
                        await signIn(email, password);
                        router.replace('/');
                    } catch (error: any) {
                        Alert.alert(
                            "",
                            (error.message || "Login Failed"),
                            [
                                {
                                    text: "OK", onPress: () => {
                                    }
                                }
                            ],
                            { cancelable: false }
                        );
                    }
                }}
            >
                <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 40, flexDirection: 'column', alignItems: 'center' }}>
                {/* <TouchableOpacity
                    testID="forgot-password-button"
                    style={styles.SecondaryButton}
                    onPress={() => {
                        router.push('/forgot-password');
                    }}
                >
                    <Text style={styles.buttonText}>Reset password</Text>
                </TouchableOpacity> */}
                <Link
                    testID="forgot-password-button"
                    style={styles.link} href="/forgot-password" >
                    Reset Password
                </Link>
                <Link
                    testID="create-account-button"
                    style={styles.link} href="/create-new-account" >
                    Create New Account
                </Link>
                {/* <TouchableOpacity
                    testID="create-account-button"
                    style={styles.SecondaryButton}
                    onPress={() => {
                        router.push('/create-new-account');
                    }}
                >
                    <Text style={styles.buttonText}>Create account</Text>
                </TouchableOpacity> */}
            </View>
        </View >
    )
}

const pageStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#ffffff'
    },
    input: {
        width: '80%',
        height: 48,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d0d0d0',
        backgroundColor: '#fbfbfb',
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#FA774E',
        borderStyle: 'solid',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: "#000",
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    link: {
        flexDirection: 'column',
        color: '#0a84ff',
        marginVertical: 6,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

const styles = StyleSheet.create({ ...defaultStyles, ...pageStyles } as any);
