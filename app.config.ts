import { ExpoConfig } from '@expo/config';

const config: ExpoConfig = {
  name: "Photo Hunt",
  slug: "photo-hunt",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
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
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-image-picker",
      {
        cameraPermission: "The app needs access to your camera."
      }
    ]
  ],
  scheme: "photo-hunt",
  extra: {
    googleCloudApiKey: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
  },
}

export default config;
