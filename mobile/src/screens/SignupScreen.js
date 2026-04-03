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
      
      onBack(); // Go back to where they came from
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || t('onboarding.signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.headerCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={[styles.backBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} 
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Ionicons name={isArabic ? 'arrow-forward' : 'chevron-back'} size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.topTitleWrap}>
            <Text style={[styles.topTitle, arBold, { color: colors.textPrimary }]}>{t('onboarding.signUp')}</Text>
          </View>
          <View style={styles.placeholderBtn} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerWrap}>
          <Text style={[styles.title, arBold, { color: colors.textPrimary }]}>{t('onboarding.signUp')}</Text>
          <Text style={[styles.subtitle, arRegular, { color: colors.textSecondary }]}>{t('onboarding.accountSub')}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={[styles.errorText, arRegular]}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Name */}
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, arRegular, { color: colors.textPrimary }]}
              placeholder={t('onboarding.name')}
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              textAlign={isArabic ? 'right' : 'left'}
            />
          </View>

          {/* Age & Gender Row */}
          <View style={styles.rowWrap}>
            <View style={[styles.inputWrap, styles.flexHalf]}>
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, arRegular, { color: colors.textPrimary }]}
                placeholder={t('onboarding.age')}
                placeholderTextColor={colors.textSecondary}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                textAlign={isArabic ? 'right' : 'left'}
              />
            </View>
            <View style={[styles.genderWrap, styles.flexHalf]}>
               <TouchableOpacity 
                  style={[styles.genderBtn, gender === 'male' && { backgroundColor: 'rgba(59,130,246,0.1)', borderColor: '#3b82f6' }]} 
                  onPress={() => setGender('male')}
                >
                 <Text style={[styles.genderText, arRegular, gender === 'male' && { color: '#3b82f6', fontWeight: '800' }, !isArabic && { fontSize: 13 }]}>{t('onboarding.male')}</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                  style={[styles.genderBtn, gender === 'female' && { backgroundColor: 'rgba(236,72,153,0.1)', borderColor: '#ec4899' }]} 
                  onPress={() => setGender('female')}
                >
                 <Text style={[styles.genderText, arRegular, gender === 'female' && { color: '#ec4899', fontWeight: '800' }, !isArabic && { fontSize: 13 }]}>{t('onboarding.female')}</Text>
               </TouchableOpacity>
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputWrap}>
            <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, arRegular, { color: colors.textPrimary }]}
              placeholder={t('onboarding.phone')}
              placeholderTextColor={colors.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              textAlign={isArabic ? 'right' : 'left'}
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, arRegular, { color: colors.textPrimary }]}
              placeholder={t('onboarding.password')}
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textAlign={isArabic ? 'right' : 'left'}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.inputEye}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: colors.primary }, loading && styles.disabledBtn]} 
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
            <Text style={[styles.switchBtnText, arRegular, { color: colors.primary }]}>{t('onboarding.switchToSignIn')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (width) => {
  const s = createScaler(width);
  return StyleSheet.create({
    screen: { flex: 1 },
    headerCard: {
      backgroundColor: '#ffffff',
      borderRadius: s(24, 20, 28),
      borderWidth: 1,
      borderColor: '#e2e8f0',
      paddingHorizontal: s(16, 14, 20),
      paddingVertical: s(14, 12, 18),
      marginHorizontal: s(16, 14, 20),
      marginTop: s(12, 10, 16),
      marginBottom: s(6, 4, 8),
      shadowColor: '#0f172a',
      shadowOpacity: 0.06,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(12, 10, 16),
    },
    backBtn: {
      width: s(44, 38, 48),
      height: s(44, 38, 48),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f1f5f9',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      shadowColor: '#0f172a',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    topTitleWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(8, 6, 12),
    },
    topTitle: {
      color: '#0a2540',
      fontSize: s(17, 15, 20),
      fontWeight: '900',
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    placeholderBtn: {
      width: s(44, 38, 48),
      height: s(44, 38, 48),
    },
    content: {
      paddingHorizontal: s(18, 14, 26),
      paddingBottom: s(30, 24, 40),
    },
    headerWrap: { marginBottom: s(24, 20, 30) },
    title: { fontSize: s(34, 28, 42), fontWeight: '900' },
    subtitle: { marginTop: s(8, 6, 10), fontSize: s(15, 13, 18), lineHeight: s(22, 19, 26) },
    card: {
      borderRadius: s(22, 18, 28),
      borderWidth: 1,
      padding: s(20, 16, 26),
    },
    rowWrap: {
      flexDirection: 'row',
      gap: s(10, 8, 14),
      marginBottom: s(16, 14, 20),
    },
    flexHalf: { flex: 1, marginBottom: 0 },
    genderWrap: {
      flexDirection: 'row',
      gap: s(6, 4, 8),
    },
    genderBtn: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.03)',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.06)',
      borderRadius: s(12, 10, 16),
      alignItems: 'center',
      justifyContent: 'center',
      height: s(54, 48, 62),
    },
    genderText: {
      fontSize: s(14, 12, 16),
      color: '#64748b'
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.03)',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.06)',
      borderRadius: s(12, 10, 16),
      marginBottom: s(16, 14, 20),
      paddingHorizontal: s(14, 12, 18),
      height: s(54, 48, 62),
    },
    inputIcon: { marginRight: s(10, 8, 12) },
    input: { flex: 1, fontSize: s(16, 14, 18) },
    inputEye: { padding: s(8, 6, 10) },
    errorBox: {
      backgroundColor: '#fee2e2',
      padding: s(12, 10, 16),
      borderRadius: s(8, 6, 10),
      marginBottom: s(16, 14, 20),
    },
    errorText: { color: '#ef4444', fontSize: s(14, 12, 16), textAlign: 'center' },
    primaryBtn: {
      height: s(54, 48, 62),
      borderRadius: s(14, 12, 18),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(10, 8, 14),
    },
    primaryBtnText: { color: '#fff', fontSize: s(16, 14, 18), fontWeight: '800' },
    disabledBtn: { opacity: 0.7 },
    switchBtn: {
      marginTop: s(16, 14, 20),
      alignItems: 'center',
      padding: s(8, 6, 10),
    },
    switchBtnText: { fontSize: s(15, 13, 17), fontWeight: '700' },
  });
};
