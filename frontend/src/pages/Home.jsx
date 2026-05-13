import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const SERVICES_PREVIEW = [
    { icon: '🔍', name: 'Code Reviewer', desc: 'Security, performance, and PR-ready code audit summaries.', price: '0.5', tag: 'Engineering' },
    { icon: '📊', name: 'Data Analyst', desc: 'Turn CSVs, numbers, and messy notes into boardroom insights.', price: '2.0', tag: 'Operations' },
    { icon: '📧', name: 'Sales Writer', desc: 'Personalized cold outreach, follow-ups, and objection handlers.', price: '0.5', tag: 'Revenue' },
    { icon: '🧾', name: 'Policy Summarizer', desc: 'Readable summaries for documents, SOPs, and compliance drafts.', price: '1.0', tag: 'Admin' },
    { icon: '🤖', name: 'Humanize Text', desc: 'Clean, natural business writing without subscription lock-in.', price: '0.5', tag: 'Content' },
];

const STEPS = [
    {
        num: '01',
        title: 'Pick a task, not a plan',
        desc: 'Choose the AI worker you need for one job: code, analysis, writing, support, or content.',
        icon: '🎯'
    },
    {
        num: '02',
        title: 'Authorize only the spend',
        desc: 'Connect Pera Wallet and approve a tiny ALGO allowance. No subscription, no surprise renewal.',
        icon: '🛡️'
    },
    {
        num: '03',
        title: 'Get the result + proof',
        desc: 'The request is unlocked after on-chain verification, so teams can audit every paid usage.',
        icon: '⚡'
    },
];

const FEATURES = [
    { icon: '🔗', title: 'On-chain proof of usage', desc: 'Each paid action is tied to Algorand verification, making spend easier to audit.' },
    { icon: '💸', title: 'True pay-per-use pricing', desc: 'A practical fit for SMEs, colleges, agencies, and teams that cannot justify monthly AI seats.' },
    { icon: '🔐', title: 'Wallet-first access', desc: 'Reduce account friction while keeping payment consent explicit through Pera Wallet.' },
    { icon: '📈', title: 'Usage dashboard', desc: 'Track balance, sessions, history, and analytics from one focused workspace.' },
    { icon: '🧠', title: 'Task-specific AI workers', desc: 'Services are packaged around real outcomes instead of a blank generic chatbot.' },
    { icon: '🧾', title: 'Enterprise-ready transparency', desc: 'Clear pricing, transaction proof, and explainable flow help build industry trust.' },
];

const ROADMAP = [
    'Industry templates for legal, HR, finance, sales, and support teams',
    'Team workspaces with roles, budgets, and monthly spend limits',
    'Invoice export with transaction IDs for accounting and audits',
    'BYOK / model choice layer so companies can choose cost vs quality',
    'Document upload, knowledge base, and private project memory',
    'Admin analytics: cost per task, saved hours, and department usage',
];

const TRUST_STATS = [
    { value: '0', label: 'subscription lock-in' },
    { value: '1 tx', label: 'verifiable payment proof' },
    { value: '24h', label: 'session allowance window' },
];

