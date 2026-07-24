/**
 * Validation utilities for Vanitas
 * Validates user input for vanity address patterns
 */

import { BASE58_ALPHABET, INVALID_BASE58_CHARS, ValidationResult } from '@/types';

/**
 * Check if a string contains only valid Base58 characters
 */
export function isValidBase58(str: string): boolean {
  return str.split('').every(char => BASE58_ALPHABET.includes(char));
}

/**
 * Check if a character can be converted to a valid Base58 character
 * by changing case (e.g., 'l' -> 'L' is valid)
 */
export function canConvertToValidBase58(char: string): boolean {
  const upper = char.toUpperCase();
  const lower = char.toLowerCase();
  return BASE58_ALPHABET.includes(upper) || BASE58_ALPHABET.includes(lower);
}

/**
 * Get invalid characters from a string
 */
export function getInvalidChars(str: string): string[] {
  return str.split('').filter(char => !BASE58_ALPHABET.includes(char));
}

/**
 * Get truly invalid characters (can't be fixed by case change)
 */
export function getTrulyInvalidChars(str: string): string[] {
  return str.split('').filter(char => !canConvertToValidBase58(char));
}

/**
 * Get characters that would need case conversion
 */
export function getConvertibleChars(str: string): string[] {
  return str.split('').filter(char => 
    !BASE58_ALPHABET.includes(char) && canConvertToValidBase58(char)
  );
}

/**
 * Validate prefix pattern
 * @param caseSensitive - if false, we allow chars that are valid when case-converted
 */
