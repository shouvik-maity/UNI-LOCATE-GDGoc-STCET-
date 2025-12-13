# 🎓 UNI LOCATE - Lost & Found System

A smart Lost & Found system for campus students built with Next.js 14, TailwindCSS, MongoDB, Firebase, and Gemini AI.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
/uni-locate
  /app                 # Next.js App Router pages
    /lost              # Lost item submission page
    /found             # Found item submission page
    /explore           # Item gallery/explore page
    /chat              # Real-time chat page
    /admin             # Admin dashboard page
  /components          # Reusable React components
  /lib                 # Utility libraries and helpers
  /models              # MongoDB/Mongoose models
  /utils               # Utility functions
  /api                 # API routes and endpoints
  /firebase            # Firebase configuration
  /styles              # Global styles and TailwindCSS
```

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TailwindCSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB + Mongoose** - Database
- **Firebase Auth** - Student email authentication
- **Firebase Firestore** - Real-time chat
- **Gemini AI** - Image recognition and matching

## ⚙️ Configuration

### 🎓 **New to Coding?**
**👉 [Start with BEGINNER_GUIDE.md - Complete step-by-step instructions for non-coders](./BEGINNER_GUIDE.md)**

### 👨‍💻 **Have Coding Experience?**
**📖 [See CONFIGURATION.md for technical setup instructions](./CONFIGURATION.md)**

### Quick Reference:
1. **MongoDB**: Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and get connection string
2. **Firebase**: Create project at [Firebase Console](https://console.firebase.google.com/) and enable Auth + Firestore
3. **Gemini AI**: Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
4. **Environment Variables**: Create `.env.local` file and fill in your credentials (see guides above)

## 📝 Development Status

This project is currently in the scaffolding phase. Core features will be implemented step by step.

## 📄 License

This project is for educational purposes.

