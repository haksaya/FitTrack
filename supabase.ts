
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kntkhnmklgjhrbwuejii.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lnttkyZGhO-uCFaDZYD_kQ_llmBs9yD';

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
