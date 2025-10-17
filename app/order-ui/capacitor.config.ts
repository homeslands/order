import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.trendcoffee.order',
  appName: 'TREND Coffee',
  webDir: 'dist',

  server: {
    /**
     * 🌐 Production – app load từ dist (offline)
     * ⚠️ Backend cần cho phép origin: https://localhost
     */
    androidScheme: 'https',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a1a',
      showSpinner: true,
      spinnerColor: '#ffffff',
      androidSpinnerStyle: 'small',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
      style: 'dark',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a1a',
    },
  },
}

export default config
