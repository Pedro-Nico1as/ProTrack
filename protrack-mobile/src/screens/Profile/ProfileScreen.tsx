import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizing } from '../../theme/tokens';
import { strings } from '../../constants/strings';
import { Text } from '../../components/core/Text';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCustomWorkoutsStore } from '../../stores/useCustomWorkoutsStore';
import { useActiveWorkoutStore } from '../../stores/useActiveWorkoutStore';
import { deleteUserAccount } from '../../services/api';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

interface ProfileMenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  action: 'edit' | 'logout' | 'delete';
}

const menuItems: ProfileMenuItem[] = [
  { icon: 'person-outline', label: strings.profile.editProfile, action: 'edit' },
  { icon: 'log-out-outline', label: strings.profile.logout, action: 'logout' },
  { icon: 'trash-outline', label: strings.profile.deleteAccount, action: 'delete' },
];

type ProfileNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen = () => {
  const { user, signOut } = useAuthStore();
  const navigation = useNavigation<ProfileNavigationProp>();
  const userName = user?.user_metadata?.full_name || strings.profile.defaultUserName;
  const userEmail = user?.email || strings.profile.defaultUserEmail;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(strings.profile.deleteAccountTitle, strings.profile.deleteAccountMsg, [
      { text: strings.profile.deleteAccountCancel, style: 'cancel' },
      {
        text: strings.profile.deleteAccountConfirm,
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            const success = await deleteUserAccount();
            if (success) {
              // Limpa todos os dados locais permanentemente ao excluir conta
              useCustomWorkoutsStore.getState().clearWorkouts();
              useActiveWorkoutStore.getState().finishWorkout();

              Alert.alert('Sucesso', strings.profile.deleteAccountSuccess, [
                {
                  text: 'OK',
                  onPress: () => {
                    signOut();
                  },
                },
              ]);
            } else {
              Alert.alert('Erro', strings.profile.deleteAccountError);
            }
          } catch {
            Alert.alert('Erro', strings.profile.deleteAccountError);
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        {isDeleting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.error} />
            <Text style={{ marginTop: spacing.md }} color={colors.textSecondary}>
              Excluindo conta...
            </Text>
          </View>
        ) : (
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
                const isDelete = item.action === 'delete';
                const handlePress = () => {
                  if (item.action === 'logout') {
                    signOut();
                  } else if (item.action === 'edit') {
                    navigation.navigate('EditProfile');
                  } else if (item.action === 'delete') {
                    handleDeleteAccount();
                  }
                };
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={handlePress}
                    style={[styles.menuItem, isDelete && styles.menuItemLast]}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={isDelete ? colors.error : colors.textSecondary}
                    />
                    <Text
                      variant="body"
                      style={styles.menuLabel}
                      color={isDelete ? colors.error : colors.text}
                    >
                      {item.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
