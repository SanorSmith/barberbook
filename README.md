# BarberBook 📚

Complete barber shop management system built with Next.js and Supabase.

## 🚀 Live Demo

**[🔗 View Live App](https://main.d3qngrpcbcukgy.amplifyapp.com)**

- **Admin Dashboard:** [https://main.d3qngrpcbcukgy.amplifyapp.com/admin/barbers](https://main.d3qngrpcbcukgy.amplifyapp.com/admin/barbers)
- **Customer Booking:** [https://main.d3qngrpcbcukgy.amplifyapp.com/booking](https://main.d3qngrpcbcukgy.amplifyapp.com/booking)
- **Home Page:** [https://main.d3qngrpcbcukgy.amplifyapp.com](https://main.d3qngrpcbcukgy.amplifyapp.com)

## Features

- 🔐 **User Authentication** - Login/Register with email verification
- 👥 **Role-Based Access** - Customer, Barber, and Admin dashboards
- 📅 **Booking System** - Calendar-based appointment scheduling
- 💈 **Barber Management** - Schedule, earnings, and profile management
- 🛠️ **Admin Panel** - Manage users, services, and barbers
- 📱 **Responsive Design** - Works on all devices
- 🔒 **Row Level Security** - Secure data access with Supabase RLS

## Tech Stack

### 🚀 **Frontend Framework**
- **Next.js 14.2.35** - React framework with App Router
- **React 18** - UI library with hooks and modern patterns
- **TypeScript 5** - Type-safe JavaScript development

### 🎨 **Styling & UI**
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **PostCSS 8** - CSS transformation tool
- **Custom Design System** - Dark theme with gold accents
- **Responsive Design** - Mobile-first approach
- **Custom Fonts** - Playfair Display (serif) & Inter (sans-serif)

### 🌐 **Backend & Database**
- **Supabase** - Backend-as-a-Service platform
  - **PostgreSQL** - Primary database with RLS policies
  - **Supabase Auth** - User authentication & JWT tokens
  - **Supabase Storage** - File storage for images
  - **Supabase Realtime** - Real-time subscriptions
- **@supabase/supabase-js 2.89.0** - JavaScript client library
- **@supabase/ssr 0.8.0** - Server-side rendering support

### 🔐 **Security & Authentication**
- **Row Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Token-based auth with refresh
- **Role-Based Access Control** - Customer, Barber, Admin roles
- **Middleware Protection** - Route-level authentication
- **Service Role API** - Admin operations with elevated permissions

### 📱 **Progressive Web App (PWA)**
- **next-pwa 5.6.0** - PWA configuration for Next.js
- **Service Worker** - Offline caching and background sync
- **Web App Manifest** - Native app-like experience
- **Cache Strategies** - Optimized performance with multiple caching strategies

### 🌍 **Internationalization**
- **next-intl 4.7.0** - Internationalization framework
- **Multi-language Support** - Ready for multiple languages
- **Locale-based Routing** - URL-based language switching

### 🛠️ **Development Tools**
- **ESLint 8** - Code linting and quality checks
- **TypeScript Compiler** - Type checking and compilation
- **Next.js Dev Server** - Hot module replacement
- **Environment Variables** - Configuration management
- **dotenv 17.2.3** - Environment variable loading

### 🎯 **Features & Architecture**
- **App Router** - Modern Next.js routing system
- **Server Components** - Server-side rendering by default
- **Client Components** - Interactive UI components
- **API Routes** - Backend API endpoints
- **Middleware** - Request interception and auth
- **Image Optimization** - Next.js Image component with CDN
- **Component Architecture** - Reusable UI components

### 📊 **Data Management**
- **React Hooks** - State management (useState, useEffect)
- **Supabase Queries** - Database operations
- **Real-time Subscriptions** - Live data updates
- **File Uploads** - Image storage and optimization
- **Form Handling** - Controlled components and validation

### 🚀 **Deployment & Performance**
- **Vercel Ready** - Optimized for Vercel deployment
- **Static Generation** - Pre-rendered pages where possible
- **Incremental Static Regeneration** - Updated static content
- **Image CDN** - Optimized image delivery
- **Code Splitting** - Automatic bundle optimization

### 🎨 **UI/UX Features**
- **Dark Theme** - Professional dark color scheme
- **Custom Color Palette** - Obsidian, Charcoal, Gold accents
- **Responsive Grid System** - Tailwind's responsive utilities
- **Interactive Components** - Modals, forms, cards
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - User-friendly error messages

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/barberbook.git
cd barberbook
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase/schema.sql`
   - Add your Supabase credentials to `.env.local`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database Setup

1. Go to Supabase Dashboard → SQL Editor
2. Run the schema from `supabase/schema.sql`
3. Run the sample data from `fix-sample-data.sql`

## Default Users

After setup, you can create users with different roles:
- **Customer**: Default role for new registrations
- **Barber**: Manage appointments and earnings
- **Admin**: Full system access

To update a user's role:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Role-based dashboards
│   └── booking/        # Booking system
├── components/         # Reusable UI components
├── lib/               # Utilities and configurations
└── middleware.ts      # Next.js middleware
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Deploy

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### AWS Deployment

Deploy to AWS using multiple options:
- **AWS Amplify** (Recommended) - Easiest with automatic CI/CD
- **AWS App Runner** - Container-based with auto-scaling
- **AWS ECS + Fargate** - Full container orchestration
- **AWS EC2 + PM2** - Traditional server deployment

📖 **[Complete AWS Deployment Guide](AWS_DEPLOYMENT.md)** - Step-by-step instructions for all options

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Digital Ocean
- Railway
