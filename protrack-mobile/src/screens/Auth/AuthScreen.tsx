import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconFlame, IconBrandGoogle } from '@tabler/icons-react-native';
import { colors, spacing, sizing } from '../../theme/tokens';
import { Text } from '../../components/core/Text';
import { Button } from '../../components/core/Button';
import { Input } from '../../components/core/Input';
import { supabase } from '../../services/supabase';
import { strings } from '../../constants/strings';

WebBrowser.maybeCompleteAuthSession();

const authSchema = z.object({
  mode: z.enum(['login', 'register']),
  name: z.string().optional(),
  email: z.string()
    .min(1, { message: strings.auth.errorEmailRequired })
    .email({ message: strings.auth.errorEmailInvalid }),
  password: z.string()
    .min(1, { message: strings.auth.errorPasswordRequired })
    .min(6, { message: strings.auth.errorPasswordMin }),
  confirmPassword: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.mode === 'register') {
    if (!data.name || data.name.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: strings.auth.errorNameRequired,
        path: ['name'],
      });
    } else if (data.name.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: strings.auth.errorNameMin,
        path: ['name'],
      });
    }

    if (!data.confirmPassword || data.confirmPassword.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: strings.auth.errorConfirmPasswordRequired,
        path: ['confirmPassword'],
      });
    } else if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: strings.auth.errorPasswordMismatch,
        path: ['confirmPassword'],
      });
    }
  }
});

type FormValues = z.infer<typeof authSchema>;

export const AuthScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const { control, handleSubmit, reset, setValue, clearErrors, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      mode: 'login',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleToggleMode = () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    setValue('mode', newMode);
    clearErrors();
  };


  const handleEmailAuth = async (data: FormValues) => {
    setIsLoading(true);
    try {
      if (data.mode === 'register') {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { full_name: data.name },
          },
        });
        
        if (error) throw error;
        
        // Se o signup retornou sessão, o onAuthStateChange já vai cuidar da navegação.
        // Se não retornou sessão (ex: confirmação de e-mail ativa no dashboard),
        // fazemos login automático em background — o trigger auto_confirm_user garante
        // que o email_confirmed_at já foi preenchido no momento do INSERT.
        if (signUpData.user && !signUpData.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });
          if (signInError) throw signInError;
        }
        // Navegação para MainTabs acontece automaticamente via onAuthStateChange -> useAuthStore -> RootNavigator
        
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        // Navegação para MainTabs acontece automaticamente via onAuthStateChange -> useAuthStore -> RootNavigator
      }
    } catch (error: any) {
      Alert.alert(strings.auth.alertErrorTitle, error.message || strings.auth.errorGeneral);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = makeRedirectUri({ path: '/auth/callback' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error(strings.auth.errorGoogleAuthUrl);

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success') {
        const { url } = result;
        const codeMatch = url.match(/code=([^&]+)/);
        if (codeMatch && codeMatch[1]) {
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(codeMatch[1]);
          if (sessionError) throw sessionError;
          return;
        }

        const accessMatch = url.match(/access_token=([^&]+)/);
        const refreshMatch = url.match(/refresh_token=([^&]+)/);
        if (accessMatch && refreshMatch) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessMatch[1],
            refresh_token: refreshMatch[1],
          });
          if (setSessionError) throw setSessionError;
        }
      }
    } catch (error: any) {
      Alert.alert(strings.auth.alertErrorTitleGoogle, error.message || strings.auth.errorGoogleConnection);
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
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <IconFlame size={32} color={colors.accent} />
            </View>
            <Text variant="heading" style={styles.title}>{strings.auth.appName}</Text>
            <Text variant="caption" color={colors.textSecondary} align="center" style={styles.subtitle}>
              {mode === 'login' ? strings.auth.subtitleLogin : strings.auth.subtitleRegister}
            </Text>
          </View>

          <View style={styles.form}>
            {mode === 'register' && (
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
            )}
            
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Input 
                  label={strings.auth.emailLabel}
                  placeholder={strings.auth.emailPlaceholder}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Input 
                  label={strings.auth.passwordLabel}
                  placeholder={strings.auth.passwordPlaceholder}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  secureTextEntry
                />
              )}
            />

            {mode === 'register' && (
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <Input 
                    label={strings.auth.confirmPasswordLabel}
                    placeholder={strings.auth.passwordPlaceholder}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={error?.message}
                    secureTextEntry
                  />
                )}
              />
            )}

            <Button
              title={mode === 'login' ? strings.auth.loginBtn : strings.auth.registerBtn}
              variant="primary"
              onPress={handleSubmit(handleEmailAuth)}
              loading={isLoading}
              style={styles.submitButton}
            />

            <TouchableOpacity 
              style={styles.toggleModeButton} 
              onPress={handleToggleMode}
            >
              <Text variant="body" color={colors.textSecondary} align="center">
                {mode === 'login' ? (
                  <>{strings.auth.dontHaveAccount}<Text color={colors.primary}>{strings.auth.signUpLink}</Text></>
                ) : (
                  <>{strings.auth.alreadyHaveAccount}<Text color={colors.primary}>{strings.auth.loginLink}</Text></>
                )}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text variant="caption" color={colors.textMuted} style={styles.separatorText}>{strings.auth.orConnectWith}</Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={handleGoogleLogin} 
              disabled={isLoading}
            >
              <IconBrandGoogle size={20} color="#4285F4" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>
                {strings.auth.googleBtnText}
              </Text>
            </TouchableOpacity>
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
  toggleModeButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  separatorText: {
    paddingHorizontal: spacing.md,
  },
  socialContainer: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: '#3F3F46',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});
