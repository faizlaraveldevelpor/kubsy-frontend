import { View, Text, StyleSheet, Image } from 'react-native';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme/color';
import BottomFilterDialog from '@/dialog/Bottomdialog';
import { Fonts } from '@/theme/fonts';
import { useSelector } from 'react-redux';


function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function Hometop() {
  const [open, setOpen] = useState(false);
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  return (
    <View style={styles.container}>
      {/* Left — logo + brand */}
      <View style={styles.left}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
        />
        <View>
          <Text style={styles.brand}>Kubsy</Text>
          <Text style={styles.greeting}>
            {getGreeting()}, {profileSlice?.full_name?.split(' ')[0] ?? ''}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="options-outline" size={20} color={Colors.lightPink} />
      </TouchableOpacity>

      <BottomFilterDialog visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },
  brand: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 12,
    color: Colors.lightPink + '70',
    fontFamily: Fonts.regular,
    marginTop: -1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: Colors.darkPlum,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
