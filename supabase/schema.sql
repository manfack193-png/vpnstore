-- Run this in Supabase SQL Editor

-- Users table
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text unique not null,
  password text not null,
  role text default 'user',
  created_at timestamp default now()
);

-- Products table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  original_price numeric,
  category text not null,
  image_url text,
  badge text,
  features text[],
  duration text,
  stock int default 999,
  active boolean default true,
  featured boolean default false,
  created_at timestamp default now()
);

-- Orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id),
  customer_email text not null,
  customer_name text,
  items jsonb not null,
  total numeric not null,
  payment_method text not null,
  payment_number text,
  transaction_id text,
  status text default 'pending',
  delivered_keys text[],
  notes text,
  created_at timestamp default now()
);

-- Settings table (admin can update)
create table if not exists settings (
  key text primary key,
  value text not null
);

-- Insert default settings
insert into settings (key, value) values
  ('bkash_number', '01942786193'),
  ('nagad_number', '01942786193'),
  ('usdt_address', 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXx'),
  ('btc_address', 'bc1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'),
  ('site_name', 'VPNStore BD'),
  ('site_tagline', 'Best VPN & Gift Cards in Bangladesh'),
  ('whatsapp', '01942786193')
on conflict (key) do nothing;

-- Insert sample products
insert into products (name, description, price, original_price, category, badge, features, duration, featured, image_url) values
  ('NordVPN 1 Month', 'NordVPN premium - 6000+ servers, 60 countries, no-log policy', 299, 799, 'VPN', 'HOT', ARRAY['6000+ Servers', '60+ Countries', 'No-Log Policy', 'Kill Switch', '6 Devices'], '1 Month', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/NordVPN_logo_2022.svg/320px-NordVPN_logo_2022.svg.png'),
  ('NordVPN 6 Months', 'NordVPN 6 month plan - save 63%', 1299, 3500, 'VPN', 'SAVE 63%', ARRAY['6000+ Servers', '60+ Countries', 'No-Log Policy', 'Kill Switch', '6 Devices'], '6 Months', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/NordVPN_logo_2022.svg/320px-NordVPN_logo_2022.svg.png'),
  ('ExpressVPN 1 Month', 'ExpressVPN - 3000+ servers, 94 countries, blazing fast', 349, 899, 'VPN', 'FAST', ARRAY['3000+ Servers', '94 Countries', 'Split Tunneling', '5 Devices'], '1 Month', false, 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/ExpressVPN_logo.svg/320px-ExpressVPN_logo.svg.png'),
  ('Surfshark 1 Month', 'Surfshark - unlimited devices, CleanWeb ad blocker', 199, 599, 'VPN', 'CHEAP', ARRAY['Unlimited Devices', '3200+ Servers', 'CleanWeb', 'MultiHop'], '1 Month', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Surfshark_Logo.svg/320px-Surfshark_Logo.svg.png'),
  ('Google Play ৳500', 'Bangladesh Google Play Gift Card ৳500 - instant delivery', 480, 500, 'GIFT_CARD', 'INSTANT', ARRAY['Instant Delivery', 'BD Region', 'No Expiry', 'Official'], null, true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/320px-Google_Play_Store_badge_EN.svg.png'),
  ('Steam Wallet $10', 'Steam Wallet $10 USD - all Steam games', 1150, 1300, 'GIFT_CARD', 'POPULAR', ARRAY['Instant Delivery', 'Global', 'All Games', 'No Expiry'], null, true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/240px-Steam_icon_logo.svg.png');

-- Admin user (password: admin123)
insert into users (name, email, password, role) values
  ('Admin', 'admin@vpnstorebd.com', 'admin123', 'admin')
on conflict (email) do nothing;
