import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    StyleSheet,
    TouchableWithoutFeedback,
    Keyboard,
    View,
    TextInput,
    TouchableOpacity,
    Text,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { defaultStyles } from '@/styles/default-styles';
import { createUser } from '@/data-sources/firebase-data-layer';
import { AppDispatch } from '@/store/configure-store';

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
        elevation: 2,
        marginTop: 10
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16
    }
});

const styles = StyleSheet.create({ ...defaultStyles, ...myStyles } as any);

const CreateNewAccountScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateAccount = async () => {
        if (!email || !password || !displayName) {
            Alert.alert('Error', 'Please fill out all fields', [
                { text: 'OK' }
            ]);
            return;
        }

        try {
            setLoading(true);
            await createUser(email, password, displayName, dispatch);
            router.replace('/');
        } catch (error: any) {
            Alert.alert('', error.message || 'Account Creation Failed', [
                { text: 'OK' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View
                    style={{
                        paddingLeft: 20,
                        paddingRight: 20,
                        flex: 1,
                        marginTop: 20,
                        justifyContent: 'flex-start'
                    }}
                >
                    <TextInput
                        style={styles.input}
                        placeholder="Name / Display Name"
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholderTextColor="#8b8b8b"
                    />
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
                        onPress={handleCreateAccount}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

export default CreateNewAccountScreen;
