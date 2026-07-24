/**
 * Formatting utilities for Vanitas
 */

/**
 * Format number with thousands separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(Math.floor(num));
}

/**
 * Format rate (attempts per second)
 */
export function formatRate(rate: number): string {
  if (rate < 1000) return `${Math.floor(rate)}/s`;
  if (rate < 1_000_000) return `${(rate / 1000).toFixed(1)}K/s`;
  return `${(rate / 1_000_000).toFixed(2)}M/s`;
}

/**
 * Format duration in milliseconds to human-readable
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Truncate public key for display
 */
export function truncateKey(key: string, startChars = 8, endChars = 8): string {
  if (key.length <= startChars + endChars + 3) {
    return key;
  }
  return `${key.slice(0, startChars)}...${key.slice(-endChars)}`;
}

/**
 * Format bytes to human-readable
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
