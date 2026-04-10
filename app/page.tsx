"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Sparkles, AlertCircle, ChevronRight, Feather } from "lucide-react";

type OptimizationResult = {
  hook: string;
  body: string;
  callToAction: string;
  hashtags: string[];
};

const PetalShower = React.memo(function PetalShower({ count = 60 }: { count?: number }) {
  const [petals, setPetals] = useState<Array<{left: string, size: number, dur: number, delay: number, type: number}>>([]);
  
  useEffect(() => {
    const arr = Array.from({ length: count }).map(() => ({
      left: `${Math.random() * 120 - 10}%`,
      size: Math.random() * 15 + 8,
      dur: Math.random() * 10 + 10,
      delay: Math.random() * -20,
      type: Math.floor(Math.random() * 3) + 1
    }));
    setPetals(arr);
  }, [count]);

  if (petals.length === 0) return null;

  return (
    <>
      {petals.map((p, i) => (
        <div key={i} 
             className="fixed bg-red-600/70 rounded-[40%_60%_70%_30%] blur-[1px] pointer-events-none shadow-[0_0_12px_rgba(220,38,38,0.5)] z-0"
             style={{
               bottom: '-10%', left: p.left, width: p.size, height: p.size * 1.5,
               animation: `wind-${p.type} ${p.dur}s infinite linear`,
               animationDelay: `${p.delay}s`
             }}
        />
      ))}
    </>
  );
});

const SplatterShower = React.memo(function SplatterShower({ count = 120 }: { count?: number }) {
  const [splatters, setSplatters] = useState<Array<{top: string, left: string, size: number, op: number, glow: boolean, rot: number, isGold: boolean, isJet: boolean, heightMult: number}>>([]);
  
  useEffect(() => {
    const arr = Array.from({ length: count }).map(() => {
      const isGold = Math.random() > 0.3; // 70% golden
      const isJet = isGold && Math.random() > 0.2; // 80% of golden elements are jets
      return {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        // Golden drops are now 70% smaller as requested (* 0.3 factor)
        size: isGold ? (Math.random() * 6 + 2) * 0.3 : Math.random() * 3 + 1,
        op: Math.random() * 0.7 + 0.3, // Brighter
        glow: Math.random() > 0.4, // More glow
        rot: Math.random() * 360,
        isGold,
        isJet,
        heightMult: isJet ? (Math.random() * 15 + 5) : (Math.random() > 0.5 ? 2 : 1)
      };
    });
    setSplatters(arr);
  }, [count]);

  if (splatters.length === 0) return null;

  return (
    <>
      {splatters.map((s, i) => (
        <div key={i} 
             className="fixed pointer-events-none z-0"
             style={{
               top: s.top, 
               left: s.left, 
               width: s.size, 
               height: s.size * s.heightMult,
               borderRadius: s.isJet ? '50% 50% 50% 50% / 80% 80% 20% 20%' : '50%',
               transform: `rotate(${s.rot}deg)`,
               opacity: s.op,
               backgroundColor: s.isGold ? '#FFD700' : '#ffffff',
               boxShadow: s.glow ? `0 0 ${s.size * 3}px ${s.isGold ? 'rgba(255,215,0,0.9)' : 'rgba(255,255,255,0.8)'}` : 'none'
             }}
        />
      ))}
    </>
  );
});

