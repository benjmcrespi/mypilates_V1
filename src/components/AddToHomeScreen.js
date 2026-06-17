"use client";
import { useEffect, useState } from 'react';

const DISMISS_KEY = 'a2hs-dismissed';

export default function AddToHomeScreen() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState(null); // 'ios' | 'android'
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Already installed / running standalone. Nothing to prompt.
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    const ua = window.navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua) && !window.MSStream;

    if (isIOS) {
      setPlatform('ios');
      setVisible(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform('android');
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    dismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 bg-bark text-linen rounded-xl border border-white/10 shadow-lg p-4 flex items-start gap-3 font-sans">
      <div className="flex-1">
        {platform === 'ios' ? (
          <p className="text-sm">
            Add Instruktor to your home screen. Tap{' '}
            <span className="font-bold">Share</span> then{' '}
            <span className="font-bold">Add to Home Screen</span>.
          </p>
        ) : (
          <p className="text-sm">
            Install Instruktor for quick access from your home screen.
          </p>
        )}
        <div className="mt-3 flex gap-3">
          {platform === 'android' && (
            <button
              onClick={handleInstall}
              className="bg-clay text-linen text-sm font-semibold px-4 py-2 rounded-xl"
            >
              Install
            </button>
          )}
          <button
            onClick={dismiss}
            className="text-sm font-medium text-smoke hover:text-linen transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
