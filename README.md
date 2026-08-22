# Blood Sync 

Blood Sync is an intelligent blood bank management system built with React Native and Expo, designed to streamline blood inventory control and access management for healthcare facilities.

## Features

-  Cross-platform mobile application (iOS & Android)
-  Real-time blood inventory tracking
-  RFID-based blood bag management
-  Dashboard with inventory overview
-  Expiry date tracking
-  Blood type management
-  Add new blood bags
-  Remove blood bags from inventory

## Tech Stack

- React Native with Expo
- React Native Paper (UI Components)
- AsyncStorage for local data persistence
- Material Community Icons
- Custom theming system

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Nayuraikar/Blood-Sync.git
cd Blood-Sync
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the Expo development server
```bash
npx expo start
```

4. Running the app
- Scan the QR code with your mobile device using the Expo Go app (Android) or Camera app (iOS)
- Press 'i' to open in iOS simulator (requires Xcode)
- Press 'a' to open in Android emulator (requires Android Studio)

## Project Structure

```
Blood-Sync/
├── components/         # Reusable UI components
├── navigation/         # Navigation configuration
├── utils/             # Utility functions and theme
├── assets/            # Images and other static assets
├── App.js             # Root component
└── package.json       # Project dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

