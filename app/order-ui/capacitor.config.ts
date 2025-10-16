import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.trendcoffee.order',
  appName: 'TREND Coffee',
  webDir: 'dist',

  server: {
    /**
     * 👇 DEV MODE – khi chạy app thật (USB hoặc Wi-Fi)
     * Dùng IP LAN của máy dev để app mobile tải web từ máy bạn
     */
    // url: 'http://192.168.1.34:5173', // ⚠️ Thay đúng IP LAN của máy bạn
    // cleartext: true, // cho phép http (vì localhost không có SSL)
    /**
     * 🌐 Android Scheme Configuration
     * - 'capacitor': dùng capacitor://localhost (có vấn đề CORS với Capacitor 7)
     * - 'https': dùng https://localhost (mặc định Capacitor 6+, bảo mật hơn, RECOMMENDED)
     */
    androidScheme: 'https', // ✅ Dùng https://localhost (tránh CORS issue)
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a1a',
      showSpinner: true,
      androidSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a1a',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
      androidPresentationOptions: {
        vibrate: true,
        sound: true,
        lights: true,
      },
    },
  },
}

export default config
