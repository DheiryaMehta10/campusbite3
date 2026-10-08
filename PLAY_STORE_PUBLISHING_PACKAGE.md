# 🚀 UniBite Google Play Store Production Publishing Package

This document contains all production configurations, store listing metadata, keystore signing details, and release build procedures for **UniBite Student** and **UniBite Restaurant**.

---

## 📱 APPS TO PUBLISH (2 TOTAL)

### APP 1: UniBite Student
- **App Display Name:** `UniBite Student`
- **Package ID:** `com.unibite.student`
- **Category:** Food & Drink
- **Target Audience / Content Rating:** Everyone (13+)
- **Short Description:** Smart campus food delivery straight to your hostel lobby.
- **Full Description:**
  ```
  UniBite is an easy-to-use food ordering app designed specifically for campus students. Browse campus restaurants and canteens, place orders with scheduled batch delivery waves, track deliveries in real-time, and enjoy hot meals delivered right to your hostel or campus drop-off point with zero delivery hassles. Perfect for busy student life, late-night study sessions, and quick campus snacking.
  ```
- **Privacy Policy URL:** `https://www.privacypolicy.com/live/Unibite.html`
- **Support Email:** `support@Unibite.com`
- **Pricing:** Free
- **Live Production Web URL:** `https://student-app-xi-bice.vercel.app`

---

### APP 2: UniBite Restaurant
- **App Display Name:** `UniBite Restaurant`
- **Package ID:** `com.unibite.restaurant`
- **Category:** Food & Drink
- **Target Audience / Content Rating:** Everyone (13+)
- **Short Description:** Partner restaurant management & live order fulfillment for campus canteens.
- **Full Description:**
  ```
  UniBite Restaurant app empowers campus food vendors and canteen partners to manage their food orders efficiently. Accept and track incoming student orders, manage menu catalogs, toggle item availability in real-time, batch prepare meals for delivery slots, and monitor live delivery waves. Designed for campus food operators to streamline kitchen operations and grow revenue.
  ```
- **Privacy Policy URL:** `https://www.privacypolicy.com/live/Unibite.html`
- **Support Email:** `support@Unibite.com`
- **Pricing:** Free
- **Live Production Web URL:** `https://restaurant-app-gamma-seven.vercel.app`

---

## 🔐 PRODUCTION KEYSTORE & SIGNING CREDENTIALS

> [!IMPORTANT]
> A 2048-bit RSA release signing keystore has been generated at `C:\Users\dheir\Campusbite\unibite-release.jks`.
> **Do NOT delete or lose this file.** It is required for all future app updates on Google Play.

| Property | Value |
| :--- | :--- |
| **Keystore File** | `unibite-release.jks` |
| **Keystore Path** | `C:\Users\dheir\Campusbite\unibite-release.jks` |
| **Key Alias** | `unibite` |
| **Keystore Password** | `UniBite@2026` |
| **Key Password** | `UniBite@2026` |
| **Algorithm** | RSA 2048-bit |
| **Validity** | 10,000 days (~27 years) |

---

## 🛠️ BUILD & GENERATE PRODUCTION ARTIFACTS (.AAB / .APK)

Google Play Console requires **Android App Bundles (.aab)** for all new production releases.

### 1. Build Student App (`apps/student-app`):
```bash
cd apps/student-app
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap copy android
npx cap sync android

# Build Release AAB / APK:
cd android
./gradlew bundleRelease
```
Signed AAB will be output to: `apps/student-app/android/app/build/outputs/bundle/release/app-release.aab`

---

### 2. Build Restaurant App (`apps/restaurant-app`):
```bash
cd apps/restaurant-app
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap copy android
npx cap sync android

# Build Release AAB / APK:
cd android
./gradlew bundleRelease
```
Signed AAB will be output to: `apps/restaurant-app/android/app/build/outputs/bundle/release/app-release.aab`

---

## 📋 GOOGLE PLAY CONSOLE SUBMISSION CHECKLIST

1. **Create App in Play Console**:
   - Go to [Google Play Console](https://play.google.com/console).
   - Click **Create App** > Choose `UniBite Student` / `UniBite Restaurant`.
   - Default language: English (United States / India).
   - App or game: **App** | Free or paid: **Free**.

2. **Set up Store Presence**:
   - Paste the **Short Description** and **Full Description** provided above.
   - Upload **App Icon** (512x512 PNG, 32-bit color).
   - Upload **Feature Graphic** (1024x500 PNG/JPG).
   - Upload at least **2 Phone Screenshots** (1080x1920 PNG).

3. **App Content & Policy Declarations**:
   - **Privacy Policy**: Enter `https://www.privacypolicy.com/live/Unibite.html`.
   - **App Access**: All functionality is available without special access (or provide student test login).
   - **Ads**: Select *No, my app does not contain ads*.
   - **Content Rating**: Complete questionnaire > Rating will be *Everyone*.
   - **Target Audience**: 13+ (Students & Young Adults).
   - **Financial Features / Government Apps**: Select *No*.

4. **Production Release Track**:
   - Go to **Release** > **Production** > **Create New Release**.
   - Upload the signed `app-release.aab` bundle.
   - Release name: `1.0.0 (1)`.
   - Release notes: `Initial production release of UniBite for campus food delivery.`
   - Click **Next** > Review and click **Start Rollout to Production**.

5. **Approval Time**:
   - Google typically approves new submissions within **24–48 hours**.
