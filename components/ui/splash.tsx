import { useSession } from '@/components/providers/session-provider';
import { SplashScreen } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export function Splash() {
    const { isLoading } = useSession();

    if (!isLoading) {
        SplashScreen.hideAsync();
    }

    return null;
}
