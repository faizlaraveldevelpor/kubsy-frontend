import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons, MaterialIcons, Entypo, Feather, FontAwesome5 } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import SettingsHeader from "@/components/setting/SettingsHeader";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

type RowItemProps = {
  iconBg: string;
  leftIcon: React.ReactNode;
  label: string;
  rightText?: string;
};

const ICON_SIZE = 24;

const Settings: React.FC<Props> = () => {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const selectedLanguage = "English";
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const isPremium = profileSlice?.is_vip === true;

  const RowItem: React.FC<RowItemProps> = ({ leftIcon, label, rightText, iconBg }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => {
        switch (label) {
          case "Personal Information":
            router.push('/setting/Parsnalinformation');
            break;
          case "Discovery Settings":
            router.push('/setting/DiscoverySettings');
            break;
          case "Privacy & Permissions":
            router.push('/setting/Privacypolicy');
            break;
          case "Blocked Users":
            router.push('/setting/BlockedUsers');
            break;
          case "Security":
            router.push('/setting/Security');
            break;
          case "Language":
            router.push('/setting/Language');
            break;
          default:
            break;
        }
      }}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
          {leftIcon}
        </View>
        <Text style={styles.rowText}>{label}</Text>
      </View>

      <View style={styles.rowRight}>
        {rightText && <Text style={styles.rightText}>{rightText}</Text>}
        <Ionicons name="chevron-forward" size={22} color="#777" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <SettingsHeader title="Settings" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* --- PREMIUM SUBSCRIPTION SECTION START --- */}
        {isPremium && (
          <View style={styles.premiumSection}>
            <View style={styles.premiumHeader}>
              <View style={styles.premiumTitleRow}>
                <FontAwesome5 name="crown" size={18} color={Colors.white} />
                <Text style={styles.premiumTitle}>VIP Subscription</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>ACTIVE</Text>
              </View>
            </View>

            <View style={styles.premiumInfoBox}>
              <View style={styles.infoLine}>
                <Text style={styles.infoLabel}>Plan:</Text>
                <Text style={styles.infoValue}>Premium Monthly</Text>
              </View>
              <View style={styles.infoLine}>
                <Text style={styles.infoLabel}>Expires On:</Text>
                <Text style={styles.infoValue}>
                   {profileSlice?.membership_expires_at 
                    ? new Date(profileSlice.membership_expires_at).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      }) 
                    : "N/A"}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.manageBtn}
              onPress={() => router.push("/setting/Premiumamanagement")}
            >
              <Text style={styles.manageBtnText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* --- PREMIUM SUBSCRIPTION SECTION END --- */}

        <RowItem
          iconBg={Colors.lightPink + '40'}
          leftIcon={<Ionicons name="person-circle-outline" size={ICON_SIZE} color={Colors.primary} />}
          label="Personal Information"
        />

        <RowItem
          iconBg={Colors.softPink + '30'}
          leftIcon={<MaterialIcons name="explore" size={ICON_SIZE} color={Colors.primary} />}
          label="Discovery Settings"
        />

        <RowItem
          iconBg={Colors.accent + '25'}
          leftIcon={<Ionicons name="lock-closed-outline" size={ICON_SIZE} color={Colors.accent} />}
          label="Privacy & Permissions"
        />

        <RowItem
          iconBg={Colors.primary + '25'}
          leftIcon={<MaterialIcons name="block" size={ICON_SIZE} color={Colors.primary} />}
          label="Blocked Users"
        />

        <RowItem
          iconBg={Colors.green + '30'}
          leftIcon={<Ionicons name="shield-checkmark" size={ICON_SIZE} color={Colors.green} />}
          label="Security"
        />

        <RowItem
          iconBg={Colors.softPink + '25'}
          leftIcon={<Ionicons name="globe-outline" size={ICON_SIZE} color={Colors.secondary} />}
          label="Data & Storage"
        />

        <RowItem
          iconBg={Colors.lightPink + '40'}
          leftIcon={<MaterialIcons name="feedback" size={ICON_SIZE} color={Colors.accent} />}
          label="Feedback"
        />

        <RowItem
          iconBg={Colors.lightgray + '99'}
          leftIcon={<Feather name="globe" size={ICON_SIZE} color={Colors.primaryDarker} />}
          label="Language"
          rightText={selectedLanguage}
        />

        <RowItem
          iconBg={Colors.primary + '20'}
          leftIcon={<Entypo name="info-with-circle" size={ICON_SIZE} color={Colors.primary} />}
          label="AboutHome"
        />
        
        <View style={{height: 30}} />
      </ScrollView>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 18 },

  // --- Naya Premium Section Style ---
  premiumSection: {
    backgroundColor: Colors.primary,
    marginHorizontal: 15,
    marginVertical: 15,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.primary,
    elevation: 2,
    marginBottom:50
  },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  premiumTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  premiumTitle: { fontSize: 16, fontFamily: Fonts.bold, color: Colors.white },
  statusBadge: { backgroundColor: Colors.white, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: Fonts.bold, color: Colors.primary },
  premiumInfoBox: { marginBottom: 15 },
  infoLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  infoLabel: { fontSize: 13, fontFamily: Fonts.regular, color: Colors.white },
  infoValue: { fontSize: 13, fontFamily: Fonts.bold, color: Colors.white },
  manageBtn: { backgroundColor: Colors.white, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  manageBtnText: { color: Colors.primary, fontSize: 14, fontFamily: Fonts.bold },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginVertical: 8,
    backgroundColor: Colors.background,
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  iconWrapper: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12, // Thoda modern square-round look
  },
  rowText: { marginLeft: 12, fontSize: 15, fontFamily: Fonts.medium, color: Colors.black },
  rowRight: { flexDirection: "row", alignItems: "center" },
  rightText: { marginRight: 5, color: Colors.wine, fontSize: 14 },
});