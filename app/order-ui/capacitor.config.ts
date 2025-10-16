import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.trendcoffee.order',
  appName: 'TREND Coffee',
  webDir: 'dist',

  server: {
    /**
     * 🧑‍💻 DEV MODE (trong lúc phát triển)
     * Nếu đang dev app mobile và muốn reload trực tiếp code từ máy tính:
     * Bỏ comment dòng dưới, thay YOUR_LOCAL_IP bằng IP thật (vd: 192.168.1.34)
     * Khi đó, app sẽ load web từ local, gọi BE theo .env.sandbox
     */
    url: 'http://192.168.1.34:5173',
    cleartext: true,

    /**
     * 🌐 SANDBOX/STAGING/PRODUCTION
     * Khi build app chính thức (không live reload), Capacitor sẽ load file từ thư mục dist.
     * Lúc này các endpoint API đã được inject từ .env.* lúc build web.
     */
    androidScheme: 'https',
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
      // Android: Hiển thị popup khi app đang mở
      androidPresentationOptions: {
        vibrate: true,
        sound: true,
        lights: true,
      },
    },
  },
}

export default config
