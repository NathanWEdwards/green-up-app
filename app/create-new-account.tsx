import { router } from 'expo-router';
import { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useSession } from '@/components/providers/session-provider';
import { defaultStyles } from '@/styles/default-styles';

export default function NewUser() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { newUser } = useSession();

    return (
        <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                style={{
                    ...styles.input,
                    width: '80%',
                    height: 40,
                    borderWidth: 1,
                    marginBottom: 10
                }}
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry={true}
                style={{
                    ...styles.input,
                    width: '80%',
                    height: 40,
                    borderWidth: 1,
                    marginBottom: 10
                }}
            />
            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    newUser(email, password);
                    router.replace('/');
                }}
            >
                <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
        </View>
    );
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
        marginBottom: 12
    },
    button: {
        backgroundColor: '#FA774E',
        borderStyle: 'solid',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: '#000'
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '600'
    },
    link: {
        color: '#0a84ff',
        marginTop: 6
    }
});

const styles = StyleSheet.create({ ...defaultStyles, ...pageStyles } as any);
