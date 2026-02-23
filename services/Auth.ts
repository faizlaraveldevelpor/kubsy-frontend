import { supabase } from "@/lib/supabase";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export async function signUpEmail(email: string, password: string) {
  
  return supabase.auth.signUp({ email, password });
}
export async function signInEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}
export async function signInOAuth(provider: 'google' | 'facebook') {
  return supabase.auth.signInWithOAuth({ provider });
}
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}


