import React, { useState, useEffect } from 'react';
import { AppPackage, DeviceType, SecureToken } from '../types';
import { QRCodeSvg } from './QRCodeSvg';
import { ApnaAppLogo } from './ApnaAppLogo';
import {
  generateItmsInstallLink,
  detectUserDevice,
} from '../services/appData';
import {
  ShieldCheck,
  Smartphone,
  Download,
  KeyRound,
  Check,
  Copy,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Play,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCode,
} from 'lucide-react';

interface DirectInstallPageProps {
  app: AppPackage;
  token?: SecureToken;
  onBack: () => void;
  onOpenSimulator: () => void;
  onOpenPlist: () => void;
  onRecordInstall: (appId: string, platform: 'ios' | 'android') => void;
}

export const DirectInstallPage: React.FC<DirectInstallPageProps> = ({
  app,
  token,
  onBack,
  onOpenSimulator,
  onOpenPlist,
  onRecordInstall,
}) => {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android'>('ios');
  const [passcodeEntered, setPasscodeEntered] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(!token?.passcodeProtected);
  const [passcodeError, setPasscodeError] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [installedNotice, setInstalledNotice] = useState<string | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  useEffect(() => {
    const detected = detectUserDevice();
    setDevice(detected);
    if (detected === 'android') {
      setSelectedPlatform('android');
    } else {
      setSelectedPlatform('ios');
    }
  }, []);

  const isExpired = token?.expiresAt ? Date.now() > token.expiresAt : false;
  const isLimitReached =
    token?.maxDownloads !== null &&
    token?.maxDownloads !== undefined &&
    token.downloadCount >= token.maxDownloads;

  const handleUnlockPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (token?.passcode && passcodeEntered.trim() === token.passcode) {
      setIsUnlocked(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleIosInstallClick = () => {
    onRecordInstall(app.id, 'ios');
    const link = generateItmsInstallLink(app, token);
    setInstalledNotice('Triggering Apple itms-services OTA manifest. Tap "Install" on the iOS system prompt.');
    setShowIosGuide(true);
    // In real iOS Safari, navigating to itms-services triggers native installation dialog
    window.location.href = link;
  };

  const handleAndroidInstallClick = () => {
    onRecordInstall(app.id, 'android');
    setInstalledNotice(`Downloading ${app.name} APK (${app.androidConfig.apkSize}). Check your notification drawer to complete installation.`);
    setShowAndroidGuide(true);

    // Trigger synthetic APK file download
    const blob = new Blob([`ApnaApp32 Android APK Payload for ${app.name} v${app.version}`], {
      type: 'application/vnd.android.package-archive',
    });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${app.androidConfig.packageName}-v${app.version}.apk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  const copyChecksum = () => {
    navigator.clipboard.writeText(app.sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const copyPageLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App Directory</span>
        </button>

        <div className="flex items-center gap-2.5">
          <ApnaAppLogo size={26} showText={false} />
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ApnaApp32 Verification Gateway</span>
          </div>
        </div>

        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-semibold text-cyan-300 transition-colors cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Test in Simulator</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Passcode Lock Screen */}
        {!isUnlocked && (
          <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">Passcode Protected Distribution</h2>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Enter the 4-digit security PIN provided by your administrator to unlock the download.
            </p>

            <form onSubmit={handleUnlockPasscode} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  value={passcodeEntered}
                  onChange={(e) => setPasscodeEntered(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-40 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-center text-base font-mono font-bold tracking-widest text-cyan-400 focus:outline-none focus:border-cyan-500/50"
                  autoFocus
                />
                {passcodeError && (
                  <p className="text-[11px] text-red-400 mt-1.5 font-medium">
                    Incorrect passcode. Please verify with the app administrator.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Verify & Unlock Installation
              </button>
            </form>
          </div>
        )}

        {/* Unlocked Installation Screen */}
        {isUnlocked && (
          <div className="space-y-6">
            {/* Status Notices */}
            {isExpired && (
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-300 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>This distribution link has expired. Please contact the administrator for a fresh token.</span>
              </div>
            )}

            {isLimitReached && (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-300 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>This token has reached its maximum download limit ({token?.maxDownloads} installs).</span>
              </div>
            )}

            {installedNotice && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in duration-200">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{installedNotice}</span>
              </div>
            )}

            {/* App Hero Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  {/* App Icon */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${app.iconBg} flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-cyan-950/30 shrink-0 ring-1 ring-white/10`}>
                    {app.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{app.name}</h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">{app.tagline}</p>

                    {/* Metadata line without pills */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 font-mono flex-wrap">
                      <span>v{app.version}</span>
                      <span aria-hidden="true">·</span>
                      <span>Build {app.buildNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span>{app.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>Released {app.releaseDate}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop QR Scan badge */}
                <div className="flex flex-col items-center sm:items-end shrink-0">
                  <div className="bg-white p-2 rounded-xl shadow-lg">
                    <QRCodeSvg value={currentUrl} size={110} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono text-center sm:text-right">
                    Scan with Phone Camera
                  </span>
                </div>
              </div>

              {/* Platform Toggle Tabs */}
              <div className="mt-8 pt-6 border-t border-slate-800/80">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                    <button
                      onClick={() => setSelectedPlatform('ios')}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                        selectedPlatform === 'ios'
                          ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Apple iOS (iPhone / iPad)</span>
                    </button>
                    <button
                      onClick={() => setSelectedPlatform('android')}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                        selectedPlatform === 'android'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Android (APK Package)</span>
                    </button>
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    Detected Device: <strong className="text-white uppercase">{device}</strong>
                  </div>
                </div>

                {/* Primary Action Button based on platform */}
                {selectedPlatform === 'ios' ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={handleIosInstallClick}
                        disabled={isExpired || isLimitReached}
                        className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Direct Install on iOS Device</span>
                      </button>
                      <button
                        onClick={onOpenPlist}
                        className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title="View Apple XML Manifest (.plist)"
                      >
                        <FileCode className="w-4 h-4 text-cyan-400" />
                        <span>Inspect Manifest</span>
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">iOS Installation Requirements:</span>
                        <button
                          onClick={() => setShowIosGuide(!showIosGuide)}
                          className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 cursor-pointer font-mono"
                        >
                          <span>{showIosGuide ? 'Hide Instructions' : 'View Enterprise Trust Instructions'}</span>
                          {showIosGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {showIosGuide && (
                        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-400 leading-relaxed">
                          <p>
                            1. Tap <strong className="text-white">“Direct Install on iOS Device”</strong> in Safari. Tap <strong className="text-white">“Install”</strong> when prompted.
                          </p>
                          <p>
                            2. Once the app icon finishes downloading on your Home Screen, open <strong className="text-white">Settings</strong> → <strong className="text-white">General</strong> → <strong className="text-white">VPN &amp; Device Management</strong>.
                          </p>
                          <p>
                            3. Under Enterprise App, select <strong className="text-cyan-400 font-mono">{app.iosConfig.signingTeam}</strong> and tap <strong className="text-white">“Trust”</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={handleAndroidInstallClick}
                        disabled={isExpired || isLimitReached}
                        className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download &amp; Install Android APK ({app.androidConfig.apkSize})</span>
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">Android Installation Guidance:</span>
                        <button
                          onClick={() => setShowAndroidGuide(!showAndroidGuide)}
                          className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1 cursor-pointer font-mono"
                        >
                          <span>{showAndroidGuide ? 'Hide Instructions' : 'View Unknown Apps Permission'}</span>
                          {showAndroidGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {showAndroidGuide && (
                        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-400 leading-relaxed">
                          <p>
                            1. Tap the download notification once complete, or open your <strong className="text-white">Files / Downloads</strong> folder.
                          </p>
                          <p>
                            2. If prompted <strong className="text-white">“For your security, your phone is not allowed to install unknown apps”</strong>, tap <strong className="text-white">Settings</strong> and toggle on <strong className="text-white">Allow from this source</strong> for your browser.
                          </p>
                          <p>
                            3. Tap <strong className="text-white">Install</strong> to complete setup. Google Play Protect will verify package integrity.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cryptographic & Build Verification Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Build Details */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-3">
                <h3 className="font-semibold text-white tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Build Specification</span>
                </h3>

                <div className="space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Bundle ID:</span>
                    <span className="text-cyan-400">{selectedPlatform === 'ios' ? app.iosConfig.bundleId : app.androidConfig.packageName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Minimum OS:</span>
                    <span className="text-slate-200">{selectedPlatform === 'ios' ? `iOS ${app.iosConfig.minIosVersion}+` : app.androidConfig.minAndroidVersion}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Payload Size:</span>
                    <span className="text-slate-200">{selectedPlatform === 'ios' ? app.iosConfig.ipaSize : app.androidConfig.apkSize}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Signing Identity:</span>
                    <span className="text-emerald-400 truncate max-w-[200px]">
                      {selectedPlatform === 'ios' ? app.iosConfig.signingTeam : 'Keystore SHA-256 Valid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security & Access Token Policy */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-3">
                <h3 className="font-semibold text-white tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Cryptographic Token Policy</span>
                </h3>

                <div className="space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Active Token:</span>
                    <span className="text-cyan-400">{token?.token ?? 'Public Link'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Remaining Quota:</span>
                    <span className="text-slate-200 tabular-nums">
                      {token?.maxDownloads ? `${token.maxDownloads - token.downloadCount} installs remaining` : 'Unlimited quota'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Expiration:</span>
                    <span className="text-slate-200">
                      {token?.expiresAt ? new Date(token.expiresAt).toLocaleString() : 'Permanent token'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Passcode Protected:</span>
                    <span className={token?.passcodeProtected ? 'text-amber-400' : 'text-slate-400'}>
                      {token?.passcodeProtected ? 'Enforced (PIN Validated)' : 'Open access'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Binary Checksum Card */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="font-mono text-slate-400 shrink-0">SHA-256 Checksum:</span>
                <span className="font-mono text-cyan-400 text-[11px] truncate select-all">{app.sha256}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={copyChecksum}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                </button>
                <button
                  onClick={copyPageLink}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-4 text-center text-xs text-slate-400 font-mono">
        ApnaApp32 OTA Engine · End-to-end HTTPS encrypted distribution for iOS &amp; Android
      </footer>
    </div>
  );
};
