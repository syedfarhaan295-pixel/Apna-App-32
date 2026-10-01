import { AppPackage, DeviceType, SecureToken } from '../types';

// Images generated via generate_image tool
import heroDistributeImg from '../assets/images/hero_app_distribute_1790839277635.jpg';
import apexPreviewImg from '../assets/images/app_preview_apex_1790839292245.jpg';
import vaultPayPreviewImg from '../assets/images/app_preview_vaultpay_1790839305380.jpg';
import novaCarePreviewImg from '../assets/images/app_preview_novacare_1790839316509.jpg';
import pulseCamPreviewImg from '../assets/images/app_preview_pulse_1790839328341.jpg';

export { heroDistributeImg };

export const INITIAL_APPS: AppPackage[] = [
  {
    id: 'app-apnaapp32-core',
    name: 'ApnaApp32 Official Client',
    tagline: 'Direct mobile app installer & OTA package launcher',
    description:
      'The official ApnaApp32 mobile client built from syedfarhaan295-pixel/Apna-App-32. Provides on-device package installations, expiring token verifications, and instant wireless OTA updates directly to iOS and Android.',
    category: 'Developer & Distribution',
    iconBg: 'from-blue-600 via-sky-500 to-orange-500',
    iconSymbol: 'Smartphone',
    previewImage: '', // Uses dynamic fallback with logo emblem
    version: '1.0.0',
    buildNumber: 132,
    releaseDate: '2026-10-01',
    releaseNotes: [
      'Official production build from GitHub repository syedfarhaan295-pixel/Apna-App-32',
      'Integrated Apple itms-services OTA manifest engine',
      'Direct Android APK stream with Play Protect verification',
      'Support for secure expiring tokens and PIN-protected releases',
    ],
    platforms: ['ios', 'android'],
    iosConfig: {
      bundleId: 'com.apnaapp32.client',
      minIosVersion: '16.0',
      ipaSize: '34.6 MB',
      ipaUrl: 'https://cdn.apnaapp32.io/builds/apnaapp32-1.0.0.ipa',
      manifestPlistUrl: 'https://cdn.apnaapp32.io/manifests/apnaapp32-1.0.0.plist',
      provisioningProfileType: 'Enterprise In-House',
      signingTeam: 'ApnaApp32 Engineering Org (Enterprise)',
      teamId: '32APNA7788',
      entitlements: ['push-notifications', 'background-fetch', 'device-management'],
    },
    androidConfig: {
      packageName: 'com.apnaapp32.client',
      minAndroidVersion: 'Android 10 (API 29)',
      targetSdk: 35,
      apkSize: '28.9 MB',
      apkUrl: 'https://cdn.apnaapp32.io/builds/apnaapp32-1.0.0.apk',
      sha256Fingerprint: '32:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE',
      permissions: ['INTERNET', 'REQUEST_INSTALL_PACKAGES', 'POST_NOTIFICATIONS'],
    },
    stats: {
      totalInstalls: 6840,
      iosInstalls: 4120,
      androidInstalls: 2720,
      activeLinksCount: 12,
    },
    sha256: 'a32f7b8899cc11eedd4400225566778899aabbccddeeff001122334455667788',
    githubRepo: 'syedfarhaan295-pixel/Apna-App-32',
  },
  {
    id: 'app-apex-fleet',
    name: 'Apex Fleet Logistics',
    tagline: 'Enterprise route optimization & real-time telemetry',
    description:
      'Field-tested by 4,200+ commercial drivers across North America. Provides offline route sequencing, sub-second BLE sensor diagnostics, and instant proof-of-delivery signatures.',
    category: 'Logistics & Field Ops',
    iconBg: 'from-blue-600 to-indigo-800',
    iconSymbol: 'Truck',
    previewImage: apexPreviewImg,
    version: '3.4.2',
    buildNumber: 428,
    releaseDate: '2026-09-28',
    releaseNotes: [
      'Added zero-latency offline map tile caching for mountain passes',
      'Optimized BLE tire pressure sensor reconnect loop',
      'Enhanced electronic logbook compliance export for DOT audit',
      'Fixed background location battery drain on Android 15 & iOS 18',
    ],
    platforms: ['ios', 'android'],
    iosConfig: {
      bundleId: 'com.apexlogistics.fleetops',
      minIosVersion: '16.0',
      ipaSize: '42.8 MB',
      ipaUrl: 'https://cdn.airdeploy.io/builds/apex-fleet-3.4.2.ipa',
      manifestPlistUrl: 'https://cdn.airdeploy.io/manifests/apex-fleet-3.4.2.plist',
      provisioningProfileType: 'Enterprise In-House',
      signingTeam: 'Apex Logistics Systems Inc. (Enterprise)',
      teamId: '9K8J7H6G5F',
      entitlements: ['location.background', 'bluetooth-central', 'push-notifications'],
    },
    androidConfig: {
      packageName: 'com.apexlogistics.fleetops',
      minAndroidVersion: 'Android 10 (API 29)',
      targetSdk: 35,
      apkSize: '38.4 MB',
      apkUrl: 'https://cdn.airdeploy.io/builds/apex-fleet-3.4.2.apk',
      sha256Fingerprint: '94:D1:6A:48:82:17:F0:4B:C3:98:50:88:2E:7C:1F:B9:5D:88:22:91:0A:74:61:99:EE:12:80:FF:55:01:A2:3C',
      permissions: ['ACCESS_FINE_LOCATION', 'BLUETOOTH_SCAN', 'POST_NOTIFICATIONS', 'FOREGROUND_SERVICE_LOCATION'],
    },
    stats: {
      totalInstalls: 3842,
      iosInstalls: 2190,
      androidInstalls: 1652,
      activeLinksCount: 5,
    },
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'app-vaultpay',
    name: 'VaultPay Terminal',
    tagline: 'Biometric point-of-sale & multi-signature vault',
    description:
      'Ultra-secure mobile payment gateway engineered for private wealth advisors and mobile retail merchants. Compliant with PCI-PTS 6.0 and Apple Secure Enclave / Android StrongBox.',
    category: 'Fintech & Security',
    iconBg: 'from-emerald-600 to-teal-800',
    iconSymbol: 'ShieldCheck',
    previewImage: vaultPayPreviewImg,
    version: '2.1.0',
    buildNumber: 194,
    releaseDate: '2026-09-24',
    releaseNotes: [
      'Activated Hardware Keystore attestation on Android 14+',
      'Added tap-to-pay EMV contactless protocol v3.2',
      'Dual biometric multi-factor approval for payouts exceeding $10k',
      'Instant tamper detection with memory zeroization protection',
    ],
    platforms: ['ios', 'android'],
    iosConfig: {
      bundleId: 'finance.vaultpay.pos',
      minIosVersion: '16.4',
      ipaSize: '31.4 MB',
      ipaUrl: 'https://cdn.airdeploy.io/builds/vaultpay-2.1.0.ipa',
      manifestPlistUrl: 'https://cdn.airdeploy.io/manifests/vaultpay-2.1.0.plist',
      provisioningProfileType: 'Enterprise In-House',
      signingTeam: 'VaultPay Financial Technologies LLC',
      teamId: '4M3N2B1V0C',
      entitlements: ['keychain-access-groups', 'secure-enclave', 'nfc.reader'],
    },
    androidConfig: {
      packageName: 'finance.vaultpay.pos',
      minAndroidVersion: 'Android 11 (API 30)',
      targetSdk: 35,
      apkSize: '29.1 MB',
      apkUrl: 'https://cdn.airdeploy.io/builds/vaultpay-2.1.0.apk',
      sha256Fingerprint: 'A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90:12:34:56:78:9A:BC:DE:F0:12:34:56:78:9A:BC:DE:F0',
      permissions: ['NFC', 'USE_BIOMETRIC', 'CAMERA', 'VIBRATE'],
    },
    stats: {
      totalInstalls: 1420,
      iosInstalls: 980,
      androidInstalls: 440,
      activeLinksCount: 3,
    },
    sha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  },
  {
    id: 'app-novacare',
    name: 'NovaCare Clinical',
    tagline: 'HIPAA-compliant patient rounding & vitals stream',
    description:
      'Bedside documentation and continuous physiological telemetry app for ICU nurses and attending physicians. Directly connects to hospital HL7 FHIR nodes with zero local persistent cache.',
    category: 'Healthcare & Clinical',
    iconBg: 'from-cyan-600 to-blue-700',
    iconSymbol: 'Activity',
    previewImage: novaCarePreviewImg,
    version: '4.0.1',
    buildNumber: 512,
    releaseDate: '2026-09-30',
    releaseNotes: [
      'Direct integration with Philips IntelliVue telemetry monitors',
      'Voice-to-clinical-note dictation with medical terminology model',
      'Barcode medication scanner with five-rights clinical verification',
      'Dark mode calibrated for low-light night-shift hospital rooms',
    ],
    platforms: ['ios', 'android'],
    iosConfig: {
      bundleId: 'health.novacare.clinical',
      minIosVersion: '16.0',
      ipaSize: '58.2 MB',
      ipaUrl: 'https://cdn.airdeploy.io/builds/novacare-4.0.1.ipa',
      manifestPlistUrl: 'https://cdn.airdeploy.io/manifests/novacare-4.0.1.plist',
      provisioningProfileType: 'Enterprise In-House',
      signingTeam: 'NovaCare Health Systems Alliance',
      teamId: '7T6R5E4W3Q',
      entitlements: ['healthkit', 'critical-alerts', 'camera.scanning'],
    },
    androidConfig: {
      packageName: 'health.novacare.clinical',
      minAndroidVersion: 'Android 10 (API 29)',
      targetSdk: 35,
      apkSize: '52.7 MB',
      apkUrl: 'https://cdn.airdeploy.io/builds/novacare-4.0.1.apk',
      sha256Fingerprint: '44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33',
      permissions: ['CAMERA', 'RECORD_AUDIO', 'HIGH_SAMPLING_RATE_SENSORS', 'WAKE_LOCK'],
    },
    stats: {
      totalInstalls: 5190,
      iosInstalls: 3820,
      androidInstalls: 1370,
      activeLinksCount: 8,
    },
    sha256: 'bc94a085d5f2a240b9386c97a892b15809ef0ef82c75f1b53e83b4293f0b4d45',
  },
  {
    id: 'app-pulsecam',
    name: 'PulseCam 4K Studio',
    tagline: '10-bit ProRes & Log cinema capture suite',
    description:
      'Cinema-grade capture suite featuring anamorphic desqueeze, false color exposure zebras, waveform monitor, and uncompressed multi-channel 48kHz audio monitoring.',
    category: 'Photo & Video Production',
    iconBg: 'from-amber-600 to-orange-800',
    iconSymbol: 'Video',
    previewImage: pulseCamPreviewImg,
    version: '1.8.5',
    buildNumber: 87,
    releaseDate: '2026-09-18',
    releaseNotes: [
      'ProRes 422 HQ 60fps recording direct to external USB-C SSD',
      'Custom 3D LUT preview import via Files app',
      'Real-time focus peaking with custom highlight colors',
      'Timecode sync via Bluetooth Ambient Lockit tentacle',
    ],
    platforms: ['ios', 'android'],
    iosConfig: {
      bundleId: 'studio.pulsecam.pro',
      minIosVersion: '17.0',
      ipaSize: '84.1 MB',
      ipaUrl: 'https://cdn.airdeploy.io/builds/pulsecam-1.8.5.ipa',
      manifestPlistUrl: 'https://cdn.airdeploy.io/manifests/pulsecam-1.8.5.plist',
      provisioningProfileType: 'Enterprise In-House',
      signingTeam: 'Pulse Cinema Software Labs',
      teamId: '2X4C6V8B0N',
      entitlements: ['camera.raw', 'microphone.uncompressed', 'external-storage'],
    },
    androidConfig: {
      packageName: 'studio.pulsecam.pro',
      minAndroidVersion: 'Android 12 (API 31)',
      targetSdk: 35,
      apkSize: '76.8 MB',
      apkUrl: 'https://cdn.airdeploy.io/builds/pulsecam-1.8.5.apk',
      sha256Fingerprint: '12:34:56:78:90:AB:CD:EF:FE:DC:BA:09:87:65:43:21:12:34:56:78:90:AB:CD:EF:FE:DC:BA:09:87:65:43:21',
      permissions: ['CAMERA', 'RECORD_AUDIO', 'MANAGE_EXTERNAL_STORAGE'],
    },
    stats: {
      totalInstalls: 890,
      iosInstalls: 610,
      androidInstalls: 280,
      activeLinksCount: 2,
    },
    sha256: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
  },
];

