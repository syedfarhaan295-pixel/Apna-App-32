import React, { useState } from 'react';
import { AppPackage } from '../types';
import { UploadCloud, Check, FileCode, Smartphone, X, Layers, AlertCircle } from 'lucide-react';

interface UploadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppCreated: (newApp: AppPackage) => void;
}

export const UploadAppModal: React.FC<UploadAppModalProps> = ({
  isOpen,
  onClose,
  onAppCreated,
}) => {
  const [appName, setAppName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Enterprise Tools');
  const [version, setVersion] = useState('1.0.0');
  const [buildNumber, setBuildNumber] = useState(1);
  const [bundleId, setBundleId] = useState('com.company.myapp');
  const [platformSelection, setPlatformSelection] = useState<'both' | 'ios' | 'android'>('both');
  const [signingTeam, setSigningTeam] = useState('Enterprise In-House Distribution');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [droppedFileName, setDroppedFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateDrop = (e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    let name = 'app-release.ipa';
    if ('dataTransfer' in e && e.dataTransfer.files?.[0]) {
      name = e.dataTransfer.files[0].name;
    } else if ('target' in e && (e.target as HTMLInputElement).files?.[0]) {
      name = (e.target as HTMLInputElement).files![0].name;
    }
    setDroppedFileName(name);
    // Autofill name from file
    const cleanName = name.replace(/\.(ipa|apk|zip)$/i, '').replace(/[-_]/g, ' ');
    if (!appName) {
      setAppName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
    if (name.endsWith('.apk')) {
      setPlatformSelection('android');
    } else if (name.endsWith('.ipa')) {
      setPlatformSelection('ios');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadPercent(10);

    // Simulate binary parsing & SHA256 hashing
    const interval = setInterval(() => {
      setUploadPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);

          const finalPlatforms =
            platformSelection === 'both' ? (['ios', 'android'] as const) : [platformSelection];

          const newPackage: AppPackage = {
            id: `app-custom-${Date.now()}`,
            name: appName.trim() || 'Custom Mobile Application',
            tagline: tagline.trim() || 'Internal enterprise distribution build',
            description: description.trim() || 'Direct over-the-air installation build with verified cryptographic certificate.',
            category,
            iconBg: 'from-cyan-600 to-indigo-700',
            iconSymbol: 'Smartphone',
            previewImage: '', // Will use high-fidelity fallback preview container
            version: version.trim() || '1.0.0',
            buildNumber: Number(buildNumber) || 1,
            releaseDate: new Date().toISOString().split('T')[0],
            releaseNotes: ['Initial release build uploaded via ApnaApp32 direct portal.'],
            platforms: [...finalPlatforms],
            iosConfig: {
              bundleId: bundleId.trim() || 'com.example.app',
              minIosVersion: '16.0',
              ipaSize: '36.2 MB',
              ipaUrl: 'https://cdn.airdeploy.io/builds/custom-app.ipa',
              manifestPlistUrl: 'https://cdn.airdeploy.io/manifests/custom-app.plist',
              provisioningProfileType: 'Enterprise In-House',
              signingTeam: signingTeam.trim() || 'Verified Enterprise Organization',
              teamId: '8X9W2K7M1P',
              entitlements: ['push-notifications', 'background-fetch'],
            },
            androidConfig: {
              packageName: bundleId.trim() || 'com.example.app',
              minAndroidVersion: 'Android 10 (API 29)',
              targetSdk: 35,
              apkSize: '32.8 MB',
              apkUrl: 'https://cdn.airdeploy.io/builds/custom-app.apk',
              sha256Fingerprint: '8A:9B:C1:D2:E3:F4:05:16:27:38:49:5A:6B:7C:8D:9E:0F:1A:2B:3C:4D:5E:6F:70:81:92:A3:B4:C5:D6:E7:F8',
              permissions: ['INTERNET', 'ACCESS_NETWORK_STATE', 'POST_NOTIFICATIONS'],
            },
            stats: {
              totalInstalls: 0,
              iosInstalls: 0,
              androidInstalls: 0,
              activeLinksCount: 1,
            },
            sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          };

          onAppCreated(newPackage);
          setIsUploading(false);
          onClose();
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Upload & Distribute Mobile App</h3>
              <p className="text-xs text-slate-400">Direct OTA package distribution for iOS (.ipa) and Android (.apk)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* File Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleSimulateDrop}
            className="relative border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/40 rounded-xl p-5 text-center cursor-pointer transition-colors"
          >
            <input
              type="file"
              accept=".ipa,.apk,.zip"
              onChange={handleSimulateDrop}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-2 text-cyan-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-white">
              {droppedFileName ? droppedFileName : 'Drag & drop your .ipa or .apk package here'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports Apple Enterprise / Ad-Hoc IPAs and signed Android APKs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">App Title</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. Skyline Pilot Pro"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="Enterprise Tools">Enterprise Tools</option>
                <option value="Logistics & Ops">Logistics & Ops</option>
                <option value="Fintech & Banking">Fintech & Banking</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Field Engineering">Field Engineering</option>
                <option value="Productivity">Productivity</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">One-Line Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Autonomous flight navigation and weather radar"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Platform</label>
              <select
                value={platformSelection}
                onChange={(e) => setPlatformSelection(e.target.value as 'both' | 'ios' | 'android')}
                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="both">Both (iOS & Android)</option>
                <option value="ios">Apple iOS (.ipa)</option>
                <option value="android">Android (.apk)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Version String</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Build Number</label>
              <input
                type="number"
                value={buildNumber}
                onChange={(e) => setBuildNumber(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Bundle ID / Package Name</label>
              <input
                type="text"
                value={bundleId}
                onChange={(e) => setBundleId(e.target.value)}
                placeholder="com.acme.pilotapp"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Signing Team / Certificate</label>
              <input
                type="text"
                value={signingTeam}
                onChange={(e) => setSigningTeam(e.target.value)}
                placeholder="Acme Corp Enterprise In-House"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Release Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of changes, new capabilities, or testing requirements..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>

          {isUploading && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyan-400">Processing binary & generating manifest...</span>
                <span className="text-white">{uploadPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-150"
                  style={{ width: `${uploadPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? 'Registering...' : 'Upload & Deploy App'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
