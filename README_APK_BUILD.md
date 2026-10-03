# QuakeGuard APK Building & Packaging Guide

This directory contains the complete Android source code and Gradle build configuration for **QuakeGuard**.

## 📦 How to Build the `.apk` File

### Method 1: Using the Automated Build Script (Recommended)
1. Navigate to `scratch/quakeguard/mobile/`.
2. Double-click [`build_apk.bat`](file:///C:/Users/praji/.gemini/antigravity/scratch/quakeguard/mobile/build_apk.bat).
3. The script will compile the release APK and place it at:
   `scratch/quakeguard/mobile/build/app/outputs/flutter-apk/app-release.apk`

---

### Method 2: Instant Web-to-APK (PWABuilder / Bubblewrap)
Since QuakeGuard includes a PWA Service Worker (`sw.js`) and Web Manifest (`manifest.json`):
1. Open [PWABuilder.com](https://www.pwabuilder.com).
2. Enter your QuakeGuard web URL or upload `manifest.json`.
3. Click **Package for Android** to generate the signed `.apk` file instantly.

---

### Method 3: Using Flutter Command Line
If you have the Flutter SDK installed:
```bash
cd C:\Users\praji\.gemini\antigravity\scratch\quakeguard\mobile
flutter pub get
flutter build apk --release
```
The output APK file will be located at:
`mobile/build/app/outputs/flutter-apk/app-release.apk`
