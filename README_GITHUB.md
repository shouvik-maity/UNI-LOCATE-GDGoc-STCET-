# 🎓 UniLocate - Smart Lost & Found System

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-cyan?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

A modern, AI-powered lost & found management system designed specifically for university campuses. Built with cutting-edge web technologies and optimized for mobile performance.

## ✨ Features

### 🔍 **Smart Item Management**
- **AI-Powered Image Recognition** - Automatic item categorization and description generation
- **Advanced Search & Filtering** - Find items by category, location, date, or keywords
- **Real-time Matching System** - AI suggests potential matches between lost and found items
- **Image Compression** - Automatic optimization for faster loading (1MB limit)

### 👥 **User Experience**
- **Secure Authentication** - Firebase-powered email/password authentication
- **Mobile-First Design** - Optimized for smartphones and tablets
- **Drag & Drop Upload** - Intuitive image upload interface
- **Real-time Notifications** - Instant updates on item status changes

### 🛠️ **Admin Dashboard**
- **Comprehensive Analytics** - Track lost/found item statistics
- **Bulk Management** - Update multiple items simultaneously
- **Pagination Controls** - Handle large datasets efficiently
- **Status Management** - Mark items as returned, resolved, or archived

### 📱 **Performance Optimized**
- **Mobile Performance** - Loads in under 2 seconds on mobile devices
- **Lazy Loading** - Efficient data loading with pagination
- **Image Optimization** - Compressed images for faster uploads
- **Responsive Design** - Works seamlessly across all device sizes

## 🚀 Tech Stack

### **Frontend**
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React](https://reactjs.org/)** - UI library

### **Backend & Database**
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling
- **[Next.js API Routes](https://nextjs.org/docs/api-routes)** - Serverless API endpoints

### **Authentication & Services**
- **[Firebase Authentication](https://firebase.google.com/products/auth)** - User authentication
- **[Firebase Firestore](https://firebase.google.com/products/firestore)** - Real-time database (planned)

### **AI & Analytics**
- **[Gemini AI](https://ai.google.dev/)** - Image recognition and analysis
- **[Google AI Studio](https://makersuite.google.com/)** - AI model integration

### **Development Tools**
- **[ESLint](https://eslint.org/)** - Code linting
- **[PostCSS](https://postcss.org/)** - CSS processing
- **[npm](https://www.npmjs.com/)** - Package management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ 
- **npm** or **yarn** package manager
- **Git** for version control

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/unilocate.git
cd unilocate
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/unilocate

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
unilocate/
├── 📁 app/                    # Next.js 14 App Router
│   ├── 📁 admin/             # Admin dashboard
│   ├── 📁 api/               # API routes
│   ├── 📁 chat/              # Chat functionality
│   ├── 📁 explore/           # Item exploration
│   ├── 📁 found/             # Found item reporting
│   ├── 📁 login/             # User authentication
│   ├── 📁 lost/              # Lost item reporting
│   └── layout.tsx            # Root layout
├── 📁 components/            # Reusable React components
├── 📁 lib/                   # Utility libraries
├── 📁 models/                # MongoDB/Mongoose models
├── 📁 utils/                 # Utility functions
├── 📁 styles/                # Global styles
├── 📄 package.json           # Dependencies
├── 📄 next.config.js         # Next.js configuration
├── 📄 tailwind.config.js     # Tailwind CSS config
└── 📄 tsconfig.json          # TypeScript configuration
```

## 🔧 Configuration Guides

### **For Beginners**
👉 **[BEGINNER_GUIDE.md](./BEGINNER_GUIDE.md)** - Step-by-step instructions for non-coders

### **For Developers**
👉 **[CONFIGURATION.md](./CONFIGURATION.md)** - Technical setup and configuration

### **Deployment**
👉 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deploy to production (Vercel, Railway, etc.)

### **Quick Start**
👉 **[QUICK_START.md](./QUICK_START.md)** - Get up and running quickly

## 🎯 Usage

### **For Students**
1. **Register/Login** - Create account with university email
2. **Report Lost Item** - Upload photo and describe the item
3. **Report Found Item** - Help others by reporting found items
4. **Browse Items** - Explore reported items and check for matches

### **For Administrators**
1. **Access Dashboard** - Login with admin credentials
2. **Manage Items** - Update status, delete, or archive items
3. **View Analytics** - Monitor system usage and trends
4. **Bulk Operations** - Handle multiple items efficiently

## 🚀 Deployment

### **Recommended Platforms**
- **[Vercel](https://vercel.com/)** - Best for Next.js (Free tier available)
- **[Railway](https://railway.app/)** - Full-stack deployment (Free tier)
- **[Netlify](https://netlify.com/)** - Static site hosting

### **Database Hosting**
- **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** - Free 512MB tier

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build production
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 API Documentation

### **Core Endpoints**
- `GET /api/lost` - Fetch lost items
- `POST /api/lost` - Create lost item report
- `GET /api/found` - Fetch found items
- `POST /api/found` - Create found item report
- `GET /api/admin/stats` - Admin dashboard statistics

### **Authentication**
- All endpoints require Firebase authentication
- Include Firebase ID token in Authorization header

## 📊 Performance

### **Mobile Performance**
- ⚡ **Load Time**: < 2 seconds on 3G
- 📱 **Image Upload**: Optimized to 1MB max
- 🔄 **Pagination**: 20 items per page on mobile
- 💾 **Caching**: Smart caching for improved performance

### **Browser Support**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🛡️ Security

- **Firebase Authentication** - Secure user management
- **Environment Variables** - Sensitive data protection
- **Input Validation** - XSS and injection prevention
- **Image Validation** - File type and size restrictions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **MongoDB** - For the flexible database solution
- **Firebase** - For authentication and real-time capabilities
- **Gemini AI** - For intelligent image analysis

## 📞 Support

- 📧 **Email**: support@unilocate.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/unilocate/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/unilocate/discussions)

---

**Built with ❤️ for university communities**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Funilocate)
[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/new/template)
