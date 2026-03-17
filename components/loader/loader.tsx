import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { defaultStyles } from '@/styles/default-styles';

const styles = StyleSheet.create({ ...defaultStyles } as any);

export default function Loader({ message }: { message: string }) {
    return (
        <SafeAreaView style={styles.container}>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: 'white', fontSize: 16, marginTop: 12 }}>
                    {message}
                </Text>
            </View>
        </SafeAreaView>
    );
}
