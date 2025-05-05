# TaraApp 🚀
**Your Ultimate Travel Companion App**

TaraApp is a mobile application designed to enhance group travel experiences by integrating real-time geolocation, weather forecasts, trip planning, emergency alerts, and group coordination into one powerful app. Built with **React Native** using **Expo**, **Node.js**, **Firebase**, and **CouchDB**, TaraApp ensures a seamless travel experience—online or offline.

---

## 📱 Features

### 🗺 Location & Navigation
- Live GPS tracking of individual and group members
- Set routes from Point A to B with estimated time and distance
- Transport mode selection: Walk, Bike, Car, etc.

### 🌦 Weather Integration
- Real-time weather info using **Open-Meteo API**
- Weekly and monthly forecasts
- Weather alerts for planned trips

### 🧳 Itineraries
- Create, edit, and delete personal or group itineraries
- Add places of interest
- Cache itineraries for offline access

### 👥 Group Travel
- Create and manage travel groups
- Share live location with group members
- Real-time group chat feature

### 🚨 Emergency Alert System
- One-tap emergency button
- Auto-SMS to registered emergency contact
- Shows nearest hospital, police, and fire stations

### 🔐 User Authentication
- Sign in with:
  - Google (OAuth 2.0)
  - Facebook
  - Email/Password
  - Guest/Anonymous login
- Two-Factor Authentication (Gmail users)

---

## 🧰 Tech Stack

| Layer | Tools |
|------|-------|
| Frontend | React Native (Expo), Leaflet.js |
| Backend | Node.js, Express.js |
| Auth | Firebase Authentication |
| Database | CouchDB (Cloud), AsyncStorage (Offline) |
| Maps | OpenStreetMap (via Leaflet & Nominatim) |
| Weather API | Open-Meteo |
| Location | Expo Location |
| Messaging | Socket.IO (for group chat and live location sharing) |

---

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/your-username/TaraApp.git
cd TaraApp

# Install dependencies
npm install

# Start the Expo server
npx expo start
