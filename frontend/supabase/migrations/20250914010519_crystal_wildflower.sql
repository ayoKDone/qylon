/*
  # Create waitlist table

  1. New Tables
    - `waitlist`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `source` (text) - tracks which form was used (hero or final-cta)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `waitlist` table
    - Add policy for public insert access
    - Add policy for authenticated users to read data (for admin)
*/

CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  source text DEFAULT 'unknown',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit emails to waitlist
CREATE POLICY "Anyone can submit to waitlist"
  ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read waitlist entries (for admin dashboard)
CREATE POLICY "Authenticated users can read waitlist"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (true);