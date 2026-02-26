import { ConfigContext, ExpoConfig } from 'expo/config';
const targetEnvironment = process.env.TARGET_ENVIRONMENT || 'local';
const firebaseTarget = require(`./firebase-config.${targetEnvironment}.js`);

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
            ...config.updates,
            fallbackToCacheTimeout: 0,
            url: process.env.EAS_UPDATE_URL
        },
        extra: {
            ...config.extra,
            firebase: {
                ...firebaseTarget
            },
            eas: {
                ...config.extra?.eas,
                projectId: process.env.EAS_PROJECT_ID
            }
        },
        assetBundlePatterns: [
            '**/*'
        ],
        ios: {
            ...config.ios,
            supportsTablet: true,
            bundleIdentifier: 'org.greenupvermont.app',
            googleServicesFile: './GoogleService-Info.plist',
            config: {
                ...config.ios?.config,
                googleMapsApiKey: process.env.IOS_GOOGLE_MAPS_API_KEY || ''
            }
        },
        android: {
            ...config.android,
            adaptiveIcon: {
                backgroundColor: '#E6F4FE',
                foregroundImage: './assets/images/android-icon-foreground.png',
                backgroundImage: './assets/images/android-icon-background.png',
                monochromeImage: './assets/images/android-icon-monochrome.png'
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: true,
            package: 'org.greenupvermont.app',
            googleServicesFile: './google-services.json',
            config: {
                ...config.android?.config,
                googleMaps: {
                    ...config.android?.config?.googleMaps,
                    apiKey: process.env.ANDROID_GOOGLE_MAPS_API_KEY || ''
                }
            }
        },
        web: {
            output: 'static',
            favicon: './assets/images/favicon.png'
        },
        plugins: [
            [
                'expo-location',
                {
                    locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.',
                }
            ],
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