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
import { SvgXml } from 'react-native-svg';

const wordmarkXml = `<svg width="512" height="111" viewBox="0 0 512 111" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M32.16 87.96C28 87.96 24.24 87.12 20.88 85.44C17.52 83.68 14.84 81.32 12.84 78.36C10.84 75.4 9.76001 72 9.60001 68.16V47.64C9.76001 43.8 10.84 40.4 12.84 37.44C14.92 34.4 17.6 32 20.88 30.24C24.24 28.48 28 27.6 32.16 27.6C37.52 27.6 42.32 28.92 46.56 31.56C50.8 34.2 54.12 37.8 56.52 42.36C59 46.92 60.24 52.08 60.24 57.84C60.24 63.52 59 68.64 56.52 73.2C54.12 77.76 50.8 81.36 46.56 84C42.32 86.64 37.52 87.96 32.16 87.96ZM8.79169e-06 111V28.8H15.72V44.04L13.08 58.08L15.6 72.12V111H8.79169e-06ZM29.4 73.44C32.28 73.44 34.84 72.8 37.08 71.52C39.32 70.16 41.04 68.32 42.24 66C43.52 63.6 44.16 60.84 44.16 57.72C44.16 54.68 43.52 52 42.24 49.68C41.04 47.28 39.32 45.44 37.08 44.16C34.84 42.8 32.28 42.12 29.4 42.12C26.6 42.12 24.08 42.8 21.84 44.16C19.6 45.44 17.84 47.28 16.56 49.68C15.36 52 14.76 54.68 14.76 57.72C14.76 60.84 15.36 63.6 16.56 66C17.84 68.32 19.56 70.16 21.72 71.52C23.96 72.8 26.52 73.44 29.4 73.44ZM70.5469 86.76V28.8H86.2669V86.76H70.5469ZM86.2669 54.72L80.1469 50.64C80.8669 43.52 82.9469 37.92 86.3869 33.84C89.8269 29.68 94.7869 27.6 101.267 27.6C104.067 27.6 106.587 28.08 108.827 29.04C111.067 29.92 113.107 31.4 114.947 33.48L105.107 44.76C104.227 43.8 103.147 43.08 101.867 42.6C100.667 42.12 99.2669 41.88 97.6669 41.88C94.3069 41.88 91.5469 42.96 89.3869 45.12C87.3069 47.2 86.2669 50.4 86.2669 54.72ZM146.068 87.96C140.228 87.96 134.948 86.64 130.228 84C125.588 81.28 121.868 77.64 119.068 73.08C116.348 68.44 114.988 63.28 114.988 57.6C114.988 51.92 116.348 46.84 119.068 42.36C121.788 37.8 125.508 34.2 130.228 31.56C134.948 28.84 140.188 27.48 145.948 27.48C151.868 27.48 157.148 28.84 161.788 31.56C166.508 34.2 170.228 37.8 172.948 42.36C175.668 46.84 177.028 51.92 177.028 57.6C177.028 63.28 175.668 68.44 172.948 73.08C170.228 77.64 166.508 81.28 161.788 84C157.148 86.64 151.908 87.96 146.068 87.96ZM145.948 73.32C148.908 73.32 151.508 72.68 153.748 71.4C156.068 70.04 157.828 68.2 159.028 65.88C160.308 63.48 160.948 60.76 160.948 57.72C160.948 54.68 160.308 52 159.028 49.68C157.748 47.36 155.988 45.56 153.748 44.28C151.508 42.92 148.908 42.24 145.948 42.24C143.068 42.24 140.508 42.92 138.268 44.28C136.028 45.56 134.268 47.36 132.988 49.68C131.708 52 131.068 54.68 131.068 57.72C131.068 60.76 131.708 63.48 132.988 65.88C134.268 68.2 136.028 70.04 138.268 71.4C140.508 72.68 143.068 73.32 145.948 73.32ZM194.262 86.76V4.68001H209.982V86.76H194.262ZM180.702 42.6V28.8H223.542V42.6H180.702ZM232.383 86.76V28.8H248.103V86.76H232.383ZM248.103 54.72L241.983 50.64C242.703 43.52 244.783 37.92 248.223 33.84C251.663 29.68 256.623 27.6 263.103 27.6C265.903 27.6 268.423 28.08 270.663 29.04C272.903 29.92 274.943 31.4 276.783 33.48L266.943 44.76C266.063 43.8 264.983 43.08 263.703 42.6C262.503 42.12 261.103 41.88 259.503 41.88C256.143 41.88 253.383 42.96 251.223 45.12C249.143 47.2 248.103 50.4 248.103 54.72ZM304.904 87.96C299.624 87.96 294.864 86.64 290.624 84C286.384 81.36 283.064 77.76 280.664 73.2C278.264 68.64 277.064 63.52 277.064 57.84C277.064 52.08 278.264 46.92 280.664 42.36C283.064 37.8 286.384 34.2 290.624 31.56C294.864 28.92 299.624 27.6 304.904 27.6C309.064 27.6 312.784 28.44 316.064 30.12C319.344 31.8 321.944 34.16 323.864 37.2C325.864 40.16 326.944 43.52 327.104 47.28V68.16C326.944 72 325.864 75.4 323.864 78.36C321.944 81.32 319.344 83.68 316.064 85.44C312.784 87.12 309.064 87.96 304.904 87.96ZM307.784 73.44C312.184 73.44 315.744 72 318.464 69.12C321.184 66.16 322.544 62.36 322.544 57.72C322.544 54.68 321.904 52 320.624 49.68C319.424 47.28 317.704 45.44 315.464 44.16C313.304 42.8 310.744 42.12 307.784 42.12C304.904 42.12 302.344 42.8 300.104 44.16C297.944 45.44 296.224 47.28 294.944 49.68C293.744 52 293.144 54.68 293.144 57.72C293.144 60.84 293.744 63.6 294.944 66C296.224 68.32 297.944 70.16 300.104 71.52C302.344 72.8 304.904 73.44 307.784 73.44ZM321.704 86.76V71.16L324.224 57L321.704 43.08V28.8H337.304V86.76H321.704ZM378.571 87.96C372.651 87.96 367.331 86.64 362.611 84C357.891 81.36 354.171 77.76 351.451 73.2C348.731 68.64 347.371 63.52 347.371 57.84C347.371 52.08 348.731 46.92 351.451 42.36C354.171 37.8 357.891 34.2 362.611 31.56C367.411 28.84 372.731 27.48 378.571 27.48C383.131 27.48 387.331 28.32 391.171 30C395.011 31.68 398.331 34.08 401.131 37.2L391.051 47.4C389.531 45.72 387.691 44.44 385.531 43.56C383.451 42.68 381.131 42.24 378.571 42.24C375.691 42.24 373.091 42.92 370.771 44.28C368.531 45.56 366.731 47.36 365.371 49.68C364.091 51.92 363.451 54.6 363.451 57.72C363.451 60.76 364.091 63.48 365.371 65.88C366.731 68.2 368.531 70.04 370.771 71.4C373.091 72.68 375.691 73.32 378.571 73.32C381.211 73.32 383.571 72.88 385.651 72C387.811 71.04 389.651 69.68 391.171 67.92L401.371 78.12C398.411 81.32 395.011 83.76 391.171 85.44C387.331 87.12 383.131 87.96 378.571 87.96ZM447.233 86.76L424.793 56.88L447.113 28.8H465.233L439.073 60.48L439.673 52.8L466.433 86.76H447.233ZM410.273 86.76V3.8147e-06H425.993V86.76H410.273Z" fill="white"/>
<ellipse cx="498.04" cy="73.704" rx="13.858" ry="12.7901" transform="rotate(0.63988 498.04 73.704)" fill="#E43232"/>
</svg>`;

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
                <SvgXml xml={wordmarkXml} width={240} height={52} style={styles.welcomeLogo} />
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
  welcomeLogo: {
    marginBottom: spacing.md,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 2.0,
    fontWeight: '700',
    opacity: 0.8,
  },
  welcomeCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
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
    backgroundColor: 'rgba(30, 30, 30, 0.75)',
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
