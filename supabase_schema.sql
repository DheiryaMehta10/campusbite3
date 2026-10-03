-- =========================================================
-- CampusBite - PostgreSQL Database Schema for Supabase
-- "Order Smart. Delivered by Slot."
-- =========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- 1. ENUMS
-- =========================================================
DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM (
        'placed',
        'restaurant_accepted',
        'preparing',
        'ready_for_delivery',
        'out_for_delivery',
        'arrived',
        'ready_for_collection',
        'delivered',
        'cancelled',
        'failed',
        'uncollected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE catalog_type_enum AS ENUM ('food', 'grocery', 'medical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE operational_status_enum AS ENUM ('open', 'temporarily_closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE closure_source_enum AS ENUM ('RESTAURANT', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =========================================================
-- 2. TABLES
-- =========================================================

-- Students Profile Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    college_name VARCHAR(150) NOT NULL,
    hostel_name VARCHAR(100) NOT NULL,
    room_number VARCHAR(50),
    email VARCHAR(150) NOT NULL,
    account_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurants Table
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    image_url TEXT,
    rating NUMERIC(2,1) DEFAULT 4.5,
    operational_status operational_status_enum DEFAULT 'open',
    closed_by closure_source_enum DEFAULT NULL,
    closure_reason TEXT,
    closed_at TIMESTAMPTZ,
    reopened_at TIMESTAMPTZ,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurant Staff Users
CREATE TABLE IF NOT EXISTS restaurant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type catalog_type_enum NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon TEXT,
    display_order INT DEFAULT 0
);

-- Food Items (Restaurant Specific)
CREATE TABLE IF NOT EXISTS food_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    is_veg BOOLEAN DEFAULT TRUE,
    is_sold_out BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grocery Items
CREATE TABLE IF NOT EXISTS grocery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    image_url TEXT,
    stock INT DEFAULT 100,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grocery Item Variants
CREATE TABLE IF NOT EXISTS grocery_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grocery_item_id UUID REFERENCES grocery_items(id) ON DELETE CASCADE,
    variant_name VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    stock INT DEFAULT 50,
    active BOOLEAN DEFAULT TRUE
);

-- Medical Essentials Catalogue (Excluding Thermometer)
CREATE TABLE IF NOT EXISTS medical_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    dosage_info TEXT,
    is_sold_out BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery Slots
CREATE TABLE IF NOT EXISTS delivery_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    cutoff_time TIME NOT NULL,
    max_orders INT DEFAULT 100,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blackout Dates (No Delivery Dates)
CREATE TABLE IF NOT EXISTS blackout_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blackout_date DATE UNIQUE NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery Fee Configuration
CREATE TABLE IF NOT EXISTS delivery_fee_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_amount NUMERIC(10,2) DEFAULT 10.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform Fee Rules (Configurable item-count based)
CREATE TABLE IF NOT EXISTS platform_fee_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    min_items INT NOT NULL,
    max_items INT NOT NULL,
    fee_amount NUMERIC(10,2) NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- Student Carts
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    cart_type catalog_type_enum DEFAULT 'food',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    item_type catalog_type_enum NOT NULL,
    item_id UUID NOT NULL,
    variant_id UUID,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE RESTRICT,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
    catalog_type catalog_type_enum DEFAULT 'food',
    delivery_slot_id UUID REFERENCES delivery_slots(id) ON DELETE RESTRICT,
    subtotal NUMERIC(10,2) NOT NULL,
    delivery_fee NUMERIC(10,2) NOT NULL,
    platform_fee NUMERIC(10,2) NOT NULL,
    discount NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cod',
    payment_status VARCHAR(50) DEFAULT 'pending',
    order_status order_status_enum DEFAULT 'placed',
    placed_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancellation_reason TEXT
);

-- Order Items (Snapshots)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    item_type catalog_type_enum NOT NULL,
    item_id UUID,
    item_name VARCHAR(150) NOT NULL,
    variant_name VARCHAR(100),
    quantity INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL
);

-- Uncollected Orders Management
CREATE TABLE IF NOT EXISTS uncollected_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    contacted BOOLEAN DEFAULT FALSE,
    contacted_at TIMESTAMPTZ,
    collected BOOLEAN DEFAULT FALSE,
    collected_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners Table
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    target_type VARCHAR(50) DEFAULT 'food',
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    active BOOLEAN DEFAULT TRUE
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo Codes Table
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    min_order_amount NUMERIC(10,2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Audit Actions
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID,
    action_name VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100),
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 3. SEED INITIAL DATA (Guaranteed MVP Defaults)
-- =========================================================

-- Delivery Fee Default: ₹10
INSERT INTO delivery_fee_config (fee_amount) 
SELECT 10.00 WHERE NOT EXISTS (SELECT 1 FROM delivery_fee_config);

-- Platform Fee Rules Defaults: 1-3 -> ₹2, 4-7 -> ₹4
INSERT INTO platform_fee_rules (min_items, max_items, fee_amount, active)
VALUES 
    (1, 3, 2.00, true),
    (4, 7, 4.00, true)
ON CONFLICT DO NOTHING;

-- Delivery Slots: Lunch (disabled), Evening 1 (6-7 PM, cutoff 5:50 PM), Evening 2 (7-8 PM, cutoff 6:50 PM)
INSERT INTO delivery_slots (name, start_time, end_time, cutoff_time, max_orders, active)
VALUES 
    ('Lunch Slot (12:00 PM – 1:00 PM)', '12:00:00', '13:00:00', '11:50:00', 50, false),
    ('Evening Slot 1 (6:00 PM – 7:00 PM)', '18:00:00', '19:00:00', '17:50:00', 100, true),
    ('Evening Slot 2 (7:00 PM – 8:00 PM)', '19:00:00', '20:00:00', '18:50:00', 100, true)