export const INITIAL_TOKENS: SecureToken[] = [
  {
    id: 'tok-apnaapp32-main',
    token: 'sec_apna32_prod',
    appId: 'app-apnaapp32-core',
    label: 'Main Production Release (GitHub syedfarhaan295-pixel)',
    createdAt: Date.now() - 3600 * 1000 * 6,
    expiresAt: Date.now() + 3600 * 1000 * 24 * 30, // 30 days
    maxDownloads: 500,
    downloadCount: 142,
    passcodeProtected: false,
    allowedPlatform: 'all',
    status: 'active',
  },
  {
    id: 'tok-apex-beta',
    token: 'sec_af7b89e2',
    appId: 'app-apex-fleet',
    label: 'Q4 Driver Pilot Cohort',
    createdAt: Date.now() - 3600 * 1000 * 24 * 2,
    expiresAt: Date.now() + 3600 * 1000 * 24 * 5,
    maxDownloads: 50,
    downloadCount: 31,
    passcodeProtected: false,
    allowedPlatform: 'all',
    status: 'active',
  },
  {
    id: 'tok-apex-lock',
    token: 'sec_99d12f4c',
    appId: 'app-apex-fleet',
    label: 'Executive Team Review (Passcode: 7788)',
    createdAt: Date.now() - 3600 * 1000 * 5,
    expiresAt: Date.now() + 3600 * 1000 * 48,
    maxDownloads: 10,
    downloadCount: 4,
    passcodeProtected: true,
    passcode: '7788',
    allowedPlatform: 'all',
    status: 'active',
  },
  {
    id: 'tok-vaultpay-audit',
    token: 'sec_c44b9101',
    appId: 'app-vaultpay',
    label: 'KPMG Security Pentest Token',
    createdAt: Date.now() - 3600 * 1000 * 12,
    expiresAt: Date.now() + 3600 * 1000 * 36,
    maxDownloads: 5,
    downloadCount: 2,
    passcodeProtected: true,
    passcode: '9021',
    allowedPlatform: 'all',
    status: 'active',
  },
  {
    id: 'tok-novacare-stmary',
    token: 'sec_e88a0023',
    appId: 'app-novacare',
    label: 'St. Mary Hospital ICU Station',
    createdAt: Date.now() - 3600 * 1000 * 48,
    expiresAt: Date.now() + 3600 * 1000 * 24 * 12,
    maxDownloads: 100,
    downloadCount: 68,
    passcodeProtected: false,
    allowedPlatform: 'ios',
    status: 'active',
  },
];

