-- -- ============================================
-- -- LIFE DISCIPLINE SYSTEM - COMPLETE SCHEMA (FIXED)
-- -- ============================================

-- -- USERS TABLE (Extended)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS discipline_goal text;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS mentor_email text;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_streak integer DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date date;

-- -- PROMISES - Things I WILL NOT DO
-- CREATE TABLE IF NOT EXISTS user_promises_dont (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid REFERENCES users(id) ON DELETE CASCADE,
--   title text NOT NULL,
--   description text,
--   severity text CHECK (severity IN ('low', 'medium', 'high', 'strict')),
--   category text,
--   created_at timestamptz DEFAULT now(),
--   updated_at timestamptz DEFAULT now(),
--   is_active boolean DEFAULT true
-- );

-- -- PROMISES - Things I MUST DO
-- CREATE TABLE IF NOT EXISTS user_promises_do (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid REFERENCES users(id) ON DELETE CASCADE,
--   title text NOT NULL,
--   description text,
--   frequency text CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
--   target_count integer,
--   created_at timestamptz DEFAULT now(),
--   updated_at timestamptz DEFAULT now(),
--   is_active boolean DEFAULT true
-- );

-- -- DAILY TIMETABLE (24-hour schedule)
-- CREATE TABLE IF NOT EXISTS daily_timetable (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid REFERENCES users(id) ON DELETE CASCADE,
--   day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, etc.
--   start_time time NOT NULL,
--   end_time time NOT NULL,
--   title text NOT NULL,
--   description text,
--   category text CHECK (category IN ('work', 'study', 'health', 'personal', 'leisure', 'rest')),
--   priority integer DEFAULT 3,
--   is_recurring boolean DEFAULT true,
--   created_at timestamptz DEFAULT now()
-- );

-- -- MEDICINES/SCHEDULED ITEMS
-- CREATE TABLE IF NOT EXISTS medicines (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid REFERENCES users(id) ON DELETE CASCADE,
--   name text NOT NULL,
--   dosage text,
--   schedule_type text CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'specific')),
--   time_of_day text[], -- CHANGED FROM time[] to text[] for easier handling
--   days_of_week integer[], -- [0,1,2,3,4,5,6]
--   reminder_minutes_before integer DEFAULT 5,
--   is_active boolean DEFAULT true,
--   created_at timestamptz DEFAULT now()
-- );

-- -- DIET PLANS
-- CREATE TABLE IF NOT EXISTS diet_plans (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid REFERENCES users(id) ON DELETE CASCADE,
--   meal_type text CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
--   name text NOT NULL,
--   description text,
--   calories integer,
--   time_of_day text, -- CHANGED FROM time to text
--   days_of_week integer[],
--   created_at timestamptz DEFAULT now()
-- );

-- -- HABITS TRACKING
-- CREATE TABLE IF NOT EXISTS habits (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid REFERENCES users(id) ON DELETE CASCADE,
--   name text NOT NULL,
--   description text,
--   category text CHECK (category IN ('health', 'learning', 'productivity', 'personal', 'financial')),
--   target_frequency text CHECK (target_frequency IN ('daily', 'weekly', 'monthly')),
--   current_streak integer DEFAULT 0,
--   best_streak integer DEFAULT 0,
--   created_at timestamptz DEFAULT now()
-- );

-- -- DAILY CHECK-IN RESPONSES
-- CREATE TABLE IF NOT EXISTS daily_checkins (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid REFERENCES users(id) ON DELETE CASCADE,
--   checkin_date date NOT NULL DEFAULT CURRENT_DATE,
--   checkin_type text CHECK (checkin_type IN ('morning', 'night', 'midday')),
--   question_1_response boolean, -- Followed timetable?
--   question_2_response boolean, -- Avoided bad habits?
--   question_3_response boolean, -- Followed good habits?
--   question_4_response boolean, -- Took medicines?
--   question_5_response boolean, -- Studied as per plan?
--   question_6_response boolean, -- Ate according to diet?
--   question_7_response boolean, -- Read book?
--   question_8_response boolean, -- Worked out?
--   overall_mood text CHECK (overall_mood IN ('excellent', 'good', 'neutral', 'poor', 'terrible')),
--   notes text,
--   completed_at timestamptz,
--   created_at timestamptz DEFAULT now(),
--   UNIQUE(user_id, checkin_date, checkin_type)
-- );

