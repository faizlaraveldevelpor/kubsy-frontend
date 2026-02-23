import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "./Auth";
import { ProfileData } from "@/types/slice";
import axios from "axios";
import { Alert } from "react-native";
import { router } from "expo-router";
export async function getMyProfile() {
  const user = await getCurrentUser();
  return supabase.from('profiles').select('*').eq('id', user?.id).single();
}
export async function insertProfile(data: ProfileData) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  // RLS ke liye id field must include karo
  const profileData = {
    id: user.id,
    ...data,
  };

  const { data: insertedProfile, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select(); // updated row return karega

  if (error) {
    console.log('Supabase insert error:', error);
    throw error;
  }

  return insertedProfile;
}
export async function updateProfile(data: {
  full_name?: string;
  nickname?: string;
  date_of_birth?: string;
  gender?: string;
  avatar_url?: string;
  location?: { lat: number; lng: number; city?: string; country?: string };
  email?: string;
  phone?: string;
  images?: string[];
  interests?: string[];
  country?: string;
  pin?: string;
  is_vip?: boolean;
  daily_swipes_count?: number;
  profession:string
  about:string,
  cetagory:string
}) {
  // 1️⃣ Get current logged-in user
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  // 2️⃣ Update profile where id matches logged-in user
  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)
    .select(); // return updated row

  // 3️⃣ Error handling
  if (error) {
    console.error('Supabase update error:', error);
    throw error;
  }

  // 4️⃣ Return the updated profile
  return updatedProfile;
}
export async function deleteProfile() {
  // 1️⃣ Get current logged-in user
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  // 2️⃣ Delete profile where id matches logged-in user
  const { data: deletedProfile, error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id)
    .select(); // return deleted row

  // 3️⃣ Error handling
  if (error) {
    console.error('Supabase delete error:', error);
    throw error;
  }

  // 4️⃣ Return the deleted profile (optional)
  return deletedProfile;
}
const API_BASE = "https://vps.kubsy.app/api/v1";

export const fetchProfiles = async (userId: string, data: object, pageNum: number) => {
  const url = `${API_BASE}/profiles?page=${pageNum}`;
  try {
    const response = await axios.post(
      url,
      { data },
      {
        headers: {
          Authorization: userId,
          "Content-Type": "application/json",
        },
      }
    );

    console.log('Profiles:', response.data); 
    return response.data;
  } catch (error:any) {
    console.log('API Error:', error.response?.data || error.message);
    return null;
  }
};

/** Backend API: profile ki category (cetagory) update karo */
export const updateCategoryApi = async (userId: string, cetagory: string) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/profiles/category`,
      { cetagory },
      {
        headers: {
          Authorization: userId,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.log("Update category API error:", error.response?.data || error.message);
    throw error;
  }
};

export const blockprofiles=async(myId,otherUserId)=>{
 try {
            // 1. Pehle user ki maujooda blocked list fetch karein
            const { data: userData, error: fetchError } = await supabase
              .from('profiles')
              .select('blocked_profiles')
              .eq('id', myId)
              .single();

            if (fetchError) throw fetchError;

            // 2. Nayi ID ko array mein add karein (Duplicate check ke saath)
            const currentBlocked = userData?.blocked_profiles || [];
            if (currentBlocked.includes(otherUserId)) {
              Alert.alert("Info", "User is already blocked.");
              return;
            }

            const updatedBlocked = [...currentBlocked, otherUserId];

            // 3. Profiles table ko update karein
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ blocked_profiles: updatedBlocked })
              .eq('id', myId);

            if (updateError) throw updateError;

            Alert.alert("Blocked", "User has been added to your blocked list.");
            router.back(); 
          } catch (err: any) {
            console.error("Block Error:", err);
            Alert.alert("Error", err.message || "Could not update blocked list.");
          }

}
export const unblockProfile = async (myId: string, otherUserId: string) => {
  try {
    // 1. Pehle current blocked list fetch karein
    const { data: userData, error: fetchError } = await supabase
      .from('profiles')
      .select('blocked_profiles')
      .eq('id', myId)
      .single();

    if (fetchError) throw fetchError;

    const currentBlocked = userData?.blocked_profiles || [];

    // 2. Check karein ke kya user waqai block list mein hai
    if (!currentBlocked.includes(otherUserId)) {
      Alert.alert("Info", "User is not in your blocked list.");
      return;
    }

    // 3. Array se us ID ko nikaal dein (Filter out)
    const updatedBlocked = currentBlocked.filter((id: string) => id !== otherUserId);

    // 4. Profiles table ko update karein
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ blocked_profiles: updatedBlocked })
      .eq('id', myId);

    if (updateError) throw updateError;
  
    Alert.alert("Success", "User has been unblocked.");
    return "unblock"
  } catch (err: any) {
    console.error("Unblock Error:", err);
    Alert.alert("Error", err.message || "Could not unblock user.");
  }
};
export const getBlockedUsersData = async (currentUserId: string) => {
  try {
    // 1. Current user ki blocked_profiles array fetch karein
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('blocked_profiles')
      .eq('id', currentUserId)
      .single();

    if (userError) throw userError;

    const blockedIds = userData?.blocked_profiles || [];

    if (blockedIds.length === 0) return [];

    // 2. Un blocked IDs ka poora data (name, avatar_url) doosri table se layein
    const { data: blockedProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url') // Jo columns aapko chahiye
      .in('id', blockedIds); // 'in' filter array ke liye use hota hai

    if (profilesError) throw profilesError;

    return blockedProfiles;
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    return [];
  }
};