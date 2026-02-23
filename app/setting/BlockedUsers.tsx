import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useRouter } from "expo-router";
import { getBlockedUsersData, unblockProfile } from "@/services/Profile";
import { useSelector } from "react-redux";

const BlockedUsers = () => {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const [blockedList, setBlockedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);

  useEffect(() => {
    if (profileSlice?.id) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [profileSlice]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getBlockedUsersData(profileSlice?.id);
      setBlockedList(data || []);
    } catch (error) {
      Alert.alert("Error", "Failed to load blocked users");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (targetId: string) => {
    try {
      setActionLoading(targetId);
      const success = await unblockProfile(profileSlice?.id, targetId);
      if (success === "unblock") {
        setBlockedList((prev) => prev.filter((user) => user.id !== targetId));
      } else {
        throw new Error("Unblock failed");
      }
    } catch (error) {
      Alert.alert("Error", "Could not unblock user. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const renderUser = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarEmpty]}>
          <Ionicons name="person" size={22} color={Colors.lightPink + "40"} />
        </View>
      )}
      <Text style={styles.userName} numberOfLines={1}>
        {item.full_name || "Unknown User"}
      </Text>
      <TouchableOpacity
        style={[styles.unblockBtn, actionLoading === item.id && { opacity: 0.5 }]}
        onPress={() => handleUnblock(item.id)}
        disabled={actionLoading !== null}
        activeOpacity={0.85}
      >
        {actionLoading === item.id ? (
          <ActivityIndicator size="small" color={Colors.accent} />
        ) : (
          <Text style={styles.unblockText}>Unblock</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: safeTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked Users</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.stateLoadingText}>Loading…</Text>
        </View>
      ) : blockedList.length > 0 ? (
        <FlatList
          data={blockedList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUser}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      ) : (
        <View style={styles.stateWrap}>
          <View style={styles.stateCircle}>
            <Ionicons name="ban-outline" size={36} color={Colors.lightPink + "50"} />
          </View>
          <Text style={styles.stateTitle}>No blocked users</Text>
          <Text style={styles.stateSub}>Users you block will appear here</Text>
        </View>
      )}
    </View>
  );
};

export default BlockedUsers;

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
  avatarEmpty: {
    backgroundColor: Colors.wine + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  unblockBtn: {
    backgroundColor: Colors.accent + "18",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  unblockText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.accent,
  },

  /* States */
  stateWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  stateCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.darkPlum,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  stateTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 6,
  },
  stateSub: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + "60",
    textAlign: "center",
  },
  stateLoadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + "70",
  },
});