-- -- WEEKLY SUMMARIES
-- CREATE TABLE IF NOT EXISTS weekly_summaries (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid REFERENCES users(id) ON DELETE CASCADE,
--   week_start_date date NOT NULL,
--   week_end_date date NOT NULL,
--   timetable_adherence_percent integer DEFAULT 0,
--   good_habits_completed integer DEFAULT 0,
--   bad_habits_broken integer DEFAULT 0,
--   medicine_adherence_percent integer DEFAULT 0,
--   diet_followed_percent integer DEFAULT 0,
--   streak_maintained boolean DEFAULT false,
--   summary_text text,
--   sent_to_mentor boolean DEFAULT false,
--   created_at timestamptz DEFAULT now()
-- );

-- -- ACCOUNTABILITY PARTNERS
-- CREATE TABLE IF NOT EXISTS accountability_partners (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid REFERENCES users(id) ON DELETE CASCADE,
--   partner_type text CHECK (partner_type IN ('telegram', 'email', 'phone')),
--   contact_info text NOT NULL,
--   receives_daily_updates boolean DEFAULT false,
--   receives_weekly_reports boolean DEFAULT true,
--   receives_failure_alerts boolean DEFAULT true,
--   is_active boolean DEFAULT true,
--   created_at timestamptz DEFAULT now()
-- );

-- -- DATE-SPECIFIC EVENTS
-- CREATE TABLE IF NOT EXISTS date_events (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid REFERENCES users(id) ON DELETE CASCADE,
--   title text NOT NULL,
--   description text,
--   event_date date NOT NULL,
--   start_time text, -- CHANGED FROM time to text
--   end_time text,
--   event_type text CHECK (event_type IN ('meeting', 'appointment', 'exam', 'deadline', 'celebration')),
--   reminder_sent boolean DEFAULT false,
--   created_at timestamptz DEFAULT now()
-- );

-- -- ============================================
-- -- SAMPLE DATA (FIXED VERSION)
-- -- ============================================

-- -- Insert test user if not exists
-- INSERT INTO users (id, email, discipline_goal)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'test@lifediscipline.com',
--   'Rebuild life with strict discipline for 6 months'
-- ) ON CONFLICT (id) DO NOTHING;

-- -- Sample "WILL NOT DO" promises
-- INSERT INTO user_promises_dont (user_id, title, description, severity) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'No porn', 'Complete abstinence from adult content', 'strict'),
-- ('00000000-0000-0000-0000-000000000001', 'No junk food', 'Avoid processed food and sugar', 'high'),
-- ('00000000-0000-0000-0000-000000000001', 'No social media', 'Limit to 30 mins per day max', 'medium'),
-- ('00000000-0000-0000-0000-000000000001', 'No late nights', 'Sleep by 11 PM daily', 'high');

-- -- Sample "MUST DO" promises
-- INSERT INTO user_promises_do (user_id, title, description, frequency) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'Read 20 pages', 'Non-fiction personal development', 'daily'),
-- ('00000000-0000-0000-0000-000000000001', 'Morning workout', '30 minutes exercise', 'daily'),
-- ('00000000-0000-0000-0000-000000000001', 'Meditate', '10 minutes mindfulness', 'daily'),
-- ('00000000-0000-0000-0000-000000000001', 'Drink 3L water', 'Stay hydrated', 'daily');

-- -- Sample daily timetable
-- INSERT INTO daily_timetable (user_id, day_of_week, start_time, end_time, title, category) VALUES
-- ('00000000-0000-0000-0000-000000000001', 1, '07:00', '07:30', 'Wake up & morning routine', 'personal'),
-- ('00000000-0000-0000-0000-000000000001', 1, '07:30', '08:30', 'Workout & breakfast', 'health'),
-- ('00000000-0000-0000-0000-000000000001', 1, '08:30', '12:30', 'Deep work session', 'work'),
-- ('00000000-0000-0000-0000-000000000001', 1, '12:30', '13:30', 'Lunch break', 'rest'),
-- ('00000000-0000-0000-0000-000000000001', 1, '13:30', '17:30', 'Skill learning', 'study'),
-- ('00000000-0000-0000-0000-000000000001', 1, '17:30', '18:30', 'Exercise', 'health'),
-- ('00000000-0000-0000-0000-000000000001', 1, '18:30', '20:00', 'Personal projects', 'work'),
-- ('00000000-0000-0000-0000-000000000001', 1, '20:00', '21:00', 'Dinner & family time', 'personal'),
-- ('00000000-0000-0000-0000-000000000001', 1, '21:00', '22:00', 'Reading', 'study'),
-- ('00000000-0000-0000-0000-000000000001', 1, '22:00', '23:00', 'Planning for tomorrow', 'personal');

