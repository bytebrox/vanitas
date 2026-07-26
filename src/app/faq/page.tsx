'use client';

/**
 * FAQ Page
 * Comprehensive answers to common questions about Vanitas
 */

import { useState } from 'react';
import { Footer, FadeIn, PageIntro, ContentWithSide } from '@/components';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
  category: string;
}

const faqs: FAQItem[] = [
  // General
  {
    category: 'General',
    question: 'What is a vanity address?',
    answer: 'A vanity address is a cryptocurrency wallet address that contains a specific pattern you choose. For example, an address starting with "SOL" or ending with "DAO". It\'s purely cosmetic but can help with brand recognition or personalization.',
  },
  {
    category: 'General',
    question: 'Why would I want a vanity address?',
    answer: 'Common reasons include: brand recognition for businesses and DAOs, personal customization, easier identification of your own addresses, and professional appearance for public-facing wallets.',
  },
  {
    category: 'General',
    question: 'Are these real blockchain addresses?',
    answer:
      'Yes. Each forge produces standard keys for that chain: Solana Ed25519 (Phantom, Solflare, …), EVM secp256k1 0x addresses (MetaMask and every EVM network), Bitcoin mainnet (legacy / SegWit), and Tron Base58Check T… addresses. Import into a matching wallet and they work like any other key.',
  },
  {
    category: 'General',
    question: 'How long does it take to find an address?',
    answer:
      'It depends on the pattern length and the alphabet of that forge. Solana/Tron Base58 is roughly 58 possibilities per character; EVM hex is 16; Bitcoin formats differ by type. Short patterns take seconds; each extra character multiplies expected time. Use the on-page estimate for your pattern.',
  },
  {
    category: 'General',
    question: 'Why can\'t I use certain characters like 0, O, I, or l?',
    answer:
      'On Solana (and similar Base58 alphabets), those look-alike characters are excluded by design. EVM patterns use hex (0-9, a-f) only. Bitcoin and Tron each have their own allowed character sets — the forge UI validates as you type.',
  },
  {
    category: 'General',
    question: 'What\'s the difference between Wallet and Token Mint generator?',
    answer: 'On the Solana forge, Wallet creates a vanity address for your personal wallet. Mint creates a vanity token mint for launchpads. Technically they\'re the same Ed25519 keypairs — the difference is how you use them.',
  },
  {
    category: 'General',
    question: 'Which forges does Vanitas offer?',
    answer:
      'Nine forges: Solana (/sol), EVM (/evm — wallet, CREATE, CREATE2), Bitcoin (/btc — legacy, SegWit, Taproot), Tron (/tron), Aptos (/aptos), Sui (/sui), TON (/ton), Cardano (/cardano), and XRP (/xrp). There is also a terminal CLI via npx vanitas.',
  },
  {
    category: 'General',
    question: 'What\'s the difference between the Solana and EVM forges?',
    answer:
      'Solana uses Base58 Ed25519 addresses (Phantom, Solflare, etc.). The EVM forge uses 0x hex addresses (secp256k1). That same private key works on every EVM chain — Ethereum, BNB, Base, Arbitrum, and more — so you do not need a separate tool per network.',
  },
  {
    category: 'General',
    question: 'Is there a terminal CLI?',
    answer: (
      <div className="space-y-2">
        <p>
          Yes. Same forges, keys stay on your machine. Run{' '}
          <code className="font-mono text-ink">npx vanitas</code> for an interactive wizard, or pass
          flags (chain, prefix, threads). Package:{' '}
          <a
            href="https://www.npmjs.com/package/vanitas"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            npmjs.com/package/vanitas
          </a>
          .
        </p>
      </div>
    ),
  },

  // Ethereum / EVM
  {
    category: 'Ethereum / EVM',
    question: 'Which chains work with the EVM forge?',
    answer: (
      <div className="space-y-2">
        <p>
          Any EVM-compatible chain. A vanity wallet or contract address from the{' '}
          <a href="/evm" className="text-accent hover:underline">
            EVM forge
          </a>{' '}
          is a standard <span className="font-mono">0x</span> address. The same private key
          produces the same address on every EVM network — there is no separate key per chain.
        </p>
        <p>That includes, among others:</p>
        <ul className="list-disc list-inside space-y-1 text-muted">
          <li>Ethereum mainnet</li>
          <li>BNB Smart Chain (BSC)</li>
          <li>Base</li>
          <li>Arbitrum</li>
          <li>Optimism</li>
          <li>Polygon</li>
          <li>Avalanche C-Chain</li>
          <li>Robinhood Chain and other EVM L1s / L2s</li>
        </ul>
        <p>
          Import the key into MetaMask, Rabby, or any EVM wallet, switch the network, and the
          address matches. Contract mode (CREATE · nonce 0) follows the same rule on every EVM chain.
        </p>
      </div>
    ),
  },
  {
    category: 'Ethereum / EVM',
    question: 'Do I need a separate generator for BNB / BSC?',
    answer:
      'No. BNB Smart Chain is EVM-compatible, so addresses from the EVM forge work on BSC without any extra step. A dedicated “BNB generator” would search the same 0x space. (This does not cover old BNB Beacon Chain bech32 addresses that start with bnb1 — those are a different format.)',
  },
  {
    category: 'Ethereum / EVM',
    question: 'What can I forge on the EVM page?',
    answer:
      'Two modes: a vanity wallet (EOA) whose 0x address matches your hex pattern, or a vanity contract address derived from the first deploy of that key (CREATE with nonce 0). Both work on every EVM chain listed above.',
  },

  // Bitcoin
  {
    category: 'Bitcoin',
    question: 'What Bitcoin address types does Vanitas support?',
    answer:
      'Mainnet legacy P2PKH (addresses starting with 1) and SegWit bech32 (bc1q…). Export is WIF for wallet import. Keys stay in the browser like every other forge.',
  },
  {
    category: 'Bitcoin',
    question: 'Do I need to type the leading 1 or bc1q in the prefix?',
    answer:
      'No. For legacy, typing BTC searches for 1BTC… — the leading 1 is added automatically (you can still type 1BTC yourself). For SegWit, typing cafe searches for bc1qcafe… unless you already start the prefix with bc1.',
  },
  {
    category: 'Bitcoin',
    question: 'Can I generate Taproot or Lightning addresses?',
    answer:
      'Taproot (bc1p…) is supported on the Bitcoin forge — switch Address type to Taproot. Lightning invoices are out of scope.',
  },

  // Tron
  {
    category: 'Tron',
    question: 'What does the Tron forge produce?',
    answer:
      'Standard mainnet Base58Check addresses starting with T, from secp256k1 keys. Compatible with typical Tron wallets that accept private-key import. Typing Ace searches for TAce… — the leading T is added automatically. Leave Case sensitive off unless you need an exact letter case. Use Target → CREATE for a vanity contract address at deployer nonce 0 (same RLP math as EVM, then Tron encoding).',
  },
  {
    category: 'Tron',
    question: 'Why does Case sensitive + a lowercase prefix never find anything?',
    answer:
      'Tron addresses use Base58 with version byte 0x41. The character right after T is almost always uppercase (or a digit) — a lowercase letter there is effectively impossible. Also capital O, I, and l are not in Base58, so patterns like “TRON” cannot appear literally. Uncheck Case sensitive so oko matches TOko / Toko / etc.',
  },

  // Token Mint
  {
    category: 'Token Mint',
    question: 'What is a Token Mint address?',
    answer: 'A Token Mint address is the contract address of a token on Solana. When you launch a token, this address becomes permanent and public - it\'s what people see on DEXScreener, Birdeye, and other platforms.',
  },
  {
    category: 'Token Mint',
    question: 'How do I use the generated key on a launchpad?',
    answer: (
      <ol className="list-decimal list-inside space-y-1">
        <li>Generate your custom token address and copy the <strong>Private Key</strong></li>
        <li>On your launchpad (pump.fun, Raydium, Meteora, etc.), find the "Token Address" or "Custom Mint" section</li>
        <li>Paste the private key into the input field</li>
        <li>Complete your token launch — your token will have your custom vanity address!</li>
      </ol>
    ),
  },
  {
    category: 'Token Mint',
    question: 'Does the token address need to end with "pump"?',
    answer: 'No! That\'s a common misconception. You can use any vanity pattern you like - DOGE, MOON, your project name, etc. The "pump" suffix some tokens have is just marketing, not a technical requirement.',
  },
  {
    category: 'Token Mint',
    question: 'Can someone steal my token address before I launch?',
    answer: 'No. Your token address is protected by the private key. Without the private key, nobody can deploy a token to that address. As long as you keep your private key secret until you use it, the address is yours.',
  },
  {
    category: 'Token Mint',
    question: 'Do I need to keep the private key after launching?',
    answer: 'No. The private key is only used once during token creation. After your token is deployed, the token address becomes public and permanent. You don\'t need to store the mint keypair - it served its purpose.',
  },
  {
    category: 'Token Mint',
    question: 'Which launchpads are supported?',
    answer: 'The generated keypairs work with any Solana launchpad or DEX that supports custom mint addresses, including pump.fun, Raydium, Meteora, Jupiter Launch, and many more. The key format is standard Solana Ed25519.',
  },

  // Security
  {
    category: 'Security',
    question: 'Is this safe to use?',
    answer: 'Yes. All key generation happens entirely in your browser. Your private keys are never sent to any server. You can verify this by checking the Network tab in your browser\'s developer tools while generating.',
  },
  {
    category: 'Security',
    question: 'Do you store my private keys?',
    answer: 'No. We have no database, no backend processing, and no way to access your keys. The entire application runs client-side in your browser. Once you close the page, the keys exist only where you saved them.',
  },
  {
    category: 'Security',
    question: 'How can I verify you\'re not secretly storing my data?',
    answer: (
      <ol className="list-decimal list-inside space-y-1">
        <li>Open Developer Tools (F12)</li>
        <li>Go to the <strong>Network</strong> tab</li>
        <li>Generate an address</li>
        <li>You'll see <strong>NO requests</strong> during generation — keys are created locally</li>
      </ol>
    ),
  },
  {
    category: 'Security',
    question: 'How can I verify the keys aren\'t being sent somewhere?',
    answer: (
      <ol className="list-decimal list-inside space-y-1">
        <li>Open your browser's Developer Tools (F12)</li>
        <li>Go to the <strong>Network</strong> tab</li>
        <li>Generate an address — no outgoing requests will appear</li>
        <li>You can also disconnect from the internet and the tool will still work</li>
      </ol>
    ),
  },
  {
    category: 'Security',
    question: 'Is the code open source?',
    answer: 'Yes. The complete source code is available on GitHub at vanitas.fun. You can audit the code yourself or have someone you trust review it.',
  },
  {
    category: 'Security',
    question: 'What is the Live Audit page?',
    answer: (
      <div className="space-y-2">
        <p>
          The <a href="/audit" className="text-accent hover:underline">Live Audit</a> runs 8 real security checks directly in your browser — no server involved. It tests things like:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted">
          <li>Whether your random number generator works correctly</li>
          <li>Whether any data leaves your browser during key generation</li>
          <li>Whether the code running here matches the open-source version on GitHub</li>
          <li>Whether your browser can securely create keys for the forges</li>
        </ul>
        <p>Every test runs locally on your device. Green = good. Red = something needs attention.</p>
      </div>
    ),
  },
  {
    category: 'Security',
    question: 'Can I use this offline?',
    answer: 'Yes. Once the page is loaded, you can disconnect from the internet and continue generating addresses. This is another way to ensure your keys never leave your device.',
  },
  {
    category: 'Security',
    question: 'Are vanity addresses less secure than random addresses?',
    answer: 'No. The cryptographic security is identical. The private key is still generated randomly using secure methods (Web Crypto API). Only the public key is filtered for your pattern.',
  },
  {
    category: 'Security',
    question: 'What is the Key Security Check?',
    answer: 'After generating a key, we perform a real-time security analysis: checking entropy level (256 bits), verifying CSPRNG support, running a random sample test with 10,000 bytes, and performing a Chi-Square statistical test. This proves your browser uses proper cryptographic random number generation.',
  },
  {
    category: 'Security',
    question: 'What does the Chi-Square test measure?',
    answer: 'The Chi-Square test verifies that random numbers are uniformly distributed. We generate 10,000 random bytes and check if all 256 possible values (0-255) appear with roughly equal frequency. A Chi-Square value below 293 means excellent randomness (p > 0.05).',
  },
  {
    category: 'Security',
    question: 'What is CSPRNG?',
    answer: 'CSPRNG stands for Cryptographically Secure Pseudo-Random Number Generator. It\'s a special type of random number generator designed for security applications. Your browser\'s Web Crypto API provides hardware-backed CSPRNG, which is the gold standard for key generation.',
  },
  {
    category: 'Security',
    question: 'Where can I report a security issue?',
    answer: 'Please use GitHub Security Advisories on our repository to report vulnerabilities privately. Do not open public issues for security problems. You can also check our SECURITY.md file for our complete security policy.',
  },

  // Technical
  {
    category: 'Technical',
    question: 'How does the generation work?',
    answer:
      'Workers generate random keypairs for the selected forge, encode the public address, and check your pattern until a match is found. Solana uses Ed25519 (native Web Crypto when available). EVM, Bitcoin, and Tron use secp256k1 paths. All cores run in parallel so the UI stays responsive.',
  },
  {
    category: 'Technical',
    question: 'Why is this so fast?',
    answer:
      'Solana benefits from native Web Crypto Ed25519 (SubtleCrypto.generateKey) in modern browsers — often ~125× faster than pure JS. Other forges use optimized @noble cryptography with the same multi-worker parallelism. Chrome 113+, Firefox 129+, and Safari 17+ have the strongest Solana path.',
  },
  {
    category: 'Technical',
    question: 'What are Web Workers?',
    answer: 'Web Workers are a browser feature that allows JavaScript to run in parallel background threads. This lets us use multiple CPU cores simultaneously without freezing your browser\'s interface.',
  },
  {
    category: 'Technical',
    question: 'Why does the speed vary?',
    answer:
      'Speed depends on CPU cores, browser crypto support (especially native Ed25519 on Solana), which forge you use, and what else the machine is doing.',
  },
  {
    category: 'Technical',
    question: 'What cryptographic algorithms are used?',
    answer:
      'Solana: Ed25519. EVM and Tron: secp256k1 + keccak-256 for address derivation. Bitcoin: secp256k1 with legacy, SegWit, and Taproot encoding. Aptos and Sui: Ed25519 with chain-specific hashing. All private keys use crypto.getRandomValues() for CSPRNG entropy.',
  },
  {
    category: 'Technical',
    question: 'What if my browser doesn\'t support native Ed25519?',
    answer: 'For older browsers without native Ed25519 support, the Solana forge falls back to watsign (WebAssembly). This is still fast (~22,000 keys/sec) but about 5x slower than native. The Key Security Check will show which method your browser uses.',
  },

  // Usage
  {
    category: 'Usage',
    question: 'How do I import the generated key into Phantom?',
    answer: (
      <>
        <p className="mb-2">On the Solana forge, download the JSON file, then in Phantom:</p>
        <ol className="list-decimal list-inside space-y-1 mb-2">
          <li>Settings → Manage Accounts</li>
          <li>Add/Connect Wallet → Import Private Key</li>
          <li>Select your downloaded JSON file</li>
        </ol>
        <p>Alternatively, you can copy the private key directly and paste it. EVM / Bitcoin / Tron keys use their own export formats (hex, WIF, etc.).</p>
      </>
    ),
  },
  {
    category: 'Usage',
    question: 'What\'s the difference between TXT and JSON download?',
    answer:
      'TXT is human-readable storage. On Solana, JSON follows Solana CLI format for Phantom / Solflare / CLI import. Other forges export formats appropriate to that chain (for example WIF on Bitcoin).',
  },
  {
    category: 'Usage',
    question: 'Can I search for both prefix and suffix at the same time?',
    answer: 'Yes! Enter your desired prefix and suffix, and the tool will find an address matching both. Note that this exponentially increases the difficulty.',
  },
  {
    category: 'Usage',
    question: 'What does "case sensitive" mean?',
    answer: 'When enabled, the pattern must match exactly (e.g., "Sol" won\'t match "SOL" or "sol"). When disabled, any capitalization will match, making it faster to find addresses. Availability depends on the forge alphabet.',
  },
  {
    category: 'Usage',
    question: 'Can I pause and resume generation?',
    answer: 'You can stop generation at any time, but you cannot resume from where you left off. Each start begins a fresh search.',
  },

  // Troubleshooting
  {
    category: 'Troubleshooting',
    question: 'Why is the "Start Crunching" button disabled?',
    answer:
      'Usually because no pattern is entered, the pattern has characters invalid for that forge, or it is too long. Solana Base58 rejects 0, O, I, and l; EVM expects hex; Bitcoin/Tron validate against their alphabets.',
  },
  {
    category: 'Troubleshooting',
    question: 'My browser is freezing during generation',
    answer: 'Try reducing the number of threads/workers. Using too many on an older device can cause slowdowns. The tool should remain responsive, but reducing threads helps on lower-end hardware.',
  },
  {
    category: 'Troubleshooting',
    question: 'The generated key doesn\'t work in my wallet',
    answer: 'Make sure you\'re downloading the JSON format for wallet imports. The TXT file is for human reading. If issues persist, try copying the private key directly from the reveal option.',
  },
  {
    category: 'Troubleshooting',
    question: 'Sound notification isn\'t playing',
    answer: 'Ensure sound is enabled (toggle in the controls section). Your browser may also be blocking audio—try clicking anywhere on the page first, as browsers require user interaction before playing sounds.',
  },
];

