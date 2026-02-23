import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useRouter } from "expo-router";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";

const friendsData = [
  { id: "1", name: "John Doe", username: "@johndoe", followers: 1200, image: "https://randomuser.me/api/portraits/men/1.jpg" },
  { id: "2", name: "Jane Smith", username: "@janesmith", followers: 980, image: "https://randomuser.me/api/portraits/women/2.jpg" },
  { id: "3", name: "Michael Johnson", username: "@michaelj", followers: 1500, image: "https://randomuser.me/api/portraits/men/3.jpg" },
  { id: "4", name: "Alice Brown", username: "@alicebrown", followers: 870, image: "https://randomuser.me/api/portraits/women/4.jpg" },
];

const InviteFriends = () => {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  const toggleInvite = (id: string) => {
    setInvitedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderItem = ({ item }: any) => {
    const isInvited = invitedIds.includes(item.id);
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>
            {item.username} · {item.followers.toLocaleString()} followers
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.inviteBtn, isInvited && styles.invitedBtn]}
          activeOpacity={0.85}
          onPress={() => toggleInvite(item.id)}
        >
          {isInvited ? (
            <Ionicons name="checkmark" size={16} color={Colors.primary} />
          ) : (
            <Text style={styles.inviteBtnText}>Invite</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: safeTop }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Friends</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={friendsData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyCircle}>
              <Ionicons name="people-outline" size={36} color={Colors.lightPink + "50"} />
            </View>
            <Text style={styles.emptyTitle}>No contacts found</Text>
          </View>
        }
      />
    </View>
  );
};

export default InviteFriends;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.darkPlum,
    padding: 14,
    borderRadius: 16,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  sub: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + "60",
    marginTop: 2,
  },
  inviteBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  invitedBtn: {
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 12,
  },
  inviteBtnText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: "#fff",
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.darkPlum,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
});
