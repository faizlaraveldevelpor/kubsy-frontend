import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';

interface TabHeaderProps {
  title: string;
  rightContent?: React.ReactNode;
}

export default function TabHeader({ title, rightContent }: TabHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {rightContent ? <View style={styles.headerRight}>{rightContent}</View> : <View style={styles.headerRight} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 10,
    borderRadius: 18,
  },
  headerTitle: {
    color: Colors.black,
    fontSize: 22,
    fontFamily: Fonts.bold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
