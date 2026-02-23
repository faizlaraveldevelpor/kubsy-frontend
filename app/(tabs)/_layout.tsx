import { Tabs } from 'expo-router';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { GetprofileApi } from '@/store/profileSlice';
import { getMyProfile } from '@/services/Profile';
import { useLocationOnStart } from '@/hooks/Location';
import { supabase } from '@/lib/supabase';

export default function TabLayout() {
  const dispatch = useDispatch();
  const [alltotal, setalltotal] = useState(0);
  const channelRef = useRef<any>(null);

  const userProfile = useSelector((state: any) => state?.profileSlice?.userApi);
  const myId = userProfile?.id;

  // --- FIXED LOGIC: Conversation membership check ke saath ---
  const fetchAndSetUnreadCount = useCallback(async (userId?: string) => {
    const activeId = userId || myId;
    if (!activeId) return;

    try {
      // 1. Pehle woh conversations dhoondo jahan main member hoon
      const { data: myConvs, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1.eq.${activeId},user2.eq.${activeId}`);

      if (convError) throw convError;

      if (!myConvs || myConvs.length === 0) {
        setalltotal(0);
        return;
      }

      const myConvIds = myConvs.map(c => c.id);

      // 2. Ab sirf un conversations ke unread messages lao jo MERI hain
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('is_read', false)
        .neq('sender_id', activeId)
        .in('conversation_id', myConvIds); // Security Check: Sirf meri chats

      if (msgError) throw msgError;

      // Unique Conversations count karna
      const uniqueChatIds = new Set(messages?.map(m => m.conversation_id) || []);
      setalltotal(uniqueChatIds.size);
      console.log('Verified Badge Count:', uniqueChatIds.size);

    } catch (error) {
      console.error('Badge Fetch Error:', error);
    }
  }, [myId]);

  useEffect(() => {
    const initProfileAndData = async () => {
      try {
        const data = await getMyProfile();
        if (data?.data) {
          dispatch(GetprofileApi(data.data));
          fetchAndSetUnreadCount(data.data.id);
        }
      } catch (error) {
        console.log('Profile Initialization Error:', error);
      }
    };
    initProfileAndData();
  }, [dispatch, fetchAndSetUnreadCount]);

  useEffect(() => {
    if (!myId) return;

    fetchAndSetUnreadCount();

    const setupRealtime = async () => {
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
      }

      const channelName = `global_unread_${myId}_${Date.now()}`;
      channelRef.current = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          () => {
            fetchAndSetUnreadCount();
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [myId, fetchAndSetUnreadCount]);

  useLocationOnStart();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: Fonts.bold,
          paddingBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={20} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Ionicons size={20} name="compass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="match"
        options={{
          title: 'Match',
          tabBarIcon: ({ color }) => <Ionicons size={20} name="heart" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarBadge: alltotal > 0 ? alltotal : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.primary,
            color: 'white',
            fontSize: 10,
          },
          tabBarIcon: ({ color }) => <Ionicons size={20} name="chatbubble-ellipses" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons size={20} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}