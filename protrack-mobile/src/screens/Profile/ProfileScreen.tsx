import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizing } from '../../theme/tokens';
import { strings } from '../../constants/strings';
import { Text } from '../../components/core/Text';
import { useAuthStore } from '../../stores/useAuthStore';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

interface ProfileMenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  action: 'edit' | 'logout';
}

const menuItems: ProfileMenuItem[] = [
  { icon: 'person-outline', label: strings.profile.editProfile, action: 'edit' },
  { icon: 'log-out-outline', label: strings.profile.logout, action: 'logout' },
];

type ProfileNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen = () => {
  const { user, signOut } = useAuthStore();
  const navigation = useNavigation<ProfileNavigationProp>();
  const userName = user?.user_metadata?.full_name || strings.profile.defaultUserName;
  const userEmail = user?.email || strings.profile.defaultUserEmail;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Avatar + Name */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={colors.textMuted} />
            </View>
            <Text variant="subheading" weight="bold" style={styles.userName}>
              {userName}
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              {userEmail}
            </Text>
          </View>

          {/* Menu items */}
          <View style={styles.menuSection}>
            {menuItems.map((item, i) => {
              const isLogout = item.action === 'logout';
              const handlePress = () => {
                if (item.action === 'logout') {
                  signOut();
                } else if (item.action === 'edit') {
                  navigation.navigate('EditProfile');
                }
              };
              return (
                <TouchableOpacity
                  key={i}
                  onPress={handlePress}
                  style={[styles.menuItem, isLogout && styles.menuItemLast]}
                  activeOpacity={0.7}
                >
                  <Ionicons name={item.icon} size={22} color={colors.textSecondary} />
                  <Text variant="body" style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    padding: spacing.md,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
    marginBottom: spacing.md,
  },
  userName: {
    marginBottom: spacing.xs,
  },
  menuSection: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    minHeight: sizing.touchableMinHeight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
