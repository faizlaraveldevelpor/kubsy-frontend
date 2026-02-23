import Bottomsection from "@/components/chat/Bottomsection";
import Topsection from "@/components/chat/Topsection";
import { getCnversation } from "@/services/chat";
import { Getchats } from "@/store/chat";
import { Colors } from "@/theme/color";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../lib/supabase";

export default function Chats() {
  const [searchQuery, setSearchQuery] = useState("");
  const profileSlice = useSelector(
    (state: any) => state?.profileSlice?.userApi
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!profileSlice?.id) return;

    let subscription: any;

    const init = async () => {
      try {
        // 1️⃣ Initial fetch
        const conversation = await getCnversation(profileSlice.id);
        if (conversation) {
          dispatch(Getchats(conversation));
        }

        // 2️⃣ Realtime subscription
        subscription = supabase
          .channel('public:conversations')
          .on(
            'postgres_changes',
            {
              event: '*', // INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'conversations',
            },
            async (payload) => {
              console.log('Realtime update:', payload);

              // Fetch latest conversations
              const updatedConversations = await getCnversation(profileSlice.id);
              if (updatedConversations) {
                dispatch(Getchats(updatedConversations));
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.log("Error fetching conversations:", error);
      }
    };

    init();

    return () => {
      // Cleanup subscription on unmount
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [profileSlice?.id]);

  return (
    <View style={{ backgroundColor: Colors.background, flex: 1 }}>
      <Topsection searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Bottomsection searchQuery={searchQuery} />
    </View>
  );
}
