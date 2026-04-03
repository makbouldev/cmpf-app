const { withAndroidManifest, withMainApplication, withAppBuildGradle } = require('@expo/config-plugins');

const withAlarmManifest = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application[0];

    // Add Receiver
    if (!mainApplication.receiver) mainApplication.receiver = [];
    mainApplication.receiver.push({
      '$': {
        'android:name': '.AlarmReceiver',
        'android:enabled': 'true',
        'android:exported': 'true',
      },
    });

    // Add Service
    if (!mainApplication.service) mainApplication.service = [];
    mainApplication.service.push({
      '$': {
        'android:name': '.AlarmService',
        'android:enabled': 'true',
        'android:exported': 'false',
        'android:foregroundServiceType': 'mediaPlayback',
      },
    });

    // Add Permissions
    if (!config.modResults.manifest['uses-permission']) config.modResults.manifest['uses-permission'] = [];
    
    const permissions = [
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.USE_EXACT_ALARM',
      'android.permission.WAKE_LOCK',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
      'android.permission.VIBRATE',
      'android.permission.USE_FULL_SCREEN_INTENT',
      'android.permission.RECEIVE_BOOT_COMPLETED'
    ];

    permissions.forEach(perm => {
      if (!config.modResults.manifest['uses-permission'].find(p => p.$['android:name'] === perm)) {
        config.modResults.manifest['uses-permission'].push({ $: { 'android:name': perm } });
      }
    });

    return config;
  });
};

const withAlarmMainApplication = (config) => {
  return withMainApplication(config, (config) => {
    let content = config.modResults.contents;

    // Add Import
    if (!content.includes('import com.cmpf.ambulance.AlarmPackage;')) {
      content = content.replace(
        'import com.cmpf.ambulance.PackageList;',
        'import com.cmpf.ambulance.PackageList;\nimport com.cmpf.ambulance.AlarmPackage;'
      );
    }

    // Add Package to List
    if (!content.includes('packages.add(new AlarmPackage());')) {
      content = content.replace(
        'List<ReactPackage> packages = new PackageList(this).getPackages();',
        'List<ReactPackage> packages = new PackageList(this).getPackages();\n      packages.add(new AlarmPackage());'
      );
    }

    config.modResults.contents = content;
    return config;
  });
};

module.exports = (config) => {
  config = withAlarmManifest(config);
  config = withAlarmMainApplication(config);
  return config;
};
