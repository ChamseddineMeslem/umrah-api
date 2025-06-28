-- ✳️ 1. الجداول الأساسية
CREATE TABLE airports (
  id serial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  city text,
  country text
);

CREATE TABLE airlines (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL
);

CREATE TABLE site_stats (
  id serial PRIMARY KEY,
  total_visits bigint DEFAULT 0
);

-- ✳️ 2. وكالات السفر
CREATE TABLE agencies (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  wilaya text NOT NULL,
  license_number text NOT NULL,
  phone text NOT NULL,
  bank_account text,
  logo_url text,
  background_url text,
  location_name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

CREATE TABLE agency_airports (
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  airport_id int REFERENCES airports(id) ON DELETE CASCADE,
  PRIMARY KEY (agency_id, airport_id)
);

-- ✳️ 3. فروع الوكالات
CREATE TABLE agency_branches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  email text,
  password text,
  wilaya text,
  departure_airport text,
  location_name text,
  latitude numeric,
  longitude numeric,
  manager_phone text
);

CREATE TABLE agency_branches_airports (
  agency_id uuid REFERENCES agency_branches(id) ON DELETE CASCADE,
  airport_id int REFERENCES airports(id) ON DELETE CASCADE,
  PRIMARY KEY (agency_id, airport_id)
);

-- ✳️ 4. إدارة الموقع
CREATE TABLE admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'sub',
  created_by uuid REFERENCES admins(id), -- ✅ تم التعديل هنا من INTEGER إلى UUID
  permissions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✳️ 5. العروض
CREATE TABLE offers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  title text NOT NULL,
  main_image text,
  services jsonb,
  airline_id int REFERENCES airlines(id),
  flight_type text CHECK (flight_type IN ('مباشرة', 'غير مباشرة')),
  departure_date date,
  return_date date,
  duration_days int,
  hotel_name text,
  hotel_distance numeric,
  hotel_images text[],
  description text,
  entry_exit text,
  price_double numeric,
  price_triple numeric,
  price_quad numeric,
  price_quint numeric,
  created_at timestamp DEFAULT now()
);

CREATE TABLE offer_gifts (
  id serial PRIMARY KEY,
  offer_id uuid REFERENCES offers(id) ON DELETE CASCADE,
  gift_name text
);

CREATE TABLE offer_view_counts (
  offer_id uuid PRIMARY KEY REFERENCES offers(id) ON DELETE CASCADE,
  view_count bigint DEFAULT 0
);

-- ✳️ 6. الحجوزات
CREATE TABLE bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id uuid REFERENCES offers(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  passport_image_url text,
  room_type text,
  status text DEFAULT 'قيد الانتظار' CHECK (status IN ('قيد الانتظار', 'مقبول', 'مرفوض')),
  tracking_code text UNIQUE,
  created_at timestamp DEFAULT now()
);

-- ✳️ 7. الدردشة
CREATE TABLE chats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now()
);

CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type text CHECK (sender_type IN ('agency', 'admin')),
  message text NOT NULL,
  sent_at timestamp DEFAULT now()
);

-- ✳️ 8. سجل النشاطات
CREATE TABLE admin_activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES auth.users(id),
  action text,
  target_type text,
  target_id uuid,
  created_at timestamp DEFAULT now()
);