export default function Home() {
  const [postContent, setPostContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState("");
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (result && !isLoading) {
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 150); // Small delay to let Framer Motion mount the DOM elements
    }
  }, [result, isLoading]);

  const handleOptimize = async () => {
    if (!postContent.trim()) {
      setError("Veuillez coller un brouillon pour commencer.");
      return;
    }
    
    setError("");
    setIsLoading(true);
    setResult(null);

    try {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 3000));
      const responsePromise = fetch("/api/optimize-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postContent }),
      });

      const [response] = await Promise.all([responsePromise, minDelay]);

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'optimisation.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-10 overflow-hidden relative">

      <PetalShower count={80} />
      <SplatterShower count={150} />

      <main className="w-full max-w-4xl z-10 flex flex-col items-center pt-8 relative mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-[var(--color-primary-dark)]/40 bg-black/60 backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Feather className="w-4 h-4 text-[var(--color-primary-light)]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-primary-light)] font-light drop-shadow-sm">Pour ceux qui viendront après</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-200 to-neutral-600 mb-6 tracking-wide drop-shadow-2xl">
            Élevez votre voix
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto font-light leading-relaxed tracking-wide">
            Libérez vos idées de leur gravité.<br />
            Déposez vos mots dans l’ombre, et laissez l’IA les polir jusqu’à ce qu’ils deviennent lumière entre élégance fragile et impact tranchant.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="w-full bg-black/40 backdrop-blur-3xl border border-[var(--color-primary)]/10 rounded-2xl p-1 shadow-2xl relative"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-b from-[var(--color-primary)]/20 via-transparent to-red-600/10 rounded-2xl opacity-40 blur-xl pointer-events-none"></div>
          
          <div className="relative bg-[#050505]/80 rounded-xl border border-white/5 overflow-hidden flex flex-col focus-within:border-[var(--color-primary)]/40 focus-within:shadow-[0_0_20px_rgba(212,175,55,0.1)] transition-all duration-700">
            <textarea
              className="w-full bg-transparent p-8 text-neutral-100 placeholder:text-neutral-700 outline-none resize-none min-h-[220px] font-sans leading-relaxed tracking-[0.01em]"
              placeholder="Écrivez ou collez votre brouillon ici, plongez dans l'obscurité..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            
            <div className="p-4 bg-black/40 flex items-center justify-between border-t border-white/5">
              <div className="text-xs text-[var(--color-primary)]/50 flex items-center gap-2">
                {error && <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {error}</span>}
              </div>
              <button
                onClick={handleOptimize}
                disabled={isLoading}
                className="group relative px-8 py-3 bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] text-black hover:from-[var(--color-primary)] hover:to-[var(--color-primary-light)] rounded-lg font-medium tracking-widest uppercase text-xs transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] overflow-hidden border border-[var(--color-primary-light)]/30"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
                <span className="relative flex items-center gap-2">
                  {isLoading ? "Lévitation..." : "Lancer l'expédition"}
                  {!isLoading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex flex-col items-center pointer-events-none"
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" />
              
              <div className="mt-[25vh] relative flex flex-col items-center">
                <motion.div 
                  className="relative flex items-center justify-center h-64 w-32 mb-16"
                  initial={{ rotate: 90, scale: 1.45 }}
                  animate={{ y: [-15, 15, -15], rotate: 90, scale: 1.45 }}
                  transition={{ 
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <svg className="h-full drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" viewBox="0 0 100 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Blade */}
                    <polygon points="48,150 52,150 51,800 49,800" fill="url(#bladeGrad)" />
                    {/* Blood groove */}
                    <line x1="50" y1="150" x2="50" y2="700" stroke="#111" strokeWidth="1" />
                    
                    {/* Hilt / Guard (Swept Hilt Renaissance style) */}
                    <path d="M 30,150 C 10,180 30,220 48,250" fill="none" stroke="#FFD700" strokeWidth="4" />
                    <path d="M 70,150 C 90,180 70,220 52,250" fill="none" stroke="#FFD700" strokeWidth="4" />
                    <path d="M 15,190 C 15,220 48,230 48,230" fill="none" stroke="#B8860B" strokeWidth="2" />
                    <path d="M 85,190 C 85,220 52,230 52,230" fill="none" stroke="#B8860B" strokeWidth="2" />
                    <path d="M 50,150 C 70,140 85,120 70,100 C 60,85 50,100 50,100" fill="none" stroke="#FFD700" strokeWidth="3" />
                    
                    {/* Quillons (crossguard) */}
                    <line x1="15" y1="150" x2="85" y2="150" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
                    
                    {/* Handle */}
                    <rect x="44" y="60" width="12" height="90" fill="#2d2d2d" rx="2" />
                    <rect x="44" y="70" width="12" height="3" fill="#B8860B" />
                    <rect x="44" y="90" width="12" height="3" fill="#B8860B" />
                    <rect x="44" y="110" width="12" height="3" fill="#B8860B" />
                    <rect x="44" y="130" width="12" height="3" fill="#B8860B" />
                    
                    {/* Pommel */}
                    <polygon points="50,20 60,40 50,60 40,40" fill="#FFD700" />
                    <circle cx="50" cy="40" r="4" fill="#B8860B" />

                    <defs>
                      <linearGradient id="bladeGrad" x1="48" y1="150" x2="52" y2="150" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#9ca3af" />
                        <stop offset="50%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#4b5563" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Magical scanning ring on the blade */}
                  <motion.div 
                    className="absolute w-20 h-6 border-2 border-[#FFD700] rounded-full shadow-[0_0_15px_rgba(255,215,0,0.8)] z-10"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ y: [-60, 110, -60], rotateX: 65, rotateZ: 360 }}
                    transition={{ 
                      y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                      rotateZ: { duration: 2, repeat: Infinity, ease: "linear" }
                    }}
                  />
                </motion.div>
                <p className="text-[#FFD700] font-serif italic tracking-widest text-sm animate-pulse drop-shadow-md">
                  Affûtage de vos mots...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Container */}
        <AnimatePresence>
          {result && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="w-full mt-16 grid grid-cols-1 gap-8 z-10 pb-12"
            >
              <div className="flex items-center gap-4 mb-2 justify-center md:justify-start z-10">
                <Sparkles className="w-5 h-5 text-[var(--color-primary)] opacity-70" />
                <h2 className="text-2xl font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500 drop-shadow-md uppercase text-sm">
                  Création Suspendue
                </h2>
              </div>

              <ResultCard 
                title="Accroche" 
                content={result.hook} 
                onCopy={() => handleCopy(result.hook, "hook")} 
                isCopied={copiedStates["hook"]} 
              />
              
              <ResultCard 
                title="Corps du Post" 
                content={result.body} 
                onCopy={() => handleCopy(result.body, "body")} 
                isCopied={copiedStates["body"]} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
                <ResultCard 
                  title="Appel à l'action (CTA)" 
                  content={result.callToAction} 
                  onCopy={() => handleCopy(result.callToAction, "cta")} 
                  isCopied={copiedStates["cta"]} 
                />
                
                <div className="bg-[#050505]/60 backdrop-blur-3xl border border-white/5 rounded-xl overflow-hidden shadow-[0_10px_40px_rgb(0,0,0,0.8)] group hover:border-[var(--color-primary)]/20 transition-all duration-700 relative z-10">
                  <div className="px-8 py-5 bg-black/40 border-b border-white/5 flex justify-between items-center relative z-10">
                    <h3 className="font-serif text-sm tracking-[0.15em] text-neutral-300 uppercase">Résonance</h3>
                    <button 
                      onClick={() => handleCopy(result.hashtags.join(" "), "hashtags")}
                      className="text-neutral-600 hover:text-[var(--color-primary)] transition-colors p-2 rounded-md hover:bg-white/5"
                      title="Copier les hashtags"
                    >
                      {copiedStates["hashtags"] ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="p-8 flex flex-wrap gap-3 relative z-10">
                    {result.hashtags.map((tag, idx) => (
                      <span key={idx} className="px-4 py-2 bg-black/60 text-[var(--color-primary-light)] rounded-full text-xs tracking-wider border border-[var(--color-primary-dark)]/30 shadow-[inset_0_0_15px_rgba(212,175,55,0.05)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ResultCard({ title, content, onCopy, isCopied }: { title: string, content: string, onCopy: () => void, isCopied: boolean }) {
  return (
    <div className="bg-[#050505]/60 backdrop-blur-3xl border border-white/5 rounded-xl overflow-hidden shadow-[0_10px_40px_rgb(0,0,0,0.8)] group hover:border-[var(--color-primary)]/20 transition-all duration-700 relative z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
      <div className="px-8 py-5 bg-black/40 border-b border-white/5 flex justify-between items-center relative z-10">
        <h3 className="font-serif text-sm tracking-[0.15em] text-neutral-300 uppercase">{title}</h3>
        <button 
          onClick={onCopy}
          className="text-neutral-600 hover:text-[var(--color-primary)] transition-colors p-2 rounded-md hover:bg-white/5 backdrop-blur-sm"
          title="Copier"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-8 relative z-10">
        <p className="text-neutral-300 leading-loose font-light whitespace-pre-wrap tracking-wide">{content}</p>
      </div>
    </div>
  );
}
