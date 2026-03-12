import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Animated,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Video, Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '@/lib/supabase';
import { createMessage, deletemessage, getMessages, getConversationById, markMessagesAsRead } from '@/services/chat';
import { UploadDialog } from '@/dialog/filesSend';
import { uploadImageToSupabase } from '@/lib/supabsestorage';
import { blockprofiles, unblockProfile } from '@/services/Profile';
import { useLocalSearchParams, useSearchParams } from 'expo-router/build/hooks';
import { blockprofile, UnblockProfile } from '@/store/profileSlice';
import { singleChatFnc } from '@/store/chat';
import ReportDialog from '@/dialog/reportdailog'; // Import Added
import { getIcebreakers } from '@/services/icebreakers';

const icebreakersState = [
  "🍦 Favorite ice cream flavor?",
  "🌍 Dream travel destination?",
  "🎬 Last movie you loved?",
  "🍕 Pizza or Biryani?",
  "🎵 Current favorite song?",
  "🚀 If you could go to Mars, would you?",
];

const SingleChat = () => {
  const [ICEBREAKER_PROMPTS, seticebreakersState] = useState<{ message?: string[] }[]>([])
  const safeTop = useSafeAreaTop();
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const singlechatsSlice = useSelector((state: any) => state?.chats?.singleChatData);
  const router = useRouter();
  const dispatch = useDispatch();
  const [image, setimage] = useState<string | null>(null);
  const [video, setvideo] = useState<string | null>(null);
  const [document, setdocument] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false); // New State
  const [uploading, setUploading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const bottomAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const blockUserSlice = useSelector((state: any) => state?.profileSlice?.blockUser);

  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [playingSound, setPlayingSound] = useState<Audio.Sound | null>(null);
  const [playingUri, setPlayingUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const params = useLocalSearchParams<{ id?: string; matchId?: string }>();

  // Push notification se aaye to conversation_id se data load karo
  useEffect(() => {
    const matchId = params?.matchId;
    if (!matchId || !profileSlice?.id) return;
    if (singlechatsSlice?.conversation_id === matchId) return;

    (async () => {
      const conv = await getConversationById(matchId, profileSlice.id);
      if (conv) {
        dispatch(singleChatFnc(conv));
      }
    })();
  }, [params?.matchId, profileSlice?.id]);

  useEffect(()=>{
   const icebreakerfnc=async()=>{
      const Icebreakers=await  getIcebreakers()
      if (Icebreakers) {
      seticebreakersState(Icebreakers)
      
         
      }
    }
    icebreakerfnc()
  },[])
  // --- NEW: Block User Function ---
  const handleBlockUser = async () => {
    const otherUserId = params?.id || singlechatsSlice?.other_user?.id;
    const myId = profileSlice?.id;

    if (!otherUserId || !myId) return;

    Alert.alert(
      "Block User",
      `Are you sure you want to block this user?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            blockprofiles(myId, otherUserId);
            dispatch(blockprofile(otherUserId));
          }
        }
      ]
    );
  };
  // --- NEW: Block User Function ---
  const handleUnBlockUser = async () => {
    const otherUserId = params?.id || singlechatsSlice?.other_user?.id;
    const myId = profileSlice?.id;

    if (!otherUserId || !myId) return;

    Alert.alert(
      "Unblock User",
      `Are you sure you want to unblock this user?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblock",
          style: "destructive",
          onPress: async () => {
            unblockProfile(myId, otherUserId);
            dispatch(UnblockProfile(otherUserId));
          }
        }
      ]
    );
  };

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      Animated.timing(bottomAnim, { toValue: e.endCoordinates.height, duration: 250, useNativeDriver: false }).start();
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(bottomAnim, { toValue: 0, duration: 250, useNativeDriver: false }).start();
    });
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const handleDeleteMessage = async (message: any) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (message.message_type !== 'text') {
                const filePath = message.content.split("/user/")[1];
                if (filePath) {
                  await supabase.storage.from("user").remove([filePath]);
                }
              }
              await deletemessage(message.id, profileSlice?.id);
              setMessages((prev) => prev.filter((m) => m.id !== message.id));
            } catch (err: any) {
              console.log("Delete Error:", err.message);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    const conversationId = singlechatsSlice?.conversation_id;
    const myId = profileSlice?.id;
    const otherUserId = singlechatsSlice?.other_user?.id ? String(singlechatsSlice.other_user.id) : null;

    if (!conversationId || !myId || !otherUserId) return;

    const typingChannel = supabase.channel(`typing:${conversationId}`);
    typingChannel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id === otherUserId) setOtherTyping(true);
      })
      .on('broadcast', { event: 'stop_typing' }, ({ payload }) => {
        if (payload.user_id === otherUserId) setOtherTyping(false);
      })
      .subscribe();

    const presenceChannel = supabase.channel(`presence:${conversationId}`, {
      config: { presence: { key: myId } },
    });

    const updateOnlineFromState = () => {
      const state = presenceChannel.presenceState() as Record<string, unknown[]>;
      const otherPresence = state?.[otherUserId];
      setIsOnline(Array.isArray(otherPresence) && otherPresence.length > 0);
    };

    presenceChannel
      .on('presence', { event: 'sync' }, updateOnlineFromState)
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key === otherUserId) setIsOnline(true);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key === otherUserId) setIsOnline(false);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ user_id: myId, online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [singlechatsSlice?.conversation_id, singlechatsSlice?.other_user?.id, profileSlice?.id]);

  useEffect(() => {
    if (!singlechatsSlice?.conversation_id) return;
    const loadChat = async () => {
      setInitialLoading(true);
      setPage(0);
      setHasMore(true);
      const msgs = await getMessages(singlechatsSlice.conversation_id, 0, PAGE_SIZE);
      setMessages(msgs);
      setInitialLoading(false);

      try {
        await markMessagesAsRead(singlechatsSlice.conversation_id, profileSlice?.id);
      } catch (err) { console.log("Read mark error:", err); }
    };
    loadChat();

    const subscription = supabase
      .channel(`chat:${singlechatsSlice.conversation_id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${singlechatsSlice.conversation_id}` },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [payload.new, ...prev]);
            if (payload.new.sender_id !== profileSlice?.id) {
              await markMessagesAsRead(singlechatsSlice.conversation_id, profileSlice?.id);
            }
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter(m => m.id !== payload.old.id));
          } else {
            const updatedMsgs = await getMessages(singlechatsSlice.conversation_id, 0, PAGE_SIZE);
            setMessages(updatedMsgs);
          }
        })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [singlechatsSlice?.conversation_id]);

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore || initialLoading || !singlechatsSlice?.conversation_id) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const oldMsgs = await getMessages(singlechatsSlice.conversation_id, nextPage, PAGE_SIZE);
    if (oldMsgs.length < PAGE_SIZE) setHasMore(false);
    if (oldMsgs.length > 0) {
      setMessages((prev) => [...prev, ...oldMsgs]);
      setPage(nextPage);
    }
    setLoadingMore(false);
  };

  const handleTyping = () => {
    if (!singlechatsSlice?.conversation_id || !profileSlice?.id) return;
    supabase.channel(`typing:${singlechatsSlice.conversation_id}`).send({
      type: 'broadcast', event: 'typing', payload: { user_id: profileSlice.id },
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      supabase.channel(`typing:${singlechatsSlice.conversation_id}`).send({
        type: 'broadcast', event: 'stop_typing', payload: { user_id: profileSlice.id },
      });
    }, 1500);
  };

  const sendMessage = async () => {
    if (!text.trim() || !profileSlice?.id || !singlechatsSlice?.conversation_id) return;
    const content = text;
    setText('');
    try {
      await createMessage({
        conversation_id: singlechatsSlice.conversation_id,
        sender_id: profileSlice.id,
        content: content,
        message_type: 'text',
      });
    } catch (err) { console.log('Error sending message:', err); }
  };

  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== 'granted') return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
      setIsRecording(true);
    } catch (err) { console.log('START RECORD ERROR', err); }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      if (uri) handleSelect('audio', uri);
    } catch (err) { console.log('STOP RECORD ERROR', err); }
  };

  const handleSelect = async (type: 'image' | 'video' | 'file' | 'audio', uri: string) => {
    if (!uri || !profileSlice?.id || !singlechatsSlice?.conversation_id) return;
    try {
      setUploading(true);
      const uploadedUrl = await uploadImageToSupabase(uri);
      if (!uploadedUrl) throw new Error('Upload failed');
      await createMessage({
        conversation_id: singlechatsSlice.conversation_id,
        sender_id: profileSlice.id,
        content: uploadedUrl,
        message_type: type,
      });
      setDialogVisible(false);
    } catch (err) {
      console.log('File Upload Error:', err);
      Alert.alert("Error", "Could not upload file.");
    } finally {
      setUploading(false);
    }
  };

  const playAudio = async (uri: string) => {
    try {
      if (playingUri === uri && playingSound) {
        await playingSound.stopAsync();
        await playingSound.unloadAsync();
        setPlayingSound(null);
        setPlayingUri(null);
        return;
      }
      const { sound } = await Audio.Sound.createAsync({ uri });
      setPlayingSound(sound);
      setPlayingUri(uri);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingSound(null);
          setPlayingUri(null);
        }
      });
    } catch (err) { console.log('Audio play error', err); }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isSent = item.sender_id === profileSlice?.id;
    const time = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => isSent && handleDeleteMessage(item)}
        style={[styles.messageBubble, isSent ? styles.sent : styles.received]}
      >
        {item.message_type === 'text' && <Text style={styles.messageText}>{item.content}</Text>}
        {item.message_type === 'image' && <Image source={{ uri: item.content }} style={{ width: 200, height: 200, borderRadius: 10 }} resizeMode="cover" />}
        {(item.message_type === 'video' || item.message_type === 'file') && (
          <Video source={{ uri: item.content }} style={{ width: 200, height: 150, borderRadius: 10 }} useNativeControls resizeMode="cover" />
        )}
        {item.message_type === 'audio' && (
          <TouchableOpacity onPress={() => playAudio(item.content)} style={{ padding: 10, backgroundColor: isSent ? 'rgba(255,255,255,0.2)' : '#555', borderRadius: 10 }}>
            <Text style={{ color: '#fff' }}>{playingUri === item.content ? '⏸️ Playing...' : '🎤 Voice Note'}</Text>
          </TouchableOpacity>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 }}>
          <Text style={styles.timeText}>{time}</Text>
          {isSent && item.is_read && <Text style={styles.seenText}>seen</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.userName} numberOfLines={1}>{singlechatsSlice?.other_user?.full_name || 'Chat'}</Text>
          {/* <Text style={[styles.statusText, { color: isOnline ? '#4CAF50' : '#999' }]}>{isOnline ? 'Online' : 'Offline'}</Text> */}
        </View>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          {/* Report Icon Added */}
          <TouchableOpacity onPress={() => setReportVisible(true)} style={{ justifyContent: 'center' }}>
            <Ionicons name="flag-outline" size={22} color={Colors.black} />
          </TouchableOpacity>

          {
            blockUserSlice?.includes(String(params?.id || singlechatsSlice?.other_user?.id)) === true ? <>
              <TouchableOpacity onPress={handleUnBlockUser} style={styles.blockButton}>
                <Ionicons name="lock-open-outline" size={22} color={Colors.primary} /></TouchableOpacity>
            </> : <>
              <TouchableOpacity onPress={handleBlockUser} style={styles.blockButton}>
                <Ionicons name="ban-outline" size={22} color="red" /></TouchableOpacity>
            </>
          }
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {initialLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
            renderItem={renderMessage}
            inverted
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.3}
            ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={Colors.primary} style={{ margin: 10 }} /> : null}
          />
        )}
      </View>

      {!initialLoading && messages.length === 0 && (
        <View style={styles.icebreakerContainer}>
          <Text style={styles.icebreakerHeader}>Spark a conversation:</Text>
          <FlatList
            horizontal
            data={Array.isArray(ICEBREAKER_PROMPTS?.[0]?.message) ? ICEBREAKER_PROMPTS[0].message : icebreakersState}
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.icebreakerChip} onPress={() => setText(item)}>
                <Text style={styles.icebreakerText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View style={{ height: 20, paddingHorizontal: 20 }}>
        {otherTyping && <Text style={{ color: '#888', fontSize: 12, fontStyle: 'italic' }}>typing...</Text>}
      </View>

      {uploading && <View style={styles.loadingOverlay}><ActivityIndicator size="large" color={Colors.primary} /></View>}
      {blockUserSlice?.includes(params?.id) == true ? null :
        <Animated.View style={[styles.bottomBar, { bottom: bottomAnim }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message"
              placeholderTextColor="#888"
              value={text}
              onChangeText={(val) => { setText(val); handleTyping(); }}
            />
            <TouchableOpacity onPress={() => setDialogVisible(true)}>
              <Ionicons name="options-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.micButton, { backgroundColor: Colors.primary }]}
            onPress={text !== '' ? sendMessage : undefined}
            onPressIn={text === '' ? startRecording : undefined}
            onPressOut={text === '' ? stopRecording : undefined}
          >
            <Ionicons name={text !== '' ? 'send' : (isRecording ? 'radio-button-on' : 'mic')} size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>}

      <UploadDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        onSelect={handleSelect}
        setdocument={setdocument}
        setimage={setimage}
        setvideo={setvideo}
      />

      {/* Report Dialog Integrated */}
      <ReportDialog
        isVisible={reportVisible}
        onClose={() => setReportVisible(false)}
        reportedUserId={params?.id}
        reportedUserName={singlechatsSlice?.other_user?.id}
        currentUserId={profileSlice?.id}
      />
    </View>
  );
};

export default SingleChat;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.gray, backgroundColor: Colors.background },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  userName: { fontSize: 16, color: Colors.black, fontFamily: Fonts.bold },
  statusText: { fontSize: 11, fontFamily: Fonts.medium, marginTop: 2 },
  blockButton: { width: 40, alignItems: 'flex-end' },
  messageBubble: { maxWidth: '75%', padding: 10, borderRadius: 15, marginVertical: 4 },
  sent: { backgroundColor: Colors.primary, alignSelf: 'flex-end' },
  received: { backgroundColor: Colors.darkPlum, alignSelf: 'flex-start' },
  messageText: { color: Colors.white, fontFamily: Fonts.medium, fontSize: 15 },
  timeText: { fontSize: 9, color: Colors.lightgray, fontFamily: Fonts.medium },
  seenText: { fontSize: 10, color: Colors.lightPink, fontFamily: Fonts.bold, marginLeft: 4 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: Colors.background },
  inputContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 25, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 8 : 2 },
  input: { flex: 1, marginLeft: 8, color: Colors.black, fontFamily: Fonts.medium },
  micButton: { marginLeft: 10, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background + '4D', zIndex: 10 },
  icebreakerContainer: { paddingVertical: 10 },
  icebreakerHeader: { fontSize: 12, color: Colors.gray, fontFamily: Fonts.medium, marginLeft: 20, marginBottom: 8 },
  icebreakerChip: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: Colors.primary + '40', elevation: 2, shadowColor: Colors.background, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  icebreakerText: { color: Colors.black, fontFamily: Fonts.medium, fontSize: 13 },
});