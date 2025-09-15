# Supabase Database Setup Instructions

## Problem
Registration data is not appearing in Supabase because the required database tables don't exist.

## Solution
You need to create the database tables in your Supabase project.

### Steps:

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project: `mcdhnxkzsbcifsaijieu`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Database Setup**
   - Copy the entire content from `supabase-setup.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the SQL

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `profiles`
     - `cart_items` 
     - `wishlist_items`

### What the SQL does:
- Creates the `profiles` table to store user information
- Creates `cart_items` and `wishlist_items` tables
- Sets up Row Level Security (RLS) policies
- Creates a trigger to automatically create profiles when users register
- Adds proper foreign key relationships

### After Setup:
Once you run the SQL, try registering a new user. The data should now appear in the `profiles` table in Supabase.

## Testing Registration
1. Go to your app at http://localhost:3001
2. Navigate to registration page
3. Fill out the form and submit
4. Check Supabase Dashboard > Table Editor > profiles table
5. Your new user should appear there

## Troubleshooting
If you still have issues:
1. Check the browser console for errors
2. Check Supabase logs in Dashboard > Logs
3. Verify your Supabase URL and anon key in `src/supabase/config.ts`