-- -- Sample medicines (FIXED: using text[] instead of time[])
-- INSERT INTO medicines (user_id, name, dosage, schedule_type, time_of_day) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'Vitamin D', '1000 IU', 'daily', ARRAY['08:00', '20:00']),
-- ('00000000-0000-0000-0000-000000000001', 'Omega-3', '1000 mg', 'daily', ARRAY['08:00']);

-- -- Sample date-specific event
-- INSERT INTO date_events (user_id, title, event_date, start_time, event_type) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'Doctor Appointment', '2024-12-25', '15:00', 'appointment'),
-- ('00000000-0000-0000-0000-000000000001', 'Online Exam', '2024-12-28', '10:00', 'exam');

-- -- ============================================
-- -- ROW LEVEL SECURITY (RLS) POLICIES
-- -- ============================================

-- -- Enable RLS on all tables
-- ALTER TABLE user_promises_dont ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_promises_do ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_timetable ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE accountability_partners ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE date_events ENABLE ROW LEVEL SECURITY;

-- -- Policies for user_promises_dont
-- DROP POLICY IF EXISTS "Users can view own dont promises" ON user_promises_dont;
-- CREATE POLICY "Users can view own dont promises" ON user_promises_dont
--   FOR SELECT USING (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Users can insert own dont promises" ON user_promises_dont;
-- CREATE POLICY "Users can insert own dont promises" ON user_promises_dont
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Users can update own dont promises" ON user_promises_dont;
-- CREATE POLICY "Users can update own dont promises" ON user_promises_dont
--   FOR UPDATE USING (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Users can delete own dont promises" ON user_promises_dont;
-- CREATE POLICY "Users can delete own dont promises" ON user_promises_dont
--   FOR DELETE USING (auth.uid() = user_id);

-- -- Policies for user_promises_do
-- DROP POLICY IF EXISTS "Users can view own do promises" ON user_promises_do;
-- CREATE POLICY "Users can view own do promises" ON user_promises_do
--   FOR SELECT USING (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Users can insert own do promises" ON user_promises_do;
-- CREATE POLICY "Users can insert own do promises" ON user_promises_do
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Users can update own do promises" ON user_promises_do;
-- CREATE POLICY "Users can update own do promises" ON user_promises_do
--   FOR UPDATE USING (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Users can delete own do promises" ON user_promises_do;
-- CREATE POLICY "Users can delete own do promises" ON user_promises_do
--   FOR DELETE USING (auth.uid() = user_id);

-- -- Policies for daily_timetable
-- DROP POLICY IF EXISTS "Users can view own timetable" ON daily_timetable;
-- CREATE POLICY "Users can view own timetable" ON daily_timetable
--   FOR SELECT USING (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Users can manage own timetable" ON daily_timetable;
-- CREATE POLICY "Users can manage own timetable" ON daily_timetable
--   FOR ALL USING (auth.uid() = user_id);

-- -- Policies for medicines
-- DROP POLICY IF EXISTS "Users can view own medicines" ON medicines;
-- CREATE POLICY "Users can view own medicines" ON medicines
--   FOR SELECT USING (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Users can manage own medicines" ON medicines;
-- CREATE POLICY "Users can manage own medicines" ON medicines
--   FOR ALL USING (auth.uid() = user_id);

-- -- Policies for diet_plans
-- DROP POLICY IF EXISTS "Users can view own diet plans" ON diet_plans;
-- CREATE POLICY "Users can view own diet plans" ON diet_plans
--   FOR SELECT USING (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Users can manage own diet plans" ON diet_plans;
-- CREATE POLICY "Users can manage own diet plans" ON diet_plans
--   FOR ALL USING (auth.uid() = user_id);

-- -- Policies for habits
-- DROP POLICY IF EXISTS "Users can view own habits" ON habits;
-- CREATE POLICY "Users can view own habits" ON habits
--   FOR SELECT USING (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Users can manage own habits" ON habits;
-- CREATE POLICY "Users can manage own habits" ON habits
--   FOR ALL USING (auth.uid() = user_id);

-- -- Policies for daily_checkins
-- DROP POLICY IF EXISTS "Users can view own checkins" ON daily_checkins;
-- CREATE POLICY "Users can view own checkins" ON daily_checkins
--   FOR SELECT USING (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Users can insert own checkins" ON daily_checkins;
-- CREATE POLICY "Users can insert own checkins" ON daily_checkins
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Users can update own checkins" ON daily_checkins;
-- CREATE POLICY "Users can update own checkins" ON daily_checkins
--   FOR UPDATE USING (auth.uid() = user_id);

-- -- Policies for weekly_summaries
-- DROP POLICY IF EXISTS "Users can view own weekly summaries" ON weekly_summaries;
-- CREATE POLICY "Users can view own weekly summaries" ON weekly_summaries
--   FOR SELECT USING (auth.uid() = user_id);

-- -- Policies for accountability_partners
-- DROP POLICY IF EXISTS "Users can view own partners" ON accountability_partners;
-- CREATE POLICY "Users can view own partners" ON accountability_partners
--   FOR SELECT USING (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Users can manage own partners" ON accountability_partners;
-- CREATE POLICY "Users can manage own partners" ON accountability_partners
--   FOR ALL USING (auth.uid() = user_id);

-- -- Policies for date_events
-- DROP POLICY IF EXISTS "Users can view own date events" ON date_events;
-- CREATE POLICY "Users can view own date events" ON date_events
--   FOR SELECT USING (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Users can manage own date events" ON date_events;
-- CREATE POLICY "Users can manage own date events" ON date_events
--   FOR ALL USING (auth.uid() = user_id);

-- -- ============================================
-- -- FUNCTIONS AND TRIGGERS
-- -- ============================================

-- -- Function to update user's last active date
-- CREATE OR REPLACE FUNCTION update_user_last_active()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   UPDATE users 
--   SET last_active_date = CURRENT_DATE,
--       daily_streak = CASE 
--         WHEN last_active_date = CURRENT_DATE - INTERVAL '1 day' 
--         THEN daily_streak + 1 
--         ELSE 1 
--       END
--   WHERE id = NEW.user_id;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Trigger on daily_checkins to update streak
-- DROP TRIGGER IF EXISTS update_streak_on_checkin ON daily_checkins;
-- CREATE TRIGGER update_streak_on_checkin
--   AFTER INSERT ON daily_checkins
--   FOR EACH ROW
--   EXECUTE FUNCTION update_user_last_active();

-- -- Function to generate weekly summary
-- CREATE OR REPLACE FUNCTION generate_weekly_summary(user_uuid uuid, start_date date)
-- RETURNS SETOF weekly_summaries AS $$
-- DECLARE
--   summary_record weekly_summaries;
--   total_days integer := 7;
--   timetable_days integer;
--   habit_days integer;
--   medicine_days integer;
--   diet_days integer;
-- BEGIN
--   -- Calculate adherence percentages
--   SELECT COUNT(*) INTO timetable_days
--   FROM daily_checkins 
--   WHERE user_id = user_uuid 
--     AND checkin_date BETWEEN start_date AND start_date + 6
--     AND question_1_response = true;
    
--   SELECT COUNT(*) INTO habit_days
--   FROM daily_checkins 
--   WHERE user_id = user_uuid 
--     AND checkin_date BETWEEN start_date AND start_date + 6
--     AND question_2_response = true 
--     AND question_3_response = true;
    
--   SELECT COUNT(*) INTO medicine_days
--   FROM daily_checkins 
--   WHERE user_id = user_uuid 
--     AND checkin_date BETWEEN start_date AND start_date + 6
--     AND question_4_response = true;
    
--   SELECT COUNT(*) INTO diet_days
--   FROM daily_checkins 
--   WHERE user_id = user_uuid 
--     AND checkin_date BETWEEN start_date AND start_date + 6
--     AND question_6_response = true;
  
--   -- Insert into weekly_summaries
--   INSERT INTO weekly_summaries (
--     user_id, 
--     week_start_date, 
--     week_end_date,
--     timetable_adherence_percent,
--     good_habits_completed,
--     bad_habits_broken,
--     medicine_adherence_percent,
--     diet_followed_percent,
--     summary_text
--   ) VALUES (
--     user_uuid,
--     start_date,
--     start_date + 6,
--     ROUND((timetable_days::float / total_days) * 100),
--     habit_days,
--     total_days - habit_days,
--     ROUND((medicine_days::float / total_days) * 100),
--     ROUND((diet_days::float / total_days) * 100),
--     format(
--       'Weekly Report %s to %s: Timetable Adherence: %s%%. Good Habits: %s/%s days. Medicine Adherence: %s%%. Diet Followed: %s%%. %s',
--       start_date,
--       start_date + 6,
--       ROUND((timetable_days::float / total_days) * 100),
--       habit_days,
--       total_days,
--       ROUND((medicine_days::float / total_days) * 100),
--       ROUND((diet_days::float / total_days) * 100),
--       CASE 
--         WHEN (timetable_days::float / total_days) > 0.8 THEN 'Excellent discipline maintained!'
--         WHEN (timetable_days::float / total_days) > 0.6 THEN 'Good progress, keep going!'
--         WHEN (timetable_days::float / total_days) > 0.4 THEN 'Average week, room for improvement.'
--         ELSE 'Need to refocus and rebuild discipline.'
--       END
--     )
--   ) RETURNING * INTO summary_record;
  
--   RETURN NEXT summary_record;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- ============================================
-- -- VIEWS FOR REPORTING
-- -- ============================================

-- -- View for today's schedule
-- CREATE OR REPLACE VIEW today_schedule AS
-- SELECT 
--   u.email,
--   dt.title as activity,
--   dt.start_time,
--   dt.end_time,
--   dt.category
-- FROM daily_timetable dt
-- JOIN users u ON dt.user_id = u.id
-- WHERE dt.day_of_week = EXTRACT(DOW FROM CURRENT_DATE)
-- ORDER BY dt.start_time;

-- -- View for pending reminders
-- CREATE OR REPLACE VIEW pending_reminders AS
-- SELECT 
--   u.email,
--   t.title as task_title,
--   r.remind_at,
--   r.reminder_type
-- FROM reminders r
-- JOIN tasks t ON r.task_id = t.id
-- JOIN users u ON t.user_id = u.id
-- WHERE r.sent = false 
--   AND r.remind_at <= NOW() + INTERVAL '5 minutes'
-- ORDER BY r.remind_at;








-- ============================================
-- LIFE DISCIPLINE SYSTEM - COMPLETE SCHEMA (FIXED)
-- ============================================

-- First, let's ensure we don't have duplicate tables by dropping old ones if they exist
-- (Only if you're starting fresh, otherwise skip this section)

-- -- If you want to start fresh, uncomment these lines:
-- DROP TABLE IF EXISTS accountability_partners CASCADE;
-- DROP TABLE IF EXISTS weekly_summaries CASCADE;
-- DROP TABLE IF EXISTS date_events CASCADE;
-- DROP TABLE IF EXISTS diet_plans CASCADE;
-- DROP TABLE IF EXISTS habits CASCADE;
-- DROP TABLE IF EXISTS daily_checkins CASCADE;
-- DROP TABLE IF EXISTS medicines CASCADE;
-- DROP TABLE IF EXISTS daily_timetable CASCADE;
-- DROP TABLE IF EXISTS user_promises_do CASCADE;
-- DROP TABLE IF EXISTS user_promises_dont CASCADE;
-- DROP FUNCTION IF EXISTS generate_weekly_summary CASCADE;
-- DROP FUNCTION IF EXISTS update_user_last_active CASCADE;

-- USERS TABLE (Extended)
ALTER TABLE users ADD COLUMN IF NOT EXISTS discipline_goal text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mentor_email text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_streak integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date date;

-- PROMISES - Things I WILL NOT DO
CREATE TABLE IF NOT EXISTS user_promises_dont (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'strict')),
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- PROMISES - Things I MUST DO
CREATE TABLE IF NOT EXISTS user_promises_do (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  frequency text CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  target_count integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- DAILY TIMETABLE (24-hour schedule)
CREATE TABLE IF NOT EXISTS daily_timetable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, etc.
  start_time time NOT NULL,
  end_time time NOT NULL,
  title text NOT NULL,
  description text,
  category text CHECK (category IN ('work', 'study', 'health', 'personal', 'leisure', 'rest')),
  priority integer DEFAULT 3,
  is_recurring boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- MEDICINES/SCHEDULED ITEMS
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text,
  schedule_type text CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'specific')),
  time_of_day text[], -- Using text[] for easier handling
  days_of_week integer[], -- [0,1,2,3,4,5,6]
  reminder_minutes_before integer DEFAULT 5,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- DIET PLANS
CREATE TABLE IF NOT EXISTS diet_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type text CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  name text NOT NULL,
  description text,
  calories integer,
  time_of_day text, -- Using text instead of time
  days_of_week integer[],
  created_at timestamptz DEFAULT now()
);

-- HABITS TRACKING
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text CHECK (category IN ('health', 'learning', 'productivity', 'personal', 'financial')),
  target_frequency text CHECK (target_frequency IN ('daily', 'weekly', 'monthly')),
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- DAILY CHECK-IN RESPONSES
CREATE TABLE IF NOT EXISTS daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date date NOT NULL DEFAULT CURRENT_DATE,
  checkin_type text CHECK (checkin_type IN ('morning', 'night', 'midday')),
  question_1_response boolean, -- Followed timetable?
  question_2_response boolean, -- Avoided bad habits?
  question_3_response boolean, -- Followed good habits?
  question_4_response boolean, -- Took medicines?
  question_5_response boolean, -- Studied as per plan?
  question_6_response boolean, -- Ate according to diet?
  question_7_response boolean, -- Read book?
  question_8_response boolean, -- Worked out?
  overall_mood text CHECK (overall_mood IN ('excellent', 'good', 'neutral', 'poor', 'terrible')),
  notes text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, checkin_date, checkin_type)
);

-- WEEKLY SUMMARIES
CREATE TABLE IF NOT EXISTS weekly_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  timetable_adherence_percent integer DEFAULT 0,
  good_habits_completed integer DEFAULT 0,
  bad_habits_broken integer DEFAULT 0,
  medicine_adherence_percent integer DEFAULT 0,
  diet_followed_percent integer DEFAULT 0,
  streak_maintained boolean DEFAULT false,
  summary_text text,
  sent_to_mentor boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ACCOUNTABILITY PARTNERS
CREATE TABLE IF NOT EXISTS accountability_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_type text CHECK (partner_type IN ('telegram', 'email', 'phone')),
  contact_info text NOT NULL,
  receives_daily_updates boolean DEFAULT false,
  receives_weekly_reports boolean DEFAULT true,
  receives_failure_alerts boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- DATE-SPECIFIC EVENTS
CREATE TABLE IF NOT EXISTS date_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  start_time text, -- Using text instead of time
  end_time text,
  event_type text CHECK (event_type IN ('meeting', 'appointment', 'exam', 'deadline', 'celebration')),
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- SAMPLE DATA (FIXED VERSION)
-- ============================================

-- Insert test user if not exists
INSERT INTO auth.users (id, email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@lifediscipline.com'
) ON CONFLICT (id) DO NOTHING;

-- Sample "WILL NOT DO" promises
INSERT INTO user_promises_dont (user_id, title, description, severity) VALUES
('00000000-0000-0000-0000-000000000001', 'No porn', 'Complete abstinence from adult content', 'strict'),
('00000000-0000-0000-0000-000000000001', 'No junk food', 'Avoid processed food and sugar', 'high'),
('00000000-0000-0000-0000-000000000001', 'No social media', 'Limit to 30 mins per day max', 'medium'),
('00000000-0000-0000-0000-000000000001', 'No late nights', 'Sleep by 11 PM daily', 'high')
ON CONFLICT (id) DO NOTHING;

-- Sample "MUST DO" promises
INSERT INTO user_promises_do (user_id, title, description, frequency) VALUES
('00000000-0000-0000-0000-000000000001', 'Read 20 pages', 'Non-fiction personal development', 'daily'),
('00000000-0000-0000-0000-000000000001', 'Morning workout', '30 minutes exercise', 'daily'),
('00000000-0000-0000-0000-000000000001', 'Meditate', '10 minutes mindfulness', 'daily'),
('00000000-0000-0000-0000-000000000001', 'Drink 3L water', 'Stay hydrated', 'daily')
ON CONFLICT (id) DO NOTHING;

-- Sample daily timetable
INSERT INTO daily_timetable (user_id, day_of_week, start_time, end_time, title, category) VALUES
('00000000-0000-0000-0000-000000000001', 1, '07:00', '07:30', 'Wake up & morning routine', 'personal'),
('00000000-0000-0000-0000-000000000001', 1, '07:30', '08:30', 'Workout & breakfast', 'health'),
('00000000-0000-0000-0000-000000000001', 1, '08:30', '12:30', 'Deep work session', 'work'),
('00000000-0000-0000-0000-000000000001', 1, '12:30', '13:30', 'Lunch break', 'rest'),
('00000000-0000-0000-0000-000000000001', 1, '13:30', '17:30', 'Skill learning', 'study'),
('00000000-0000-0000-0000-000000000001', 1, '17:30', '18:30', 'Exercise', 'health'),
('00000000-0000-0000-0000-000000000001', 1, '18:30', '20:00', 'Personal projects', 'work'),
('00000000-0000-0000-0000-000000000001', 1, '20:00', '21:00', 'Dinner & family time', 'personal'),
('00000000-0000-0000-0000-000000000001', 1, '21:00', '22:00', 'Reading', 'study'),
('00000000-0000-0000-0000-000000000001', 1, '22:00', '23:00', 'Planning for tomorrow', 'personal')
ON CONFLICT (id) DO NOTHING;

-- Sample medicines
INSERT INTO medicines (user_id, name, dosage, schedule_type, time_of_day) VALUES
('00000000-0000-0000-0000-000000000001', 'Vitamin D', '1000 IU', 'daily', ARRAY['08:00', '20:00']),
('00000000-0000-0000-0000-000000000001', 'Omega-3', '1000 mg', 'daily', ARRAY['08:00'])
ON CONFLICT (id) DO NOTHING;

-- Sample date-specific event
INSERT INTO date_events (user_id, title, event_date, start_time, event_type) VALUES
('00000000-0000-0000-0000-000000000001', 'Doctor Appointment', '2024-12-25', '15:00', 'appointment'),
('00000000-0000-0000-0000-000000000001', 'Online Exam', '2024-12-28', '10:00', 'exam')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_promises_dont ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_promises_do ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE accountability_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Policies for user_promises_dont
    DROP POLICY IF EXISTS "Users can view own dont promises" ON user_promises_dont;
    DROP POLICY IF EXISTS "Users can insert own dont promises" ON user_promises_dont;
    DROP POLICY IF EXISTS "Users can update own dont promises" ON user_promises_dont;
    DROP POLICY IF EXISTS "Users can delete own dont promises" ON user_promises_dont;
    DROP POLICY IF EXISTS "Users can manage own dont_promises" ON user_promises_dont;
    
    -- Policies for user_promises_do
    DROP POLICY IF EXISTS "Users can view own do promises" ON user_promises_do;
    DROP POLICY IF EXISTS "Users can insert own do promises" ON user_promises_do;
    DROP POLICY IF EXISTS "Users can update own do promises" ON user_promises_do;
    DROP POLICY IF EXISTS "Users can delete own do promises" ON user_promises_do;
    DROP POLICY IF EXISTS "Users can manage own do_promises" ON user_promises_do;
    
    -- Policies for daily_timetable
    DROP POLICY IF EXISTS "Users can view own timetable" ON daily_timetable;
    DROP POLICY IF EXISTS "Users can manage own timetable" ON daily_timetable;
    
    -- Policies for medicines
    DROP POLICY IF EXISTS "Users can view own medicines" ON medicines;
    DROP POLICY IF EXISTS "Users can manage own medicines" ON medicines;
    
    -- Policies for diet_plans
    DROP POLICY IF EXISTS "Users can view own diet plans" ON diet_plans;
    DROP POLICY IF EXISTS "Users can manage own diet plans" ON diet_plans;
    
    -- Policies for habits
    DROP POLICY IF EXISTS "Users can view own habits" ON habits;
    DROP POLICY IF EXISTS "Users can manage own habits" ON habits;
    
    -- Policies for daily_checkins
    DROP POLICY IF EXISTS "Users can view own checkins" ON daily_checkins;
    DROP POLICY IF EXISTS "Users can insert own checkins" ON daily_checkins;
    DROP POLICY IF EXISTS "Users can update own checkins" ON daily_checkins;
    
    -- Policies for weekly_summaries
    DROP POLICY IF EXISTS "Users can view own weekly summaries" ON weekly_summaries;
    
    -- Policies for accountability_partners
    DROP POLICY IF EXISTS "Users can view own partners" ON accountability_partners;
    DROP POLICY IF EXISTS "Users can manage own partners" ON accountability_partners;
    
    -- Policies for date_events
    DROP POLICY IF EXISTS "Users can view own date events" ON date_events;
    DROP POLICY IF EXISTS "Users can manage own date events" ON date_events;
END $$;

-- Now create new policies

-- Policies for user_promises_dont
CREATE POLICY "Users can view own dont promises" ON user_promises_dont
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dont promises" ON user_promises_dont
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dont promises" ON user_promises_dont
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dont promises" ON user_promises_dont
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for user_promises_do
CREATE POLICY "Users can view own do promises" ON user_promises_do
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own do promises" ON user_promises_do
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own do promises" ON user_promises_do
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own do promises" ON user_promises_do
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for daily_timetable
CREATE POLICY "Users can view own timetable" ON daily_timetable
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own timetable" ON daily_timetable
  FOR ALL USING (auth.uid() = user_id);

-- Policies for medicines
CREATE POLICY "Users can view own medicines" ON medicines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own medicines" ON medicines
  FOR ALL USING (auth.uid() = user_id);

-- Policies for diet_plans
CREATE POLICY "Users can view own diet plans" ON diet_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own diet plans" ON diet_plans
  FOR ALL USING (auth.uid() = user_id);

-- Policies for habits
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own habits" ON habits
  FOR ALL USING (auth.uid() = user_id);

-- Policies for daily_checkins
CREATE POLICY "Users can view own checkins" ON daily_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins" ON daily_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins" ON daily_checkins
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for weekly_summaries
CREATE POLICY "Users can view own weekly summaries" ON weekly_summaries
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for accountability_partners
CREATE POLICY "Users can view own partners" ON accountability_partners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own partners" ON accountability_partners
  FOR ALL USING (auth.uid() = user_id);

-- Policies for date_events
CREATE POLICY "Users can view own date events" ON date_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own date events" ON date_events
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update user's last active date
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET last_active_date = CURRENT_DATE,
      daily_streak = CASE 
        WHEN last_active_date = CURRENT_DATE - INTERVAL '1 day' 
        THEN daily_streak + 1 
        ELSE 1 
      END
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on daily_checkins to update streak
DROP TRIGGER IF EXISTS update_streak_on_checkin ON daily_checkins;
CREATE TRIGGER update_streak_on_checkin
  AFTER INSERT ON daily_checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_active();

-- Function to generate weekly summary
CREATE OR REPLACE FUNCTION generate_weekly_summary(user_uuid uuid, start_date date)
RETURNS SETOF weekly_summaries AS $$
DECLARE
  summary_record weekly_summaries;
  total_days integer := 7;
  timetable_days integer;
  habit_days integer;
  medicine_days integer;
  diet_days integer;
BEGIN
  -- Calculate adherence percentages
  SELECT COUNT(*) INTO timetable_days
  FROM daily_checkins 
  WHERE user_id = user_uuid 
    AND checkin_date BETWEEN start_date AND start_date + 6
    AND question_1_response = true;
    
  SELECT COUNT(*) INTO habit_days
  FROM daily_checkins 
  WHERE user_id = user_uuid 
    AND checkin_date BETWEEN start_date AND start_date + 6
    AND question_2_response = true 
    AND question_3_response = true;
    
  SELECT COUNT(*) INTO medicine_days
  FROM daily_checkins 
  WHERE user_id = user_uuid 
    AND checkin_date BETWEEN start_date AND start_date + 6
    AND question_4_response = true;
    
  SELECT COUNT(*) INTO diet_days
  FROM daily_checkins 
  WHERE user_id = user_uuid 
    AND checkin_date BETWEEN start_date AND start_date + 6
    AND question_6_response = true;
  
  -- Insert into weekly_summaries
  INSERT INTO weekly_summaries (
    user_id, 
    week_start_date, 
    week_end_date,
    timetable_adherence_percent,
    good_habits_completed,
    bad_habits_broken,
    medicine_adherence_percent,
    diet_followed_percent,
    summary_text
  ) VALUES (
    user_uuid,
    start_date,
    start_date + 6,
    ROUND((timetable_days::float / total_days) * 100),
    habit_days,
    total_days - habit_days,
    ROUND((medicine_days::float / total_days) * 100),
    ROUND((diet_days::float / total_days) * 100),
    format(
      'Weekly Report %s to %s: Timetable Adherence: %s%%. Good Habits: %s/%s days. Medicine Adherence: %s%%. Diet Followed: %s%%. %s',
      start_date,
      start_date + 6,
      ROUND((timetable_days::float / total_days) * 100),
      habit_days,
      total_days,
      ROUND((medicine_days::float / total_days) * 100),
      ROUND((diet_days::float / total_days) * 100),
      CASE 
        WHEN (timetable_days::float / total_days) > 0.8 THEN 'Excellent discipline maintained!'
        WHEN (timetable_days::float / total_days) > 0.6 THEN 'Good progress, keep going!'
        WHEN (timetable_days::float / total_days) > 0.4 THEN 'Average week, room for improvement.'
        ELSE 'Need to refocus and rebuild discipline.'
      END
    )
  ) RETURNING * INTO summary_record;
  
  RETURN NEXT summary_record;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View for today's schedule
CREATE OR REPLACE VIEW today_schedule AS
SELECT 
  u.email,
  dt.title as activity,
  dt.start_time,
  dt.end_time,
  dt.category
FROM daily_timetable dt
JOIN users u ON dt.user_id = u.id
WHERE dt.day_of_week = EXTRACT(DOW FROM CURRENT_DATE)
ORDER BY dt.start_time;

-- View for pending reminders
-- Note: This requires a reminders table which doesn't exist in your schema
-- If you need this, you should create the reminders table first
/*
CREATE OR REPLACE VIEW pending_reminders AS
SELECT 
  u.email,
  t.title as task_title,
  r.remind_at,
  r.reminder_type
FROM reminders r
JOIN tasks t ON r.task_id = t.id
JOIN users u ON t.user_id = u.id
WHERE r.sent = false 
  AND r.remind_at <= NOW() + INTERVAL '5 minutes'
ORDER BY r.remind_at;
*/