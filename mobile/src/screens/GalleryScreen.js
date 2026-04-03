import { useMemo, useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createGalleryStyles } from '../styles/galleryStyles';
import { useAppTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';

const galleryImages = [
  require('../../assets/19-r4sbjga1qmedxkxilmtadom3nmbuoeu0jj6kovw650 (1).jpg'),
  require('../../assets/WhatsApp Image 2026-02-07 at 12.38.20.jpeg'),
  require('../../assets/WhatsApp Image 2026-02-07 at 12.38.26 (1).jpeg'),
  require('../../assets/WhatsApp Image 2026-02-07 at 12.38.26 (3).jpeg'),
  require('../../assets/WhatsApp Image 2026-02-07 at 12.38.26 (4).jpeg'),
  require('../../assets/WhatsApp Image 2026-02-07 at 12.38.26.jpeg'),
  require('../../assets/WhatsApp Image 2026-02-07 at 12.38.27.jpeg'),
  require('../../assets/WhatsApp Image 2026-02-07 at 12.38.30 (1).jpeg'),
  require('../../assets/WhatsApp Image 2026-02-07 at 12.38.31 (3).jpeg'),
  require('../../assets/WhatsApp Image 2026-02-07 at 12.38.32.jpeg'),
  require('../../assets/WhatsApp Image 2026-02-07 at 12.39.28 (4).jpeg'),
];

export default function GalleryScreen({ onBack }) {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createGalleryStyles(width), [width]);
  const { t, language } = useI18n();
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const arBold = language === 'ar' ? { fontFamily: 'Cairo_700Bold' } : null;

  const [selectedImage, setSelectedImage] = useState(null);

  const txt = {
    title: t('home.galleryTitle') || 'Galerie',
    subtitle: t('home.gallerySub') || 'Nos moments importants',
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: isDark ? colors.background : '#f8fafc' }]}>
      <View style={[styles.header, isDark && { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, isDark && { backgroundColor: colors.surfaceAlt }]} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text style={[styles.title, arBold, { color: colors.textPrimary }]}>{txt.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{txt.subtitle}</Text>
        </View>

        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {galleryImages.map((img, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.imageItem, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setSelectedImage(img)}
              activeOpacity={0.85}
            >
              <Image source={img} style={styles.image} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={selectedImage} style={styles.fullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
