# BarberBook 📚

Complete barber shop management system built with Next.js and Supabase.

## Features

- 🔐 **User Authentication** - Login/Register with email verification
- 👥 **Role-Based Access** - Customer, Barber, and Admin dashboards
- 📅 **Booking System** - Calendar-based appointment scheduling
- 💈 **Barber Management** - Schedule, earnings, and profile management
- 🛠️ **Admin Panel** - Manage users, services, and barbers
- 📱 **Responsive Design** - Works on all devices
- 🔒 **Row Level Security** - Secure data access with Supabase RLS

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI Components**: Custom components with modern design
- **Deployment**: Ready for Vercel/Netlify

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

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Digital Ocean
- Railway
