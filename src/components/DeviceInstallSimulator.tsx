import React, { useState, useEffect } from 'react';
import { AppPackage } from '../types';
import { Smartphone, Check, ShieldCheck, Download, AlertTriangle, Play, RefreshCw, X, ArrowRight, ExternalLink } from 'lucide-react';

interface DeviceInstallSimulatorProps {
  app: AppPackage;
  isOpen: boolean;
  onClose: () => void;
}

type SimPlatform = 'ios' | 'android';
type IosStep = 'idle' | 'prompt' | 'downloading' | 'installed' | 'untrusted_alert' | 'trusted_opened';
type AndroidStep = 'idle' | 'downloading' | 'package_prompt' | 'scanning' | 'installed_open';

export const DeviceInstallSimulator: React.FC<DeviceInstallSimulatorProps> = ({
  app,
  isOpen,
  onClose,
}) => {
  const [platform, setPlatform] = useState<SimPlatform>('ios');
  const [iosStep, setIosStep] = useState<IosStep>('idle');
  const [androidStep, setAndroidStep] = useState<AndroidStep>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Reset states on platform change or open
  useEffect(() => {
    setIosStep('idle');
    setAndroidStep('idle');
    setDownloadProgress(0);
  }, [platform, isOpen, app.id]);

  // Handle simulated progress timers
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (iosStep === 'downloading') {
      timer = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIosStep('installed');
            return 100;
          }
          return prev + 12;
        });
      }, 250);
    } else if (androidStep === 'downloading') {
      timer = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setAndroidStep('package_prompt');
            return 100;
          }
          return prev + 15;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [iosStep, androidStep]);

  if (!isOpen) return null;

  const startIosInstall = () => {
    setIosStep('prompt');
  };

  const confirmIosPrompt = () => {
    setDownloadProgress(0);
    setIosStep('downloading');
  };

  const startAndroidInstall = () => {
    setDownloadProgress(0);
    setAndroidStep('downloading');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col md:flex-row">
        {/* Left Side: Explanatory & Controls panel */}
        <div className="w-full md:w-5/12 p-6 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Direct Install Engine</h3>
              </div>
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Experience the direct, over-the-air installation lifecycle as it appears natively on physical devices—bypassing public app stores with enterprise certificates.
            </p>

            {/* Platform Selector */}
            <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center mb-6">
              <button
                onClick={() => setPlatform('ios')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  platform === 'ios'
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Apple iOS (OTA Plist)</span>
              </button>
              <button
                onClick={() => setPlatform('android')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  platform === 'android'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Android (Direct APK)</span>
              </button>
            </div>

            {/* Technical Mechanism Details */}
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="font-semibold text-slate-200 block mb-1">
                  {platform === 'ios' ? 'Apple itms-services Protocol' : 'Android PackageInstaller Intent'}
                </span>
                <p className="text-slate-400 leading-normal text-[11px]">
                  {platform === 'ios'
                    ? 'iOS intercepts itms-services://?action=download-manifest URLs and queries Apple’s wireless manifest XML over HTTPS to verify bundle ID, provisions, and IPA payload directly on Springboard.'
                    : 'Android downloads the signed APK binary and triggers android.content.pm.PackageInstaller with verified SHA-256 fingerprint checks.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-slate-400">Bundle Identifier:</span>
                  <span className="font-mono text-cyan-400 font-medium">
                    {platform === 'ios' ? app.iosConfig.bundleId : app.androidConfig.packageName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-slate-400">Payload Size:</span>
                  <span className="font-mono text-slate-200">
                    {platform === 'ios' ? app.iosConfig.ipaSize : app.androidConfig.apkSize}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Signing Identity:</span>
                  <span className="font-mono text-emerald-400 truncate max-w-[160px]">
                    {platform === 'ios' ? app.iosConfig.signingTeam : 'Keystore SHA-256 Valid'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
            <button
              onClick={() => {
                setIosStep('idle');
                setAndroidStep('idle');
                setDownloadProgress(0);
              }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 py-1.5 px-2.5 rounded-lg hover:bg-slate-900 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Simulation</span>
            </button>
            <button
              onClick={onClose}
              className="hidden md:inline-flex px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Right Side: Virtual Phone Display */}
        <div className="w-full md:w-7/12 p-6 flex flex-col items-center justify-center bg-[#070b12] relative overflow-hidden">
          {/* Subtle Ambient Backlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-600/10 blur-[100px] pointer-events-none rounded-full" />

          {/* Device Frame */}
          <div className="relative w-[300px] h-[580px] bg-slate-950 border-[6px] border-slate-800 rounded-[44px] shadow-2xl overflow-hidden flex flex-col select-none ring-1 ring-white/10">
            {/* Top Notch / Dynamic Island */}
            <div className="h-6 w-full flex items-center justify-center pt-1.5 z-20">
              <div className="h-4 w-28 bg-slate-900 rounded-full flex items-center justify-between px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
              </div>
            </div>

            {/* Screen Content */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950 text-slate-200 p-4">
              {/* Header Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1 mb-4">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex items-center">
                    <div className="w-full h-full bg-slate-400 rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* SIMULATION STATES FOR IOS */}
              {platform === 'ios' && (
                <div className="flex-1 flex flex-col justify-between">
                  {iosStep === 'idle' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/30 mb-3 text-white font-bold text-xl">
                        {app.name.charAt(0)}
                      </div>
                      <h4 className="text-sm font-semibold text-white">{app.name}</h4>
                      <span className="text-[11px] text-slate-400 mt-0.5 font-mono">v{app.version} (Build {app.buildNumber})</span>
                      <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                        Ready to trigger Apple Over-The-Air wireless manifest.
                      </p>
                      <button
                        onClick={startIosInstall}
                        className="mt-6 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Trigger itms-services</span>
                      </button>
                    </div>
                  )}

                  {iosStep === 'prompt' && (
                    <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-150">
                      {/* Native iOS Safari Installation Alert Modal */}
                      <div className="w-full max-w-[250px] bg-slate-800/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-4 text-center shadow-2xl">
                        <h5 className="text-xs font-semibold text-white mb-1">“apnaapp32.io” would like to install “{app.name}”</h5>
                        <p className="text-[10px] text-slate-400 mb-3">Enterprise app signed by {app.iosConfig.signingTeam}</p>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/80">
                          <button
                            onClick={() => setIosStep('idle')}
                            className="py-1.5 text-xs text-slate-400 hover:text-white font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={confirmIosPrompt}
                            className="py-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                          >
                            Install
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {iosStep === 'downloading' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className="relative w-18 h-18 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shadow-xl mb-3">
                        {/* Shaded darkening mask */}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          {/* Circular progress ring */}
                          <div className="relative w-10 h-10">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <circle
                                cx="18"
                                cy="18"
                                r="15"
                                fill="none"
                                className="stroke-slate-700"
                                strokeWidth="3"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="15"
                                fill="none"
                                className="stroke-cyan-400 transition-all duration-200"
                                strokeWidth="3"
                                strokeDasharray="94.2"
                                strokeDashoffset={94.2 - (94.2 * downloadProgress) / 100}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-300">
                              {downloadProgress}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-white">Installing on Springboard...</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-1">OTA Payload: {app.iosConfig.ipaSize}</span>
                    </div>
                  )}

                  {iosStep === 'installed' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
                      <div
                        onClick={() => setIosStep('untrusted_alert')}
                        className="group cursor-pointer relative p-3 rounded-2xl hover:bg-slate-900/60 transition-colors flex flex-col items-center"
                      >
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/40 text-white font-bold text-xl group-hover:scale-105 transition-transform">
                          {app.name.charAt(0)}
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-slate-950" />
                        </div>
                        <span className="text-xs font-medium text-white mt-2 max-w-[120px] truncate">{app.name}</span>
                        <span className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1 font-mono">
                          Tap to Launch
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-4 px-4 leading-normal">
                        App successfully placed on Home Screen. Tap app icon to test launch verification.
                      </p>
                    </div>
                  )}

                  {iosStep === 'untrusted_alert' && (
                    <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-150">
                      <div className="w-full max-w-[250px] bg-slate-800/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-4 text-center shadow-2xl">
                        <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                        <h5 className="text-xs font-semibold text-white mb-1">Untrusted Enterprise Developer</h5>
                        <p className="text-[10px] text-slate-300 mb-3 leading-relaxed">
                          iPhone has not trusted “{app.iosConfig.signingTeam}”. You must trust this profile in Settings before opening.
                        </p>
                        <div className="space-y-1.5 pt-2 border-t border-slate-700/80">
                          <button
                            onClick={() => setIosStep('trusted_opened')}
                            className="w-full py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Trust Profile in Settings
                          </button>
                          <button
                            onClick={() => setIosStep('installed')}
                            className="w-full py-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {iosStep === 'trusted_opened' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-3 animate-in zoom-in-95 duration-200">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-white">{app.name} Active</h4>
                      <span className="text-[10px] font-mono text-emerald-400 mt-0.5">Enterprise Certificate Verified</span>
                      <p className="text-[11px] text-slate-300 mt-3 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-left">
                        {app.description}
                      </p>
                      <button
                        onClick={() => setIosStep('idle')}
                        className="mt-4 px-3 py-1.5 bg-slate-800 text-xs text-slate-300 hover:text-white rounded-lg cursor-pointer"
                      >
                        Restart Test
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SIMULATION STATES FOR ANDROID */}
              {platform === 'android' && (
                <div className="flex-1 flex flex-col justify-between">
                  {androidStep === 'idle' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/30 mb-3 text-white font-bold text-xl">
                        {app.name.charAt(0)}
                      </div>
                      <h4 className="text-sm font-semibold text-white">{app.name}</h4>
                      <span className="text-[11px] text-slate-400 mt-0.5 font-mono">v{app.version} (APK Signed)</span>
                      <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                        Ready to download direct APK stream and invoke Android PackageInstaller.
                      </p>
                      <button
                        onClick={startAndroidInstall}
                        className="mt-6 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download APK Package</span>
                      </button>
                    </div>
                  )}

                  {androidStep === 'downloading' && (
                    <div className="flex-1 flex flex-col justify-center">
                      {/* Android Notification Bar */}
                      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Download className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span className="text-xs font-semibold text-white">Downloading file...</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono truncate mb-2">
                          {app.androidConfig.packageName}-v{app.version}.apk
                        </p>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 transition-all duration-200"
                            style={{ width: `${downloadProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mt-1.5">
                          <span>{((parseFloat(app.androidConfig.apkSize) * downloadProgress) / 100).toFixed(1)} MB / {app.androidConfig.apkSize}</span>
                          <span>{downloadProgress}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {androidStep === 'package_prompt' && (
                    <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-150">
                      {/* Native Android Package Installer Dialog */}
                      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl text-left">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                            {app.name.charAt(0)}
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold text-white">{app.name}</h5>
                            <span className="text-[10px] text-slate-400 font-mono">Do you want to install this app?</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-3 space-y-1">
                          <div className="font-semibold text-slate-300">Access Requested:</div>
                          {app.androidConfig.permissions.slice(0, 3).map((perm, idx) => (
                            <div key={idx} className="font-mono text-[9px] text-slate-400 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-emerald-400" />
                              <span>{perm}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                          <button
                            onClick={() => setAndroidStep('idle')}
                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setAndroidStep('scanning');
                              setTimeout(() => {
                                setAndroidStep('installed_open');
                              }, 1800);
                            }}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg cursor-pointer"
                          >
                            Install
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {androidStep === 'scanning' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className="w-14 h-14 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin flex items-center justify-center mb-3">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                      </div>
                      <span className="text-xs font-semibold text-white">Google Play Protect Scan</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-1">Verifying SHA-256 binary hash...</span>
                    </div>
                  )}

                  {androidStep === 'installed_open' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-3 animate-in zoom-in-95 duration-200">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                        <Check className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-white">App Installed</h4>
                      <span className="text-[10px] font-mono text-emerald-400 mt-0.5">Verified Safe by Play Protect</span>
                      <p className="text-[11px] text-slate-300 mt-3 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-left">
                        {app.description}
                      </p>
                      <button
                        onClick={() => setAndroidStep('idle')}
                        className="mt-4 px-3 py-1.5 bg-slate-800 text-xs text-slate-300 hover:text-white rounded-lg cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Home Indicator */}
              <div className="h-4 w-full flex items-center justify-center mt-2">
                <div className="w-24 h-1 bg-slate-600/50 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
