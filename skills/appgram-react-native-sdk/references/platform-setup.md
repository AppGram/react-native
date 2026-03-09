# Platform setup & debugging

## Install & link
1) `npm install @appgram/react-native`
2) `npm install @react-native-async-storage/async-storage lucide-react-native react-native-svg react-native-markdown-display react-native-render-html`
3) iOS: `npx pod-install` (or `cd ios && pod install`).
4) Android: open Android Studio/Gradle sync or run `cd android && ./gradlew :app:assembleDebug` once to verify linking.

## Minimum versions
- React Native ≥0.70, React 18.
- react-native-svg ≥13, lucide-react-native ≥0.300.

## Common fixes
- Metro cache: `npm start -- --reset-cache`
- Watchman: `watchman watch-del-all` (if installed)
- Android clean build: `cd android && ./gradlew clean && ./gradlew :app:assembleDebug`
- iOS clean pods: `cd ios && rm -rf Pods Podfile.lock && pod install`
- Hermes mismatch: ensure RN version default Hermes enabled; if disabling Hermes, rebuild pods.
- Missing SVG icons: reinstall `react-native-svg` and `lucide-react-native`, then rebuild pods / Gradle.

## iOS notes
- If using Xcode, ensure the pods integrate with `use_frameworks!` defaults; no extra manual steps needed.
- For simulator fingerprinting issues, reset simulator content or clear AsyncStorage: `xcrun simctl erase all` (destructive) or uninstall the app.

## Android notes
- Ensure `mavenCentral()` is present in `android/build.gradle`.
- If release build crashes on SVG, check ProGuard/R8 rules; typically not needed, but you can keep `-keep class com.horcrux.svg.** { *; }` as a safeguard.
- AsyncStorage failing on Android emulator: wipe data via AVD Manager or reinstall app.

## Web (Expo / RNW)
- Components assume native; hooks can be used in Expo if dependencies are available; check markdown/html render libs compatibility on web.

## Validation checklist before shipping
- Run `npm run lint` and `npm run typecheck`.
- Build once: `npm run build` to ensure bob output.
- For app integrators: verify one happy-path flow per feature (wishlist vote, support submit, survey submit, blog post view, status load) on both platforms.
