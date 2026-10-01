export type PlatformType = 'ios' | 'android';

export interface IosConfig {
  bundleId: string;
  minIosVersion: string;
  ipaSize: string;
  ipaUrl: string;
  manifestPlistUrl: string;
  provisioningProfileType: 'Enterprise In-House' | 'Ad-Hoc' | 'Developer';
  signingTeam: string;
  teamId: string;
  entitlements: string[];
}

export interface AndroidConfig {
  packageName: string;
  minAndroidVersion: string;
  targetSdk: number;
  apkSize: string;
  apkUrl: string;
  sha256Fingerprint: string;
  permissions: string[];
}

export interface SecureToken {
  id: string;
  token: string;
  appId: string;
  label: string;
  createdAt: number;
  expiresAt: number | null; // null means never
  maxDownloads: number | null; // null means unlimited
  downloadCount: number;
  passcodeProtected: boolean;
  passcode?: string;
  allowedPlatform: 'all' | 'ios' | 'android';
  status: 'active' | 'revoked' | 'expired';
}

export interface AppPackage {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  iconBg: string;
  iconSymbol: string;
  previewImage: string;
  version: string;
  buildNumber: number;
  releaseDate: string;
  releaseNotes: string[];
  platforms: PlatformType[];
  iosConfig: IosConfig;
  androidConfig: AndroidConfig;
  stats: {
    totalInstalls: number;
    iosInstalls: number;
    androidInstalls: number;
    activeLinksCount: number;
  };
  sha256: string;
  githubRepo?: string;
}

export type DeviceType = 'ios' | 'android' | 'desktop';
