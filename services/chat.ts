import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "./Auth";
import { Alert } from "react-native";

export async function sendMessage(chatId: string, message: string) {
  const user = await getCurrentUser();
  return supabase.from('messages').insert({
    chat_id: chatId,
    sender_id: user?.id,
    message,
  });
}
export const getCnversation = async (profileId: string, page: number = 0, pageSize: number = 10) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  try {
    // 1. Apni blocked list fetch karein
    const { data: userData } = await supabase
      .from("profiles")
      .select("blocked_profiles")
      .eq("id", profileId)
      .single();

    // 2. Reports table se reported IDs fetch karein
    const { data: reportedData } = await supabase
      .from("reports")
      .select("reported_id")
      .eq("status", true);

    // 3. Profiles table se admin-blocked users fetch karein
    const { data: adminBlockedData } = await supabase
      .from("profiles")
      .select("id")
      .eq("adminblock", true);

    // Sab IDs ko ek jagah jama karein
    const blockedIds = userData?.blocked_profiles || [];
    const reportedIds = reportedData?.map(r => r.reported_id) || [];
    const adminBlockedIds = adminBlockedData?.map(p => p.id) || [];

    // Unique IDs ki list banayein jinhe hide karna hai
    const excludeIds = [...new Set([...blockedIds, ...reportedIds, ...adminBlockedIds])];

    // 4. Main query build karein
    let query = supabase
      .from("conversations")
      .select(`
        id,
        updated_at,
        last_message:messages!fk_last_message (
          id, content, sender_id, created_at, is_read
        ),
        user1_profile:profiles!conversations_user1_fkey (id, full_name, avatar_url, adminblock),
        user2_profile:profiles!conversations_user2_fkey (id, full_name, avatar_url, adminblock)
      `)
      .or(`user1.eq.${profileId},user2.eq.${profileId}`)
      .order('updated_at', { ascending: false })
      .range(from, to);

    // 5. Filter apply karein
    if (excludeIds.length > 0) {
      const filterString = `(${excludeIds.join(',')})`;
      query = query.not('user1', 'in', filterString);
      query = query.not('user2', 'in', filterString);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map((conv: any) => ({
      conversation_id: conv.id,
      updated_at: conv.updated_at,
      last_message: conv.last_message,
      other_user: conv.user1_profile?.id === profileId ? conv.user2_profile : conv.user1_profile,
    }));

  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
};

/** Single conversation by ID (e.g. push notification se open karne ke liye) */
export const getConversationById = async (conversationId: string, profileId: string) => {
  try {
    const { data: conv, error } = await supabase
      .from("conversations")
      .select(`
        id,
        updated_at,
        last_message:messages!fk_last_message (id, content, sender_id, created_at, is_read),
        user1_profile:profiles!conversations_user1_fkey (id, full_name, avatar_url, adminblock),
        user2_profile:profiles!conversations_user2_fkey (id, full_name, avatar_url, adminblock)
      `)
      .eq("id", conversationId)
      .single();

    if (error || !conv) return null;
    const other_user = (conv as any).user1_profile?.id === profileId ? (conv as any).user2_profile : (conv as any).user1_profile;
    return {
      conversation_id: conv.id,
      updated_at: (conv as any).updated_at,
      last_message: (conv as any).last_message,
      other_user,
      sender_id: profileId,
    };
  } catch (err) {
    console.error("getConversationById error:", err);
    return null;
  }
};

interface MessageInput {
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: "text" | "image" | "file"; // add more types if needed
}

export const createMessage = async ({ conversation_id, sender_id, content, message_type }: any) => {
  try {
    // 1️⃣ Pehle conversation se dusre user (Receiver) ki ID nikaalein
    const { data: convData, error: convFetchError } = await supabase
      .from("conversations")
      .select("user1, user2")
      .eq("id", conversation_id)
      .single();

    if (convFetchError || !convData) {
      console.error("Conversation not found");
      return null;
    }

    // Pata karein ke receiver kaun hai
    const receiverId = convData.user1 === sender_id ? convData.user2 : convData.user1;

    // 2️⃣ Receiver ki profile fetch karein (block check + push token)
    const { data: receiverProfile, error: profileError } = await supabase
      .from("profiles")
      .select("blocked_profiles, expo_push_token, full_name")
      .eq("id", receiverId)
      .single();

    if (profileError) {
      console.error("Error fetching receiver profile:", profileError);
    }

    // Agar sender ki ID receiver ke blocked_profiles array mein hai
    const isBlocked = receiverProfile?.blocked_profiles?.includes(sender_id);

    if (isBlocked) {
      Alert.alert("Action denied: You are blocked by this user.");
      // Hum yahan se return kar jayenge taake message insert na ho
      return { error: "blocked" }; 
    }

    // 3️⃣ Agar block nahi hai, toh message insert karein
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        conversation_id,
        sender_id,
        content,
        message_type,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating message:", error);
      return null;
    }

    // 4️⃣ Conversation table ko update karein (Last Message aur Timestamp)
    const { error: updateConvError } = await supabase
      .from("conversations")
      .update({ 
        last_message_id: message.id, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", conversation_id);

    if (updateConvError) {
      console.error("Error updating conversation metadata:", updateConvError);
    }

    // 5️⃣ Receiver ko push notification bhejein (app bahar ho toh bhi aayegi)
    const pushToken = receiverProfile?.expo_push_token;
    if (pushToken && String(pushToken).startsWith("ExponentPushToken")) {
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", sender_id)
        .single();

      const senderName = senderProfile?.full_name || "Someone";
      const notifBody =
        message_type === "text"
          ? (content || "").slice(0, 200)
          : message_type === "image"
          ? "📷 Photo"
          : "📎 File";

      const payload = {
        to: pushToken,
        title: senderName,
        body: notifBody || "New message",
        data: { type: "chat", matchId: conversation_id },
        sound: "default",
        priority: "high" as const,
        channelId: "default",
      };

      try {
        const res = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (json?.data?.[0]?.status === "error") {
          console.warn("Expo push error:", json.data[0].message);
        }
      } catch (err) {
        console.error("Push send failed:", err);
      }
    }

    return message;
  } catch (err) {
    console.error("Unexpected error in createMessage:", err);
    return null;
  }
};

export const getMessages = async (conversationId: string, page: number = 0, pageSize: number = 20) => {
  try {
    // Range calculate karein
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("messages")
      .select(`
        id,
        content,
        message_type,
        sender_id,
        created_at,
        is_read,
        sender:profiles!messages_sender_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false }) // Latest messages batch pehle aayega
      .range(from, to); // Pagination logic

    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const markMessagesAsRead = async (conversation_id: string, user_id: string) => {
  // Update messages where login user is recipient
  const { data, error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversation_id)
    .neq('sender_id', user_id); // sender ki messages skip karo

  if (error) console.log('Error marking messages as read:', error);

  return data;
};

export const subscribeUnreadMessages = (
  myProfileId: string,
  callback: (unreadMessages: any[]) => void
) => {
  if (!myProfileId) return;

  const fetchUnread = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, is_read")
      .eq("is_read", false)
      .neq("sender_id", myProfileId);

    if (error) console.error("Unread fetch error:", error);
    callback(data ?? []);
  };

  // 1️⃣ Initial fetch
  fetchUnread();

  // 2️⃣ Realtime subscription
  const channel = supabase
    .channel("public:messages")
    .on(
      "postgres_changes",
      {
        event: "*", // INSERT + UPDATE + DELETE
        schema: "public",
        table: "messages",
      },
      (payload) => {
        const msg = payload.new;

        if (!msg) return;

        // ✅ Case 1: New message sent to me (is_read = false)
        // ✅ Case 2: Message read by me or others (is_read changed)
        if (msg.sender_id !== myProfileId) {
          fetchUnread(); // refresh unread count
        }
      }
    )
    .subscribe((status) => {
      console.log("Realtime subscription status:", status);
    });

  // 3️⃣ Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};


export const deletemessage = async (messageId, userId) => {
  try {
    const { error } = await supabase
      .from('messages') // Aapki table ka naam
      .delete()
      .eq('id', messageId)      // Sirf woh message delete ho jiski ID match kare
      .eq('sender_id', userId);   // Safety check: Taake sirf bhejne wala hi delete kar sakay

    if (error) {
      console.error('Error deleting message:', error.message);
      return { success: false, error };
    }

    console.log('Message deleted successfully');
    return { success: true };
  } catch (err) {
    console.log('Unexpected error:', err);
  }
};








