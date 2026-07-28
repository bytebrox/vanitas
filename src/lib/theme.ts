export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'vanitas-theme';
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Inline critical dark tokens — paints correctly before globals.css loads. */
export const THEME_CRITICAL_CSS = `html.dark{color-scheme:dark;--paper:28 26 24;--beige:42 39 36;--surface:36 34 32;--ink:232 226 218;--accent:168 144 112;--muted:154 148 140;--border:74 69 64;--paper-hex:#1c1a18}html.dark body{background-color:rgb(28,26,24)!important;color:rgb(232,226,218)}`;

/**
 * Runs before first paint. Prefers localStorage, falls back to cookie,
 * writes both so the next SSR response already has class="dark".
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var k='${THEME_STORAGE_KEY}';var t=null;try{t=localStorage.getItem(k)}catch(e){}if(t!=='dark'&&t!=='light'){var c=document.cookie.match(/(?:^|; )${THEME_STORAGE_KEY}=([^;]*)/);t=c?decodeURIComponent(c[1]):'light'}var d=t==='dark';var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';try{localStorage.setItem(k,t)}catch(e){}document.cookie=k+'='+t+';path=/;max-age=${THEME_COOKIE_MAX_AGE};SameSite=Lax';var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',d?'#1C1A18':'#F5F0E8')}catch(e){document.documentElement.style.colorScheme='light'}})();`;
