# 🗄️ Supabase Database Setup Guide

## Step 1: Create Supabase Project (5 minutes)

1. **Go to Supabase**: https://supabase.com
2. **Sign up/Login** with GitHub
3. **Create New Project**:
   - Name: `aims-dashboard`
   - Database Password: (save this somewhere safe)
   - Region: Choose closest to you
   - Click "Create new project"
4. **Wait ~2 minutes** for database to provision

---

## Step 2: Run Database Schema (2 minutes)

1. **Open SQL Editor**:
   - In Supabase dashboard, click "SQL Editor" in sidebar
   
2. **Copy and paste** the entire contents of `supabase-schema.sql`

3. **Click "Run"** (or press Ctrl+Enter)

4. **Verify tables created**:
   - Go to "Table Editor" in sidebar
   - You should see:
     - ✅ `inventory` table with 2 rows
     - ✅ `replenishment_orders` table with 2 rows

---

## Step 3: Get API Credentials (1 minute)

1. **Go to Project Settings**:
   - Click the ⚙️ gear icon in sidebar
   - Click "API" section

2. **Copy these values**:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGci...` (very long string)

3. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

---

## Step 4: Verify Connection (2 minutes)

1. **Restart your dev server**:
   ```bash
   # Press Ctrl+C to stop current server
   npm run dev
   ```

2. **Check Supabase Dashboard**:
   - Go to "Table Editor"
   - Click on `inventory` table
   - You should see 2 items

---

## Quick Verification Checklist

- [ ] Supabase project created
- [ ] SQL schema executed successfully
- [ ] `inventory` table has 2 rows
- [ ] `replenishment_orders` table has 2 rows
- [ ] API credentials copied
- [ ] `.env.local` file updated
- [ ] Dev server restarted

---

## Next Steps

Once Supabase is set up, I'll update the API routes to:
1. ✅ Fetch real data from Supabase instead of mock data
2. ✅ Save approved/rejected orders to database
3. ✅ Update stock levels in real-time

---

## Troubleshooting

### Can't see tables in Table Editor
- Go back to SQL Editor and run the schema again
- Check for error messages in the output

### Environment variables not working
- Make sure `.env.local` is in the root folder (`d:\aims`)
- Restart the dev server (Ctrl+C then `npm run dev`)
- No quotes needed around the values

### Connection errors
- Double-check the URL and Key are copied correctly
- Make sure you copied the **anon** key, not the service role key

---

**Ready?** Let me know when you've completed these steps and I'll update the code to use Supabase! 🚀
