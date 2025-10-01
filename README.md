# Image Captioning App (React Native / Expo)

A simple Image Captioning App built with **Expo React Native**. Users can signup, login, go through onboarding, add image/audio complaints, transcribe audio using Whisper API, save, share, and delete cards, and toggle dark/light theme using **Zustand**.

## Features

* Signup & Signin with JWT auth
* Onboarding screen
* Add image or record audio
* Audio transcription using Whisper API
* Save, delete, and share cards
* Dark & light theme toggle using Zustand
* Persistent storage with AsyncStorage

## Tech Stack

* Frontend: React Native (Expo), expo-image-picker, expo-av, AsyncStorage, Zustand
* Backend: Node.js, Express, MongoDB, Multer, JWT, bcryptjs

## Folder Structure

```
/app
  /assets
  /components
    ZustandStore.js
  /screens
    Signin.js
    Signup.js
    OnboardingScreen.js
    ComplaintScreen.js
    Index.js
/server
  index.js
  controllers/
  models/
  middleware/
  package.json
  .env
```

## Screens

* **Index.js**: checks onboarding & token
* **OnboardingScreen.js**: tutorial slides
* **Signup.js / Signin.js**: authentication
* **ComplaintScreen.js**: add image/audio, transcribe, share, delete, toggle theme

## Backend API

* **POST /register**: `{ name, email, password }` → returns `{ token, user }`
* **POST /login**: `{ email, password }` → returns `{ token, user }`
* **POST /upload**: `audio` (multipart/form-data) → returns `{ transcription }`

## Environment Variables

```
MONGO_URL=your_mongo_url
JWT_SECRET=your_jwt_secret
PORT=3000
EXPO_PUBLIC_API_URL=https://your-backend-url.com
```

## Setup

### Backend

```bash
cd server
npm install
node index.js
```

### Frontend

```bash
cd app
npm install
expo start
```

## Build APK

```bash
eas build -p android --profile apk
```

## Curl Examples

### Register

```bash
curl -X POST "https://your-backend.com/register" -H "Content-Type: application/json" -d '{"name":"John","email":"john@example.com","password":"123456"}'
```

### Login

```bash
curl -X POST "https://your-backend.com/login" -H "Content-Type: application/json" -d '{"email":"john@example.com","password":"123456"}'
```

### Upload audio

```bash
curl -X POST "https://your-backend.com/upload" -F "audio=@/path/to/audio.m4a"
```
