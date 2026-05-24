import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconLock } from '@tabler/icons-react-native';
import { colors, spacing } from '../../theme/tokens';
import { Text } from '../../components/core/Text';
import { Button } from '../../components/core/Button';
import { Input } from '../../components/core/Input';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

const showAlert = (
  title: string,
  message: string,
  buttons?: Array<{ text: string; onPress?: () => void }>
) => {
  if (Platform.OS === 'web') {
    const webAlert = (globalThis as any).alert;
    if (typeof webAlert === 'function') {
      webAlert(`${title}\n\n${message}`);
    } else {
      console.log(`[Web Alert] ${title}: ${message}`);
    }
    if (buttons && buttons.length > 0) {
      const firstButton = buttons[0];
      if (firstButton.onPress) {
        firstButton.onPress();
      }
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

const getFriendlyErrorMessage = (error: any): string => {
  const message = error?.message || '';
  if (message === 'Invalid login credentials') {
    return 'E-mail ou senha incorretos. Por favor, tente novamente ou redefina sua senha.';
  }
  if (message === 'Email not confirmed') {
    return 'E-mail não confirmado. Por favor, verifique sua caixa de entrada para ativar sua conta.';
  }
  if (
    message.toLowerCase().includes('rate limit') ||
    message.toLowerCase().includes('rate_limit') ||
    message.toLowerCase().includes('60 seconds') ||
    message.toLowerCase().includes('too many requests')
  ) {
    return 'Limite de segurança atingido. O Supabase limita a frequência de envio de e-mails para evitar spam (limite de 3 e-mails/hora e 1 envio por minuto). Por favor, aguarde um momento ou aumente os limites no painel do Supabase (Settings > Auth > Rate Limits).';
  }
  return message || 'Ocorreu um problema na autenticação.';
};

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, { message: 'A senha é obrigatória' })
      .min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
    confirmPassword: z.string().min(1, { message: 'A confirmação de senha é obrigatória' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const signOut = useAuthStore((state) => state.signOut);
  const setIsResettingPassword = useAuthStore((state) => state.setIsResettingPassword);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleResetPassword = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      showAlert('Sucesso', 'Sua senha foi redefinida com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            setIsResettingPassword(false);
          },
        },
      ]);
    } catch (error: any) {
      showAlert('Erro ao redefinir senha', getFriendlyErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <IconLock size={32} color={colors.accent} />
            </View>
            <Text variant="heading" style={styles.title}>
              Nova Senha
            </Text>
            <Text
              variant="caption"
              color={colors.textSecondary}
              align="center"
              style={styles.subtitle}
            >
              Digite sua nova senha abaixo para redefinir o acesso à sua conta.
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Input
                  label="Nova Senha"
                  placeholder="Mínimo 6 caracteres"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  isPassword
                  textContentType="newPassword"
                  autoComplete="password-new"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Input
                  label="Confirmar Nova Senha"
                  placeholder="Confirme sua nova senha"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  isPassword
                  textContentType="newPassword"
                  autoComplete="password-new"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />

            <Button
              title="Redefinir Senha"
              variant="primary"
              onPress={handleSubmit(handleResetPassword)}
              loading={isLoading}
              style={styles.submitButton}
            />

            <Button
              title="Cancelar e Voltar"
              variant="outline"
              onPress={handleCancel}
              disabled={isLoading}
              style={styles.cancelButton}
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentLight,
  },
  title: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  subtitle: {
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  form: {
    marginBottom: spacing.xl,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
});
