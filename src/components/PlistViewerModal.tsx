import React, { useState } from 'react';
import { AppPackage } from '../types';
import { generateApplePlistXml, generateItmsInstallLink } from '../services/appData';
import { FileCode, Copy, Check, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface PlistViewerModalProps {
  app: AppPackage;
  isOpen: boolean;
  onClose: () => void;
}

export const PlistViewerModal: React.FC<PlistViewerModalProps> = ({
  app,
  isOpen,
  onClose,
}) => {
  const [copiedPlist, setCopiedPlist] = useState(false);
  const [copiedItms, setCopiedItms] = useState(false);

  if (!isOpen) return null;

  const xmlContent = generateApplePlistXml(app);
  const itmsLink = generateItmsInstallLink(app);

  const copyPlist = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopiedPlist(true);
    setTimeout(() => setCopiedPlist(false), 2000);
  };

  const copyItms = () => {
    navigator.clipboard.writeText(itmsLink);
    setCopiedItms(true);
    setTimeout(() => setCopiedItms(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Apple OTA Wireless Manifest</h3>
              <p className="text-xs text-slate-400 font-mono">manifest.plist · itms-services protocol</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Apple Wireless App Distribution Specification</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              When an iOS user taps an <code className="text-cyan-300 font-mono">itms-services://</code> link, MobileSafari triggers the iOS Springboard daemon. Springboard fetches this XML manifest over HTTPS to verify the bundle ID, version, and signing certificate before downloading the payload.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300">Generated Manifest XML:</span>
              <button
                onClick={copyPlist}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {copiedPlist ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPlist ? 'Copied' : 'Copy XML'}</span>
              </button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 overflow-x-auto max-h-72 text-[11px] font-mono text-slate-300 selection:bg-cyan-500/20">
              <pre className="whitespace-pre">{xmlContent}</pre>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300">Direct Protocol Link:</span>
              <button
                onClick={copyItms}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {copiedItms ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedItms ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono text-cyan-300 break-all select-all">
              {itmsLink}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex justify-end bg-slate-950">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
