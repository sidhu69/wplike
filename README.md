# ChatApp - WhatsApp-Style Messaging Platform

A modern, mobile-first Progressive Web App (PWA) for real-time messaging with competitive rankings and rewards.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery with typing indicators
- **Friend System**: Search and add friends easily
- **Competitive Rankings**: Daily, Weekly, Monthly, and Annual leaderboards
- **Coin Rewards**: Win coins by topping the rankings
- **Media Sharing**: Send images from gallery
- **Read Receipts**: See when messages are read (✓ vs ✓✓)
- **Profile Management**: Customize your name and avatar
- **Mobile Optimized**: Perfect for Android devices
- **PWA Support**: Install directly to home screen

## 📋 Prerequisites

1. **Supabase Account** - Create one at [supabase.com](https://supabase.com)
2. **Node.js 20** - Already installed in this environment

## 🔧 Setup Instructions

### 1. Configure Supabase Backend

The Supabase credentials are already set up. Now you need to create the database schema:

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the sidebar
3. Copy the contents of `supabase-setup.sql`
4. Paste and run it in the SQL editor
5. Follow the detailed instructions in `SUPABASE_SETUP.md`

**Important**: You must also create a storage bucket called `media` and make it public. See `SUPABASE_SETUP.md` for complete instructions.

### 2. Run the Application

The app is already running! Just click the webview URL above to see it.

If you need to restart:
```bash
npm run dev
```

### 3. First Time Setup

1. Open the app in your browser
2. Click "Sign Up" to create an account
3. Complete your profile with name and photo
4. Search for friends and start chatting!

## 📱 Using the App

### Authentication
- **Sign Up**: Create account with email and password
- **Login**: Access your existing account
- **Onboarding**: Set your name and profile picture

### Chatting
- **Find Friends**: Use the search icon (🔍) on the Chats page
- **Send Messages**: Tap a chat to open the conversation
- **Share Images**: Use the image icon in the chat
- **Read Receipts**: ✓ = sent, ✓✓ = read

### Rankings
- **View Leaderboards**: Navigate to Rankings tab
- **Switch Periods**: Tap Daily, Weekly, Monthly, or Annual
- **See Prizes**: Check coin rewards for top 3 positions
- **Track Progress**: Your rank updates in real-time

### Profile
- **Edit Profile**: Tap "Edit Profile" to change name or avatar
- **View Stats**: See total messages sent and current rank
- **Blocked Contacts**: Manage blocked users
- **Logout**: Sign out of your account

## 🏗️ Project Structure

```
client/src/
├── pages/              # All app pages/screens
│   ├── auth-page.tsx          # Login & Signup
│   ├── onboarding-page.tsx    # Profile setup
│   ├── chats-page.tsx         # Chat list
│   ├── chat-detail-page.tsx   # Individual chat
│   ├── search-page.tsx        # Find friends
│   ├── rankings-page.tsx      # Leaderboards
│   └── profile-page.tsx       # User profile
├── components/
│   ├── layout/         # Navigation components
│   └── ui/            # Reusable UI components (shadcn)
├── stores/            # State management (Zustand)
├── lib/               # Utilities (Supabase, React Query)
└── App.tsx            # Main app with routing

shared/
└── schema.ts          # TypeScript types & validation

Database Setup:
├── supabase-setup.sql       # Complete database schema
└── SUPABASE_SETUP.md        # Step-by-step instructions
```

## 🎨 Design System

- **Colors**: WhatsApp-inspired green theme (#075E54)
- **Typography**: Roboto font family
- **Components**: shadcn/ui with custom styling
- **Mobile-First**: Optimized for 375px-428px screens
- **Dark Mode**: Fully supported

## 🔐 Security

- **Row Level Security (RLS)**: All tables protected
- **Authentication**: Supabase Auth handles sessions
- **Private Messages**: Only sender/receiver can access
- **Storage Policies**: Authenticated uploads, public reads

## 📊 Database Schema

### Tables
- `profiles` - User information (name, avatar, bio)
- `friendships` - Friend relationships
- `chats` - Chat sessions between users
- `messages` - Individual messages with media
- `coin_prizes` - Configurable ranking rewards
- `blocked_users` - User blocking

### Functions
- `get_rankings(period_type)` - Calculate user rankings
- `handle_new_user()` - Auto-create profile on signup

## 🌐 Deployment

This is a Progressive Web App that can be:
- Accessed via any web browser
- Installed to Android home screen
- Used offline (with cached data)

To deploy to production:
1. Configure environment variables on your hosting platform
2. Run `npm run build`
3. Serve the `dist` folder

## 🐛 Troubleshooting

### "Failed to connect to Supabase"
- Check that credentials are set correctly
- Verify Supabase project is active
- Run the SQL migration in Supabase

### "Upload failed"
- Create the `media` storage bucket in Supabase
- Make sure it's set to public
- Configure storage policies (see SUPABASE_SETUP.md)

### "Rankings not showing"
- Send some messages first
- Rankings update in real-time
- Check the SQL function exists: `get_rankings`

### Messages not updating in real-time
- Enable Realtime on the `messages` table in Supabase
- Check browser console for WebSocket errors
- Verify RLS policies allow SELECT

## 📦 Technologies

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State**: Zustand (auth) + React Query (server state)
- **Routing**: Wouter (lightweight router)

## 🎯 Next Steps

Future enhancements (not in current version):
- Voice note recording & playback
- Camera capture (currently uses file upload)
- Group chats
- Push notifications
- Video calling
- Message search
- Stories/Status feature
- Admin panel for coin management

## 📝 License

This project was built for personal use and learning.

## 🤝 Support

For issues or questions about Supabase setup, refer to:
- `SUPABASE_SETUP.md` - Complete setup guide
- `replit.md` - Technical documentation
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
