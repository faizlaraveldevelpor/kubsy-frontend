import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";

type FaqCategory = "All" | "Getting Started" | "Profile" | "Matching" | "Premium" | "Safety";

const TABS: FaqCategory[] = ["All", "Getting Started", "Profile", "Matching", "Premium", "Safety"];

interface Faq {
  q: string;
  a: string;
  category: Exclude<FaqCategory, "All">;
}

const FAQS: Faq[] = [
  // Getting Started
  {
    category: "Getting Started",
    q: "What is Kubsy?",
    a: "Kubsy is a modern dating app designed to help you meet genuine people near you. Swipe, match, and start meaningful conversations.",
  },
  {
    category: "Getting Started",
    q: "How do I create an account?",
    a: "Tap 'Get Started' on the welcome screen and sign in with your phone number. You'll receive a verification code to confirm your identity.",
  },
  {
    category: "Getting Started",
    q: "Is Kubsy free to use?",
    a: "Yes! Kubsy is free to download and use. You can swipe, match, and chat at no cost. Premium unlocks extra features like unlimited likes and seeing who liked you.",
  },
  {
    category: "Getting Started",
    q: "How do I enable notifications?",
    a: "Go to your device Settings > Notifications > Kubsy and enable alerts. This way you'll never miss a new match or message.",
  },

  // Profile
  {
    category: "Profile",
    q: "How do I edit my profile?",
    a: "Go to the Profile tab and tap 'Edit Profile'. You can update your photos, bio, interests, and personal details at any time.",
  },
  {
    category: "Profile",
    q: "How many photos can I upload?",
    a: "You can upload up to 6 photos to your profile. We recommend using clear, recent photos that show your face.",
  },
  {
    category: "Profile",
    q: "Can I change my name or date of birth?",
    a: "You can update your name from Personal Information in settings. Date of birth can only be changed once — contact support if you need help.",
  },
  {
    category: "Profile",
    q: "What are interests and how do they help?",
    a: "Interests are tags like 'Travel', 'Music', or 'Fitness' that appear on your profile. They help others find common ground and improve your match suggestions.",
  },

  // Matching
  {
    category: "Matching",
    q: "How does matching work?",
    a: "When you like someone and they like you back, it's a match! You can then start chatting. Use the heart button or swipe right to like someone.",
  },
  {
    category: "Matching",
    q: "What does Super Like do?",
    a: "A Super Like lets the other person know you're especially interested. It stands out from regular likes and increases your chances of matching.",
  },
  {
    category: "Matching",
    q: "I ran out of swipes. What now?",
    a: "Free users have a daily swipe limit that resets every 24 hours. Upgrade to Premium for unlimited swipes.",
  },
  {
    category: "Matching",
    q: "Can I change my discovery preferences?",
    a: "Yes! Go to Profile > Discovery Settings to adjust age range, distance, and gender preferences. These filters control who you see while swiping.",
  },
  {
    category: "Matching",
    q: "Why am I not getting matches?",
    a: "Try adding more photos, writing a detailed bio, and expanding your discovery preferences (age range, distance). A complete profile gets up to 10x more matches.",
  },

  // Premium
  {
    category: "Premium",
    q: "What do I get with Premium?",
    a: "Premium includes unlimited likes, the ability to see who liked you, Super Likes, advanced filters, and priority in the swipe deck.",
  },
  {
    category: "Premium",
    q: "How do I subscribe to Premium?",
    a: "Go to Profile > Get VIP and choose a plan. Payment is handled securely through the App Store or Google Play.",
  },
  {
    category: "Premium",
    q: "Can I cancel my subscription?",
    a: "Yes, you can cancel anytime from your device's subscription settings (App Store or Google Play). You'll keep Premium benefits until the end of your billing period.",
  },
  {
    category: "Premium",
    q: "Will I get a refund if I cancel?",
    a: "Refunds are handled by Apple or Google based on their refund policies. Contact their support for refund requests.",
  },

  // Safety
  {
    category: "Safety",
    q: "How do I report someone?",
    a: "Open the person's profile and tap the report icon. Select a reason and our team will review it within 24 hours. Reports are anonymous.",
  },
  {
    category: "Safety",
    q: "How do I block a user?",
    a: "Open their profile and tap the block option. They won't be able to see your profile or contact you. You can manage blocked users from Settings.",
  },
  {
    category: "Safety",
    q: "Is my personal information safe?",
    a: "Your data is encrypted and never shared with other users. We follow strict privacy standards. Read our Privacy Policy for full details.",
  },
  {
    category: "Safety",
    q: "How do I delete my account?",
    a: "Go to Profile > Settings and select 'Delete Account'. This action is permanent and will remove all your data, matches, and messages.",
  },
];

const HomeScreen = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FaqCategory>("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return FAQS.filter((f) => {
      const matchTab = activeTab === "All" || f.category === activeTab;
      const matchSearch = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [activeTab, search]);

  const handleTabPress = (tab: FaqCategory) => {
    setActiveTab(tab);
    setActiveId(null);
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {TABS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.tabBtn, activeTab === item && styles.tabActive]}
              onPress={() => handleTabPress(item)}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabText, activeTab === item && styles.tabTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={Colors.lightPink + "50"} />
        <TextInput
          placeholder="Search FAQ..."
          style={styles.searchInput}
          placeholderTextColor={Colors.lightPink + "40"}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={Colors.lightPink + "50"} />
          </TouchableOpacity>
        )}
      </View>

      {/* FAQ list */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="help-circle-outline" size={40} color={Colors.lightPink + "30"} />
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptyHint}>Try a different search term or category</Text>
          </View>
        ) : (
          filtered.map((item) => {
            const key = item.category + item.q;
            const isOpen = activeId === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.card, isOpen && styles.cardOpen]}
                onPress={() => setActiveId(isOpen ? null : key)}
                activeOpacity={0.85}
              >
                <View style={styles.questionRow}>
                  <Text style={styles.question}>{item.q}</Text>
                  <View style={[styles.chevronCircle, isOpen && styles.chevronCircleOpen]}>
                    <Ionicons
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={isOpen ? "#fff" : Colors.primary}
                    />
                  </View>
                </View>
                {isOpen && (
                  <>
                    <View style={styles.answerDivider} />
                    <Text style={styles.answer}>{item.a}</Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 12,
  },
  tabContainer: {
    height: 36,
    marginBottom: 14,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  tabBtn: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: Colors.darkPlum,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.lightPink + "70",
    includeFontPadding: false,
  },
  tabTextActive: {
    color: "#fff",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.darkPlum,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
    marginBottom: 14,
    marginHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.white,
  },
  card: {
    backgroundColor: Colors.darkPlum,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardOpen: {
    borderColor: Colors.primary + "40",
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginRight: 12,
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  chevronCircleOpen: {
    backgroundColor: Colors.primary,
  },
  answerDivider: {
    height: 1,
    backgroundColor: Colors.lightPink + "10",
    marginTop: 14,
    marginBottom: 12,
  },
  answer: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + "80",
    lineHeight: 22,
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.lightPink + "50",
  },
  emptyHint: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + "30",
  },
});
