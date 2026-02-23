export interface ProfileData {
  id?: string|null;
  full_name?: string|null;
  nickname?: string|null;
  date_of_birth?: number|null; // timestamp
  gender?: string|null;
   avatar_url?: string|null;

  location?: {
    latitude?: number|null;
    longitude?: number|null;
  };

  email?: string|null;
  phone?: number|null;
   images?: string[]|null;
  interests?: string[]|null;
  is_vip?: boolean|null;
  daily_swipes_count?: number|null;
  created_at?: number|null;
  updated_at?: number|null;
  about?: string|null;
}