export function validatePrefix(prefix: string, caseSensitive: boolean = true): ValidationResult {
  if (!prefix) {
    return { valid: true };
  }

  if (prefix.length > 8) {
    return {
      valid: false,
      error: 'Prefix too long. Maximum 8 characters (longer = exponentially slower).',
    };
  }

  // Check for truly invalid characters (can't be fixed by case change)
  const trulyInvalid = getTrulyInvalidChars(prefix);
  if (trulyInvalid.length > 0) {
    const isCommonMistake = trulyInvalid.some(c => INVALID_BASE58_CHARS.includes(c));
    return {
      valid: false,
      error: isCommonMistake
        ? `Invalid characters: ${trulyInvalid.join(', ')}. Note: 0, O, I are not in Base58.`
        : `Invalid Base58 characters: ${trulyInvalid.join(', ')}`,
    };
  }

  // For case-sensitive mode, also check convertible chars
  if (caseSensitive) {
    const convertible = getConvertibleChars(prefix);
    if (convertible.length > 0) {
      // 'l' is special - lowercase l is not in Base58, but uppercase L is
      const hasLowerL = convertible.includes('l');
      if (hasLowerL) {
        return {
          valid: false,
          error: `'l' (lowercase L) is not in Base58. Use 'L' (uppercase) instead, or enable case-insensitive matching.`,
        };
      }
      return {
        valid: false,
        error: `Invalid Base58 characters: ${convertible.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate suffix pattern
 * @param caseSensitive - if false, we allow chars that are valid when case-converted
 */
export function validateSuffix(suffix: string, caseSensitive: boolean = true): ValidationResult {
  if (!suffix) {
    return { valid: true };
  }

  if (suffix.length > 8) {
    return {
      valid: false,
      error: 'Suffix too long. Maximum 8 characters.',
    };
  }

  // Check for truly invalid characters (can't be fixed by case change)
  const trulyInvalid = getTrulyInvalidChars(suffix);
  if (trulyInvalid.length > 0) {
    const isCommonMistake = trulyInvalid.some(c => INVALID_BASE58_CHARS.includes(c));
    return {
      valid: false,
      error: isCommonMistake
        ? `Invalid characters: ${trulyInvalid.join(', ')}. Note: 0, O, I are not in Base58.`
        : `Invalid Base58 characters: ${trulyInvalid.join(', ')}`,
    };
  }

  // For case-sensitive mode, also check convertible chars
  if (caseSensitive) {
    const convertible = getConvertibleChars(suffix);
    if (convertible.length > 0) {
      const hasLowerL = convertible.includes('l');
      if (hasLowerL) {
        return {
          valid: false,
          error: `'l' (lowercase L) is not in Base58. Use 'L' (uppercase) instead, or enable case-insensitive matching.`,
        };
      }
      return {
        valid: false,
        error: `Invalid Base58 characters: ${convertible.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Characters that commonly appear at the start of Solana addresses
 * Due to how Base58 encoding works with 32-byte public keys,
 * addresses almost always start with these characters
 */
const COMMON_FIRST_CHARS = '123456789ABCDEFGH';
const RARE_FIRST_CHARS = 'JKL';
const VERY_RARE_FIRST_CHARS = 'MNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * Get the rarity multiplier for a single character at the start
 */
function getCharRarity(char: string): { multiplier: number; rarity: 'common' | 'rare' | 'very_rare' | 'extreme' } {
  // Common first characters (1-9, A-H) - normal difficulty
  if (COMMON_FIRST_CHARS.includes(char)) {
    return { multiplier: 1, rarity: 'common' };
  }
  
  // Rare first characters (J-L) - ~10x harder
  if (RARE_FIRST_CHARS.includes(char)) {
    return { multiplier: 10, rarity: 'rare' };
  }
  
  // Very rare uppercase (M-Z) - ~100x harder
  if (char >= 'M' && char <= 'Z') {
    return { multiplier: 100, rarity: 'very_rare' };
  }
  
  // Lowercase letters at start - practically impossible (~1000x+ harder)
  if (char >= 'a' && char <= 'z') {
    return { multiplier: 1000, rarity: 'extreme' };
  }
  
  return { multiplier: 1, rarity: 'common' };
}

/**
 * Get the rarity multiplier for the first character of a prefix
 * Solana addresses don't have uniformly distributed first characters
 * For case-insensitive, we use the better (less rare) variant
 */
export function getFirstCharRarity(prefix: string, caseSensitive: boolean = true): { multiplier: number; rarity: 'common' | 'rare' | 'very_rare' | 'extreme' } {
  if (!prefix || prefix.length === 0) {
    return { multiplier: 1, rarity: 'common' };
  }
  
  const firstChar = prefix[0];
  const charRarity = getCharRarity(firstChar);
  
  // For case-insensitive: check if the other case is better
  if (!caseSensitive && /[a-zA-Z]/.test(firstChar)) {
    const otherCase = firstChar === firstChar.toUpperCase() 
      ? firstChar.toLowerCase() 
      : firstChar.toUpperCase();
    const otherRarity = getCharRarity(otherCase);
    
    // Use the better (lower multiplier) variant
    if (otherRarity.multiplier < charRarity.multiplier) {
      return otherRarity;
    }
  }
  
  return charRarity;
}

/**
 * Get warning message for rare first characters
 */
export function getFirstCharWarning(prefix: string, caseSensitive: boolean): string | null {
  if (!prefix || prefix.length === 0) return null;
  
  // Use the same logic as difficulty calculation for consistency
  const { rarity, multiplier } = getFirstCharRarity(prefix, caseSensitive);
  const firstChar = prefix[0];
  
  // No warning for common characters
  if (rarity === 'common') return null;
  
  // For case-insensitive, adjust the message
  const caseNote = !caseSensitive ? ' (even with case-insensitive matching)' : '';
  
  switch (rarity) {
    case 'rare':
      return `"${firstChar.toUpperCase()}" is uncommon at the start of addresses${caseNote}. This may take ~${multiplier}x longer than expected.`;
    case 'very_rare':
      return `"${firstChar.toUpperCase()}" is very rare at the start of addresses${caseNote}. This may take ~${multiplier}x longer. Consider using it as a suffix instead.`;
    case 'extreme':
      return `Lowercase "${firstChar}" at the start is extremely rare (almost never occurs). This could take hours or days. Strongly recommend using as suffix or disabling case-sensitive matching.`;
    default:
      return null;
  }
}

/**
 * Estimate difficulty (number of attempts needed on average)
 * Each Base58 character has 58 possibilities
 */
export function estimateDifficulty(prefix: string, suffix: string, caseSensitive: boolean): number {
  const prefixLen = prefix.length;
  const suffixLen = suffix.length;
  
  if (prefixLen === 0 && suffixLen === 0) {
    return 1;
  }

  // Base58 has 58 characters
  // Case-insensitive effectively halves the alphabet for letters
  const alphabetSize = caseSensitive ? 58 : 34; // 58 or ~34 effective chars
  
  const totalChars = prefixLen + suffixLen;
  let baseDifficulty = Math.pow(alphabetSize, totalChars);
  
  // Apply first character rarity multiplier for prefix
  // Always apply this - even case-insensitive has rarity issues
  if (prefix.length > 0) {
    const { multiplier } = getFirstCharRarity(prefix, caseSensitive);
    baseDifficulty *= multiplier;
  }
  
  return baseDifficulty;
}

/**
 * Format difficulty as human-readable string
 */
export function formatDifficulty(difficulty: number): string {
  if (difficulty < 1000) return `~${difficulty} attempts`;
  if (difficulty < 1_000_000) return `~${(difficulty / 1000).toFixed(1)}K attempts`;
  if (difficulty < 1_000_000_000) return `~${(difficulty / 1_000_000).toFixed(1)}M attempts`;
  if (difficulty < 1_000_000_000_000) return `~${(difficulty / 1_000_000_000).toFixed(1)}B attempts`;
  return `~${(difficulty / 1_000_000_000_000).toFixed(1)}T attempts`;
}

/**
 * Estimate time based on difficulty and rate
 */
export function estimateTime(difficulty: number, ratePerSecond: number): string {
  if (ratePerSecond === 0) return 'Unknown';
  
  const seconds = difficulty / ratePerSecond;
  
  if (seconds < 1) return '< 1 second';
  if (seconds < 60) return `~${Math.ceil(seconds)} seconds`;
  if (seconds < 3600) return `~${Math.ceil(seconds / 60)} minutes`;
  if (seconds < 86400) return `~${Math.ceil(seconds / 3600)} hours`;
  if (seconds < 2592000) return `~${Math.ceil(seconds / 86400)} days`;
  if (seconds < 31536000) return `~${Math.ceil(seconds / 2592000)} months`;
  return `~${Math.ceil(seconds / 31536000)} years`;
}
