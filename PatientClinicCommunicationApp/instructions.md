# Building and Installing the Patient Clinic Communication App APK

This guide will walk you through the process of building an APK for the Patient Clinic Communication App and installing it on your Android device.

## Prerequisites

- Node.js and npm installed on your computer
- Java Development Kit (JDK) 11 or newer
- Android SDK installed (typically comes with Android Studio)
- USB debugging enabled on your Android device

## Building the APK

### Step 1: Install Project Dependencies

First, make sure all project dependencies are installed:

```bash
npm install
```

### Step 2: Prepare Gradle (If You Have Network Issues)

If you encounter network issues when Gradle tries to download its distribution, you can manually download and configure it:

1. Download Gradle 8.0.1 manually from https://services.gradle.org/distributions/gradle-8.0.1-all.zip
2. Place the downloaded zip file in one of these locations:
   - `C:\Users\[YourUsername]\.gradle\wrapper\dists\gradle-8.0.1-all\[some-hash]\`
   - Or modify the `distributionUrl` in `android\gradle\wrapper\gradle-wrapper.properties` to point to your local file:
     ```
     distributionUrl=file\:///C:/path/to/gradle-8.0.1-all.zip
     ```

### Step 3: Build the Release APK

Run the build command:

```bash
npm run build-android
```

This command executes `cd android && gradlew assembleRelease`, which builds the release version of the APK.

If you prefer to run the commands manually, you can:

```bash
cd android
.\gradlew.bat assembleRelease
```

### Step 4: Find the Generated APK

After a successful build, the APK will be located at:

```
android\app\build\outputs\apk\release\app-release.apk
```

## Installing the APK on Your Android Device

### Method 1: Using a USB Cable

1. Connect your Android device to your computer with a USB cable
2. Enable file transfer mode on your device
3. Copy the APK file to your device
4. On your device, use a file manager to locate and tap the APK to install it
   - You may need to enable "Install from Unknown Sources" in your device settings

### Method 2: Using ADB (Android Debug Bridge)

1. Connect your device via USB and ensure USB debugging is enabled
2. Open a command prompt and run:
   ```bash
   adb install -r android\app\build\outputs\apk\release\app-release.apk
   ```

## Troubleshooting

### Signing Issues

The current configuration uses the debug keystore for signing the release build. For a production app, you should generate your own keystore:

1. Generate a keystore:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Modify `android\app\build.gradle` to use your keystore:
   ```gradle
   signingConfigs {
       release {
           storeFile file('path/to/my-release-key.keystore')
           storePassword 'your-store-password'
           keyAlias 'my-key-alias'
           keyPassword 'your-key-password'
       }
   }
   buildTypes {
       release {
           signingConfig signingConfigs.release
           ...
       }
   }
   ```

### Network Issues

If you continue to have network issues:
1. Check your internet connection
2. Configure Gradle to use a proxy if you're behind one
3. Try using a VPN if certain domains are blocked in your network

## Notes

- The generated APK is not optimized for the Play Store. For Play Store distribution, you would need to use Android App Bundle format.
- The current version of the app is 1.0 (versionCode 1, versionName "1.0")
- The application ID is "com.patientclinic.app"