import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../i18n/I18nContext';
import { useAppTheme } from '../theme/ThemeContext';
import { createScaler } from '../utils/responsive';
import { adminSignIn } from '../services/api';

export default function AdminLoginScreen({ onBack, onNavigate, onUpdatePreferences }) {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width), [width]);
  const { t, language } = useI18n();
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const arRegular = language === 'ar' ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = language === 'ar' ? { fontFamily: 'Cairo_700Bold' } : null;

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert(t('common.alert'), t('admin.loginRequired'));
      return;
    }
    setLoading(true);
    try {
      const response = await adminSignIn({ identifier: identifier.trim(), password: password.trim() });
      if (onUpdatePreferences) {
        await onUpdatePreferences({
          admin: {
            token: response.data?.token || '',
            profile: response.data?.admin || null,
            loggedAt: new Date().toISOString(),
          },
        });
      }
      Alert.alert(t('common.success'), t('admin.loginSuccess'));
      onNavigate('admin-requests');
    } catch (error) {
      const apiMessage = error?.response?.data?.error;
      Alert.alert(t('common.error'), apiMessage || t('admin.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, isDark && { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, isDark && { backgroundColor: colors.surfaceAlt }]} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, arBold, { color: colors.textPrimary }]}>{t('admin.title')}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.formWrap}>
        <Text style={[styles.title, arBold, { color: colors.textPrimary }]}>{t('admin.loginTitle')}</Text>
        <Text style={[styles.subtitle, arRegular, { color: colors.textSecondary }]}>{t('admin.loginSub')}</Text>

        <TextInput
          style={[styles.input, arRegular, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder={t('admin.identifier')}
          placeholderTextColor="#9ca3af"
          value={identifier}
          onChangeText={setIdentifier}
        />
        <TextInput
          style={[styles.input, arRegular, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder={t('admin.password')}
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.primaryBtnText, arBold]}>{t('admin.loginButton')}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (width) => {
  const s = createScaler(width);
  return StyleSheet.create({
    screen: { flex: 1 },
    header: {
      backgroundColor: '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
      paddingHorizontal: s(16, 14, 20),
      paddingVertical: s(12, 10, 16),
      flexDirection: 'row',
      alignItems: 'center',
    },
    backBtn: {
      width: s(40, 36, 44),
      height: s(40, 36, 44),
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      color: '#111827',
      fontSize: s(17, 15, 20),
      fontWeight: '700',
    },
    headerPlaceholder: {
      width: s(40, 36, 44),
    },
    formWrap: {
      paddingHorizontal: s(20, 16, 26),
      paddingTop: s(32, 24, 40),
    },
    title: {
      fontSize: s(24, 20, 30),
      fontWeight: '800',
      marginBottom: s(4, 3, 6),
    },
    subtitle: {
      fontSize: s(14, 12, 16),
      lineHeight: s(20, 18, 24),
      marginBottom: s(24, 20, 30),
    },
    input: {
      backgroundColor: '#f9fafb',
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 10,
      height: 48,
      paddingHorizontal: s(14, 12, 18),
      fontSize: s(15, 13, 17),
      color: '#111827',
      marginBottom: s(10, 8, 12),
    },
    primaryBtn: {
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(6, 4, 8),
      backgroundColor: '#2563eb',
    },
    primaryBtnText: { color: '#fff', fontSize: s(15, 14, 17), fontWeight: '700' },
  });
};
