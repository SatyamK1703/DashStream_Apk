# DashStream Apk

This is the frontend for the DashStream application. It is a React Native application built with Expo.

## Available Scripts

In the project directory, you can run:

| Script            | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `npm start`       | Runs the app in development mode.                       |
| `npm run android` | Runs the app on a connected Android device or emulator. |
| `npm run ios`     | Runs the app on the iOS simulator.                      |
| `npm run web`     | Runs the app in a web browser.                          |
| `npm run lint`    | Lints the code using ESLint and Prettier.               |
| `npm run format`  | Formats the code using ESLint and Prettier.             |

## Dependencies

The main dependencies are:

- `expo`
- `react`
- `react-native`
- `nativewind` for Tailwind CSS
- `@react-navigation` for navigation
- `axios` for API requests
- `zustand` for state management

For a full list of dependencies, see `package.json`.

If you just want to run locally for testing:

```bash
npx expo prebuild
cd android
./gradlew assembleDebug
```

If you want to generate a signed APK or AAB for release:

```bash
npx expo prebuild
cd android
./gradlew assembleRelease      # APK build
# or
./gradlew bundleRelease        # Play Store bundle
```