const STORAGE_KEY_APPS = 'airdeploy_apps_v1';
const STORAGE_KEY_TOKENS = 'airdeploy_tokens_v1';

export function getStoredApps(): AppPackage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPS);
    if (!raw) return INITIAL_APPS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_APPS;
  } catch {
    return INITIAL_APPS;
  }
}

export function saveStoredApps(apps: AppPackage[]) {
  try {
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
  } catch (err) {
    console.error('Failed to save apps to storage', err);
  }
}

export function getStoredTokens(): SecureToken[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TOKENS);
    if (!raw) return INITIAL_TOKENS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TOKENS;
  } catch {
    return INITIAL_TOKENS;
  }
}

export function saveStoredTokens(tokens: SecureToken[]) {
  try {
    localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(tokens));
  } catch (err) {
    console.error('Failed to save tokens to storage', err);
  }
}

// Generate the official Apple Enterprise Wireless Manifest (.plist XML)
export function generateApplePlistXml(app: AppPackage): string {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://apnaapp32.io';
  const ipaDownloadUrl = `${currentOrigin}/download/${app.id}.ipa`;
  const icon57Url = `${currentOrigin}/icon.svg`;
  const icon512Url = `${currentOrigin}/icon.svg`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>items</key>
  <array>
    <dict>
      <key>assets</key>
      <array>
        <dict>
          <key>kind</key>
          <string>software-package</string>
          <key>url</key>
          <string>${ipaDownloadUrl}</string>
        </dict>
        <dict>
          <key>kind</key>
          <string>display-image</string>
          <key>need-shine</key>
          <false/>
          <key>url</key>
          <string>${icon57Url}</string>
        </dict>
        <dict>
          <key>kind</key>
          <string>full-size-image</string>
          <key>need-shine</key>
          <false/>
          <key>url</key>
          <string>${icon512Url}</string>
        </dict>
      </array>
      <key>metadata</key>
      <dict>
        <key>bundle-identifier</key>
        <string>${app.iosConfig.bundleId}</string>
        <key>bundle-version</key>
        <string>${app.version}</string>
        <key>kind</key>
        <string>software</string>
        <key>title</key>
        <string>${app.name}</string>
        <key>subtitle</key>
        <string>${app.tagline}</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>`;
}

// Generate the itms-services link string
export function generateItmsInstallLink(app: AppPackage, token?: SecureToken): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://apnaapp32.io';
  const manifestUrl = encodeURIComponent(`${origin}/api/manifest?appId=${app.id}${token ? `&token=${token.token}` : ''}`);
  return `itms-services://?action=download-manifest&url=${manifestUrl}`;
}

// Device detection helper
export function detectUserDevice(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  const ua = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

// Create a cryptographically secure random token string
export function generateSecureTokenString(): string {
  const chars = 'abcdef0123456789';
  let str = 'sec_';
  for (let i = 0; i < 10; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}
