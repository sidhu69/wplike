# Supabase Setup Instructions

Follow these steps to set up your Supabase backend for ChatApp.

## Step 1: Run SQL Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-setup.sql` file
5. Paste into the SQL editor
6. Click **Run** to execute the migration

This will create:
- All database tables (profiles, friendships, chats, messages, coin_prizes, blocked_users)
- Row Level Security (RLS) policies for data protection
- Database functions:
  - `create_friendship()` - Handles mutual friend connections and chat creation
  - `get_rankings()` - Calculates user rankings by period
  - `handle_new_user()` - Auto-creates profile on signup
- Triggers for automatic profile creation
- Default coin prize values

## Step 2: Create Storage Bucket

1. In your Supabase dashboard, go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Set the bucket name to: `media`
4. Make it **Public** (check the public checkbox)
5. Click **Create bucket**

## Step 3: Configure Storage Policies

After creating the bucket:

1. Click on the `media` bucket
2. Go to **Policies** tab
3. Click **New Policy**

### Policy 1: Allow Authenticated Uploads
- **Policy name**: Allow authenticated uploads
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **Policy definition**:
```sql
bucket_id = 'media'
```

### Policy 2: Allow Public Reads  
- **Policy name**: Allow public reads
- **Allowed operation**: SELECT
- **Target roles**: public
- **Policy definition**:
```sql
bucket_id = 'media'
```

## Step 4: Enable Realtime

1. Go to **Database** → **Replication** in the left sidebar
2. Find the `messages` table
3. Toggle **Realtime** to ON
4. This enables real-time subscriptions for live messaging

## Step 5: Verify Setup

Run these queries in the SQL Editor to verify:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check coin prizes
SELECT * FROM coin_prizes;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE name = 'media';
```

## Step 6: Test Authentication

1. Try signing up through the app
2. Check if a profile is automatically created in the `profiles` table
3. Verify the trigger is working

## Troubleshooting

### Profile not created on signup
- Check if the trigger `on_auth_user_created` exists
- Verify the function `handle_new_user` is created
- Look at Supabase logs for errors

### Storage uploads fail
- Verify the `media` bucket is public
- Check storage policies are correctly configured
- Ensure authenticated users can INSERT

### Realtime not working
- Enable Realtime on the `messages` table
- Check WebSocket connection in browser console
- Verify RLS policies allow SELECT on messages

### Rankings not showing
- Run the SQL function manually: `SELECT * FROM get_rankings('daily');`
- Check if there are messages in the database
- Verify the function has SECURITY DEFINER

## Optional: Update Coin Prizes

To change coin rewards:

```sql
UPDATE coin_prizes 
SET first_place = 200, second_place = 100, third_place = 50
WHERE period_type = 'daily';
```

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Messages are protected - only sender/receiver can view
- Storage uploads require authentication
- Profile creation is automatic via trigger
