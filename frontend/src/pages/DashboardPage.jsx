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
const estimateTokens = (text) =>
    Math.max(
        18,
        Math.ceil((text || '').trim().split(/\s+/).filter(Boolean).length * 1.45)
    );

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
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [pendingPrompt, setPendingPrompt] = useState('');
    const [stats, setStats] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState(null);
    const [toast, setToast] = useState(null);
    const [liveUsage, setLiveUsage] = useState({
        tokens: 0,
        cost: 0,
        previousBalance: 0,
        nextBalance: 0,
    });
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
                } catch (_) {}
            } catch (err) {
                console.error(err);
                if (err.message === 'User not found') navigate('/onboarding');
                else {
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
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [messages, chatLoading]);

    useEffect(() => {
        const tokens = estimateTokens(input);
        const unitPrice = Number(activeService?.price_algo || 0.003);
        const cost = input.trim()
            ? Math.max(0.001, tokens * unitPrice * 0.008)
            : 0;

        setLiveUsage({
            tokens: input.trim() ? tokens : 0,
            cost,
            previousBalance: visualBalance,
            nextBalance: Math.max(0, visualBalance - cost),
        });
    }, [input, activeService, visualBalance]);

    const totalTokens =
        stats?.tokens_used_30d ||
        demoUsage.reduce((sum, d) => sum + d.tokens, 0);

    const totalSpent =
        stats?.spent_algo_30d ||
        demoUsage.reduce((sum, d) => sum + d.cost, 0);

    const averageSession =
        stats?.avg_algo_per_session ||
        (history.length ? totalSpent / history.length : 0.37);

    const maxTokens = Math.max(...demoUsage.map((d) => d.tokens));

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
            {
                id: 'wallet-topup',
                label: 'Wallet top-up',
                amount: 5,
                time: 'Today',
                type: 'deposit',
            },
        ].slice(0, 5);
    }, [history, localTransactions, activeService]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || !activeService) return;

        const text = input;
        setInput('');

        const userMsg = { role: 'user', content: text };
        setMessages((prev) => [...prev, userMsg]);

        setChatLoading(true);

        try {
            const res = await sendChat(
                activeService.id,
                walletAddress,
                text,
                activeConversationId
            );

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
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: `Error: ${err.message}` },
            ]);
        } finally {
            setChatLoading(false);
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
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="neo-card h-80 animate-pulse bg-white/70"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-neo-cream text-neo-ink">
            <div className="mx-auto grid min-h-screen w-full max-w-[1500px] gap-4 px-3 py-4 lg:grid-cols-[280px_minmax(0,1fr)_360px] lg:px-6">
                <aside className="bg-white border-4 border-neo-ink p-4 rounded-2xl">
                    <button onClick={handleLogout} className="btn-primary w-full">
                        Logout
                    </button>
                </aside>

                <main className="space-y-4">
                    <div className="neo-card bg-white p-4">
                        <h1 className="text-3xl font-black">
                            Pay-per-use AI workspace
                        </h1>
                    </div>

                    <div
                        ref={chatContainerRef}
                        className="neo-card bg-white p-4 min-h-[400px]"
                    >
                        {messages.map((msg, idx) => (
                            <div key={idx} className="mb-3">
                                <b>{msg.role}</b>: {msg.content}
                            </div>
                        ))}

                        {chatLoading && <p>Processing...</p>}
                    </div>

                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 border p-2"
                        />
                        <button className="btn-primary">Send</button>
                    </form>
                </main>
            </div>

            {toast && (
                <div className="fixed bottom-6 right-6 bg-black text-white p-3 rounded">
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;