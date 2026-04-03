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
  const { colors } = useAppTheme();
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
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, arBold, { color: colors.textPrimary }]}>{t('admin.title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, arBold, { color: colors.textPrimary }]}>{t('admin.loginTitle')}</Text>
        <Text style={[styles.cardSub, arRegular, { color: colors.textSecondary }]}>{t('admin.loginSub')}</Text>

        <TextInput
          style={[styles.input, arRegular, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder={t('admin.identifier')}
          placeholderTextColor="#829ab1"
          value={identifier}
          onChangeText={setIdentifier}
        />
        <TextInput
          style={[styles.input, arRegular, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder={t('admin.password')}
          placeholderTextColor="#829ab1"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={submit} disabled={loading}>
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
    topBar: {
      minHeight: s(72, 62, 86),
      borderBottomWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: s(16, 12, 22),
    },
    backBtn: {
      width: s(42, 36, 50),
      height: s(42, 36, 50),
      borderRadius: s(12, 10, 16),
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: { fontSize: s(22, 18, 28), fontWeight: '900' },
    card: {
      margin: s(16, 12, 22),
      borderWidth: 1,
      borderRadius: s(20, 16, 24),
      padding: s(16, 12, 20),
    },
    cardTitle: { fontSize: s(22, 18, 28), fontWeight: '900' },
    cardSub: { marginTop: s(6, 5, 8), marginBottom: s(14, 10, 16), fontSize: s(13, 11, 16), lineHeight: s(20, 17, 24) },
    input: {
      borderWidth: 1,
      borderRadius: s(14, 12, 18),
      minHeight: s(50, 44, 58),
      paddingHorizontal: s(14, 12, 18),
      fontSize: s(15, 13, 18),
      marginBottom: s(10, 8, 12),
    },
    primaryBtn: {
      minHeight: s(50, 44, 58),
      borderRadius: s(14, 12, 18),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    primaryBtnText: { color: '#fff', fontSize: s(15, 13, 18), fontWeight: '800' },
  });
};
