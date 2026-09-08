import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.associacao.cobradormobile',
  appName: 'Cobrador Mobile',
  webDir: 'dist',
  plugins: {
    SystemBars: {
      insetsHandling: 'css',
      style: 'DARK',
      hidden: false
    }
  }
};

export default config;
