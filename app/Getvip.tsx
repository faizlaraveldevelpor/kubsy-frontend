import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';

const { width } = Dimensions.get('window');

const PLANS = [
  {
    id: 'monthly',
    label: '1 Month',
    price: '$9.99',
    period: '/month',
    perMonth: '$9.99',
    badge: null,
    features: ['Unlimited Swipes', 'Unlimited Likes', 'No Ads'],
  },
  {
    id: 'quarterly',
    label: '3 Months',
    price: '$19.99',
    period: '/3 months',
    perMonth: '$6.66',
    badge: 'Most Popular',
    features: ['All Premium Features', 'Priority Support', 'Exclusive Badge'],
  },
];

const PERKS = [
  { icon: 'heart-multiple', label: 'Unlimited Likes' },
  { icon: 'swap-horizontal-bold', label: 'Unlimited Swipes' },
  { icon: 'shield-star', label: 'Exclusive Badge' },
];

export default function Getvip() {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const [selectedPlan, setSelectedPlan] = useState('quarterly');

  return (
    <View style={styles.screen}>
      {/* Back button */}
      <TouchableOpacity style={[styles.backBtn, { top: safeTop + 10 }]} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={26} color={Colors.white} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <LinearGradient
          colors={[Colors.primary, Colors.wine, Colors.darkPlum]}
          style={[styles.hero, { paddingTop: safeTop + 40 }]}
        >
          <View style={styles.crownCircle}>
            <FontAwesome5 name="crown" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Kubsy VIP</Text>
          <Text style={styles.heroSub}>
            Unlock the full experience — swipe, match,{'\n'}and connect without limits.
          </Text>

          {/* Perks row */}
          <View style={styles.perksRow}>
            {PERKS.map((p) => (
              <View key={p.label} style={styles.perkItem}>
                <MaterialCommunityIcons name={p.icon as any} size={22} color={Colors.white} />
                <Text style={styles.perkLabel}>{p.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Plan cards */}
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>

        <View style={styles.plansRow}>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                activeOpacity={0.85}
                onPress={() => setSelectedPlan(plan.id)}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                ]}
              >
                {plan.badge && (
                  <View style={styles.badgeWrap}>
                    <Text style={styles.badgeText}>{plan.badge}</Text>
                  </View>
                )}

                <Text style={[styles.planLabel, isSelected && styles.planLabelSelected]}>
                  {plan.label}
                </Text>

                <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                  {plan.price}
                </Text>
                <Text style={[styles.planPeriod, isSelected && styles.planPeriodSelected]}>
                  {plan.period}
                </Text>

                {plan.id === 'quarterly' && (
                  <View style={styles.savingsPill}>
                    <Text style={styles.savingsText}>Save 33%</Text>
                  </View>
                )}

                <View style={styles.radioSpacer}>
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Features list */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What you get</Text>
          {(PLANS.find((p) => p.id === selectedPlan)?.features ?? []).map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaWrap}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.ctaBtn}
          onPress={() => router.push('/payments/Payments')}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <FontAwesome5 name="crown" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.ctaText}>Continue with VIP</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 30,
  },

  /* Hero */
  hero: {
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  crownCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: '#fff',
    letterSpacing: 0.5,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  perksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  perkItem: {
    alignItems: 'center',
    width: (width - 80) / 4,
  },
  perkLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    textAlign: 'center',
  },

  /* Section */
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginTop: 28,
    marginBottom: 14,
    paddingHorizontal: 20,
  },

  /* Plan cards */
  plansRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  planCard: {
    flex: 1,
    backgroundColor: Colors.darkPlum,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '18',
  },
  badgeWrap: {
    position: 'absolute',
    top: -11,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.lightPink,
    marginTop: 6,
  },
  planLabelSelected: {
    color: Colors.white,
  },
  planPrice: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginTop: 10,
  },
  planPriceSelected: {
    color: '#fff',
  },
  planPeriod: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.lightPink,
    marginTop: 2,
  },
  planPeriodSelected: {
    color: 'rgba(255,255,255,0.7)',
  },
  savingsPill: {
    backgroundColor: Colors.green + '25',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  savingsText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.green,
  },
  radioSpacer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 14,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  /* Features */
  featuresCard: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: Colors.darkPlum,
    borderRadius: 20,
    padding: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.white,
  },

  /* CTA */
  ctaWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 14,
    backgroundColor: Colors.background,
  },
  ctaBtn: {
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
  },
  ctaText: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: '#fff',
  },
});
