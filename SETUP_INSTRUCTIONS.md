# LIFE DISCIPLINE SYSTEM - PHASE 5 DEPLOYMENT GUIDE

## 1. DATABASE SETUP

Run the SQL migration file in Supabase:
1. Go to Supabase Dashboard → SQL Editor
2. Paste the contents of `supabase/migrations/20250101_discipline_system.sql`
3. Click "Run"

## 2. TELEGRAM BOT SETUP

### Create Telegram Bot:
1. Message @BotFather on Telegram
2. Send `/newbot`
3. Choose bot name: "Life Discipline Coach"
4. Get the API token

### Set Environment Variables in Supabase:
```bash
# In Supabase Dashboard → Settings → API → Edge Functions
TELEGRAM_BOT_TOKEN=your_bot_token_here
WEB_APP_URL=https://your-domain.com