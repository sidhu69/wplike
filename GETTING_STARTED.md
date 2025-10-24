# 🚀 Getting Started with ChatApp

Your WhatsApp-style messaging app is ready! Follow these steps to set up the backend and start using the app.

## ⚡ Quick Start (3 Steps)

### Step 1: Set Up Supabase Database (5 minutes)

1. **Open your Supabase project** at [supabase.com](https://supabase.com)
2. **Go to SQL Editor** (left sidebar)
3. **Click "New Query"**
4. **Copy & paste** the entire contents of `supabase-setup.sql`
5. **Click Run** (or press Cmd/Ctrl + Enter)

✅ You should see "Success" messages. This creates all your tables, functions, and security policies.

### Step 2: Create Media Storage Bucket (2 minutes)

1. **Go to Storage** (left sidebar in Supabase)
2. **Click "Create a new bucket"**
3. **Name it**: `media`
4. **Check the box**: "Public bucket"
5. **Click "Create bucket"**

Then set up policies:

1. **Click on the `media` bucket**
2. **Go to "Policies" tab**
3. **Click "New Policy"** → "Create a policy from scratch"

**Policy 1 - Allow authenticated uploads:**
- Policy name: `Allow authenticated uploads`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- Policy definition (USING expression): `bucket_id = 'media'`
- Click "Save policy"

**Policy 2 - Allow public reads:**
- Click "New Policy" again
- Policy name: `Allow public reads`
- Allowed operation: `SELECT`
- Target roles: `public`
- Policy definition (USING expression): `bucket_id = 'media'`
- Click "Save policy"

### Step 3: Enable Realtime (1 minute)

1. **Go to Database** → **Replication** (left sidebar)
2. **Find the `messages` table** in the list
3. **Toggle "Realtime" to ON**
4. **Click "Save"** if prompted

## 🎉 You're Done! Start Using the App

The app is already running in the webview above. Click it to open!

### First Time Setup:

1. **Click "Sign Up"** tab
2. Enter your email and password
3. Click "Sign Up"
4. Complete your profile:
   - Enter your name
   - (Optional) Upload a profile picture
5. **You're in!** 🎊

## 📱 How to Use ChatApp

### Add Friends & Start Chatting

1. **Tap the search icon** (🔍) in the top right on the Chats page
2. **Type a friend's name** to search
3. **Tap "Add"** to add them as a friend
4. **Automatically redirected to chat** - start messaging!

### Send Messages

- **Text**: Type and press Enter or tap Send
- **Images**: Tap the image icon to upload photos
- **Read Receipts**: ✓ = sent, ✓✓ = read

### View Rankings

1. **Tap "Rankings"** in the bottom navigation
2. **Switch periods**: Daily, Weekly, Monthly, or Annual
3. **See top 50** users by message count
4. **Win coins** by ranking in the top 3!

### Manage Your Profile

1. **Tap "Profile"** in the bottom navigation
2. **Edit Profile**: Change name or avatar
3. **View Stats**: Total messages and current rank
4. **Blocked Contacts**: Manage blocked users
5. **Log Out**: Sign out of your account

## 🔧 Troubleshooting

### "Something went wrong" on signup
- **Check**: Did you run the SQL migration in Step 1?
- **Fix**: Go to Supabase SQL Editor and run `supabase-setup.sql`

### Can't add friends / "Failed to add friend"
- **Check**: Did the SQL migration create the `create_friendship` function?
- **Fix**: Run this in SQL Editor:
  ```sql
  SELECT routine_name FROM information_schema.routines 
  WHERE routine_name = 'create_friendship';
  ```
  If empty, re-run the entire `supabase-setup.sql` file

### Profile picture upload fails
- **Check**: Did you create the `media` bucket in Step 2?
- **Check**: Is the bucket set to "Public"?
- **Check**: Are the storage policies configured?
- **Fix**: Follow Step 2 again carefully

### Messages don't update in real-time
- **Check**: Did you enable Realtime on the `messages` table?
- **Fix**: Follow Step 3 again
- **Alternative**: Refresh the page to see new messages

### Rankings page is empty
- **You need data first!** Send some messages, then check back
- Rankings update automatically as you chat

## 📊 Verify Your Setup

Run these queries in Supabase SQL Editor to check everything:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should show: blocked_users, chats, coin_prizes, friendships, messages, profiles

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Should show: create_friendship, get_rankings, handle_new_user

-- Check default coin prizes
SELECT * FROM coin_prizes ORDER BY period_type;

-- Should show 4 rows (daily, weekly, monthly, annual)

-- Check storage bucket
SELECT * FROM storage.buckets WHERE name = 'media';

-- Should show 1 row with public = true
```

## 🎨 Features You Can Use Now

- ✅ **Authentication**: Email/password signup and login
- ✅ **Real-time Chat**: Instant message delivery
- ✅ **Image Sharing**: Send photos from gallery
- ✅ **Friend System**: Search and add friends
- ✅ **Rankings**: Compete on 4 leaderboards
- ✅ **Coin Rewards**: Win prizes for top rankings
- ✅ **Read Receipts**: See when messages are read
- ✅ **Profile Management**: Edit name and avatar
- ✅ **Mobile PWA**: Install to home screen on Android

## 🌐 Install on Android

1. **Open the app** in Chrome on Android
2. **Tap the menu** (⋮) in Chrome
3. **Select "Add to Home screen"**
4. **Tap "Add"**
5. **Launch from home screen** - works like a native app!

## 🔐 Security Features

- ✅ All tables protected with Row Level Security (RLS)
- ✅ Users can only see their own data
- ✅ Messages are private to sender/receiver
- ✅ Secure authentication via Supabase
- ✅ File uploads require authentication

## 💡 Tips

- **Send messages to rank higher** - more messages = better ranking
- **Check rankings daily** to see your progress
- **Upload a profile picture** to personalize your profile
- **Rankings reset** based on the period (daily resets every day, etc.)

## 📝 Need More Help?

- See `README.md` for full documentation
- See `SUPABASE_SETUP.md` for detailed setup instructions
- See `replit.md` for technical details

## 🎯 What's Next?

After setting up, you can:

1. **Invite friends** to join and test the app
2. **Send messages** to appear on rankings
3. **Customize coin prizes** in the `coin_prizes` table
4. **Deploy to production** when ready

---

**Happy chatting! 💬**
