import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

// ВАЖНО: EXPO_PUBLIC_* переменные не передаются в EAS Build из .env
// автоматически если не настроены как EAS Secrets. Поэтому здесь
// захардкожен публичный anon key (он безопасен для клиента по дизайну Supabase).
const FALLBACK_URL = 'https://jqbeddqupxttexnmcxvb.supabase.co'
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxYmVkZHF1cHh0dGV4bm1jeHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzQ4NDYsImV4cCI6MjA5NjAxMDg0Nn0.ntWf2cn048qj9coSoS-2DG7Rn0Ig31LyDlj7EkBu7hA'

const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  FALLBACK_URL

const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  FALLBACK_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
