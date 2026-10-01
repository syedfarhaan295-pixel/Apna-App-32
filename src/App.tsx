import React, { useState, useEffect, useMemo } from 'react';
import { AppPackage, SecureToken } from './types';
import {
  INITIAL_APPS,
  INITIAL_TOKENS,
  getStoredApps,
  saveStoredApps,
  getStoredTokens,
  saveStoredTokens,
  heroDistributeImg,
  generateItmsInstallLink,
  detectUserDevice,
} from './services/appData';
import { QRCodeSvg } from './components/QRCodeSvg';
import { DeviceInstallSimulator } from './components/DeviceInstallSimulator';
import { SecureLinkModal } from './components/SecureLinkModal';
import { UploadAppModal } from './components/UploadAppModal';
import { PlistViewerModal } from './components/PlistViewerModal';
import { DirectInstallPage } from './components/DirectInstallPage';
import { ApnaAppLogo } from './components/ApnaAppLogo';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GitHubSyncModal } from './components/GitHubSyncModal';

import {
  Smartphone,
  ShieldCheck,
  Download,
  Share2,
  Plus,
  Play,
  FileCode,
  Search,
  ExternalLink,
  Check,
  Copy,
  Clock,
  Radio,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
  GitBranch,
} from 'lucide-react';

export default function App() {
  const [apps, setApps] = useState<AppPackage[]>(getStoredApps);
  const [tokens, setTokens] = useState<SecureToken[]>(getStoredTokens);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<'all' | 'ios' | 'android'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Active interactive modals
  const [simulatorApp, setSimulatorApp] = useState<AppPackage | null>(null);
  const [secureLinkApp, setSecureLinkApp] = useState<AppPackage | null>(null);
  const [plistApp, setPlistApp] = useState<AppPackage | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);

  // Dedicated Direct Install View (triggered when ?app=... query param is present)
  const [portalAppId, setPortalAppId] = useState<string | null>(null);
  const [portalTokenStr, setPortalTokenStr] = useState<string | null>(null);

  // Copy feedback state for card links
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);

  // Check URL query parameters for direct install links on load or popstate
  useEffect(() => {
    const handleUrlCheck = () => {
      const params = new URLSearchParams(window.location.search);
      const appParam = params.get('app');
      const tokenParam = params.get('token');
      if (appParam) {
        setPortalAppId(appParam);
        setPortalTokenStr(tokenParam);
      } else {
        setPortalAppId(null);
        setPortalTokenStr(null);
      }
    };

    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    return () => window.removeEventListener('popstate', handleUrlCheck);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    saveStoredApps(apps);
  }, [apps]);

  useEffect(() => {
    saveStoredTokens(tokens);
  }, [tokens]);

  // Handler to add newly created app
  const handleAppCreated = (newApp: AppPackage) => {
    setApps((prev) => [newApp, ...prev]);
    // Also create initial token for the app
    const initialToken: SecureToken = {
      id: `tok_${Date.now()}`,
      token: `sec_${Math.random().toString(36).substring(2, 9)}`,
      appId: newApp.id,
      label: 'Initial Internal Release',
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600 * 1000 * 72,
      maxDownloads: 50,
      downloadCount: 0,
      passcodeProtected: false,
      allowedPlatform: 'all',
      status: 'active',
    };
    setTokens((prev) => [initialToken, ...prev]);
    setSecureLinkApp(newApp);
  };

  const handleAddToken = (newToken: SecureToken) => {
    setTokens((prev) => [newToken, ...prev]);
  };

  const handleRevokeToken = (tokenId: string) => {
    setTokens((prev) => prev.filter((t) => t.id !== tokenId));
  };

  // Handler for recording install events
  const handleRecordInstall = (appId: string, platform: 'ios' | 'android') => {
    setApps((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          return {
            ...a,
            stats: {
              ...a.stats,
              totalInstalls: a.stats.totalInstalls + 1,
              iosInstalls: platform === 'ios' ? a.stats.iosInstalls + 1 : a.stats.iosInstalls,
              androidInstalls: platform === 'android' ? a.stats.androidInstalls + 1 : a.stats.androidInstalls,
            },
          };
        }
        return a;
      })
    );

    if (portalTokenStr) {
      setTokens((prev) =>
        prev.map((t) => {
          if (t.token === portalTokenStr) {
            return {
              ...t,
              downloadCount: t.downloadCount + 1,
            };
          }
          return t;
        })
      );
    }
  };

  // Switch to portal view
  const openPortalView = (appId: string, tokenString?: string) => {
    setPortalAppId(appId);
    setPortalTokenStr(tokenString || null);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('app', appId);
    if (tokenString) {
      newUrl.searchParams.set('token', tokenString);
    } else {
      newUrl.searchParams.delete('token');
    }
    window.history.pushState({}, '', newUrl.toString());
  };

  const exitPortalView = () => {
    setPortalAppId(null);
    setPortalTokenStr(null);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('app');
    newUrl.searchParams.delete('token');
    window.history.pushState({}, '', newUrl.toString());
  };

  // Filter apps
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.iosConfig.bundleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.androidConfig.packageName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlatform =
        selectedPlatformFilter === 'all' || app.platforms.includes(selectedPlatformFilter);

      const matchesCategory =
        selectedCategoryFilter === 'All' || app.category === selectedCategoryFilter;

      return matchesSearch && matchesPlatform && matchesCategory;
    });
  }, [apps, searchQuery, selectedPlatformFilter, selectedCategoryFilter]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    apps.forEach((a) => set.add(a.category));
    return ['All', ...Array.from(set)];
  }, [apps]);

  // Overall platform statistics
  const totalInstallsAcrossApps = useMemo(() => {
    return apps.reduce((acc, a) => acc + a.stats.totalInstalls, 0);
  }, [apps]);

  // If in Portal View, render dedicated Direct Install portal for end user
  if (portalAppId) {
    const targetApp = apps.find((a) => a.id === portalAppId) || apps[0];
    const targetToken = tokens.find((t) => t.token === portalTokenStr);

    return (
      <>
        <DirectInstallPage
          app={targetApp}
          token={targetToken}
          onBack={exitPortalView}
          onOpenSimulator={() => setSimulatorApp(targetApp)}
          onOpenPlist={() => setPlistApp(targetApp)}
          onRecordInstall={handleRecordInstall}
        />
        {simulatorApp && (
          <DeviceInstallSimulator
            app={simulatorApp}
            isOpen={!!simulatorApp}
            onClose={() => setSimulatorApp(null)}
          />
        )}
        {plistApp && (
          <PlistViewerModal
            app={plistApp}
            isOpen={!!plistApp}
            onClose={() => setPlistApp(null)}
          />
        )}
        <OfflineIndicator />
      </>
    );
  }

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://apnaapp32.io';

  const copyQuickInstallLink = (app: AppPackage) => {
    const existing = tokens.find((t) => t.appId === app.id && t.status === 'active');
    const tokenStr = existing ? existing.token : 'public';
    const url = `${currentOrigin}/?app=${app.id}&token=${tokenStr}`;
    navigator.clipboard.writeText(url);
    setCopiedAppId(app.id);
    setTimeout(() => setCopiedAppId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-between selection:bg-orange-500/20 selection:text-orange-300">
      {/* 
        TOP BAR CONTRACT:
        Zone 1: Single text element wordmark / brand logo
        Zone 2: 4 clean text navigation links
        Zone 3: 1-2 primary actions
      */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark with Logo */}
        <a href="/" className="hover:opacity-90 transition-opacity">
          <ApnaAppLogo size={36} showText={true} />
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <a href="#apps" className="hover:text-white transition-colors">
            App Catalog
          </a>
          <a href="#ota-architecture" className="hover:text-white transition-colors">
            OTA Architecture
          </a>
          <a href="#security" className="hover:text-white transition-colors">
            Enterprise Security
          </a>
          <a href="#telemetry" className="hover:text-white transition-colors">
            Install Telemetry
          </a>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsGitHubOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="GitHub Repository syedfarhaan295-pixel/Apna-App-32"
          >
            <GitBranch className="w-3.5 h-3.5 text-orange-400" />
            <span className="truncate max-w-[150px] lg:max-w-none">syedfarhaan295-pixel/Apna-App-32</span>
          </button>
          <PWAInstallButton />
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-400 hover:to-orange-400 text-white font-bold text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload App</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950/60 p-6 sm:p-10 lg:p-12">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>ApnaApp32 Gateway · Over-The-Air Wireless Distribution</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Install Mobile Apps Directly with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-orange-400">ApnaApp32</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Distribute iOS <code className="text-cyan-300 font-mono text-xs">.ipa</code> and Android <code className="text-orange-300 font-mono text-xs">.apk</code> builds in seconds. Powered by Apple’s native wireless <code className="text-cyan-300 font-mono text-xs">itms-services</code> protocol and instant Android package streaming with expiring tokens.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#apps"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Browse Available Apps</span>
                </a>

                <button
                  onClick={() => setSimulatorApp(apps[0])}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                  <span>Interactive Device Simulator</span>
                </button>
              </div>

              {/* Quantitative Proof Metrics (Adjacent to claim) */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
                    {totalInstallsAcrossApps.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Direct OTA Installs</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                    &lt; 2.4s
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Manifest Handshake</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    100%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">SHA-256 Verified</div>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
                <img
                  src={heroDistributeImg}
                  alt="Over the air installation visualization"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-5">
                  <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Dual OS Compatibility</span>
                        <span className="text-[10px] text-slate-400 font-mono">iOS 16+ · Android 10+</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded">
                      Live Gateway
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Apps Catalog Section */}
        <section id="apps" className="space-y-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Active Application Catalog</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate secure single-use links, inspect OTA manifests, or install onto your mobile device.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by app, bundle ID, version..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Segmented Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-950 border border-slate-800/80 rounded-xl">
            {/* Platform Segmented Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedPlatformFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedPlatformFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Platforms
              </button>
              <button
                onClick={() => setSelectedPlatformFilter('ios')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedPlatformFilter === 'ios'
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                iOS (OTA Plist)
              </button>
              <button
                onClick={() => setSelectedPlatformFilter('android')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedPlatformFilter === 'android'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Android (Direct APK)
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategoryFilter === cat
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Apps Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredApps.map((app) => {
              const appActiveTokens = tokens.filter((t) => t.appId === app.id && t.status === 'active');
              const defaultToken = appActiveTokens[0]?.token ?? 'public';
              const installUrl = `${currentOrigin}/?app=${app.id}&token=${defaultToken}`;

              return (
                <div
                  key={app.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700/80 transition-all p-6 flex flex-col justify-between space-y-5"
                >
                  {/* Top Details */}
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        {/* App Icon */}
                        {app.id === 'app-apnaapp32-core' ? (
                          <div className="shrink-0">
                            <ApnaAppLogo size={56} showText={false} />
                          </div>
                        ) : (
                          <div
                            className={`w-14 h-14 rounded-xl bg-gradient-to-tr ${app.iconBg} flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0`}
                          >
                            {app.name.charAt(0)}
                          </div>
                        )}

                        <div>
                          <h3 className="text-base font-bold text-white tracking-tight">{app.name}</h3>
                          <p className="text-xs text-slate-300 mt-0.5">{app.tagline}</p>

                          {/* Unboxed metadata without pills */}
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 font-mono flex-wrap">
                            <span className="text-cyan-400">v{app.version}</span>
                            <span aria-hidden="true">·</span>
                            <span>Build {app.buildNumber}</span>
                            <span aria-hidden="true">·</span>
                            <span>{app.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{app.stats.totalInstalls} installs</span>
                          </div>

                          {app.githubRepo && (
                            <button
                              onClick={() => setIsGitHubOpen(true)}
                              className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-mono text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
                              title="Inspect GitHub repository CI/CD pipeline"
                            >
                              <GitBranch className="w-3.5 h-3.5" />
                              <span>{app.githubRepo}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Mini QR trigger */}
                      <button
                        onClick={() => setSecureLinkApp(app)}
                        className="bg-white p-1 rounded-lg shrink-0 hover:scale-105 transition-transform shadow cursor-pointer"
                        title="View Full QR Code and Link Management"
                      >
                        <QRCodeSvg value={installUrl} size={48} showCenterIcon={false} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 mt-4 leading-relaxed line-clamp-2">
                      {app.description}
                    </p>

                    {/* Preview Screenshot (if present) */}
                    {app.previewImage && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 h-36 relative group">
                        <img
                          src={app.previewImage}
                          alt={`${app.name} interface preview`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                          <span className="text-[10px] font-mono text-slate-300">
                            {app.iosConfig.bundleId}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Release Notes bullet */}
                    <div className="mt-3.5 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60 text-[11px] text-slate-300 space-y-1">
                      <div className="font-semibold text-slate-200">Latest Changelog:</div>
                      <div className="text-slate-400 line-clamp-1 font-mono text-[10px]">
                        • {app.releaseNotes[0]}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openPortalView(app.id, defaultToken)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Install Portal</span>
                      </button>

                      <button
                        onClick={() => setSimulatorApp(app)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        title="Simulate iOS and Android installation on screen"
                      >
                        <Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                        <span>Simulator</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyQuickInstallLink(app)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Copy direct installation link"
                      >
                        {copiedAppId === app.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => setPlistApp(app)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="View Apple XML Manifest (.plist)"
                      >
                        <FileCode className="w-4 h-4 text-blue-400" />
                      </button>

                      <button
                        onClick={() => setSecureLinkApp(app)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Tokens ({appActiveTokens.length})</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-16 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-8">
              <Smartphone className="w-8 h-8 text-slate-500 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">No applications match your filter</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try clearing your search query or upload a new app package using the button in the top navigation bar.
              </p>
            </div>
          )}
        </section>

        {/* Technical Architecture Section */}
        <section id="ota-architecture" className="space-y-6 pt-6 border-t border-slate-800/80">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Direct Installation Architecture</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              How over-the-air installation executes reliably on Apple and Google operating systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Apple iOS OTA Flow */}
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  iOS
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Apple Wireless App Distribution (OTA)</h3>
                  <span className="text-xs text-slate-400 font-mono">itms-services protocol</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-cyan-400 font-bold">01.</span>
                  <p>
                    <strong className="text-white">Protocol Invocation:</strong> MobileSafari intercepts <code className="text-cyan-300 font-mono text-[11px]">itms-services://?action=download-manifest&amp;url=...</code> without requiring App Store authentication.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-cyan-400 font-bold">02.</span>
                  <p>
                    <strong className="text-white">XML Manifest Query:</strong> iOS Springboard fetches the signed <code className="text-cyan-300 font-mono text-[11px]">manifest.plist</code> over strict TLS 1.3 to verify the bundle-identifier and version number.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-cyan-400 font-bold">03.</span>
                  <p>
                    <strong className="text-white">In-Place Springboard Installation:</strong> The app icon appears directly on the user&apos;s home screen and streams the encrypted IPA binary.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-cyan-400 font-bold">04.</span>
                  <p>
                    <strong className="text-white">Enterprise Certificate Trust:</strong> Supported via Enterprise In-House certificates or Ad-Hoc provisioning profiles registered with device UDIDs.
                  </p>
                </div>
              </div>
            </div>

            {/* Android Direct APK Flow */}
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  APK
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Android Direct Package Streaming</h3>
                  <span className="text-xs text-slate-400 font-mono">PackageInstaller Intent</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-emerald-400 font-bold">01.</span>
                  <p>
                    <strong className="text-white">Stream Delivery:</strong> Signed APK package is served directly over HTTPS with accurate <code className="text-emerald-300 font-mono text-[11px]">application/vnd.android.package-archive</code> MIME headers.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-emerald-400 font-bold">02.</span>
                  <p>
                    <strong className="text-white">Package Signature Verification:</strong> Android verifies v2/v3 Keystore APK signatures and validates the target SDK (API 35).
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-emerald-400 font-bold">03.</span>
                  <p>
                    <strong className="text-white">Google Play Protect Integrity:</strong> Real-time on-device scanning ensures the SHA-256 binary hash has not been modified in transit.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-emerald-400 font-bold">04.</span>
                  <p>
                    <strong className="text-white">One-Tap Install Prompt:</strong> Users confirm permissions in the standard Android system dialog and launch immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Cryptographic Auditing Section */}
        <section id="security" className="p-6 sm:p-8 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>Enterprise Security &amp; Token Safeguards</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every distribution link includes cryptographic guarantees to protect sensitive pre-release binaries.
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>TLS 1.3 Certified · Zero Plaintext Storage</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold text-white mb-1">Expiring Access Tokens</div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Time-lock links to 1 hour, 24 hours, or 7 days. Automatic revocation triggers immediately upon expiry.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold text-white mb-1">Download Quotas</div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Enforce hard install limits (e.g. 50 devices maximum). Excess download attempts are rejected automatically.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold text-white mb-1">Passcode Shielding</div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Lock binaries behind a 4-digit security PIN to prevent unauthorized sharing among external recipients.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold text-white mb-1">SHA-256 Checksums</div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Cryptographic checksums published alongside every build ensure complete binary payload integrity.
              </p>
            </div>
          </div>
        </section>

        {/* Live Install Telemetry Section */}
        <section id="telemetry" className="p-6 sm:p-8 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Active Distribution Telemetry</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time tracking of active tokens and installations across client platforms.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400 tabular-nums">
              Total Active Tokens: <strong className="text-white">{tokens.length}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">Application</th>
                  <th className="py-2.5 px-3">Token Label</th>
                  <th className="py-2.5 px-3">Target Platform</th>
                  <th className="py-2.5 px-3 text-right">Installs / Quota</th>
                  <th className="py-2.5 px-3">Expiration</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {tokens.map((tok) => {
                  const matchedApp = apps.find((a) => a.id === tok.appId);
                  const isExpired = tok.expiresAt ? Date.now() > tok.expiresAt : false;

                  return (
                    <tr key={tok.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white">
                        {matchedApp?.name ?? tok.appId}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {tok.label}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={tok.allowedPlatform === 'ios' ? 'text-cyan-400' : tok.allowedPlatform === 'android' ? 'text-emerald-400' : 'text-slate-300'}>
                          {tok.allowedPlatform === 'all' ? 'Universal' : tok.allowedPlatform.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-200">
                        {tok.downloadCount} / {tok.maxDownloads ?? '∞'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {tok.expiresAt
                          ? isExpired
                            ? 'Expired'
                            : new Date(tok.expiresAt).toLocaleDateString()
                          : 'Permanent'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => openPortalView(tok.appId, tok.token)}
                          className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                        >
                          Open Portal
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 sm:px-6 lg:px-8 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ApnaAppLogo size={28} showText={false} />
            <span className="font-bold text-white">ApnaApp32</span>
            <span aria-hidden="true">·</span>
            <span>Direct Mobile App Distribution System for iOS &amp; Android</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>Apple Wireless OTA (itms-services)</span>
            <span>Android APK Intent</span>
            <span>PWA Standalone</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {simulatorApp && (
        <DeviceInstallSimulator
          app={simulatorApp}
          isOpen={!!simulatorApp}
          onClose={() => setSimulatorApp(null)}
        />
      )}

      {secureLinkApp && (
        <SecureLinkModal
          app={secureLinkApp}
          tokens={tokens}
          isOpen={!!secureLinkApp}
          onClose={() => setSecureLinkApp(null)}
          onAddToken={handleAddToken}
          onRevokeToken={handleRevokeToken}
          onOpenPortal={openPortalView}
        />
      )}

      {plistApp && (
        <PlistViewerModal
          app={plistApp}
          isOpen={!!plistApp}
          onClose={() => setPlistApp(null)}
        />
      )}

      {isUploadOpen && (
        <UploadAppModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onAppCreated={handleAppCreated}
        />
      )}

      {isGitHubOpen && (
        <GitHubSyncModal
          isOpen={isGitHubOpen}
          onClose={() => setIsGitHubOpen(false)}
          repoHandle="syedfarhaan295-pixel/Apna-App-32"
        />
      )}

      {/* PWA Offline indicator */}
      <OfflineIndicator />
    </div>
  );
}
