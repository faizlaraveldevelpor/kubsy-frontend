import { supabase } from "@/lib/supabase";

export const getUserMatches = async (userId: string, page: number = 0, pageSize: number = 10) => {
  if (!userId) throw new Error("Missing userId");

  const from = page * pageSize;
  const to = from + pageSize - 1;

  try {
    // 1️⃣ Reports fetch karein jin ka status true hai
    const { data: reportedData } = await supabase
      .from("reports")
      .select("reported_id")
      .eq("status", true);
    
    const reportedIds = reportedData?.map(r => r.reported_id) || [];

    // 2️⃣ Login user ki apni block list lein
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("blocked_profiles")
      .eq("id", userId)
      .single();
    
    const myBlockedList = myProfile?.blocked_profiles || [];

    // 3️⃣ Matches fetch karein
    const { data: matchesData, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .or(`user1.eq.${userId},user2.eq.${userId}`)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (matchError || !matchesData || matchesData.length === 0) return [];

    const otherUserIds = matchesData.map(match =>
      match.user1 === userId ? match.user2 : match.user1
    );

    // 4️⃣ Profiles fetch karein (Ab adminblock bhi select kar rahe hain)
    const { data: profilesData, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, profession, blocked_profiles, adminblock")
      .in("id", otherUserIds);

    if (profileError || !profilesData) return [];

    // 5️⃣ Final Filtering Logic
    const matches = matchesData.map(match => {
      const targetId = match.user1 === userId ? match.user2 : match.user1;
      const otherProfile = profilesData.find(p => p.id === targetId);

      if (!otherProfile) return null;

      // Condition 1: Kya Admin ne usay block kiya hai?
      if (otherProfile.adminblock === true) return null;

      // Condition 2: Kya wo Reports table mein true status ke sath hai?
      if (reportedIds.includes(targetId)) return null;

      // Condition 3: Kya Maine usay block kiya hai?
      const iBlockedThem = myBlockedList.includes(targetId);

      // Condition 4: Kya Usne mujhe block kiya hai?
      const theyBlockedMe = Array.isArray(otherProfile.blocked_profiles) 
        ? otherProfile.blocked_profiles.includes(userId) 
        : false;

      // Agar block wala scene hai toh filter out
      if (iBlockedThem || theyBlockedMe) return null;

      return {
        matchId: match.id,
        ...otherProfile,
        matchedAt: match.created_at,
      };
    }).filter(item => item !== null);

    return matches;

  } catch (error) {
    console.error("Error in getUserMatches:", error);
    return [];
  }
};