const Home = () => {
    const [isWalletConnected, setIsWalletConnected] = useState(false);

    useEffect(() => {
        setIsWalletConnected(!!sessionStorage.getItem('wallet_address'));
    }, []);

    return (
        <div className="overflow-hidden bg-neo-cream text-neo-ink">
            <section className="relative min-h-screen px-5 pt-28 pb-16 md:px-8 flex items-center">
                <div className="neo-grid absolute inset-0 opacity-70" />
                <div className="absolute left-6 top-28 hidden h-20 w-20 rotate-12 rounded-3xl border-4 border-neo-ink bg-neo-yellow shadow-brutal animate-float md:block" />
                <div className="absolute bottom-20 right-10 hidden h-24 w-24 -rotate-6 rounded-full border-4 border-neo-ink bg-neo-pink shadow-brutal animate-wiggle md:block" />
                <div className="absolute right-[18%] top-32 hidden rounded-full border-4 border-neo-ink bg-white px-5 py-3 font-black shadow-brutal-sm animate-slide-marquee lg:block">
                    ALGO in → AI out
                </div>

                <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.06fr_0.94fr]">
                    <div>
                        <div className="mb-6 inline-flex rotate-[-1deg] items-center gap-2 border-4 border-neo-ink bg-white px-4 py-2 font-black uppercase tracking-[0.18em] shadow-brutal-sm animate-fade-in">
                            <span className="h-3 w-3 rounded-full bg-neo-green ring-2 ring-neo-ink" />
                            Trustworthy Pay-Per-Use AI
                        </div>
                        <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl lg:text-8xl animate-slide-up">
                            Industrial AI without the subscription trap.
                        </h1>
                        <p className="mt-7 max-w-2xl text-lg font-semibold leading-8 text-neo-muted md:text-xl animate-slide-up" style={{ animationDelay: '0.15s' }}>
                            PayPerAI turns premium AI into auditable micro-services: connect wallet, approve a small ALGO allowance, use the exact task you need, and keep proof of every payment.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-4 animate-slide-up" style={{ animationDelay: '0.28s' }}>
                            <Link to="/dashboard" className="btn-primary text-base">
                                {isWalletConnected ? 'Open workspace →' : 'Connect wallet →'}
                            </Link>
                            <a href="#final-round" className="btn-secondary text-base">
                                Product roadmap
                            </a>
                        </div>

                        <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
                            {TRUST_STATS.map((stat) => (
                                <div key={stat.label} className="neo-card bg-white p-4 text-center">
                                    <div className="text-2xl font-black md:text-3xl">{stat.value}</div>
                                    <div className="mt-1 text-[11px] font-bold uppercase leading-4 text-neo-muted md:text-xs">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative animate-slide-up" style={{ animationDelay: '0.35s' }}>
                        <div className="neo-card rotate-1 bg-neo-ink p-4 text-white shadow-brutal-lg">
                            <div className="flex items-center justify-between border-b-4 border-white/20 pb-3">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-neo-green">Live workspace</p>
                                    <h2 className="text-2xl font-black">Pay only for tasks</h2>
                                </div>
                                <div className="rounded-full border-2 border-white bg-neo-green px-3 py-1 text-xs font-black text-neo-ink">VERIFIED</div>
                            </div>
                            <div className="mt-5 space-y-4">
                                {SERVICES_PREVIEW.slice(0, 4).map((service, index) => (
                                    <div key={service.name} className="flex items-center gap-4 rounded-2xl border-2 border-white/20 bg-white p-4 text-neo-ink shadow-[5px_5px_0_rgba(255,255,255,0.18)] transition-transform duration-300 hover:-translate-y-1" style={{ animationDelay: `${index * 0.08}s` }}>
                                        <div className="grid h-12 w-12 place-items-center rounded-xl border-3 border-neo-ink bg-neo-yellow text-2xl">{service.icon}</div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="truncate font-black">{service.name}</h3>
                                                <span className="rounded-full bg-neo-blue px-2 py-0.5 text-[10px] font-black uppercase text-white">{service.tag}</span>
                                            </div>
                                            <p className="truncate text-sm font-semibold text-neo-muted">{service.desc}</p>
                                        </div>
                                        <div className="font-black">{service.price} ALGO</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="about" className="px-5 py-20 md:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="neo-card bg-white p-8 md:p-10">
                        <span className="section-tag">Why this feels trustworthy</span>
                        <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-5xl">A product story judges can understand in 30 seconds.</h2>
                    </div>
                    <div className="neo-card bg-neo-green p-8 md:p-10">
                        <p className="text-xl font-bold leading-9">
                            Most AI products force businesses into monthly seats before they know value. PayPerAI is positioned as a metered AI utility: small teams can buy one result, verify the payment on-chain, and scale only when the task proves useful.
                        </p>
                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            {['No renewal anxiety', 'Auditable payments', 'Task-based outcomes'].map((item) => (
                                <div key={item} className="rounded-2xl border-3 border-neo-ink bg-white px-4 py-3 text-sm font-black shadow-brutal-sm">{item}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="px-5 py-20 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <span className="section-tag">How it works</span>
                            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-6xl">Three steps. Zero SaaS drama.</h2>
                        </div>
                        <p className="max-w-md text-lg font-semibold text-neo-muted">The flow is intentionally simple for demos, clients, and non-technical industry users.</p>
                    </div>
                    <div className="grid gap-5 md:grid-cols-3">
                        {STEPS.map((step, index) => (
                            <div key={step.num} className="neo-card bg-white p-7 transition-transform duration-300 hover:-rotate-1 hover:-translate-y-2" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="mb-8 flex items-center justify-between">
                                    <span className="text-5xl">{step.icon}</span>
                                    <span className="rounded-full border-3 border-neo-ink bg-neo-pink px-4 py-2 font-black">{step.num}</span>
                                </div>
                                <h3 className="text-2xl font-black">{step.title}</h3>
                                <p className="mt-3 font-semibold leading-7 text-neo-muted">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="services-preview" className="px-5 py-20 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 text-center">
                        <span className="section-tag">AI micro-services</span>
                        <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-6xl">Looks like a product, not a hackathon form.</h2>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
                        {SERVICES_PREVIEW.map((service, index) => (
                            <div key={service.name} className="neo-card bg-white p-5 transition-all duration-300 hover:-translate-y-2 hover:bg-neo-yellow" style={{ animationDelay: `${index * 0.07}s` }}>
                                <div className="mb-5 flex items-center justify-between">
                                    <span className="text-4xl">{service.icon}</span>
                                    <span className="rounded-full bg-neo-ink px-2 py-1 text-[10px] font-black uppercase text-white">{service.tag}</span>
                                </div>
                                <h3 className="text-xl font-black">{service.name}</h3>
                                <p className="mt-3 min-h-[84px] text-sm font-semibold leading-6 text-neo-muted">{service.desc}</p>
                                <div className="mt-5 border-t-3 border-neo-ink pt-4 font-black">{service.price} ALGO / request</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="why-us" className="px-5 py-20 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 max-w-3xl">
                        <span className="section-tag">Built for industry people</span>
                        <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-6xl">Trust signals that make buyers comfortable.</h2>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map((feature) => (
                            <div key={feature.title} className="neo-card bg-white p-6">
                                <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border-3 border-neo-ink bg-neo-blue text-2xl shadow-brutal-sm">{feature.icon}</div>
                                <h3 className="text-2xl font-black">{feature.title}</h3>
                                <p className="mt-3 font-semibold leading-7 text-neo-muted">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="final-round" className="px-5 py-20 md:px-8">
                <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="neo-card bg-neo-pink p-8 md:p-10">
                        <span className="section-tag !bg-white">Final round product direction</span>
                        <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-6xl">What we should refine next.</h2>
                        <p className="mt-5 text-lg font-bold leading-8">For the Goa final round pitch, the strongest story is: “AI spend control for teams that need results, not subscriptions.”</p>
                    </div>
                    <div className="neo-card bg-white p-6 md:p-8">
                        <div className="space-y-3">
                            {ROADMAP.map((item, index) => (
                                <div key={item} className="flex gap-4 rounded-2xl border-3 border-neo-ink bg-neo-cream p-4 shadow-brutal-sm transition-transform duration-300 hover:translate-x-1">
                                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neo-ink text-sm font-black text-white">{index + 1}</span>
                                    <p className="font-bold leading-7">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-5 pb-24 pt-10 md:px-8">
                <div className="neo-card mx-auto max-w-5xl bg-neo-ink p-8 text-center text-white md:p-12">
                    <p className="text-sm font-black uppercase tracking-[0.24em] text-neo-green">Competition-ready CTA</p>
                    <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-6xl">Show the judges an AI utility, not another chatbot.</h2>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link to="/dashboard" className="btn-primary">Launch workspace →</Link>
                        <a href="#how-it-works" className="btn-secondary">Replay flow</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
