import { ExpoConfig } from '@expo/config';

const config: ExpoConfig = {
  name: "Photo Hunt",
  slug: "photo-hunt",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*",
    "config/service-account.json"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.photohunt.app"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.photohunt.app"
  },
  extra: {
    googleCloudApiKey: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
  },
  plugins: [
    "expo-router"
  ]
}

export default config; 