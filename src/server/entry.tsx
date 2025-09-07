import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from '../App';

export function render(url: string): string {
  try {
    const html = renderToString(
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    );
    return html;
  } catch (error) {
    console.error('SSR render error:', error);
    
    return `
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-800 mb-4">NPM API Status Monitor</h1>
          <p class="text-gray-600 mb-4">Loading...</p>
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    `;
  }
}