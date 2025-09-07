import React, { useState } from 'react';

const TABS = [
  {
    key: 'email',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M22 6 12 13 2 6"/></svg>
    ),
    label: 'Email',
  },
  {
    key: 'sms',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 5l10 7 10-7"/></svg>
    ),
    label: 'SMS',
  },
  {
    key: 'twitter',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 5.924c-.793.352-1.645.59-2.54.698a4.48 4.48 0 001.963-2.475 8.94 8.94 0 01-2.828 1.082A4.48 4.48 0 0016.11 4c-2.48 0-4.49 2.01-4.49 4.49 0 .352.04.696.116 1.025C7.728 9.37 4.1 7.6 1.67 4.98a4.48 4.48 0 00-.61 2.26c0 1.56.793 2.94 2.01 3.75a4.48 4.48 0 01-2.03-.56v.06c0 2.18 1.55 4 3.6 4.42a4.48 4.48 0 01-2.02.08c.57 1.78 2.23 3.08 4.2 3.12A8.98 8.98 0 012 19.54a12.7 12.7 0 006.88 2.02c8.26 0 12.78-6.84 12.78-12.78 0-.2-.01-.39-.02-.58A9.1 9.1 0 0024 4.59a8.98 8.98 0 01-2.54.7z" /></svg>
    ),
    label: 'Twitter',
  },
  {
    key: 'support',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 15h.01M12 15h.01M16 15h.01"/></svg>
    ),
    label: 'Support',
  },
  {
    key: 'rss',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 11a9 9 0 019 9"/><path d="M4 4a16 16 0 0116 16"/><circle cx="5" cy="19" r="1"/></svg>
    ),
    label: 'RSS',
  },
];

const SubscribeModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [tab, setTab] = useState('email');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const enableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification('You will receive status updates!');
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-30" onClick={onClose}>
      <div
        className="mt-24 bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex border-b border-gray-200">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`flex-1 py-3 flex items-center justify-center text-xl border-r last:border-r-0 border-gray-200 ${tab === t.key ? 'bg-gray-100 font-bold' : 'bg-white'} transition`}
              onClick={() => setTab(t.key)}
              aria-label={t.label}
              type="button"
            >
              <span className="mr-2 text-lg">{t.icon}</span>
            </button>
          ))}
          <button
            className="w-12 flex items-center justify-center text-2xl text-gray-400 hover:text-gray-700 border-l border-gray-200"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {tab === 'email' && (
            <>
              <div className="mb-4 text-gray-700">
                Get email notifications whenever npm <b>creates</b>, <b>updates</b> or <b>resolves</b> an incident.<br />
                <span className="font-semibold">Email address:</span>
              </div>
              <input className="w-full border rounded px-3 py-2 mb-4" type="email" placeholder="" />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded mb-3 uppercase tracking-wide">Subscribe via Email</button>
              <div className="text-xs text-gray-500">
                By subscribing you agree to our <a href="#" className="underline">Privacy Policy</a>.<br />
                This site is protected by reCAPTCHA and the Google <a href="#" className="underline">Privacy Policy</a> and <a href="#" className="underline">Terms of Service</a> apply.
              </div>
            </>
          )}
          {tab === 'sms' && (
            <>
              <div className="mb-4 text-gray-700">
                Get text message notifications whenever npm <b>creates</b> or <b>resolves</b> an incident.<br />
                <span className="font-semibold">Country code:</span>
              </div>
              <select className="w-full border rounded px-3 py-2 mb-2">
                <option>United States (+1)</option>
                <option>India (+91)</option>
                <option>United Kingdom (+44)</option>
                <option>Other</option>
              </select>
              <span className="font-semibold">Phone number:</span>
              <input className="w-full border rounded px-3 py-2 mb-4" type="tel" placeholder="" />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded mb-3 uppercase tracking-wide">Subscribe via Text Message</button>
              <div className="text-xs text-gray-500">
                Message and data rates may apply. By subscribing you agree to our <a href="#" className="underline">Privacy Policy</a>, the Atlassian <a href="#" className="underline">Terms of Service</a>, and the Atlassian <a href="#" className="underline">Privacy Policy</a>.<br />
                This site is protected by reCAPTCHA and the Google <a href="#" className="underline">Privacy Policy</a> and <a href="#" className="underline">Terms of Service</a> apply.
              </div>
            </>
          )}
          {tab === 'twitter' && (
            <div className="flex items-center space-x-2">
              <a href="https://twitter.com/npmstatus" target="_blank" rel="noopener noreferrer" className="bg-black text-white rounded-full px-4 py-2 font-bold flex items-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-2"><path d="M22.46 5.924c-.793.352-1.645.59-2.54.698a4.48 4.48 0 001.963-2.475 8.94 8.94 0 01-2.828 1.082A4.48 4.48 0 0016.11 4c-2.48 0-4.49 2.01-4.49 4.49 0 .352.04.696.116 1.025C7.728 9.37 4.1 7.6 1.67 4.98a4.48 4.48 0 00-.61 2.26c0 1.56.793 2.94 2.01 3.75a4.48 4.48 0 01-2.03-.56v.06c0 2.18 1.55 4 3.6 4.42a4.48 4.48 0 01-2.02.08c.57 1.78 2.23 3.08 4.2 3.12A8.98 8.98 0 012 19.54a12.7 12.7 0 006.88 2.02c8.26 0 12.78-6.84 12.78-12.78 0-.2-.01-.39-.02-.58A9.1 9.1 0 0024 4.59a8.98 8.98 0 01-2.54.7z" /></svg>
                Follow @npmstatus
              </a>
              <span>or <a href="https://twitter.com/npmstatus" className="text-blue-600 underline">view our profile.</a></span>
            </div>
          )}
          {tab === 'support' && (
            <div className="text-center text-gray-700">
              Visit our <a href="https://www.npmjs.com/support" className="text-blue-600 underline">support site</a>.
            </div>
          )}
          {tab === 'rss' && (
            <div className="text-center text-gray-700">
              Get the <a href="#" className="text-blue-600 underline">Atom Feed</a> or <a href="#" className="text-blue-600 underline">RSS Feed</a>.
            </div>
          )}
          <button onClick={enableNotifications} disabled={notificationsEnabled} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded mb-3 uppercase tracking-wide">
            {notificationsEnabled ? 'Notifications Enabled' : 'Enable Browser Notifications'}
          </button>
          {notificationsEnabled && (
            <div className="text-center text-gray-700">
              You will receive status updates via browser notifications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal; 