import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizing } from '../../theme/tokens';
import { strings } from '../../constants/strings';
import { Text } from '../../components/core/Text';

interface ProfileMenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const menuItems: ProfileMenuItem[] = [
  { icon: 'person-outline', label: strings.profile.editProfile },
  { icon: 'settings-outline', label: strings.profile.settings },
  { icon: 'card-outline', label: strings.profile.subscription },
  { icon: 'help-circle-outline', label: strings.profile.help },
  { icon: 'log-out-outline', label: strings.profile.logout },
];

export const ProfileScreen = () => {
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
              Pedro Vieira
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              pedro@protrack.app
            </Text>
          </View>

          {/* Menu items */}
          <View style={styles.menuSection}>
            {menuItems.map((item, i) => (
              <View
                key={i}
                style={[styles.menuItem, i === menuItems.length - 1 && styles.menuItemLast]}
              >
                <Ionicons name={item.icon} size={22} color={colors.textSecondary} />
                <Text variant="body" style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            ))}
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
