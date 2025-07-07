// utils/logger.js
// Simple logger utility for consistent logging

export function logInfo(...args) {
  console.log('[INFO]', ...args);
}

export function logWarn(...args) {
  console.warn('[WARN]', ...args);
}

export function logError(...args) {
  console.error('[ERROR]', ...args);
}