ON CONFLICT DO NOTHING;

-- Default Admin Account: admin@campusbite.local / admin123
INSERT INTO admin_users (email, password_hash, role)
VALUES ('admin@campusbite.local', 'admin123', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Default Restaurants
INSERT INTO restaurants (id, name, description, image_url, rating, operational_status, active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Campus Canteen Central', 'Fresh hot meals, North & South Indian thalis, and quick snacks.', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500', 4.8, 'open', true),
    ('22222222-2222-2222-2222-222222222222', 'Night Owl Diner', 'Late night burgers, sandwiches, rolls, and cold coffee.', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500', 4.6, 'open', true),
    ('33333333-3333-3333-3333-333333333333', 'Dosa & Chaat Express', 'Crispy dosas, samosas, pav bhaji, and authentic street chaat.', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500', 4.7, 'open', true)
ON CONFLICT (id) DO NOTHING;

-- Restaurant Staff Account
INSERT INTO restaurant_users (restaurant_id, phone_number, email, password_hash)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '9876543210', 'canteen@campusbite.local', 'canteen123')
ON CONFLICT DO NOTHING;

-- Food Items
INSERT INTO food_items (restaurant_id, name, description, price, image_url, is_veg, is_sold_out, active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Special Paneer Butter Masala Thali', 'Served with 3 Butter Rotis, Jeera Rice, Dal Tadka, and Gulab Jamun', 160.00, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500', true, false, true),
    ('11111111-1111-1111-1111-111111111111', 'Butter Chicken Combo', 'Rich creamy butter chicken with 2 Garlic Naans and Steamed Rice', 190.00, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500', false, false, true),
    ('11111111-1111-1111-1111-111111111111', 'Veg Hakka Noodles & Manchurian', 'Spicy wok tossed noodles with crisp veg manchurian gravy', 140.00, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', true, false, true),
    ('22222222-2222-2222-2222-222222222222', 'Double Cheese Crispy Burger', 'Crunchy patty loaded with cheddar, lettuce, and secret garlic mayo', 110.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', true, false, true),
    ('22222222-2222-2222-2222-222222222222', 'Spicy Chicken Kathi Roll', 'Flaky paratha stuffed with marinated spicy chicken and onions', 120.00, 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500', false, false, true),
    ('33333333-3333-3333-3333-333333333333', 'Mysore Masala Dosa', 'Crispy golden dosa brushed with spicy red chutney and potato masala', 80.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500', true, false, true),
    ('33333333-3333-3333-3333-333333333333', 'Bombay Special Pav Bhaji (2 Pav)', 'Buttery mashed spiced vegetables served with toasted butter pavs', 90.00, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500', true, false, true)
ON CONFLICT DO NOTHING;

-- Grocery Items
INSERT INTO grocery_items (name, description, image_url, stock, active)
VALUES 
    ('Maggi 2-Minute Noodles (Pack of 4)', 'Classic masala instant noodles for late-night hostel cravings', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500', 50, true),
    ('Amul Taza Fresh Milk (500ml)', 'Pasteurized toned milk packet', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', 30, true),
    ('Lay''s Magic Masala Chips (50g)', 'Classic Indian spiced potato wafers', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', 100, true),
    ('Britannia Good Day Butter Cookies (200g)', 'Rich and crunchy butter cashew cookies', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', 40, true)
ON CONFLICT DO NOTHING;

-- Medical Essentials Catalogue (Notice: NO thermometer per specification requirement)
INSERT INTO medical_items (name, description, price, dosage_info, is_sold_out, active)
VALUES 
    ('Dolo 650 Tablets (Strip of 15)', 'Paracetamol 650mg for fever and body ache relief', 32.00, 'Take 1 tablet after meals as advised by physician', false, true),
    ('Moov Fast Pain Relief Spray (50g)', 'Ayurvedic fast pain relief spray for sprains, joint pain & backache', 145.00, 'Spray on affected area from 5cm distance', false, true),
    ('Hansaplast Waterproof Band-Aids (Pack of 10)', 'Sterile adhesive wound dressings for minor cuts and grazes', 40.00, 'Clean wound and apply sterile strip', false, true),
    ('Vicks Inhaler (0.5ml)', 'Provides fast relief from blocked nose and nasal congestion', 60.00, 'Inhale deeply through each nostril', false, true),
    ('ENO Lemon Sachet (Pack of 6)', 'Fast relief from acidity and indigestion in 6 seconds', 50.00, 'Dissolve 1 sachet in 150ml water and drink', false, true)
ON CONFLICT DO NOTHING;

-- Banners
INSERT INTO banners (title, description, image_url, target_type, active)
VALUES 
    ('Hostel Slot Delivery Live!', 'Order food & essentials before cutoff. Delivered right to your hostel.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', 'food', true),
    ('Evening Snacks & Chai', 'Hot samosas & rolls arriving in 6:00 PM – 7:00 PM slot.', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'food', true)
ON CONFLICT DO NOTHING;

-- Announcements
INSERT INTO announcements (title, message, active)
VALUES 
    ('Scheduled Slots Reminder', 'Evening Slot 1 cutoff is 5:50 PM. Evening Slot 2 cutoff is 6:50 PM.', true)
ON CONFLICT DO NOTHING;
