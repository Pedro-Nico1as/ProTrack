import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizing } from '../../theme/tokens';
import { Text } from '../../components/core/Text';
import { Button } from '../../components/core/Button';
import { Input } from '../../components/core/Input';
import { supabase } from '../../services/supabase';
import { strings } from '../../constants/strings';
import { useAuthStore } from '../../stores/useAuthStore';

const profileSchema = z.object({
  name: z.string()
    .min(1, { message: strings.auth.errorNameRequired })
    .min(3, { message: strings.auth.errorNameMin }),
});

type FormValues = z.infer<typeof profileSchema>;

export const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const initialName = user?.user_metadata?.full_name || '';

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialName,
    },
  });

  const handleSave = async (data: FormValues) => {
    if (data.name === initialName) {
      navigation.goBack();
      return;
    }

    setIsLoading(true);
    try {
      // Atualiza os metadados do usuário na autenticação (origem da verdade para o app)
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: { full_name: data.name },
      });

      if (authError) throw authError;

      // Também atualiza na tabela profiles (caso seja usada para outras consultas)
      if (user?.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: data.name })
          .eq('id', user.id);
        
        if (profileError) {
          console.warn('Falha ao atualizar a tabela profiles:', profileError);
          // Não lançamos erro aqui para não interromper se a tabela não for essencial
        }
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert(strings.auth.alertErrorTitleGeneral, error.message || strings.auth.errorGeneral);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text variant="heading" style={styles.title}>{strings.profile.editProfile}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Input 
                  label={strings.auth.nameLabel}
                  placeholder={strings.auth.namePlaceholder}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  autoCapitalize="words"
                />
              )}
            />

            <Button
              title="Salvar Alterações"
              variant="primary"
              onPress={handleSubmit(handleSave)}
              loading={isLoading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: 20,
  },
  placeholder: {
    width: 28,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  form: {
    marginBottom: spacing.xl,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
});
