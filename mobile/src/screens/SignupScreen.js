import { useState, useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../i18n/I18nContext';
import { useAppTheme } from '../theme/ThemeContext';
import { createScaler } from '../utils/responsive';
import { signUp } from '../services/api';

export default function SignupScreen({ onNavigate, onBack, preferences, onUpdatePreferences }) {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width), [width]);
  const { t, language } = useI18n();
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';

  const isArabic = language === 'ar';
  const arRegular = isArabic ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = isArabic ? { fontFamily: 'Cairo_700Bold' } : null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async () => {
    if (!name || !phone || !age || !gender || !password) {
      setErrorMsg(t('onboarding.signupRequired'));
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await signUp({
        name,
        phone,
        age: parseInt(age, 10),
        gender,
        password
      });
      const { token, user } = response.data;

      await onUpdatePreferences({
        account: {
          ...preferences?.account,
          mode: 'account',
          token,
          user,
          phone: user?.phone || phone,
        }
      });

      onBack();
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || t('onboarding.signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, isDark && { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, isDark && { backgroundColor: colors.surfaceAlt }]} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name={isArabic ? 'arrow-forward' : 'chevron-back'} size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, arBold, { color: colors.textPrimary }]}>{t('onboarding.signUp')}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, arBold, { color: colors.textPrimary }]}>{t('onboarding.signUp')}</Text>
        <Text style={[styles.subtitle, arRegular, { color: colors.textSecondary }]}>{t('onboarding.accountSub')}</Text>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={[styles.errorText, arRegular]}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={[styles.inputWrap, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Ionicons name="person-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, arRegular, { color: colors.textPrimary }]}
            placeholder={t('onboarding.name')}
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
            textAlign={isArabic ? 'right' : 'left'}
          />
        </View>

        <View style={styles.rowWrap}>
          <View style={[styles.inputWrap, styles.flexHalf, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, arRegular, { color: colors.textPrimary }]}
              placeholder={t('onboarding.age')}
              placeholderTextColor="#9ca3af"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              textAlign={isArabic ? 'right' : 'left'}
            />
          </View>
          <View style={[styles.genderWrap, styles.flexHalf]}>
            <TouchableOpacity
              style={[styles.genderBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }, gender === 'male' && styles.genderBtnActive]}
              onPress={() => setGender('male')}
            >
              <Text style={[styles.genderText, arRegular, gender === 'male' && styles.genderTextActive]}>{t('onboarding.male')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }, gender === 'female' && styles.genderBtnFemale]}
              onPress={() => setGender('female')}
            >
              <Text style={[styles.genderText, arRegular, gender === 'female' && styles.genderTextFemale]}>{t('onboarding.female')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.inputWrap, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Ionicons name="call-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, arRegular, { color: colors.textPrimary }]}
            placeholder={t('onboarding.phone')}
            placeholderTextColor="#9ca3af"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
            textAlign={isArabic ? 'right' : 'left'}
          />
        </View>

        <View style={[styles.inputWrap, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, arRegular, { color: colors.textPrimary }]}
            placeholder={t('onboarding.password')}
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            textAlign={isArabic ? 'right' : 'left'}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.inputEye}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.disabledBtn]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.primaryBtnText, arBold]}>{t('onboarding.signUp')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchBtn} onPress={() => onNavigate('login')}>
          <Text style={[styles.switchBtnText, arRegular, { color: '#2563eb' }]}>{t('onboarding.switchToSignIn')}</Text>
        </TouchableOpacity>
      </ScrollView>
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
    content: {
      paddingHorizontal: s(20, 16, 26),
      paddingTop: s(28, 22, 34),
      paddingBottom: s(30, 24, 40),
    },
    title: {
      fontSize: s(28, 24, 34),
      fontWeight: '800',
      marginBottom: s(6, 4, 8),
    },
    subtitle: {
      fontSize: s(15, 13, 17),
      lineHeight: s(22, 19, 26),
      marginBottom: s(24, 20, 30),
    },
    errorBox: {
      backgroundColor: '#fef2f2',
      borderWidth: 1,
      borderColor: '#fecaca',
      padding: s(12, 10, 14),
      borderRadius: 10,
      marginBottom: s(16, 14, 20),
    },
    errorText: { color: '#dc2626', fontSize: s(13, 12, 15), textAlign: 'center' },
    rowWrap: {
      flexDirection: 'row',
      gap: s(10, 8, 12),
      marginBottom: s(12, 10, 14),
    },
    flexHalf: { flex: 1, marginBottom: 0 },
    genderWrap: {
      flexDirection: 'row',
      gap: s(6, 4, 8),
    },
    genderBtn: {
      flex: 1,
      backgroundColor: '#f9fafb',
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      height: 48,
    },
    genderBtnActive: {
      backgroundColor: '#eff6ff',
      borderColor: '#2563eb',
    },
    genderBtnFemale: {
      backgroundColor: '#fdf2f8',
      borderColor: '#ec4899',
    },
    genderText: {
      fontSize: s(13, 12, 15),
      color: '#6b7280',
      fontWeight: '600',
    },
    genderTextActive: {
      color: '#2563eb',
      fontWeight: '700',
    },
    genderTextFemale: {
      color: '#ec4899',
      fontWeight: '700',
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f9fafb',
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 10,
      marginBottom: s(12, 10, 14),
      paddingHorizontal: s(14, 12, 16),
      height: 48,
    },
    inputIcon: { marginRight: s(10, 8, 12) },
    input: { flex: 1, fontSize: s(15, 14, 17) },
    inputEye: { padding: s(8, 6, 10) },
    primaryBtn: {
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(8, 6, 10),
      backgroundColor: '#2563eb',
    },
    primaryBtnText: { color: '#fff', fontSize: s(15, 14, 17), fontWeight: '700' },
    disabledBtn: { opacity: 0.6 },
    switchBtn: {
      marginTop: s(20, 16, 24),
      alignItems: 'center',
      padding: s(8, 6, 10),
    },
    switchBtnText: { fontSize: s(14, 13, 16), fontWeight: '600' },
  });
};
