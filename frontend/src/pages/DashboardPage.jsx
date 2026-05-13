import React, { useEffect, useRef, useState } from 'react';
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
    streamChat,
    getSessionStatus,
} from '../api/client';
import { useSiwa } from '../hooks/useSiwa';

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
    const [loading, setLoading] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [balance, setBalance] = useState(0);

    const [sessionExpiry, setSessionExpiry] = useState(null);
    const [sessionStatus, setSessionStatus] = useState('none');
    const [sessionCountdown, setSessionCountdown] = useState('');

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [pendingPrompt, setPendingPrompt] = useState('');
    const [isDepositing, setIsDepositing] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState(null);

    const chatContainerRef = useRef(null);

    const showToast = (msg) => alert(msg);

    useEffect(() => {
        if (!walletAddress) {
            navigate('/');
            return;
        }

        const init = async () => {
            try {
                const profile = await getUserProfile(walletAddress);
                setUser(profile);

                const srvs = await getServices();
                setServices(srvs);
                if (srvs.length) setActiveService(srvs[0]);

                const hist = await getConversationHistory(walletAddress);
                setHistory(hist);

                const bal = await getWalletPrepayBalance(walletAddress);
                setBalance(bal.balance_algo);

                const sess = await getSessionStatus(walletAddress);
                setSessionExpiry(sess.expiry_timestamp);

                if (!sess.has_session) setSessionStatus('none');
                else if (sess.is_expired) setSessionStatus('expired');
                else setSessionStatus('active');

                const analytics = await getUserAnalytics(walletAddress);
            } catch (err) {
                console.error(err);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [walletAddress, navigate]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [messages, chatLoading]);

    useEffect(() => {
        if (sessionStatus !== 'active' || !sessionExpiry) return;

        const tick = () => {
            const secs = Math.max(0, sessionExpiry - Math.floor(Date.now() / 1000));

            if (secs === 0) {
                setSessionStatus('expired');
                setSessionCountdown('');
                return;
            }

            const m = Math.floor(secs / 60);
            const s = secs % 60;

            setSessionCountdown(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [sessionStatus, sessionExpiry]);

    const executeSend = async (text) => {
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        setChatLoading(true);

        try {
            const res = await streamChat(
                activeService.id,
                walletAddress,
                text,
                activeConversationId
            );

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;

                    const data = JSON.parse(line.slice(6));

                    if (data.chunk) {
                        setMessages(prev => {
                            const copy = [...prev];
                            copy[copy.length - 1].content += data.chunk;
                            return copy;
                        });
                    }

                    if (data.done) {
                        setActiveConversationId(data.conversation_id);
                        setMessages(data.messages);

                        const bal = await getWalletPrepayBalance(walletAddress);
                        setBalance(bal.balance_algo);

                        const hist = await getConversationHistory(walletAddress);
                        setHistory(hist);
                    }
                }
            }
        } catch (err) {
            setMessages(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: `Error: ${err.message}` }
            ]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !activeService) return;

        const text = input;
        setInput('');

        if (balance < 0.5) {
            setPendingPrompt(text);
            setIsAuthModalOpen(true);
            return;
        }

        await executeSend(text);
    };

    const handleAuthorizeSession = async () => {
        try {
            setIsDepositing(true);

            const { PeraWalletConnect } = await import('@perawallet/connect');
            const algosdk = (await import('algosdk')).default;

            const pw = new PeraWalletConnect();
            let accounts = await pw.connect();

            if (accounts[0] !== walletAddress) throw new Error('Wallet mismatch');

            const paymentInfo = await getPaymentInfo(activeService.id);
            const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
            const params = await algod.getTransactionParams().do();

            const expiry = Math.floor(Date.now() / 1000) + 86400;

            const atc = new algosdk.AtomicTransactionComposer();

            const method = new algosdk.ABIMethod({
                name: 'start_session',
                args: [
                    { type: 'uint64', name: 'max_spend' },
                    { type: 'uint64', name: 'expiry_time' }
                ],
                returns: { type: 'bool' }
            });

            atc.addMethodCall({
                appID: parseInt(paymentInfo.app_id),
                method,
                methodArgs: [5000000, expiry],
                sender: walletAddress,
                suggestedParams: params,
            });

            const result = await atc.execute(algod, 4);

            await depositWalletFunds(walletAddress, result.txIDs[0]);

            const bal = await getWalletPrepayBalance(walletAddress);
            setBalance(bal.balance_algo);

            setSessionStatus('active');
            setSessionExpiry(expiry);
            setIsAuthModalOpen(false);

            if (pendingPrompt) {
                await executeSend(pendingPrompt);
                setPendingPrompt('');
            }
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setIsDepositing(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await deleteConversation(conversationToDelete);
            setHistory(prev => prev.filter(h => h.conversation_id !== conversationToDelete));
            setIsDeleteModalOpen(false);
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="p-4 flex justify-between border-b border-white/10">
                <h1 className="font-bold">AI Dashboard</h1>
                <button onClick={handleLogout}>Logout</button>
            </header>

            <div className="grid grid-cols-3 gap-4 p-4">
                <aside />

                <main>
                    <div
                        ref={chatContainerRef}
                        className="h-[500px] overflow-y-auto border border-white/10 p-3"
                    >
                        {messages.map((m, i) => (
                            <div key={i}>
                                <b>{m.role}:</b> {m.content}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSend} className="flex gap-2 mt-3">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 p-2 text-black"
                        />
                        <button>Send</button>
                    </form>
                </main>

                <aside />
            </div>

            {isAuthModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
                    <div className="bg-white text-black p-6 rounded">
                        <p>Authorize session?</p>
                        <button onClick={handleAuthorizeSession}>
                            Continue
                        </button>
                        <button onClick={() => setIsAuthModalOpen(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
                    <div className="bg-white text-black p-6 rounded">
                        <p>Delete conversation?</p>
                        <button onClick={confirmDelete}>Yes</button>
                        <button onClick={() => setIsDeleteModalOpen(false)}>No</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;