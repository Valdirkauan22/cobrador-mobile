import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { BiometricAuth, AndroidBiometryStrength } from '@aparajita/capacitor-biometric-auth';

export const isNativeApp = () => Capacitor.isNativePlatform();

export async function hashPin(pin: string): Promise<string> {
  const bytes = new TextEncoder().encode(`cobrador-mobile:${pin}`);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function authenticateDevice(): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    const info = await BiometricAuth.checkBiometry();
    if (!info.isAvailable && !info.deviceIsSecure) return false;
    await BiometricAuth.authenticate({
      reason: 'Acessar dados de cobranças e pagamentos',
      cancelTitle: 'Cancelar',
      allowDeviceCredential: true,
      androidTitle: 'Desbloquear Cobrador Mobile',
      androidSubtitle: 'Use sua biometria, PIN, padrão ou senha do aparelho',
      androidConfirmationRequired: false,
      androidBiometryStrength: AndroidBiometryStrength.weak
    });
    return true;
  } catch {
    return false;
  }
}

export async function deviceAuthAvailable(): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    const info = await BiometricAuth.checkBiometry();
    return info.isAvailable || info.deviceIsSecure;
  } catch {
    return false;
  }
}

export async function configureBillingNotifications(enabled: boolean): Promise<boolean> {
  if (!isNativeApp()) return false;
  if (!enabled) {
    await LocalNotifications.cancel({ notifications: [1508, 1808, 2508].map((id) => ({ id })) });
    return false;
  }
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== 'granted') return false;
  await LocalNotifications.cancel({ notifications: [1508, 1808, 2508].map((id) => ({ id })) });
  await LocalNotifications.schedule({
    notifications: [
      { id: 2508, title: 'Lembretes de mensalidade', body: 'Confira e envie os lembretes deste mês.', schedule: { on: { day: 25, hour: 8, minute: 0 }, repeats: true }, smallIcon: 'ic_stat_name' },
      { id: 1508, title: 'Mensalidades vencem hoje', body: 'Confira os pagamentos e as cobranças com vencimento hoje.', schedule: { on: { day: 15, hour: 8, minute: 0 }, repeats: true }, smallIcon: 'ic_stat_name' },
      { id: 1808, title: 'Primeiro ciclo de cobrança', body: 'Existem mensalidades que podem estar pendentes. Abra o Cobrador Mobile.', schedule: { on: { day: 18, hour: 8, minute: 0 }, repeats: true }, smallIcon: 'ic_stat_name' }
    ]
  });
  return true;
}

export async function checkLatestRelease(currentVersion: string): Promise<{ available: boolean; version?: string; url?: string }> {
  const response = await fetch('https://api.github.com/repos/Valdirkauan22/cobrador-mobile/releases/latest', { cache: 'no-store' });
  if (response.status === 404) return { available: false };
  if (!response.ok) throw new Error('Não foi possível consultar atualizações.');
  const release = await response.json();
  const latest = String(release.tag_name || '').replace(/^v/i, '');
  const clean = (v: string) => v.split('.').map((n) => Number(n) || 0);
  const a = clean(latest), b = clean(currentVersion);
  const available = [0, 1, 2].some((i) => (a[i] || 0) !== (b[i] || 0)) &&
    ((a[0] || 0) > (b[0] || 0) || ((a[0] || 0) === (b[0] || 0) && ((a[1] || 0) > (b[1] || 0) || ((a[1] || 0) === (b[1] || 0) && (a[2] || 0) > (b[2] || 0)))));
  return { available, version: latest, url: release.html_url };
}
