import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    deleteConversation,
    depositWalletFunds,
    getConversationHistory,
    getConversationMessages,
    getPaymentInfo,
    getServices,
    getUserAnalytics,
    getUserProfile,
    getWalletPrepayBalance,
    sendChat,
} from '../api/client';
import { useSiwa } from '../hooks/useSiwa';

const demoUsage = [
    { day: 'Mon', tokens: 1800, cost: 0.42 },
    { day: 'Tue', tokens: 2600, cost: 0.58 },
    { day: 'Wed', tokens: 1400, cost: 0.31 },
    { day: 'Thu', tokens: 3200, cost: 0.76 },
    { day: 'Fri', tokens: 2400, cost: 0.55 },
    { day: 'Sat', tokens: 4100, cost: 0.93 },
    { day: 'Sun', tokens: 2900, cost: 0.62 },
];

const modelMix = [
    { name: 'GPT-4o', pct: 46, color: 'bg-neo-blue' },
    { name: 'Claude', pct: 31, color: 'bg-neo-pink' },
    { name: 'Gemini', pct: 23, color: 'bg-neo-green' },
];

const quickPrompts = [
    'Summarize this customer feedback and estimate output cost.',
    'Draft a landing page hero for a pay-per-use AI SaaS.',
    'Analyze my daily AI spend and suggest budget controls.',
    'Create a concise sales email for wallet-based AI access.',
];

const formatAlgo = (value) => Number(value || 0).toFixed(3);
const estimateTokens = (text) => Math.max(18, Math.ceil((text || '').trim().split(/\s+/).filter(Boolean).length * 1.45));

