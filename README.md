# CMPF Ambulance Mobile + API

## الخدمات الرئيسية
- طلب سيارة إسعاف
- طلب طبيب منزلي
- مواقع الصيدليات القريبة حسب موقعك

## هيكلة المشروع
- `api/` : Node.js + Express API
- `mobile/` : تطبيق React Native (Expo)

داخل `mobile/src/`:
- `navigation/` : التنقل بين الصفحات مع animation
- `screens/` : كل صفحة في ملف مستقل
- `styles/` : StyleSheet منفصل لكل صفحة
- `components/` : مكونات قابلة لإعادة الاستخدام
- `services/` : API calls

## التشغيل
### 1) شغل الـ API
```bash
cd api
npm install
npm run dev
```

### 2) شغل تطبيق الموبايل
```bash
cd mobile
npm install
npm start
```

## مهم: API Base URL
في الملف `mobile/src/services/api.js`:
- Android Emulator: `http://10.0.2.2:4000`
- الهاتف الحقيقي على نفس Wi-Fi: `http://YOUR_PC_IP:4000`

## نسخة Web (للتجربة السريعة)
```bash
cd mobile
npm run web
```

## Build APK
```bash
npm install -g eas-cli
cd mobile
eas login
eas build:configure
eas build -p android --profile preview
```
