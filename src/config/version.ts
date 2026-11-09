import packageInfo from '../../package.json';

// Version retrieved dynamically from project package.json / Vite build definitions
export const APP_VERSION: string = 
  typeof __APP_VERSION__ !== 'undefined' && __APP_VERSION__
    ? __APP_VERSION__
    : packageInfo.version;

export const APP_NAME: string = packageInfo.name || 'healthcheck';
export const APP_DESCRIPTION: string = packageInfo.description || 'Healthcheck observatory';
