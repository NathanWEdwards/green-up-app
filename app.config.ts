import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
    return {
        ...config,
        name: 'green.up',
        slug: 'green-up',
        scheme: 'green-up',
        newArchEnabled: true,
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/images/app-icon.png',
        userInterfaceStyle: 'automatic',
        splash: {
            image: './assets/images/splash.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff'
        },
        updates: {
            fallbackToCacheTimeout: 0
        },
        assetBundlePatterns: [
            '**/*'
        ],
        ios: {
            supportsTablet: true,
            bundleIdentifier: 'org.greenupvermont.app',
            googleServicesFile: './GoogleService-Info.plist',
        },
        android: {
            adaptiveIcon: {
                backgroundColor: '#E6F4FE',
                foregroundImage: './assets/images/android-icon-foreground.png',
                backgroundImage: './assets/images/android-icon-background.png',
                monochromeImage: './assets/images/android-icon-monochrome.png'
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: true,
            package: 'org.greenupvermont.app',
            googleServicesFile: './google-services.json'
        },
        web: {
            output: 'static',
            favicon: './assets/images/favicon.png'
        },
        plugins: [
            'expo-router',
            [
                'expo-build-properties',
                {
                    'ios': {
                        'useFrameworks': 'static',
                        'buildReactNativeFromSource': true
                    }
                }
            ],
            [
                'expo-splash-screen',
                {
                    image: './assets/images/splash-icon.png',
                    imageWidth: 200,
                    resizeMode: 'contain',
                    backgroundColor: '#ffffff',
                    dark: {
                        backgroundColor: '#000000'
                    }
                }
            ],
            '@react-native-firebase/app',
            '@react-native-firebase/auth'
        ],
        experiments: {
            typedRoutes: true,
            reactCompiler: true
        }
    };
}