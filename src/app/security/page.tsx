/**
 * Security Page
 * Comprehensive explanation of Vanitas's security architecture
 */

import { Footer, PageIntro, ContentWithSide } from '@/components';

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-security-wide.webp"
        eyebrow="Security"
        title="Your keys never leave this browser"
        description="No exceptions. No backdoors. Client-side generation, zero storage, verifiable in DevTools and on the live audit page."
      >
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-micro uppercase tracking-[0.16em] text-muted">
          <a href="#architecture" className="hover:text-ink">01 Architecture</a>
          <a href="#storage" className="hover:text-ink">02 Storage</a>
          <a href="#crypto" className="hover:text-ink">03 Crypto</a>
          <a href="#headers" className="hover:text-ink">04 Headers</a>
          <a href="#verify" className="hover:text-ink">05 Verify</a>
          <a href="#faq" className="hover:text-ink">06 FAQ</a>
        </div>
      </PageIntro>

      <main className="flex-1 px-5 sm:px-8 lg:px-8 xl:px-12 pb-16">
        <ContentWithSide imageSrc="/ascii/side-aqueduct.webp" caption="Fig. V — Aqueduct">
          <div className="space-y-16">

          {/* TL;DR */}
          <section className="border-y border-ink/15 py-8">
            <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">TL;DR</p>
            <ul className="space-y-3 text-muted">
              <li><strong className="text-ink">Keys generate in your browser</strong> — never on our servers</li>
              <li><strong className="text-ink">We cannot see your keys</strong> — we neither receive nor store them</li>
              <li><strong className="text-ink">Works offline</strong> — disconnect after load to prove it</li>
              <li><strong className="text-ink">Open source</strong> — auditable code</li>
              <li><strong className="text-ink">Live auditable</strong> — run <a href="/audit" className="text-accent hover:text-ink">8 checks</a> in-browser</li>
            </ul>
          </section>

          {/* Architecture */}
          <section id="architecture" className="scroll-mt-8">
            <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">01</p>
            <h2 className="text-2xl font-bold mb-6 text-ink normal-case">Where your keys are generated</h2>
            
            <div className="mb-8 space-y-6 font-mono text-sm">
              <div className="border border-ink/20 py-6 px-5">
                <p className="text-micro uppercase tracking-[0.18em] text-ink mb-4">Your browser</p>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="border-t border-ink/15 pt-3">
                    <p className="text-ink">Main thread</p>
                    <p className="text-muted text-micro mt-1">UI / React</p>
                  </div>
                  <div className="border-t border-ink/15 pt-3">
                    <p className="text-ink">Web Workers</p>
                    <p className="text-muted text-micro mt-1">W1 · W2 · … · Wn — Ed25519</p>
                  </div>
                </div>
                <p className="text-accent text-micro uppercase tracking-[0.14em]">Keys generated here — your CPU, your memory</p>
              </div>

              <p className="text-center text-micro text-muted uppercase tracking-[0.14em]">
                ↑ static files only · no key data ↓
              </p>

              <div className="border border-ink/15 py-6 px-5 bg-beige/30">
                <p className="text-micro uppercase tracking-[0.18em] text-muted mb-4">Our server</p>
                <p className="text-muted">Delivers HTML/JS/CSS · cannot compute keys · no memory access · no key access</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-sm">
              <div>
                <p className="text-micro uppercase tracking-[0.18em] text-ink mb-3">In your browser</p>
                <ul className="space-y-2 text-muted">
                  <li>All JavaScript execution</li>
                  <li>All cryptography</li>
                  <li>RNG and keypair creation</li>
                  <li>Pattern matching & downloads</li>
                </ul>
              </div>
              <div>
                <p className="text-micro uppercase tracking-[0.18em] text-muted mb-3">Server cannot</p>
                <ul className="space-y-2 text-muted">
                  <li>See private keys</li>
                  <li>Access browser memory</li>
                  <li>Intercept generated keys</li>
                  <li>Track your patterns</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Storage */}
          <section id="storage" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-6 text-ink normal-case">
              <span className="text-accent">02</span>
              What We Store (Nothing)
            </h2>

            <div className="border-y border-ink/15 py-6 mb-6">
              <h3 className="font-bold mb-4">Zero Data Storage</h3>
              <p className="text-muted mb-4">
                Vanitas stores <strong>absolutely no data</strong>. There is no database, 
                no analytics, no tracking. The application runs entirely in your browser.
              </p>
            </div>

            <div className="border-t border-ink/15 pt-5">
              <h3 className="font-bold text-ink mb-3">We do NOT store:</h3>
              <ul className="space-y-2 text-sm text-muted">
                <li>• No private keys</li>
                <li>• No public keys / addresses</li>
                <li>• No patterns searched</li>
                <li>• No IP addresses</li>
                <li>• No timestamps</li>
                <li>• No user identifiers</li>
                <li>• No cookies</li>
                <li>• No analytics</li>
              </ul>
            </div>
          </section>

          {/* Cryptography */}
          <section id="crypto" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-6 text-ink normal-case">
              <span className="text-accent">03</span>
              Cryptographic Security
            </h2>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-ink/20">
                <thead>
                  <tr className="bg-ink/5">
                    <th className="border border-ink/20 p-3 text-left">Component</th>
                    <th className="border border-ink/20 p-3 text-left">Technology</th>
                    <th className="border border-ink/20 p-3 text-left">Standard</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-ink/20 p-3 font-medium">Key Algorithm</td>
                    <td className="border border-ink/20 p-3">Ed25519</td>
                    <td className="border border-ink/20 p-3">RFC 8032</td>
                  </tr>
                  <tr className="bg-ink/5">
                    <td className="border border-ink/20 p-3 font-medium">Key Generation</td>
                    <td className="border border-ink/20 p-3">Native Web Crypto API</td>
                    <td className="border border-ink/20 p-3">W3C Standard</td>
                  </tr>
                  <tr>
                    <td className="border border-ink/20 p-3 font-medium">Random Numbers</td>
                    <td className="border border-ink/20 p-3">crypto.getRandomValues()</td>
                    <td className="border border-ink/20 p-3">Hardware-backed CSPRNG</td>
                  </tr>
                  <tr className="bg-ink/5">
                    <td className="border border-ink/20 p-3 font-medium">Entropy</td>
                    <td className="border border-ink/20 p-3">256 bits</td>
                    <td className="border border-ink/20 p-3">Industry standard</td>
                  </tr>
                  <tr>
                    <td className="border border-ink/20 p-3 font-medium">Address Encoding</td>
                    <td className="border border-ink/20 p-3">Base58</td>
                    <td className="border border-ink/20 p-3">Solana compatible</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-5">
              <h3 className="font-bold text-blue-800 mb-3">Key Security Check</h3>
              <p className="text-sm text-blue-900 mb-3">
                After generating a key, Vanitas performs real-time security analysis:
              </p>
              <ul className="space-y-1 text-sm text-blue-900">
                <li>• <strong>Entropy verification</strong> – Confirms 256-bit entropy</li>
                <li>• <strong>CSPRNG check</strong> – Verifies cryptographically secure RNG</li>
                <li>• <strong>Chi-Square test</strong> – Statistical verification of randomness</li>
                <li>• <strong>Distribution analysis</strong> – Ensures uniform byte distribution</li>
              </ul>
            </div>
          </section>


          {/* HTTP Headers */}
          <section id="headers" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-6 text-ink normal-case">
              <span className="text-accent">04</span>
              HTTP Security Headers
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-ink/20">
                <thead>
                  <tr className="bg-ink/5">
                    <th className="border border-ink/20 p-3 text-left">Header</th>
                    <th className="border border-ink/20 p-3 text-left">Value</th>
                    <th className="border border-ink/20 p-3 text-left">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-ink/20 p-3 font-mono text-sm">Content-Security-Policy</td>
                    <td className="border border-ink/20 p-3 text-sm">Strict</td>
                    <td className="border border-ink/20 p-3 text-sm">Prevents XSS, blocks external scripts</td>
                  </tr>
                  <tr className="bg-ink/5">
                    <td className="border border-ink/20 p-3 font-mono text-sm">Strict-Transport-Security</td>
                    <td className="border border-ink/20 p-3 text-sm">max-age=31536000</td>
                    <td className="border border-ink/20 p-3 text-sm">Forces HTTPS for 1 year (HSTS)</td>
                  </tr>
                  <tr>
                    <td className="border border-ink/20 p-3 font-mono text-sm">X-Frame-Options</td>
                    <td className="border border-ink/20 p-3 text-sm">DENY</td>
                    <td className="border border-ink/20 p-3 text-sm">Prevents clickjacking</td>
                  </tr>
                  <tr className="bg-ink/5">
                    <td className="border border-ink/20 p-3 font-mono text-sm">X-Content-Type-Options</td>
                    <td className="border border-ink/20 p-3 text-sm">nosniff</td>
                    <td className="border border-ink/20 p-3 text-sm">Prevents MIME sniffing</td>
                  </tr>
                  <tr>
                    <td className="border border-ink/20 p-3 font-mono text-sm">Referrer-Policy</td>
                    <td className="border border-ink/20 p-3 text-sm">strict-origin</td>
                    <td className="border border-ink/20 p-3 text-sm">Limits referrer information</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* How to Verify */}
          <section id="verify" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-6 text-ink normal-case">
              <span className="text-accent">05</span>
              How to Verify Yourself
            </h2>

            <p className="text-muted mb-6">
              Don't trust us – verify it yourself. Here are three methods to confirm 
              that your keys never leave your browser:
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Method 1 */}
              <div className="border-t border-ink/15 pt-6 flex flex-col">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="text-micro text-accent font-mono mr-2">1</span>
                  Network Monitor
                </h3>
                <ol className="space-y-2 text-sm flex-1">
                  <li>1. Open DevTools (F12)</li>
                  <li>2. Go to <strong>Network</strong> tab</li>
                  <li>3. Clear existing requests</li>
                  <li>4. Generate an address</li>
                  <li>5. Watch: <strong>Zero requests</strong></li>
                </ol>
                <div className="border-t border-ink/10 pt-3 mt-4 text-xs text-muted">
                  <strong>Result:</strong> No key data ever transmitted
                </div>
              </div>

              {/* Method 2 */}
              <div className="border-t border-ink/15 pt-6 flex flex-col">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="text-micro text-accent font-mono mr-2">2</span>
                  Offline Test
                </h3>
                <ol className="space-y-2 text-sm flex-1">
                  <li>1. Load Vanitas</li>
                  <li>2. <strong>Go offline</strong> (airplane mode)</li>
                  <li>3. Generate an address</li>
                  <li>4. It works!</li>
                </ol>
                <div className="border-t border-ink/10 pt-3 mt-4 text-xs text-muted">
                  <strong>Result:</strong> No server needed for keys
                </div>
              </div>

              {/* Method 3 */}
              <div className="border-t border-ink/15 pt-6 flex flex-col">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="text-micro text-accent font-mono mr-2">3</span>
                  Code Review
                </h3>
                <ol className="space-y-2 text-sm flex-1">
                  <li>1. Visit <a href="https://vanitas.fun" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">GitHub</a></li>
                  <li>2. Check <code className="bg-ink/10 px-1 text-xs">vanity.worker.source.ts</code></li>
                  <li>3. Review the source code</li>
                  <li>4. Verify yourself</li>
                </ol>
                <div className="border-t border-ink/10 pt-3 mt-4 text-xs text-muted">
                  <strong>Result:</strong> All code is auditable
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-6 text-ink normal-case">
              <span className="text-accent">06</span>
              Common Questions
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-ink/20 p-5">
                <h3 className="font-bold mb-2">Can you steal my keys?</h3>
                <p className="text-sm text-muted">
                  No. We physically cannot access your keys because they never leave your browser. 
                  There is no code path that transmits key data to any server. You can verify 
                  this by auditing our source code or monitoring network traffic.
                </p>
              </div>
              <div className="border border-ink/20 p-5">
                <h3 className="font-bold mb-2">What if your servers get hacked?</h3>
                <p className="text-sm text-muted">
                  Even if our servers were compromised, attackers could not access your keys. 
                  The server only delivers static files – it never receives or processes keys. 
                  Your keys exist only in your browser's memory.
                </p>
              </div>
              <div className="border border-ink/20 p-5">
                <h3 className="font-bold mb-2">Are vanity addresses less secure?</h3>
                <p className="text-sm text-muted">
                  No. The cryptographic security is identical to random addresses. The private 
                  key is generated using the same secure methods. Only the resulting public 
                  key (address) is filtered for your pattern.
                </p>
              </div>
              <div className="border border-ink/20 p-5">
                <h3 className="font-bold mb-2">Do you collect any data?</h3>
                <p className="text-sm text-muted">
                  No. Vanitas stores zero data. There is no database, no analytics, 
                  no tracking. Everything runs entirely in your browser.
                </p>
              </div>
              <div className="border border-ink/20 p-5 md:col-span-2">
                <h3 className="font-bold mb-2">Should I use this for large amounts?</h3>
                <p className="text-sm text-muted">
                  For significant amounts, we recommend additional precautions: generate keys 
                  while offline, verify the key works with a small test transaction first, 
                  and consider using a hardware wallet for long-term storage.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-ink/15 pt-10">
            <p className="text-micro uppercase tracking-[0.2em] text-muted mb-3">Still questions?</p>
            <h2 className="text-xl font-bold text-ink normal-case mb-3">Talk to us carefully</h2>
            <p className="text-muted mb-6 max-w-xl leading-relaxed">
              Security comes first. For vulnerabilities, use responsible disclosure — not public issues.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-micro uppercase tracking-[0.16em]">
              <a href="/audit" className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent">
                Live audit
              </a>
              <a href="/faq" className="text-muted hover:text-ink">
                FAQ
              </a>
            </div>
          </section>

          </div>
        </ContentWithSide>
      </main>

      <Footer />
    </div>
  );
}