const DashboardPage = () => {
    const navigate = useNavigate();
    const { signOut } = useSiwa();
    const walletAddress = sessionStorage.getItem('wallet_address');

    const [user, setUser] = useState(null);
    const [services, setServices] = useState([]);
    const [activeService, setActiveService] = useState(null);
    const [history, setHistory] = useState([]);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [balance, setBalance] = useState(0);
    const [visualBalance, setVisualBalance] = useState(0);
    const [isDepositing, setIsDepositing] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [pendingPrompt, setPendingPrompt] = useState('');
    const [stats, setStats] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState(null);
    const [toast, setToast] = useState(null);
    const [liveUsage, setLiveUsage] = useState({ tokens: 0, cost: 0, previousBalance: 0, nextBalance: 0 });
    const [localTransactions, setLocalTransactions] = useState([]);

    const chatContainerRef = useRef(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        if (!walletAddress) {
            navigate('/');
            return;
        }

        const initDashboard = async () => {
            try {
                const profile = await getUserProfile(walletAddress);
                setUser(profile);

                const srvs = await getServices();
                setServices(srvs);
                if (srvs.length > 0) setActiveService(srvs[0]);

                const hist = await getConversationHistory(walletAddress);
                setHistory(hist);

                const bal = await getWalletPrepayBalance(walletAddress);
                setBalance(bal.balance_algo);
                setVisualBalance(bal.balance_algo);

                try {
                    const analytics = await getUserAnalytics(walletAddress);
                    setStats(analytics);
                } catch (_) { /* analytics are optional for the demo UI */ }
            } catch (err) {
                console.error('Dashboard init error:', err);
                if (err.message === 'User not found') navigate('/onboarding');
                else if (err.message?.includes('Not authenticated')) {
                    sessionStorage.clear();
                    navigate('/');
                }
            } finally {
                setLoading(false);
            }
        };

        initDashboard();
    }, [walletAddress, navigate]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, chatLoading]);

    useEffect(() => {
        const tokens = estimateTokens(input);
        const unitPrice = Number(activeService?.price_algo || 0.003);
        const cost = input.trim() ? Math.max(0.001, tokens * unitPrice * 0.008) : 0;
        setLiveUsage({
            tokens: input.trim() ? tokens : 0,
            cost,
            previousBalance: visualBalance,
            nextBalance: Math.max(0, visualBalance - cost),
        });
    }, [input, activeService, visualBalance]);

    const totalTokens = stats?.tokens_used_30d || demoUsage.reduce((sum, day) => sum + day.tokens, 0);
    const totalSpent = stats?.spent_algo_30d || demoUsage.reduce((sum, day) => sum + day.cost, 0);
    const averageSession = stats?.avg_algo_per_session || (history.length ? totalSpent / history.length : 0.37);
    const maxTokens = Math.max(...demoUsage.map((day) => day.tokens));

    const recentTransactions = useMemo(() => {
        const historyRows = history.slice(0, 4).map((item, index) => ({
            id: item.conversation_id || index,
            label: `${item.service_id || 'AI'} session`,
            amount: -(Number(activeService?.price_algo || 0.05) + index * 0.011),
            time: index === 0 ? 'Just now' : `${index + 1}h ago`,
            type: 'usage',
        }));

        return [
            ...localTransactions,
            ...historyRows,
            { id: 'wallet-topup', label: 'Wallet top-up', amount: 5, time: 'Today', type: 'deposit' },
        ].slice(0, 5);
    }, [activeService?.price_algo, history, localTransactions]);

    const loadConversation = async (convId, srvId) => {
        setChatLoading(true);
        setActiveConversationId(convId);
        const srv = services.find((s) => s.id === srvId);
        if (srv) setActiveService(srv);

        try {
            const data = await getConversationMessages(walletAddress, convId);
            setMessages(data.messages);
            setIsSidebarOpen(false);
        } catch (err) {
            console.error(err);
            showToast('Could not load that conversation.', 'error');
        } finally {
            setChatLoading(false);
        }
    };

    const handleNewChat = () => {
        setActiveConversationId(null);
        setMessages([]);
        setInput('');
        setIsSidebarOpen(false);
    };

    const executeSend = async (promptText) => {
        const tokens = estimateTokens(promptText);
        const unitPrice = Number(activeService?.price_algo || 0.003);
        const cost = Math.max(0.001, tokens * unitPrice * 0.008);
        const previousBalance = visualBalance;
        const nextBalance = Math.max(0, previousBalance - cost);

        setLiveUsage({ tokens, cost, previousBalance, nextBalance });
        setVisualBalance(nextBalance);
        setLocalTransactions((prev) => [{
            id: `${Date.now()}-${tokens}`,
            label: `${activeService?.name || 'AI'} prompt`,
            amount: -cost,
            time: 'Just now',
            type: 'usage',
        }, ...prev].slice(0, 4));

        const userMsg = { role: 'user', content: promptText };
        setMessages((prev) => [...prev, userMsg]);
        setChatLoading(true);

        try {
            const res = await sendChat(activeService.id, walletAddress, promptText, activeConversationId);
            setActiveConversationId(res.conversation_id);
            setMessages(res.messages);

            const bal = await getWalletPrepayBalance(walletAddress);
            setBalance(bal.balance_algo);
            setVisualBalance(bal.balance_algo);

            const hist = await getConversationHistory(walletAddress);
            setHistory(hist);

            const analytics = await getUserAnalytics(walletAddress);
            setStats(analytics);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || !activeService) return;

        const currentInput = input;
        setInput('');

        if (balance < 0.5) {
            setPendingPrompt(currentInput);
            setIsAuthModalOpen(true);
            return;
        }

        await executeSend(currentInput);
    };

    const handleAuthorizeSession = async () => {
        try {
            if (!activeService) return;

            const amount = 5.0;
            setIsDepositing(true);
            const { PeraWalletConnect } = await import('@perawallet/connect');
            const algosdk = (await import('algosdk')).default;
            const ALGOD_API = 'https://testnet-api.algonode.cloud';

            const pw = new PeraWalletConnect();
            let accounts = [];
            try { accounts = await pw.reconnectSession(); } catch (_) { /* connect below */ }
            if (!accounts || !accounts.length) accounts = await pw.connect();
            if (accounts[0] !== walletAddress) throw new Error('Wallet mismatch.');

            const paymentInfo = await getPaymentInfo(activeService.id);
            const toAddr = paymentInfo.contract_address;

            const algodClient = new algosdk.Algodv2('', ALGOD_API, '');
            const params = await algodClient.getTransactionParams().do();
            const amountMicro = Math.floor(amount * 1_000_000);

            const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: walletAddress,
                receiver: toAddr,
                amount: amountMicro,
                suggestedParams: params,
            });

            const method = new algosdk.ABIMethod({
                name: 'deposit',
                args: [{ type: 'pay', name: 'payment' }],
                returns: { type: 'uint64' },
            });

            const dummySigner = algosdk.makeBasicAccountTransactionSigner({
                addr: walletAddress,
                sk: new Uint8Array(64),
            });

            const atc = new algosdk.AtomicTransactionComposer();
            atc.addMethodCall({
                appID: parseInt(paymentInfo.app_id),
                method,
                methodArgs: [{ txn: payTxn, signer: dummySigner }],
                sender: walletAddress,
                suggestedParams: params,
                signer: dummySigner,
                boxes: [{
                    appIndex: parseInt(paymentInfo.app_id),
                    name: new Uint8Array([...new TextEncoder().encode('b_'), ...algosdk.decodeAddress(walletAddress).publicKey]),
                }],
            });

            const sessionMethod = new algosdk.ABIMethod({
                name: 'start_session',
                args: [{ type: 'uint64', name: 'max_spend' }, { type: 'uint64', name: 'expiry_time' }],
                returns: { type: 'bool' },
            });

            const expiryTime = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
            const maxSpend = amountMicro;

            atc.addMethodCall({
                appID: parseInt(paymentInfo.app_id),
                method: sessionMethod,
                methodArgs: [maxSpend, expiryTime],
                sender: walletAddress,
                suggestedParams: params,
                signer: dummySigner,
                boxes: [
                    { appIndex: parseInt(paymentInfo.app_id), name: new Uint8Array([...new TextEncoder().encode('sb_'), ...algosdk.decodeAddress(walletAddress).publicKey]) },
                    { appIndex: parseInt(paymentInfo.app_id), name: new Uint8Array([...new TextEncoder().encode('se_'), ...algosdk.decodeAddress(walletAddress).publicKey]) },
                    { appIndex: parseInt(paymentInfo.app_id), name: new Uint8Array([...new TextEncoder().encode('b_'), ...algosdk.decodeAddress(walletAddress).publicKey]) },
                ],
            });

            const group = atc.buildGroup().map((t) => t.txn);
            const txId = group[0].txID().toString();
            const signed = await pw.signTransaction([group.map((txn) => ({ txn, signers: [walletAddress] }))]);
            await algodClient.sendRawTransaction(signed).do();
            await algosdk.waitForConfirmation(algodClient, txId, 4);
            await depositWalletFunds(walletAddress, txId);

            const bal = await getWalletPrepayBalance(walletAddress);
            setBalance(bal.balance_algo);
            setVisualBalance(bal.balance_algo);

            setIsAuthModalOpen(false);
            if (pendingPrompt) {
                await executeSend(pendingPrompt);
                setPendingPrompt('');
            }
        } catch (err) {
            console.error(err);
            showToast(`Authorization failed: ${err.message}`, 'error');
        } finally {
            setIsDepositing(false);
        }
    };

    const handleShare = () => {
        if (!activeConversationId) {
            showToast('No conversation selected to share.', 'error');
            return;
        }
        const shareUrl = `${window.location.origin}/shared/${activeConversationId}`;
        navigator.clipboard.writeText(shareUrl);
        showToast('Share link copied!');
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
    };

    const handleDeleteConversation = (e, conversationId) => {
        e.stopPropagation();
        setConversationToDelete(conversationId);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteConversation(conversationToDelete);
            setHistory(history.filter((h) => h.conversation_id !== conversationToDelete));
            if (activeConversationId === conversationToDelete) {
                setMessages([]);
                setActiveConversationId(null);
            }
            setIsDeleteModalOpen(false);
            showToast('Conversation deleted.');
        } catch (err) {
            showToast(`Failed to delete: ${err.message}`, 'error');
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen overflow-x-hidden bg-neo-cream p-3 text-neo-ink sm:p-6">
                <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[260px_1fr_340px]">
                    {[0, 1, 2].map((item) => <div key={item} className="neo-card h-80 animate-pulse bg-white/70" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-neo-cream text-neo-ink animate-soft-enter">
            {isSidebarOpen && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-neo-ink/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

            <div className="mx-auto grid min-h-screen w-full max-w-[1500px] gap-4 px-3 py-4 sm:gap-5 sm:px-4 sm:py-5 lg:grid-cols-[280px_minmax(0,1fr)_360px] lg:px-6">
                <aside className={`fixed inset-y-0 left-0 z-50 w-[min(88vw,285px)] overflow-y-auto border-r-4 border-neo-ink bg-white p-3 shadow-brutal transition-transform duration-300 sm:p-4 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:w-auto lg:translate-x-0 lg:rounded-[1.35rem] lg:border-4 lg:animate-soft-rise ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[115%]'}`}>
                    <button onClick={() => setIsProfileOpen(true)} className="neo-card w-full bg-neo-yellow p-4 text-left transition-transform hover:-translate-y-1">
                        <div className="flex items-center gap-3">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl border-4 border-neo-ink bg-neo-pink text-xl font-black shadow-brutal-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-lg font-black">{user?.name || 'AI User'}</p>
                                <p className="truncate text-xs font-bold text-neo-muted">{walletAddress?.slice(0, 10)}...</p>
                            </div>
                        </div>
                        <div className="mt-4 rounded-2xl border-3 border-neo-ink bg-white p-3">
                            <p className="text-xs font-black uppercase tracking-[0.18em]">Pro usage plan</p>
                            <p className="mt-1 text-sm font-bold text-neo-muted">Pay only when prompts run</p>
                        </div>
                    </button>

                    <button onClick={handleNewChat} className="btn-primary mt-5 w-full !px-4 !py-3">＋ New AI prompt</button>

                    <div className="mt-6">
                        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-neo-muted">Model selector</p>
                        <div className="space-y-3">
                            {services.length === 0 && <div className="rounded-2xl border-3 border-neo-ink bg-white p-4 font-bold">No services available.</div>}
                            {services.map((service) => (
                                <button
                                    key={service.id}
                                    onClick={() => setActiveService(service)}
                                    className={`w-full rounded-2xl border-4 border-neo-ink p-4 text-left font-bold transition-all hover:-translate-y-1 ${activeService?.id === service.id ? 'bg-neo-blue text-white shadow-brutal-sm' : 'bg-white hover:bg-neo-green'}`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="min-w-0 truncate">{service.name}</span>
                                        <span className="rounded-full border-3 border-neo-ink bg-neo-yellow px-2 py-1 text-[10px] font-black text-neo-ink">{formatAlgo(service.price_algo)} ALGO</span>
                                    </div>
                                    <p className={`mt-2 line-clamp-2 text-xs ${activeService?.id === service.id ? 'text-white/80' : 'text-neo-muted'}`}>{service.description || 'Fast AI micro-service with per-request settlement.'}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-neo-muted">Usage history</p>
                        <div className="space-y-2">
                            {history.slice(0, 7).map((item, index) => (
                                <div key={item.conversation_id || index} className="group relative">
                                    <button onClick={() => loadConversation(item.conversation_id, item.service_id)} className={`w-full rounded-2xl border-3 border-neo-ink p-3 pr-11 text-left text-sm font-bold transition-all ${activeConversationId === item.conversation_id ? 'bg-neo-pink' : 'bg-white hover:bg-neo-yellow'}`}>
                                        <span className="block truncate">{item.service_id || 'AI'} Session</span>
                                        <span className="text-xs text-neo-muted">Conversation #{index + 1}</span>
                                    </button>
                                    <button onClick={(e) => handleDeleteConversation(e, item.conversation_id)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border-2 border-neo-ink bg-white px-2 py-1 text-xs font-black opacity-0 transition-opacity group-hover:opacity-100">×</button>
                                </div>
                            ))}
                            {history.length === 0 && <p className="rounded-2xl border-3 border-dashed border-neo-ink bg-white p-4 text-sm font-bold text-neo-muted">No chats yet. Send the first prompt to create history.</p>}
                        </div>
                    </div>

                    <button onClick={handleLogout} className="mt-6 w-full rounded-2xl border-4 border-neo-ink bg-white px-4 py-3 text-left font-black transition-all hover:bg-neo-pink">Logout →</button>
                </aside>

                <main className="min-w-0 space-y-5">
                    <header className="neo-card bg-white p-4 md:p-6 animate-soft-rise">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex items-start gap-3">
                                <button onClick={() => setIsSidebarOpen(true)} className="shrink-0 rounded-2xl border-4 border-neo-ink bg-neo-yellow p-3 font-black lg:hidden">☰</button>
                                <div className="min-w-0">
                                    <span className="section-tag">Live SaaS dashboard</span>
                                    <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] sm:text-4xl md:text-6xl">Pay-per-use AI workspace</h1>
                                    <p className="mt-2 max-w-2xl font-bold leading-7 text-neo-muted">Send prompts, watch token usage, see the wallet deduction, and review billing history in one judge-ready flow.</p>
                                </div>
                            </div>
                            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[520px] xl:grid-cols-4">
                                <div className="rounded-2xl border-4 border-neo-ink bg-neo-green p-3 shadow-brutal-sm transition-transform duration-200 hover:-translate-y-1 animate-scale-soft" style={{ animationDelay: '80ms' }}>
                                    <p className="text-xs font-black uppercase">Wallet</p>
                                    <p className="text-2xl font-black">{formatAlgo(visualBalance)}</p>
                                    <p className="text-xs font-bold">ALGO</p>
                                </div>
                                <div className="rounded-2xl border-4 border-neo-ink bg-neo-yellow p-3 shadow-brutal-sm transition-transform duration-200 hover:-translate-y-1 animate-scale-soft" style={{ animationDelay: '130ms' }}>
                                    <p className="text-xs font-black uppercase">Tokens</p>
                                    <p className="text-2xl font-black">{totalTokens.toLocaleString()}</p>
                                    <p className="text-xs font-bold">30 days</p>
                                </div>
                                <div className="rounded-2xl border-4 border-neo-ink bg-neo-pink p-3 shadow-brutal-sm transition-transform duration-200 hover:-translate-y-1 animate-scale-soft" style={{ animationDelay: '180ms' }}>
                                    <p className="text-xs font-black uppercase">Spent</p>
                                    <p className="text-2xl font-black">{formatAlgo(totalSpent)}</p>
                                    <p className="text-xs font-bold">ALGO</p>
                                </div>
                                <div className="rounded-2xl border-4 border-neo-ink bg-neo-blue p-3 text-white shadow-brutal-sm transition-transform duration-200 hover:-translate-y-1 animate-scale-soft" style={{ animationDelay: '230ms' }}>
                                    <p className="text-xs font-black uppercase">Avg</p>
                                    <p className="text-2xl font-black">{formatAlgo(averageSession)}</p>
                                    <p className="text-xs font-bold">/ session</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <section className="grid min-w-0 gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_300px] animate-soft-rise" style={{ animationDelay: '90ms' }}>
                        <div className="neo-card flex min-h-[560px] min-w-0 flex-col bg-white sm:min-h-[620px] transition-shadow duration-300 hover:shadow-brutal-lg">
                            <div className="flex flex-col gap-3 border-b-4 border-neo-ink p-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-neo-muted">AI usage page</p>
                                    <h2 className="text-2xl font-black">{activeService?.name || 'Select a model'}</h2>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={handleShare} className="rounded-2xl border-4 border-neo-ink bg-neo-green px-4 py-2 font-black shadow-brutal-sm transition-transform hover:-translate-y-1">Share</button>
                                    <button onClick={() => setIsProfileOpen(true)} className="rounded-2xl border-4 border-neo-ink bg-white px-4 py-2 font-black shadow-brutal-sm transition-transform hover:-translate-y-1">Profile</button>
                                </div>
                            </div>

                            <div ref={chatContainerRef} className="flex-1 overflow-y-auto bg-[linear-gradient(rgba(17,17,17,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(17,17,17,0.05)_2px,transparent_2px)] bg-[length:34px_34px] p-4 md:p-6">
                                {messages.length === 0 ? (
                                    <div className="grid h-full place-items-center py-8">
                                        <div className="max-w-2xl text-center">
                                            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-[1.35rem] border-4 border-neo-ink bg-neo-yellow text-4xl shadow-brutal animate-wiggle">🧠</div>
                                            <h3 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">Start the full pay-per-use demo.</h3>
                                            <p className="mt-3 font-bold leading-7 text-neo-muted">Pick a prompt below, send it, and the token meter + cost + wallet balance will update instantly.</p>
                                            <div className="mt-6 grid gap-3 md:grid-cols-2">
                                                {quickPrompts.map((prompt, index) => (
                                                    <button key={prompt} onClick={() => setInput(prompt)} className="rounded-2xl border-4 border-neo-ink bg-white p-4 text-left text-sm font-bold shadow-brutal-sm transition-all duration-200 hover:-translate-y-1 hover:bg-neo-yellow animate-scale-soft" style={{ animationDelay: `${index * 70}ms` }}>{prompt}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {messages.map((msg, idx) => (
                                            <div key={`${msg.role}-${idx}`} className={`flex animate-soft-rise ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[94%] overflow-hidden break-words rounded-[1.35rem] border-4 border-neo-ink p-3 shadow-brutal-sm sm:max-w-[88%] sm:p-4 ${msg.role === 'user' ? 'bg-neo-blue text-white' : 'bg-white'}`}>
                                                    <div className="mb-2 flex items-center justify-between gap-3 border-b-3 border-neo-ink pb-2">
                                                        <span className="font-black">{msg.role === 'user' ? 'You' : activeService?.name || 'AI'}</span>
                                                        {msg.role === 'assistant' && <button onClick={() => handleCopy(msg.content)} className="rounded-full border-2 border-neo-ink bg-neo-yellow px-2 py-1 text-xs font-black text-neo-ink">Copy</button>}
                                                    </div>
                                                    <p className="whitespace-pre-wrap text-sm font-semibold leading-7">{msg.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {chatLoading && (
                                            <div className="flex justify-start">
                                                <div className="rounded-[1.35rem] border-4 border-neo-ink bg-neo-yellow p-4 shadow-brutal-sm">
                                                    <div className="flex items-center gap-2 font-black"><span className="h-3 w-3 animate-bounce rounded-full bg-neo-ink" /> Processing tokens...</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSend} className="border-t-4 border-neo-ink bg-neo-yellow p-4">
                                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={`Ask ${activeService?.name || 'AI'} something...`}
                                        className="input-dark !bg-white"
                                        disabled={chatLoading}
                                    />
                                    <button type="submit" disabled={!input.trim() || chatLoading} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50">Send prompt →</button>
                                </div>
                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-2xl border-3 border-neo-ink bg-white p-3">
                                        <p className="text-xs font-black uppercase">Tokens used</p>
                                        <p className="text-2xl font-black">{liveUsage.tokens}</p>
                                    </div>
                                    <div className="rounded-2xl border-3 border-neo-ink bg-white p-3">
                                        <p className="text-xs font-black uppercase">Cost</p>
                                        <p className="text-2xl font-black">{formatAlgo(liveUsage.cost)}</p>
                                    </div>
                                    <div className="rounded-2xl border-3 border-neo-ink bg-white p-3">
                                        <p className="text-xs font-black uppercase">Wallet before</p>
                                        <p className="text-2xl font-black">{formatAlgo(liveUsage.previousBalance)}</p>
                                    </div>
                                    <div className="rounded-2xl border-3 border-neo-ink bg-neo-green p-3">
                                        <p className="text-xs font-black uppercase">Wallet after</p>
                                        <p className="text-2xl font-black">{formatAlgo(liveUsage.nextBalance)}</p>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="space-y-5">
                            <div className="neo-card bg-neo-ink p-5 text-white transition-transform duration-200 hover:-translate-y-1">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-neo-green">Cost deduction</p>
                                <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
                                    <div>
                                        <p className="text-sm font-bold text-white/60">{formatAlgo(liveUsage.previousBalance)} →</p>
                                        <p className="text-4xl font-black tracking-[-0.05em] sm:text-5xl">{formatAlgo(liveUsage.nextBalance)}</p>
                                        <p className="font-bold text-white/70">ALGO remaining</p>
                                    </div>
                                    <div className="rounded-2xl border-3 border-white bg-neo-pink px-3 py-2 text-sm font-black text-neo-ink">-{formatAlgo(liveUsage.cost)}</div>
                                </div>
                            </div>

                            <div className="neo-card bg-white p-5 transition-transform duration-200 hover:-translate-y-1">
                                <h3 className="text-xl font-black">Recent transactions</h3>
                                <div className="mt-4 space-y-3">
                                    {recentTransactions.map((tx, index) => (
                                        <div key={tx.id} className="flex items-center justify-between gap-3 rounded-2xl border-3 border-neo-ink bg-neo-cream p-3 animate-scale-soft" style={{ animationDelay: `${index * 55}ms` }}>
                                            <div className="min-w-0">
                                                <p className="truncate font-black">{tx.label}</p>
                                                <p className="text-xs font-bold text-neo-muted">{tx.time}</p>
                                            </div>
                                            <p className={`shrink-0 font-black ${tx.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{tx.amount < 0 ? '-' : '+'}{formatAlgo(Math.abs(tx.amount))}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <aside className="min-w-0 space-y-4 sm:space-y-5 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:overflow-y-auto lg:pr-1 animate-soft-rise" style={{ animationDelay: '160ms' }}>
                    <div className="neo-card bg-white p-5 transition-transform duration-200 hover:-translate-y-1">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-neo-muted">Daily usage graph</p>
                        <h3 className="mt-2 text-2xl font-black">Tokens by day</h3>
                        <div className="mt-5 flex h-52 items-end gap-1.5 border-b-4 border-l-4 border-neo-ink p-2 sm:gap-3 sm:p-3">
                            {demoUsage.map((day, index) => (
                                <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                                    <div className="w-full rounded-t-xl border-3 border-neo-ink bg-neo-blue shadow-brutal-sm transition-all duration-300 hover:bg-neo-pink animate-bar-grow" style={{ height: `${Math.max(22, (day.tokens / maxTokens) * 160)}px`, animationDelay: `${index * 65}ms` }} title={`${day.tokens} tokens`} />
                                    <span className="text-xs font-black">{day.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="neo-card bg-neo-green p-5">
                        <p className="text-xs font-black uppercase tracking-[0.2em]">Cost per day</p>
                        <div className="mt-4 space-y-3">
                            {demoUsage.slice(-5).map((day) => (
                                <div key={day.day}>
                                    <div className="mb-1 flex justify-between text-sm font-black"><span>{day.day}</span><span>{formatAlgo(day.cost)} ALGO</span></div>
                                    <div className="h-4 rounded-full border-3 border-neo-ink bg-white">
                                        <div className="h-full rounded-full bg-neo-pink transition-all duration-500" style={{ width: `${Math.min(100, day.cost * 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="neo-card bg-white p-5 transition-transform duration-200 hover:-translate-y-1">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-neo-muted">Most used AI model</p>
                        <h3 className="mt-2 text-2xl font-black">Model mix</h3>
                        <div className="mt-4 space-y-4">
                            {modelMix.map((model) => (
                                <div key={model.name}>
                                    <div className="mb-1 flex justify-between text-sm font-black"><span>{model.name}</span><span>{model.pct}%</span></div>
                                    <div className="h-5 rounded-full border-3 border-neo-ink bg-neo-cream">
                                        <div className={`h-full rounded-full transition-all duration-500 ${model.color}`} style={{ width: `${model.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="neo-card bg-neo-pink p-5">
                        <p className="text-xs font-black uppercase tracking-[0.2em]">UX flow</p>
                        <ol className="mt-4 space-y-3 font-black">
                            {['Sign up / connect wallet', 'Add prepaid balance', 'Send prompt', 'Watch usage + cost', 'Review history'].map((step, index) => (
                                <li key={step} className="flex items-center gap-3 rounded-2xl border-3 border-neo-ink bg-white p-3 transition-transform duration-200 hover:translate-x-1"><span className="grid h-7 w-7 place-items-center rounded-full bg-neo-ink text-xs text-white">{index + 1}</span>{step}</li>
                            ))}
                        </ol>
                    </div>
                </aside>
            </div>

            {isProfileOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-neo-ink/60 p-3 backdrop-blur-sm sm:p-4">
                    <div className="neo-card w-full max-w-[calc(100vw-2rem)] bg-white p-4 sm:max-w-md sm:p-6 animate-scale-soft">
                        <button onClick={() => setIsProfileOpen(false)} className="float-right rounded-full border-3 border-neo-ink bg-neo-pink px-3 py-1 font-black">×</button>
                        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-4 border-neo-ink bg-neo-yellow text-3xl font-black shadow-brutal-sm">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
                            <div>
                                <h2 className="text-2xl font-black">{user?.name}</h2>
                                <p className="break-all text-xs font-bold text-neo-muted">{walletAddress}</p>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border-3 border-neo-ink bg-neo-green p-3"><p className="text-xs font-black uppercase">Spent 30d</p><p className="text-xl font-black">{formatAlgo(totalSpent)} ALGO</p></div>
                            <div className="rounded-2xl border-3 border-neo-ink bg-neo-yellow p-3"><p className="text-xs font-black uppercase">Avg/session</p><p className="text-xl font-black">{formatAlgo(averageSession)}</p></div>
                            <div className="rounded-2xl border-3 border-neo-ink bg-neo-cream p-3 sm:col-span-2"><p className="text-xs font-black uppercase">Email</p><p className="break-all font-bold">{user?.email || 'Not provided'}</p></div>
                        </div>
                    </div>
                </div>
            )}

            {isAuthModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-neo-ink/60 p-3 backdrop-blur-sm sm:p-4">
                    <div className="neo-card w-full max-w-[calc(100vw-2rem)] bg-white p-5 text-center sm:max-w-md sm:p-7 animate-scale-soft">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-4 border-neo-ink bg-neo-yellow text-3xl shadow-brutal-sm">⚡</div>
                        <h2 className="mt-5 text-2xl font-black sm:text-3xl">Authorize AI session</h2>
                        <p className="mt-3 font-bold leading-7 text-neo-muted">Add a 5.0 ALGO session allowance. The UI will only deduct the actual prompt cost as you use AI.</p>
                        <div className="mt-6 grid gap-3">
                            <button onClick={handleAuthorizeSession} disabled={isDepositing} className="btn-primary disabled:opacity-50">{isDepositing ? 'Awaiting signature...' : 'Sign with Pera Wallet'}</button>
                            <button onClick={() => { setIsAuthModalOpen(false); setPendingPrompt(''); }} disabled={isDepositing} className="btn-secondary disabled:opacity-50">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-neo-ink/60 p-3 backdrop-blur-sm sm:p-4">
                    <div className="neo-card w-full max-w-[calc(100vw-2rem)] bg-white p-5 text-center sm:max-w-sm sm:p-7 animate-scale-soft">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-4 border-neo-ink bg-neo-pink text-3xl shadow-brutal-sm">🗑️</div>
                        <h3 className="mt-5 text-2xl font-black">Delete conversation?</h3>
                        <p className="mt-2 font-bold text-neo-muted">This removes the selected usage history item from your dashboard.</p>
                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary !px-4">Cancel</button>
                            <button onClick={confirmDelete} className="btn-primary !bg-neo-pink !px-4">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`fixed inset-x-3 bottom-4 z-[300] rounded-2xl border-4 border-neo-ink px-4 py-3 font-black shadow-brutal animate-slide-up sm:inset-x-auto sm:right-6 sm:bottom-6 sm:px-5 sm:py-4 ${toast.type === 'error' ? 'bg-neo-pink' : 'bg-neo-green'}`}>
                    {toast.type === 'error' ? '⚠️ ' : '✓ '}{toast.message}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
