import React, { useState } from 'react';
import { AppPackage, SecureToken } from '../types';
import { QRCodeSvg } from './QRCodeSvg';
import { generateSecureTokenString } from '../services/appData';
import { Link2, Shield, Clock, Check, Copy, ExternalLink, KeyRound, QrCode, Trash2, X, Smartphone } from 'lucide-react';

interface SecureLinkModalProps {
  app: AppPackage;
  tokens: SecureToken[];
  isOpen: boolean;
  onClose: () => void;
  onAddToken: (token: SecureToken) => void;
  onRevokeToken: (tokenId: string) => void;
  onOpenPortal: (appId: string, tokenString: string) => void;
}

export const SecureLinkModal: React.FC<SecureLinkModalProps> = ({
  app,
  tokens,
  isOpen,
  onClose,
  onAddToken,
  onRevokeToken,
  onOpenPortal,
}) => {
  const [label, setLabel] = useState('Production QA Testers');
  const [expiryHours, setExpiryHours] = useState<number | 'never'>(24);
  const [maxInstalls, setMaxInstalls] = useState<number | 'unlimited'>(50);
  const [passcodeEnabled, setPasscodeEnabled] = useState(false);
  const [passcode, setPasscode] = useState('4829');
  const [allowedPlatform, setAllowedPlatform] = useState<'all' | 'ios' | 'android'>('all');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  if (!isOpen) return null;

  const appTokens = tokens.filter((t) => t.appId === app.id);
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://airdeploy.io';

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenStr = generateSecureTokenString();
    const expiresAt = expiryHours === 'never' ? null : Date.now() + expiryHours * 3600 * 1000;
    const maxDownloads = maxInstalls === 'unlimited' ? null : maxInstalls;

    const newToken: SecureToken = {
      id: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      token: tokenStr,
      appId: app.id,
      label: label.trim() || 'Direct Distribution Link',
      createdAt: Date.now(),
      expiresAt,
      maxDownloads,
      downloadCount: 0,
      passcodeProtected: passcodeEnabled,
      passcode: passcodeEnabled ? passcode : undefined,
      allowedPlatform,
      status: 'active',
    };

    onAddToken(newToken);
  };

  const copyUrl = (token: SecureToken) => {
    const url = `${currentOrigin}/?app=${app.id}&token=${token.token}`;
    navigator.clipboard.writeText(url);
    setCopiedTokenId(token.id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Secure Install Link Generator</h3>
              <p className="text-xs text-slate-400 font-mono">{app.name} · v{app.version}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* New Link Creation Form */}
          <form onSubmit={handleGenerate} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Create New Expiring Access Token
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Distribution Label / Audience</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Flight Attendants Beta Group"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Expiry Window</label>
                <select
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(e.target.value === 'never' ? 'never' : Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50 font-mono"
                >
                  <option value={1}>1 Hour</option>
                  <option value={6}>6 Hours</option>
                  <option value={24}>24 Hours</option>
                  <option value={72}>3 Days</option>
                  <option value={168}>7 Days</option>
                  <option value="never">No Expiration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Max Installs</label>
                <select
                  value={maxInstalls}
                  onChange={(e) => setMaxInstalls(e.target.value === 'unlimited' ? 'unlimited' : Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50 font-mono"
                >
                  <option value={5}>5 Installs</option>
                  <option value={10}>10 Installs</option>
                  <option value={25}>25 Installs</option>
                  <option value={50}>50 Installs</option>
                  <option value={100}>100 Installs</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Target OS</label>
                <select
                  value={allowedPlatform}
                  onChange={(e) => setAllowedPlatform(e.target.value as 'all' | 'ios' | 'android')}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="all">Universal (iOS & Android)</option>
                  <option value="ios">Apple iOS Only</option>
                  <option value="android">Android Only</option>
                </select>
              </div>
            </div>

            {/* Passcode Protection Toggle */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={passcodeEnabled}
                  onChange={(e) => setPasscodeEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Require 4-digit Passcode to Download</span>
              </label>

              {passcodeEnabled && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">PIN:</span>
                  <input
                    type="text"
                    maxLength={6}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-24 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-center text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500/50 tracking-wider"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Generate Signed Secure Link & QR</span>
            </button>
          </form>

          {/* Active Tokens List */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
              <span>Active Distribution Links ({appTokens.length})</span>
              <span className="text-[11px] font-mono text-slate-400">Automatic Telemetry</span>
            </h4>

            {appTokens.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                No active links generated yet. Generate your first secure token above.
              </div>
            ) : (
              <div className="space-y-3">
                {appTokens.map((tok) => {
                  const isExpired = tok.expiresAt ? Date.now() > tok.expiresAt : false;
                  const isExhausted = tok.maxDownloads ? tok.downloadCount >= tok.maxDownloads : false;
                  const installUrl = `${currentOrigin}/?app=${app.id}&token=${tok.token}`;

                  return (
                    <div
                      key={tok.id}
                      className={`p-3.5 rounded-xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isExpired || isExhausted
                          ? 'bg-red-950/10 border-red-900/30 opacity-70'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Mini QR Preview */}
                        <div className="shrink-0 bg-white p-1 rounded-md hidden sm:block">
                          <QRCodeSvg value={installUrl} size={54} showCenterIcon={false} />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{tok.label}</span>
                            {tok.passcodeProtected && (
                              <span className="text-[10px] font-mono text-amber-400 flex items-center gap-0.5">
                                <KeyRound className="w-2.5 h-2.5" /> PIN: {tok.passcode}
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] font-mono text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-cyan-400">{tok.token}</span>
                            <span>·</span>
                            <span className="tabular-nums">
                              Installs: {tok.downloadCount} / {tok.maxDownloads ?? '∞'}
                            </span>
                            <span>·</span>
                            <span>
                              {tok.expiresAt
                                ? isExpired
                                  ? 'Expired'
                                  : `Expires in ${Math.round((tok.expiresAt - Date.now()) / (3600 * 1000))}h`
                                : 'Never expires'}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 truncate max-w-sm mt-1 select-all font-mono">
                            {installUrl}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                        <button
                          onClick={() => copyUrl(tok)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Copy direct installation link"
                        >
                          {copiedTokenId === tok.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onOpenPortal(app.id, tok.token)}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-medium text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Preview the recipient's install landing page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Portal</span>
                        </button>

                        <button
                          onClick={() => onRevokeToken(tok.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
                          title="Revoke and disable this token immediately"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex justify-end bg-slate-950">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
