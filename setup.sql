-- ============================================
-- FitTrack Veritabanı - Supabase Kurulum Script
-- ============================================
-- Bu script tüm tabloları sıfırdan oluşturur ve örnek verilerle doldurur
-- 
-- KULLANIM:
-- 1. Supabase Dashboard → SQL Editor açın
-- 2. Bu scriptin tamamını kopyalayıp yapıştırın
-- 3. "Run" butonuna tıklayın
-- 4. Demo Giriş: demo@fittrack.com / demo123
-- ============================================

-- ============================================
-- ADIM 1: Mevcut Tabloları Temizle
-- ============================================
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS activity_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS login_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS hash_password(TEXT);
DROP FUNCTION IF EXISTS verify_password(TEXT, TEXT);

-- ============================================
-- ADIM 2: Extension ve Fonksiyonlar
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Şifre hashleme fonksiyonu
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql;

-- Şifre doğrulama fonksiyonu
CREATE OR REPLACE FUNCTION verify_password(password TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN password_hash = crypt(password, password_hash);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ADIM 3: Kullanıcılar Tablosu
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS'i kapat (basit kullanım için)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ADIM 4: Aktivite Türleri Tablosu
-- ============================================
CREATE TABLE activity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL DEFAULT '🏃',
  color VARCHAR(50) NOT NULL DEFAULT '#3b82f6',
  unit VARCHAR(20) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS'i kapat
ALTER TABLE activity_types DISABLE ROW LEVEL SECURITY;

-- Index oluştur
CREATE INDEX idx_activity_types_user_id ON activity_types(user_id);

-- ============================================
-- ADIM 5: Aktivite Kayıtları Tablosu
-- ============================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type_id UUID NOT NULL REFERENCES activity_types(id) ON DELETE CASCADE,
  value NUMERIC(10, 2) NOT NULL,
  duration NUMERIC(10, 2),
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS'i kapat
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- Index'ler oluştur
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_date ON activity_logs(date);
CREATE INDEX idx_activity_logs_type_id ON activity_logs(activity_type_id);

-- ============================================
-- ADIM 6: Kilo Takibi Tablosu
-- ============================================
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight NUMERIC(5, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS'i kapat
ALTER TABLE weight_logs DISABLE ROW LEVEL SECURITY;

-- Index'ler oluştur
CREATE INDEX idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX idx_weight_logs_date ON weight_logs(date);

-- ============================================
-- ADIM 7: Login Fonksiyonu
-- ============================================
CREATE OR REPLACE FUNCTION login_user(user_email TEXT, user_password TEXT)
RETURNS TABLE (id UUID, email TEXT, full_name TEXT, role TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id, 
    u.email::TEXT, 
    u.full_name::TEXT, 
    u.role::TEXT
  FROM users u
  WHERE u.email = user_email 
    AND verify_password(user_password, u.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADIM 8: Demo Kullanıcı ve Veriler
-- ============================================

-- Demo kullanıcı oluştur
INSERT INTO users (email, password_hash, full_name, role)
VALUES (
  'demo@fittrack.com',
  hash_password('demo123'),
  'Demo Kullanıcı',
  'user'
);

-- Admin kullanıcıyı güncelle
UPDATE users 
SET email = 'admin',
    password_hash = hash_password('p@sSw0rdf'),
    updated_at = NOW()
WHERE role = 'admin';

-- Demo kullanıcı ID'sini al
DO $$
DECLARE
  demo_user_id UUID;
  admin_user_id UUID;
  
  kosu_id UUID;
  yuruyus_id UUID;
  bisiklet_id UUID;
  sinav_id UUID;
  mekik_id UUID;
  barfiks_id UUID;
BEGIN
  -- Kullanıcı ID'lerini al
  SELECT id INTO demo_user_id FROM users WHERE email = 'demo@fittrack.com';
  SELECT id INTO admin_user_id FROM users WHERE email = 'admin';

  -- Spor türlerini ekle (demo kullanıcı için)
  INSERT INTO activity_types (name, icon, color, unit, user_id, is_default)
  VALUES 
    ('Koşu', '🏃', '#3b82f6', 'dk', demo_user_id, true) RETURNING id INTO kosu_id;
  
  INSERT INTO activity_types (name, icon, color, unit, user_id, is_default)
  VALUES
    ('Yürüyüş', '🚶', '#10b981', 'dk', demo_user_id, true) RETURNING id INTO yuruyus_id;
    
  INSERT INTO activity_types (name, icon, color, unit, user_id, is_default)
  VALUES
    ('Bisiklet', '🚴', '#f59e0b', 'dk', demo_user_id, true) RETURNING id INTO bisiklet_id;
    
  INSERT INTO activity_types (name, icon, color, unit, user_id, is_default)
  VALUES
    ('Şınav', '💪', '#ef4444', 'tekrar', demo_user_id, true) RETURNING id INTO sinav_id;
    
  INSERT INTO activity_types (name, icon, color, unit, user_id, is_default)
  VALUES
    ('Mekik', '🔥', '#0ea5e9', 'tekrar', demo_user_id, true) RETURNING id INTO mekik_id;
    
  INSERT INTO activity_types (name, icon, color, unit, user_id, is_default)
  VALUES
    ('Barfiks', '🦾', '#3b82f6', 'tekrar', demo_user_id, true) RETURNING id INTO barfiks_id;

  INSERT INTO activity_types (name, icon, color, unit, user_id, is_default)
  VALUES
    ('Yüzme', '🏊', '#06b6d4', 'dk', demo_user_id, true),
    ('Yoga', '🧘', '#0284c7', 'dk', demo_user_id, true),
    ('Plank', '🧱', '#f97316', 'saniye', demo_user_id, true);

  -- Örnek aktivite kayıtları ekle (son 7 gün)
  
  -- Bugün
  INSERT INTO activity_logs (user_id, activity_type_id, value, date, notes)
  VALUES 
    (demo_user_id, sinav_id, 50, CURRENT_DATE, 'Sabah antrenmanı - çok iyiydi!'),
    (demo_user_id, mekik_id, 80, CURRENT_DATE, 'Yeni rekor 🎉'),
    (demo_user_id, kosu_id, 25, CURRENT_DATE, '5km koşu');

  -- Dün
  INSERT INTO activity_logs (user_id, activity_type_id, value, date, notes)
  VALUES 
    (demo_user_id, barfiks_id, 15, CURRENT_DATE - 1, 'Güç antrenmanı'),
    (demo_user_id, sinav_id, 45, CURRENT_DATE - 1, 'Akşam seti'),
    (demo_user_id, yuruyus_id, 40, CURRENT_DATE - 1, 'Akşam yürüyüşü');

  -- 2 gün önce
  INSERT INTO activity_logs (user_id, activity_type_id, value, date, notes)
  VALUES 
    (demo_user_id, mekik_id, 75, CURRENT_DATE - 2, 'Karın çalışması'),
    (demo_user_id, bisiklet_id, 60, CURRENT_DATE - 2, 'Park turu');

  -- 3 gün önce
  INSERT INTO activity_logs (user_id, activity_type_id, value, date, notes)
  VALUES 
    (demo_user_id, sinav_id, 55, CURRENT_DATE - 3, 'Öğlen antrenmanı'),
    (demo_user_id, kosu_id, 30, CURRENT_DATE - 3, 'Tempolu koşu');

  -- 4 gün önce
  INSERT INTO activity_logs (user_id, activity_type_id, value, date, notes)
  VALUES 
    (demo_user_id, barfiks_id, 12, CURRENT_DATE - 4, 'Sırt günü'),
    (demo_user_id, mekik_id, 70, CURRENT_DATE - 4, 'Karın');

  -- 5 gün önce
  INSERT INTO activity_logs (user_id, activity_type_id, value, date, notes)
  VALUES 
    (demo_user_id, sinav_id, 48, CURRENT_DATE - 5, 'Göğüs çalışması'),
    (demo_user_id, yuruyus_id, 35, CURRENT_DATE - 5, 'Hafif tempo');

  -- 6 gün önce
  INSERT INTO activity_logs (user_id, activity_type_id, value, date, notes)
  VALUES 
    (demo_user_id, kosu_id, 20, CURRENT_DATE - 6, 'İyileşme koşusu'),
    (demo_user_id, bisiklet_id, 45, CURRENT_DATE - 6, 'Sabah bisikleti');

  -- Demo kilo kayıtları ekle (son 30 gün için gerçekçi bir kilo takibi)
  INSERT INTO weight_logs (user_id, weight, date, notes)
  VALUES 
    (demo_user_id, 78.5, CURRENT_DATE, 'Sabah kilom'),
    (demo_user_id, 78.8, CURRENT_DATE - 2, 'Hafif artış'),
    (demo_user_id, 79.2, CURRENT_DATE - 5, null),
    (demo_user_id, 79.5, CURRENT_DATE - 7, 'Hafta başı ölçümü'),
    (demo_user_id, 79.8, CURRENT_DATE - 10, null),
    (demo_user_id, 80.1, CURRENT_DATE - 14, 'İki haftalık ölçüm'),
    (demo_user_id, 80.5, CURRENT_DATE - 17, null),
    (demo_user_id, 80.9, CURRENT_DATE - 21, 'Üç hafta önce'),
    (demo_user_id, 81.2, CURRENT_DATE - 25, null),
    (demo_user_id, 81.5, CURRENT_DATE - 28, 'Başlangıç kilom');

END $$;

-- ============================================
-- KURULUM TAMAMLANDI!
-- ============================================
-- 
-- ✅ Tüm tablolar oluşturuldu
-- ✅ RLS devre dışı bırakıldı
-- ✅ Fonksiyonlar hazır
-- ✅ Demo veriler yüklendi
-- 
-- GİRİŞ BİLGİLERİ:
-- Demo Kullanıcı: demo@fittrack.com / demo123
-- Admin Kullanıcı: admin / p@sSw0rdf
-- 
-- NOT: Güvenlik için production ortamında RLS'i aktif edin!
-- ============================================