// Group FAQs by category
const categories = [...new Set(faqs.map((faq) => faq.category))];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredFaqs = activeCategory === 'All' 
    ? faqs 
    : faqs.filter((faq) => faq.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-faq-wide.webp"
        eyebrow="Help"
        title="FAQ"
        description="Vanitas across Solana, EVM, Bitcoin, and Tron — security, formats, and usage."
      />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16">
        <ContentWithSide imageSrc="/ascii/side-landscape.webp" caption="Fig. IV — Landscape">
          <FadeIn>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-10 pb-6 border-b border-ink/15 text-micro uppercase tracking-[0.16em]">
              <button
                type="button"
                onClick={() => { setActiveCategory('All'); }}
                className={activeCategory === 'All' ? 'text-ink' : 'text-muted hover:text-ink'}
              >
                All ({faqs.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => { setActiveCategory(category); }}
                  className={activeCategory === category ? 'text-ink' : 'text-muted hover:text-ink'}
                >
                  {category} ({faqs.filter((f) => f.category === category).length})
                </button>
              ))}
            </div>
          </FadeIn>

          <div>
            {filteredFaqs.map((faq) => {
              const globalIndex = faqs.indexOf(faq);
              const isOpen = openIndex === globalIndex;

              return (
                <div key={globalIndex} className="border-b border-ink/15">
                  <button
                    type="button"
                    onClick={() => { setOpenIndex(isOpen ? null : globalIndex); }}
                    className="w-full py-5 flex items-start justify-between text-left gap-4 group"
                  >
                    <div>
                      <span className="text-micro text-muted uppercase tracking-[0.16em]">
                        {faq.category}
                      </span>
                      <h3 className="text-lg font-medium mt-1 text-ink group-hover:text-accent transition-colors">
                        {faq.question}
                      </h3>
                    </div>
                    <span className={`text-xl text-muted transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                      +
                    </span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: isOpen ? '500px' : '0',
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="pb-5 pr-8 text-muted leading-relaxed">
                      {typeof faq.answer === 'string' ? <p>{faq.answer}</p> : faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <FadeIn className="mt-14 border-t border-ink/15 pt-10">
            <p className="text-micro uppercase tracking-[0.2em] text-muted mb-3">Still stuck?</p>
            <h2 className="text-xl font-bold text-ink normal-case mb-3">Keep reading</h2>
            <p className="text-muted mb-6 max-w-xl">
              Technical detail lives in How it Works. Integrity checks live on the audit page.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-micro uppercase tracking-[0.16em]">
              <a href="/how-it-works" className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent">
                How it works
              </a>
              <a href="/audit" className="text-muted hover:text-ink">
                Live audit
              </a>
              <a href="/security" className="text-muted hover:text-ink">
                Security
              </a>
            </div>
          </FadeIn>
        </ContentWithSide>
      </main>

      <Footer />
    </div>
  );
}
