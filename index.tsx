import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Detect crawlers/bots — skip React entirely and let them read the static HTML
const BOT_PATTERN = /googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|crawler|spider|bot/i;
const isBot = BOT_PATTERN.test(navigator.userAgent);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if (isBot) {
  // Bots: keep static SEO HTML visible, don't mount React at all
  // Googlebot's "Test Live URL" completes instantly with no heavy JS
  console.log('[OviGuide] Bot detected — serving static HTML only');
} else {
  // Real users: hide static SEO block and mount React app
  const seoStatic = document.getElementById('seo-static');
  if (seoStatic) seoStatic.style.display = 'none';

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}