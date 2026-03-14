import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Alert,
    Image,
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import logo from '@/assets/images/2021_sticker_glowed.png';
import { defaultStyles } from '@/styles/default-styles';
import * as constants from '@/styles/constants';
import { LineDivider } from '@/components/divider';
import { SecondaryButton } from '@/components/button';
import { loginWithEmailPassword } from '@/data-sources/firebase-data-layer';
import { AppDispatch } from '@/store/configure-store';

const myStyles = StyleSheet.create({
    logo: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 5,
        marginTop: 50
    },
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
    button: {
        backgroundColor: '#FA774E',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16
    }
});

const styles = StyleSheet.create({ ...defaultStyles, ...myStyles } as any);

const LoginScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password', [
                { text: 'OK' }
            ]);
            return;
        }

        try {
            setLoading(true);
            await loginWithEmailPassword(email, password, dispatch);
            router.replace('/');
        } catch (error: any) {
            Alert.alert('', error.message || 'Login Failed', [{ text: 'OK' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ paddingLeft: 20, paddingRight: 20 }}>
                {!isKeyboardVisible && (
                    <View style={styles.logo}>
                        <Image
                            source={logo}
                            style={{ height: 120, width: 120 }}
                        />
                    </View>
                )}

                <View>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#8b8b8b"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                        placeholderTextColor="#8b8b8b"
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>

                    <LineDivider />

                    <View
                        style={{
                            marginTop: 40,
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}
                    >
                        <SecondaryButton
                            onPress={() => router.push('/forgot-password')}
                            style={{ width: '48%' }}
                        >
                            <MaterialCommunityIcons
                                name="account-convert"
                                size={25}
                                style={{ marginRight: 10 }}
                                color="#FFF"
                            />
                            <Text style={{ color: 'white' }}>
                                RESET PASSWORD
                            </Text>
                        </SecondaryButton>
                        <SecondaryButton
                            onPress={() => router.push('/create-new-account')}
                            style={{ width: '48%' }}
                        >
                            <MaterialCommunityIcons
                                name="account-plus"
                                size={25}
                                style={{ marginRight: 10 }}
                                color="#FFF"
                            />
                            <Text style={{ color: 'white' }}>
                                CREATE ACCOUNT
                            </Text>
                        </SecondaryButton>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default LoginScreen;
