import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizing } from '../../theme/tokens';
import { Text } from '../../components/core/Text';
import { Button } from '../../components/core/Button';
import { Input } from '../../components/core/Input';
import { supabase } from '../../services/supabase';

WebBrowser.maybeCompleteAuthSession();

export const AuthScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'register') {
        if (!name) throw new Error('O nome é obrigatório para criar a conta.');
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        
        if (error) throw error;
        Alert.alert('Sucesso!', 'Conta criada com sucesso. Bem-vindo ao ProTrack!');
        
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      Alert.alert('Atenção', error.message || 'Ocorreu um problema na autenticação.');
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
      if (!data?.url) throw new Error('Não foi possível obter a URL de autenticação');

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
      Alert.alert('Erro no Login', error.message || 'Ocorreu um problema ao conectar com o Google.');
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
              <Ionicons name="fitness" size={32} color={colors.accent} />
            </View>
            <Text variant="heading" style={styles.title}>ProTrack</Text>
            <Text variant="caption" color={colors.textSecondary} align="center" style={styles.subtitle}>
              {mode === 'login' ? 'Acesse seus treinos de qualquer lugar.' : 'Crie sua conta e revolucione seus treinos.'}
            </Text>
          </View>

          <View style={styles.form}>
            {mode === 'register' && (
              <Input 
                label="Nome completo"
                placeholder="Ex: Pedro Vieira"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}
            <Input 
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input 
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {mode === 'register' && (
              <Input 
                label="Confirmar Senha"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            )}

            <Button
              title={mode === 'login' ? 'Entrar' : 'Criar Conta'}
              variant="primary"
              onPress={handleEmailAuth}
              loading={isLoading}
              style={styles.submitButton}
            />

            <TouchableOpacity 
              style={styles.toggleModeButton} 
              onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              <Text variant="body" color={colors.textSecondary} align="center">
                {mode === 'login' ? (
                  <>Não tem uma conta? <Text color={colors.primary}>Cadastre-se</Text></>
                ) : (
                  <>Já tem conta? <Text color={colors.primary}>Fazer login</Text></>
                )}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text variant="caption" color={colors.textMuted} style={styles.separatorText}>ou conecte-se com</Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={handleGoogleLogin} 
              disabled={isLoading}
            >
              {/* O Google possui as próprias guidelines. Este botão segue exatamente o padrão oficial: fundo branco, texto escuro, sombra discreta e logo. */}
              <Ionicons name="logo-google" size={20} color="#4285F4" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>
                Continuar com o Google
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
