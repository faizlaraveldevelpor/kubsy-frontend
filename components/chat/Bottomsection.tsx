import { subscribeUnreadMessages, getCnversation } from '@/services/chat';
import { singleChatFnc, unreadedMessages } from '@/store/chat';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

type BottomsectionProps = {
  searchQuery?: string;
};

function formatTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const Bottomsection = ({ searchQuery = '' }: BottomsectionProps) => {
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const chatsSlice = useSelector((state: any) => state?.chats?.chats);
  const router = useRouter();
  const dispatch = useDispatch();

  const filteredChats = React.useMemo(() => {
    if (!searchQuery.trim()) return chatsSlice || [];
    const q = searchQuery.trim().toLowerCase();
    return (chatsSlice || []).filter(
      (item: any) =>
        (item?.other_user?.full_name || '').toLowerCase().includes(q) ||
        (item?.last_message?.content || '').toLowerCase().includes(q)
    );
  }, [chatsSlice, searchQuery]);

  const [unreaded, setunreaded] = useState<Record<string, number>>({});
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  const blockUserSlice = useSelector((state: any) => state?.profileSlice?.blockUser);

  const fetchChats = useCallback(async (pageNum: number) => {
    if (!profileSlice?.id || (pageNum > 0 && !hasMore) || loading) return;
    setLoading(true);
    const data = await getCnversation(profileSlice.id, pageNum, PAGE_SIZE);
    if (data.length < PAGE_SIZE) setHasMore(false);
    dispatch({ type: 'chats/setChats', payload: { data, page: pageNum } });
    setLoading(false);
  }, [profileSlice?.id, hasMore, loading]);

  useEffect(() => {
    fetchChats(0);
  }, [profileSlice?.id, blockUserSlice]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchChats(nextPage);
    }
  };

  useEffect(() => {
    if (!profileSlice?.id) return;
    const unsubscribe = subscribeUnreadMessages(profileSlice.id, (unreadMessages) => {
      const unreadByConversation = unreadMessages.reduce((acc, msg) => {
        acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      setunreaded((prev) => ({ ...prev, ...unreadByConversation }));
    });
    return () => { unsubscribe && unsubscribe(); };
  }, [profileSlice?.id]);

  useEffect(() => {
    dispatch(unreadedMessages(unreaded));
  }, [unreaded]);

  const renderChatItem = ({ item }: { item: any }) => {
    const unreadCount = unreaded?.[item?.conversation_id] || 0;
    const hasUnread = unreadCount > 0;
    const timeStr = formatTime(item?.last_message?.created_at || item?.updated_at);

    return (
      <TouchableOpacity
        style={styles.chatRow}
        activeOpacity={0.7}
        onPress={() => {
          setunreaded((prev) => {
            const copy = { ...prev };
            delete copy[item.conversation_id];
            return copy;
          });
          dispatch(singleChatFnc({
            conversation_id: item.conversation_id,
            sender_id: profileSlice?.id,
          }));
          router.push({
            pathname: '/singlechat',
            params: { id: `${item?.other_user?.id}` },
          });
        }}
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Image
            source={{ uri: item?.other_user?.avatar_url || 'https://www.gravatar.com/avatar/0?d=mp' }}
            style={styles.avatar}
          />
          {hasUnread && <View style={styles.onlineDot} />}
        </View>

        {/* Content */}
        <View style={styles.chatContent}>
          <View style={styles.nameTimeRow}>
            <Text style={[styles.userName, hasUnread && styles.userNameUnread]} numberOfLines={1}>
              {item?.other_user?.full_name || 'User'}
            </Text>
            <Text style={[styles.timeText, hasUnread && styles.timeTextUnread]}>{timeStr}</Text>
          </View>
          <View style={styles.messageRow}>
            <Text
              style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
              numberOfLines={1}
            >
              {item.last_message?.content || 'No messages yet'}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListEmpty = () =>
    !loading && filteredChats.length === 0 ? (
      <View style={styles.emptyWrap}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="chatbubbles-outline" size={48} color={Colors.lightPink + '40'} />
        </View>
        <Text style={styles.emptyTitle}>No conversations yet</Text>
        <Text style={styles.emptySub}>Start matching to begin chatting!</Text>
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.conversation_id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={filteredChats?.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
        ListFooterComponent={() =>
          loading && hasMore ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
          ) : null
        }
        renderItem={renderChatItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },

  /* Avatar */
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.darkPlum,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    borderWidth: 2.5,
    borderColor: Colors.background,
  },

  /* Content */
  chatContent: {
    flex: 1,
    marginLeft: 14,
  },
  nameTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.white,
    flex: 1,
    marginRight: 8,
  },
  userNameUnread: {
    fontFamily: Fonts.bold,
  },
  timeText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '60',
  },
  timeTextUnread: {
    color: Colors.primary,
    fontFamily: Fonts.medium,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '60',
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: Colors.lightPink,
    fontFamily: Fonts.medium,
  },

  /* Unread badge */
  unreadBadge: {
    backgroundColor: Colors.primary,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: Fonts.bold,
  },

  /* Separator */
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: 88,
    marginRight: 18,
  },

  /* Empty state */
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.darkPlum,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '60',
    textAlign: 'center',
  },
});

export default Bottomsection;
