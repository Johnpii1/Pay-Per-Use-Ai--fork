import React from 'react';
import { Link } from 'react-router-dom';

const SERVICES_PREVIEW = [
    { icon: '🔍', name: 'Code Reviewer', desc: 'Expert code review for bugs, security & performance.', price: '0.5' },
    { icon: '✍️', name: 'Essay Writer', desc: 'Compelling essays crafted by award-winning AI writers.', price: '1.0' },
    { icon: '📧', name: 'Cold Email Writer', desc: 'High-converting outreach emails that get replies.', price: '0.5' },
    { icon: '🤖', name: 'Humanize Text', desc: 'Transform AI text into natural human-sounding content.', price: '0.5' },
    { icon: '📊', name: 'Data Analyst', desc: 'Surface key insights from your data like a pro.', price: '2.0' },
];

const STEPS = [
    {
        num: '01',
        title: 'Choose Service',
        desc: 'Browse our AI services and pick the one that fits your need.',
        icon: '🎯'
    },
    {
        num: '02',
        title: 'Pay with ALGO',
        desc: 'Send ALGO from your Pera Wallet to the platform address.',
        icon: '💎'
    },
    {
        num: '03',
        title: 'Verify & Get Result',
        desc: 'Paste your Transaction ID — we verify on-chain and deliver your AI response instantly.',
        icon: '⚡'
    },
];

const FEATURES = [
    { icon: '🔗', title: 'Blockchain Verified', desc: 'Every payment is verified directly on the Algorand blockchain. No middlemen.' },
    { icon: '💸', title: 'Pay Per Use', desc: 'No subscriptions, no hidden fees. Pay only for the AI services you use.' },
    { icon: '🚀', title: 'Lightning Fast', desc: 'Get your AI response in seconds after blockchain verification.' },
    { icon: '🔒', title: 'Fully Transparent', desc: 'Open, auditable transactions. Your payment trail is public and immutable.' },
    { icon: '🎯', title: 'Premium AI Models', desc: 'Powered by GPT-4o-mini with expert-tuned system prompts for each service.' },
    { icon: '🌐', title: 'No Account Needed', desc: 'Just a wallet. No email, no password, no personal data required.' },
];

const Home = () => {
    return (
        <div className="overflow-hidden">
            {/* ─── HERO ─── */}
            <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
                {/* Background effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[120px]"></div>
                    <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-brand-violet/8 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative z-10 text-center max-w-4xl">
                    <div className="section-tag animate-fade-in">Built on Algorand Blockchain</div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-[1.1] mb-6 animate-slide-up">
                        Premium AI,{' '}
                        <span className="italic gradient-text">powered by</span>{' '}
                        blockchain.
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        Pay per use in ALGO. No subscriptions. No accounts. Just verify on-chain and get your AI response instantly.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        <Link to="/services" className="btn-primary text-base">
                            Connect to your wallet →
                        </Link>
                        <a href="#how-it-works" className="btn-secondary text-base">
                            See How It Works
                        </a>
                    </div>
                </div>
            </section>

            {/* ─── ABOUT ─── */}
            <section id="about" className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="section-tag">About PayPerAI</span>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                                AI services that respect your <span className="italic text-brand-light">freedom.</span>
                            </h2>
                            <p className="text-gray-400 leading-relaxed mb-6 text-lg">
                                PayPerAI is a blockchain-gated AI platform where you pay only for what you use. No monthly subscriptions, no accounts, no data harvesting. Just connect your Algorand wallet, pay in ALGO, and get premium AI responses instantly.
                            </p>
                            <p className="text-gray-500 leading-relaxed">
                                Every transaction is verified directly on the Algorand Testnet blockchain — fully transparent, fully auditable, and impossibly fast.
                            </p>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple to-brand-violet rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative glass-card rounded-2xl p-8 flex flex-col gap-6">
                                <div className="flex gap-4 items-center mb-2">
                                    <div className="w-12 h-12 rounded-full bg-brand-purple/20 flex items-center justify-center border border-brand-purple/30">
                                        <span className="text-xl">⚡</span>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-xl">Platform Metrics</h3>
                                        <p className="text-gray-500 text-xs uppercase tracking-widest">Real-time stats</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/40 rounded-xl p-5 border border-white/5 relative overflow-hidden group/stat">
                                        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity"></div>
                                        <div className="text-xs text-gray-400 mb-2 font-medium">Available AI Services</div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-serif font-bold text-white">5</span>
                                            <span className="text-brand-light text-sm font-bold">+</span>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 rounded-xl p-5 border border-white/5 relative overflow-hidden group/stat">
                                        <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/10 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity"></div>
                                        <div className="text-xs text-gray-400 mb-2 font-medium">Minimum Cost</div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-serif font-bold text-white">0.5</span>
                                            <span className="text-brand-light text-sm font-bold">ALGO</span>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 rounded-xl p-5 border border-white/5 relative overflow-hidden group/stat">
                                        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity"></div>
                                        <div className="text-xs text-gray-400 mb-2 font-medium">Verification Time</div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-serif font-bold text-white">~3</span>
                                            <span className="text-brand-light text-sm font-bold">SEC</span>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 rounded-xl p-5 border border-white/5 relative overflow-hidden group/stat">
                                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity"></div>
                                        <div className="text-xs text-gray-400 mb-2 font-medium">Blockchain Verified</div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-serif font-bold text-green-400">100</span>
                                            <span className="text-green-500 text-sm font-bold">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS (Flow Diagram) ─── */}
            <section id="how-it-works" className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-purple/3 to-transparent"></div>
                <div className="relative z-10 max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="section-tag">Process</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                            Three effortless <span className="italic text-brand-light">steps.</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            From choosing a service to getting your AI response — it takes less than a minute.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] glow-line"></div>

                        {STEPS.map((step, i) => (
                            <div key={step.num} className="relative glass-card glass-card-hover rounded-2xl p-8 text-center transition-all duration-500" style={{ animationDelay: `${i * 0.2}s` }}>
                                <div className="text-4xl mb-4">{step.icon}</div>
                                <div className="text-xs font-bold text-brand-light tracking-wider mb-2">STEP {step.num}</div>
                                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/services" className="btn-primary">Start Now →</Link>
                    </div>
                </div>
            </section>

            {/* ─── SERVICES PREVIEW ─── */}
            <section id="services-preview" className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="section-tag">Services</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                            Premium AI at your <span className="italic text-brand-light">fingertips.</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Each service is powered by expert-tuned AI models, gated by Algorand blockchain payments.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {SERVICES_PREVIEW.map((s, i) => (
                            <div key={s.name} className="glass-card glass-card-hover rounded-2xl p-6 text-center transition-all duration-500 group cursor-pointer">
                                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{s.icon}</div>
                                <h3 className="font-bold text-white text-sm mb-2">{s.name}</h3>
                                <p className="text-gray-500 text-xs leading-relaxed mb-3">{s.desc}</p>
                                <div className="text-brand-light font-bold text-sm">{s.price} ALGO</div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <Link to="/services" className="btn-primary">Buy Access →</Link>
                    </div>
                </div>
            </section>

            {/* ─── WHY CHOOSE US ─── */}
            <section id="why-us" className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-violet/3 to-transparent"></div>
                <div className="relative z-10 max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="section-tag">Why Choose Us</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                            Built different, by <span className="italic text-brand-light">design.</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            PayPerAI replaces expensive API subscriptions with transparent, per-use blockchain payments.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((f, i) => (
                            <div key={f.title} className="glass-card glass-card-hover rounded-2xl p-8 transition-all duration-500">
                                <div className="text-3xl mb-4">{f.icon}</div>
                                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
