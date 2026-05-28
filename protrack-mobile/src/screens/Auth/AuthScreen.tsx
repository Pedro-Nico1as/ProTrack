import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  IconBrandGoogle,
  IconArrowLeft,
  IconMail,
  IconLock,
  IconUser,
} from '@tabler/icons-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedGlowBackground } from '../../components/common/AnimatedGlowBackground';
import { colors, spacing, sizing } from '../../theme/tokens';
import { Text } from '../../components/core/Text';
import { Button } from '../../components/core/Button';
import { Input } from '../../components/core/Input';
import { supabase } from '../../services/supabase';
import { strings } from '../../constants/strings';

WebBrowser.maybeCompleteAuthSession();

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const showAlert = (
  title: string,
  message: string,
  buttons?: { text: string; onPress?: () => void }[]
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

const authSchema = z
  .object({
    mode: z.enum(['login', 'register', 'forgot']),
    name: z.string().optional(),
    email: z
      .string()
      .min(1, { message: strings.auth.errorEmailRequired })
      .email({ message: strings.auth.errorEmailInvalid }),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'login' || data.mode === 'register') {
      if (!data.password || data.password.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: strings.auth.errorPasswordRequired,
          path: ['password'],
        });
      } else if (data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: strings.auth.errorPasswordMin,
          path: ['password'],
        });
      }
    }
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
  const [mode, setMode] = useState<'welcome' | 'login' | 'register' | 'forgot'>('welcome');

  const { control, handleSubmit, setValue, clearErrors } = useForm<FormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      mode: 'login',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSetMode = (newMode: 'welcome' | 'login' | 'register' | 'forgot') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMode(newMode);
    if (newMode !== 'welcome') {
      setValue('mode', newMode);
    }
    clearErrors();
  };

  const handleEmailAuth = async (data: FormValues) => {
    setIsLoading(true);
    try {
      if (data.mode === 'register') {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password || '',
          options: {
            data: { full_name: data.name?.trim() },
            emailRedirectTo: 'protrack://auth/callback',
          },
        });

        if (error) throw error;

        const isEmailAlreadyRegistered =
          signUpData?.user &&
          (!signUpData.user.identities || signUpData.user.identities.length === 0);

        if (isEmailAlreadyRegistered) {
          showAlert(
            'E-mail já cadastrado',
            'Este e-mail já está em uso. Por favor, tente fazer login ou utilize outro e-mail.'
          );
          setIsLoading(false);
          return;
        }

        if (signUpData?.session) {
          showAlert('Conta Criada!', 'Sua conta foi criada com sucesso e você já está conectado!');
        } else {
          showAlert(
            'Verifique seu e-mail',
            `Conta criada com sucesso! Enviamos uma notificação de confirmação para o e-mail: ${data.email}. Por favor, verifique sua caixa de entrada (e a pasta de spam) para ativar sua conta.`
          );
        }
      } else if (data.mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(data.email.trim(), {
          redirectTo: 'protrack://reset-password',
        });
        if (error) throw error;
        showAlert(
          'E-mail enviado',
          `Verifique sua caixa de entrada no e-mail ${data.email} para redefinir sua senha.`
        );
        handleSetMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email.trim(),
          password: data.password || '',
        });
        if (error) throw error;
      }
    } catch (error: any) {
      showAlert(strings.auth.alertErrorTitle, getFriendlyErrorMessage(error));
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
      showAlert(
        strings.auth.alertErrorTitleGoogle,
        error.message || strings.auth.errorGoogleConnection
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Glow Background */}
      <AnimatedGlowBackground />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            mode === 'welcome'
              ? { justifyContent: 'space-between', paddingHorizontal: 0, paddingVertical: 0 }
              : { paddingHorizontal: spacing.xl, paddingVertical: spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {mode === 'welcome' ? (
            <>
              {/* Screen 1: Welcome Header */}
              <View style={styles.welcomeHeader}>
                <Text variant="hero" style={styles.welcomeTitle}>
                  protrack<Text style={styles.welcomeTitleDot}>.</Text>
                </Text>
                <Text style={styles.welcomeSubtitle}>EVOLUÇÃO EM ALTA PERFORMANCE</Text>
              </View>

              {/* Screen 1: Welcome Bottom Card */}
              <View style={styles.welcomeCard}>
                <Text variant="heading" style={styles.welcomeCardTitle}>
                  Pronto para evoluir além dos seus limites?
                </Text>
                <Text style={styles.welcomeCardText}>
                  Crie seu treino, registre suas cargas e acompanhe sua performance com precisão
                  profissional.
                </Text>
                <Button
                  title="Começar agora  ➔"
                  variant="primary"
                  onPress={() => handleSetMode('login')}
                  style={{ borderRadius: 26, overflow: 'hidden', marginTop: spacing.md }}
                />
              </View>
            </>
          ) : (
            <>
              {/* Screen 2: Form Card (Glassmorphism container) */}
              <View style={styles.formCard}>
                {/* Back button */}
                <TouchableOpacity
                  style={styles.cardHeaderBack}
                  onPress={() => handleSetMode(mode === 'forgot' ? 'login' : 'welcome')}
                  activeOpacity={0.7}
                >
                  <IconArrowLeft
                    size={18}
                    color={colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text color={colors.textSecondary} style={styles.cardHeaderBackText}>
                    {mode === 'forgot' ? strings.auth.backToLogin : 'Voltar'}
                  </Text>
                </TouchableOpacity>

                {/* Header inside Card */}
                <View style={styles.header}>
                  <Text variant="heading" style={styles.cardTitle}>
                    {mode === 'login' ? (
                      <>
                        {"Let's"} <Text style={styles.cardTitleHighlight}>Track you in.</Text>
                      </>
                    ) : mode === 'register' ? (
                      <>
                        {"Let's"} <Text style={styles.cardTitleHighlight}>Get you started.</Text>
                      </>
                    ) : (
                      <>
                        {"Let's"} <Text style={styles.cardTitleHighlight}>Reset your access.</Text>
                      </>
                    )}
                  </Text>

                  <Text style={styles.cardSubtitle}>
                    {mode === 'login' && 'Evolução e alta performance a cada treino.'}
                    {mode === 'register' && 'Crie sua conta para iniciar sua jornada.'}
                    {mode === 'forgot' && 'Insira seu e-mail para recuperar sua senha.'}
                  </Text>
                </View>

                {mode === 'register' && (
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                      <Input
                        placeholder={strings.auth.nameLabel}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={error?.message}
                        autoCapitalize="words"
                        textContentType="name"
                        autoComplete="name"
                        leftIcon={<IconUser size={20} color={colors.textSecondary} />}
                      />
                    )}
                  />
                )}

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <Input
                      placeholder={strings.auth.emailLabel}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={error?.message}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="emailAddress"
                      autoComplete="email"
                      leftIcon={<IconMail size={20} color={colors.textSecondary} />}
                    />
                  )}
                />

                {mode !== 'forgot' && (
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                      <View>
                        <Input
                          placeholder={strings.auth.passwordLabel}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          error={error?.message}
                          isPassword
                          textContentType="password"
                          autoComplete="password"
                          autoCapitalize="none"
                          autoCorrect={false}
                          leftIcon={<IconLock size={20} color={colors.textSecondary} />}
                        />
                        {mode === 'login' && (
                          <TouchableOpacity
                            style={styles.forgotPasswordButton}
                            onPress={() => handleSetMode('forgot')}
                          >
                            <Text variant="caption" color={colors.textSecondary}>
                              Esqueci minha senha
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  />
                )}

                {mode === 'register' && (
                  <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                      <Input
                        placeholder={strings.auth.confirmPasswordLabel}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={error?.message}
                        isPassword
                        textContentType="password"
                        autoComplete="password"
                        autoCapitalize="none"
                        autoCorrect={false}
                        leftIcon={<IconLock size={20} color={colors.textSecondary} />}
                      />
                    )}
                  />
                )}

                <Button
                  title={
                    mode === 'login'
                      ? strings.auth.loginBtn
                      : mode === 'register'
                        ? strings.auth.registerBtn
                        : strings.auth.forgotPasswordBtn
                  }
                  variant="primary"
                  onPress={handleSubmit(handleEmailAuth)}
                  loading={isLoading}
                  style={{
                    borderRadius: 26,
                    overflow: 'hidden',
                    marginTop: mode === 'login' ? 0 : spacing.md,
                  }}
                />

                {mode !== 'forgot' && (
                  <>
                    <View style={styles.separatorContainer}>
                      <View style={styles.separatorLine} />
                      <Text variant="caption" color={colors.textMuted} style={styles.separatorText}>
                        ou conecte-se com
                      </Text>
                      <View style={styles.separatorLine} />
                    </View>

                    <TouchableOpacity
                      style={styles.googleButton}
                      onPress={handleGoogleLogin}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      <IconBrandGoogle size={20} color="#E1E1E6" style={styles.googleIcon} />
                      <Text style={styles.googleButtonText}>{strings.auth.googleBtnText}</Text>
                    </TouchableOpacity>
                  </>
                )}

                <Text
                  variant="caption"
                  color={colors.textSecondary}
                  align="center"
                  style={styles.switchModeLabel}
                >
                  {mode === 'login' && 'Não tem uma conta?'}
                  {mode === 'register' && 'Já tem uma conta?'}
                  {mode === 'forgot' && 'Lembrou de sua senha?'}
                </Text>
              </View>

              {/* Switch mode button outside the main card at the bottom */}
              <TouchableOpacity
                style={styles.bottomSwitchButton}
                onPress={() => handleSetMode(mode === 'login' ? 'register' : 'login')}
                activeOpacity={0.8}
              >
                <Text style={styles.bottomSwitchButtonText}>
                  {mode === 'login' ? 'Cadastre-se' : 'Fazer Login'}
                </Text>
              </TouchableOpacity>
            </>
          )}
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
  },
  welcomeHeader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 1.5,
  },
  welcomeTitle: {
    fontSize: 46,
    letterSpacing: -1,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  welcomeTitleDot: {
    color: colors.primary,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 2.0,
    fontWeight: '700',
    opacity: 0.8,
  },
  welcomeCard: {
    backgroundColor: 'rgba(22, 22, 26, 0.85)',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl * 1.5,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    marginTop: spacing.xl * 2,
  },
  welcomeCardTitle: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing.md,
  },
  welcomeCardText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    textAlign: 'left',
  },
  cardTitleHighlight: {
    fontWeight: '800',
    color: colors.primary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'left',
  },
  formCard: {
    backgroundColor: 'rgba(22, 22, 26, 0.75)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 8,
    width: '100%',
    alignSelf: 'center',
  },
  cardHeaderBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  cardHeaderBackText: {
    fontSize: 13,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    opacity: 0.6,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  separatorText: {
    paddingHorizontal: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1.0,
    fontSize: 11,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    width: '100%',
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  switchModeLabel: {
    marginTop: spacing.lg,
    opacity: 0.8,
  },
  bottomSwitchButton: {
    height: sizing.buttonHeight,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  bottomSwitchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
