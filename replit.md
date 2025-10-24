# ChatApp - WhatsApp-like Messaging Platform

## Overview
A progressive web application (PWA) for mobile messaging with real-time chat, competitive rankings, and coin rewards. Built with React, TypeScript, Supabase, and optimized for Android devices.

## Tech Stack
### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React Router alternative)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand for auth state, React Query for server state
- **Real-time**: Supabase Realtime subscriptions

### Backend
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (email/password)
- **Storage**: Supabase Storage for media files (avatars, images, voice notes)
- **Real-time**: Supabase Realtime for live message updates

## Features Implemented
1. **Authentication**
   - Email/password signup and login
   - Profile onboarding with name and avatar
   - Secure session management

2. **Messaging**
   - Real-time one-on-one chat
   - Text messages with timestamps
   - Image sharing from gallery
   - Read receipts (single/double check marks)
   - Message history with infinite scroll

3. **Friend Management**
   - Search users by name
   - Add friends instantly
   - Automatic chat creation on friend add

4. **Rankings System**
   - Four ranking periods: Daily, Weekly, Monthly, Annual
   - Top 50 users by message count
   - Real-time ranking updates
   - Coin prizes for top 3 positions
   - Visual distinction for podium finishers

5. **Profile & Settings**
   - Edit profile name and avatar
   - View message statistics
   - Current daily ranking display
   - Blocked contacts management
   - Logout functionality

6. **PWA Features**
   - Installable on Android home screen
   - Offline-ready manifest
   - Mobile-optimized viewport
   - WhatsApp-inspired green theme

## Database Schema
Tables created in Supabase:
- `profiles` - User profiles with name, avatar, bio
- `friendships` - Friend relationships between users
- `chats` - Chat sessions between two users
- `messages` - Individual messages with type and media support
- `coin_prizes` - Configurable prizes for ranking winners
- `blocked_users` - User blocking relationships

Database functions:
- `get_rankings(period_type)` - Calculate user rankings by period

## Project Structure
```
client/src/
├── components/
│   ├── layout/
│   │   ├── bottom-nav.tsx      # Bottom navigation bar
│   │   └── top-header.tsx      # Top header with search
│   └── ui/                     # shadcn UI components
├── pages/
│   ├── auth-page.tsx           # Login/Signup
│   ├── onboarding-page.tsx     # Profile setup
│   ├── chats-page.tsx          # Chat list
│   ├── chat-detail-page.tsx    # Individual chat view
│   ├── search-page.tsx         # Find friends
│   ├── rankings-page.tsx       # Leaderboards
│   └── profile-page.tsx        # User profile & settings
├── stores/
│   └── authStore.ts            # Zustand auth state
├── lib/
│   ├── supabase.ts             # Supabase client config
│   └── queryClient.ts          # React Query config
└── App.tsx                     # Main app with routing
```

## Environment Variables
Required secrets (already configured):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Design System
- **Colors**: WhatsApp-inspired green primary (#075E54)
- **Typography**: Roboto font family
- **Components**: shadcn/ui with custom WhatsApp styling
- **Mobile-first**: Optimized for 375px-428px screens
- **Dark mode**: Fully supported with automatic theme switching

## Next Steps (Not in MVP)
1. Voice note recording and playback
2. Camera capture (currently uses file upload)
3. Group chat functionality
4. Push notifications via service workers
5. Admin panel for updating coin prizes
6. Message search
7. Video calling
8. Status/Stories feature

## Development
The app uses:
- Vite for build tooling
- Express server for serving the app
- Hot module replacement for fast development

All database operations are handled by Supabase with real-time subscriptions for instant updates.
