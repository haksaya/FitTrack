
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iwzecuhqccyktwhmxtgi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3emVjdWhxY2N5a3R3aG14dGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDE5MDYsImV4cCI6MjA4MTgxNzkwNn0.QMmeRfVjDkhDAh-gkx8AD0SWg33drv50ir1ItSyh3z8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * ÖNEMLİ: KURULUM REHBERİ
 * 
 * 1. setup.sql dosyasındaki kodu Supabase SQL Editor'de çalıştırın.
 * 2. Supabase Panelinde -> Project Settings -> API -> RLS'nin kapalı 
 *    veya tabloların "anon" erişimine açık olduğundan emin olun.
 * 3. Artık Supabase Auth servisi yerine doğrudan 'users' tablosunu kullanıyoruz.
 * 
 * Varsayılan Kullanıcı:
 * E-posta: admin@sportakip.com
 * Şifre: SporTakip123!
 */
