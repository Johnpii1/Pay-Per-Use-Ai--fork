import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getPaymentInfo, initiatePayment, submitQuery } from '../api/client';

const PaymentPage = () => {
    const { serviceId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const service = location.state?.service;
    const wallet = sessionStorage.getItem('wallet_address');

    const [paymentInfo, setPaymentInfo] = useState(null);
    const [step, setStep] = useState('PROMPT');  // PROMPT -> PAYMENT -> VERIFY -> DONE
    const [prompt, setPrompt] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [txId, setTxId] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState(null);

    useEffect(() => {
        if (!service || !wallet) {
            navigate('/login');
            return;
        }
        getPaymentInfo(service.id)
            .then(setPaymentInfo)
            .catch(err => setError("Failed to load payment info: " + err.message));
    }, [service, wallet, navigate]);

    // Step 1: Create session with prompt
    const handleCreateSession = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const result = await initiatePayment(service.id, wallet, prompt);
            setSessionId(result.session_id);
            setStep('PAYMENT');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify payment and get AI response
    const handleVerify = async () => {
        setIsLoading(true);
        setError(null);
        setStep('VERIFY');
        try {
            const result = await submitQuery(sessionId, txId);
            setAiResponse(result);
            setStep('DONE');
        } catch (err) {
            setError(err.message);
            setStep('PAYMENT');
        } finally {
            setIsLoading(false);
        }
    };

    if (!service) return null;

    return (
        <div className="min-h-screen pt-28 pb-16 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <button onClick={() => navigate('/services')} className="text-gray-500 hover:text-white text-sm transition-colors mb-8 flex items-center gap-2">
                    ← Back to Services
                </button>

                {/* Service header */}
                <div className="glass-card rounded-2xl p-6 mb-8 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="text-3xl">
                            {{'code_review':'🔍','essay_writer':'✍️','data_analyst':'📊','cold_email':'📧','humanize_text':'🤖'}[service.id] || '✨'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{service.name}</h2>
                            <p className="text-sm text-gray-400">{service.description}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-brand-light">{service.price_algo} ALGO</div>
                        <div className="text-xs text-gray-500">per request</div>
                    </div>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center gap-2 mb-10 justify-center">
                    {['Enter Prompt', 'Send Payment', 'Verify & Get Result'].map((label, i) => {
                        const stepIndex = { PROMPT: 0, PAYMENT: 1, VERIFY: 2, DONE: 2 }[step] || 0;
                        const isActive = i === stepIndex;
                        const isDone = i < stepIndex || step === 'DONE';
                        return (
                            <React.Fragment key={label}>
                                {i > 0 && <div className={`h-px w-8 ${isDone ? 'bg-brand-purple' : 'bg-white/10'}`}></div>}
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isActive ? 'bg-brand-purple/20 text-brand-light border border-brand-purple/30' : isDone ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-gray-600 border border-white/5'}`}>
                                    {isDone && !isActive ? '✓' : i + 1}. {label}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Error display */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* ─── STEP 1: ENTER PROMPT ─── */}
                {step === 'PROMPT' && (
                    <div className="glass-card rounded-2xl p-8 glow-purple animate-fade-in">
                        <h3 className="text-xl font-bold text-white mb-6">Enter your prompt</h3>
                        <form onSubmit={handleCreateSession} className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-semibold text-gray-300">Your Prompt / Question</label>
                                    <span className={`text-xs ${prompt.length > 1900 ? 'text-red-400' : 'text-gray-600'}`}>{prompt.length}/2000</span>
                                </div>
                                <textarea
                                    required
                                    rows={6}
                                    maxLength={2000}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="input-dark resize-none"
                                    placeholder="Enter the code to review, essay topic, email pitch, or text to humanize..."
                                />
                            </div>

                            <div className="glass-card rounded-xl p-4">
                                <div className="text-xs text-gray-600 mb-1 font-semibold">Paying from wallet</div>
                                <code className="text-xs text-gray-400 font-mono break-all">{wallet}</code>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !prompt.trim()}
                                className="btn-primary w-full !rounded-xl text-base disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating Session...' : 'Create Session & Proceed to Payment →'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ─── STEP 2: SEND PAYMENT ─── */}
                {step === 'PAYMENT' && (
                    <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
                        {/* Left: Payment instructions */}
                        <div className="glass-card rounded-2xl p-8 glow-purple">
                            <h3 className="text-xl font-bold text-white mb-6">Send Payment</h3>

                            {/* QR Code */}
                            <div className="bg-white rounded-xl p-4 w-fit mx-auto mb-6">
                                {paymentInfo?.qr_code_base64 ? (
                                    <img src={`data:image/png;base64,${paymentInfo.qr_code_base64}`} alt="QR Code" className="w-44 h-44" />
                                ) : (
                                    <div className="w-44 h-44 bg-gray-100 flex items-center justify-center text-gray-400">Loading...</div>
                                )}
                            </div>

                            {/* Address */}
                            <div className="mb-6">
                                <div className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2">Send to this address</div>
                                <div className="flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                                    <code className="text-xs text-gray-300 p-3 overflow-x-auto whitespace-nowrap flex-grow font-mono">
                                        {paymentInfo?.contract_address || 'Loading...'}
                                    </code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(paymentInfo?.contract_address)}
                                        className="px-4 py-3 text-xs font-bold text-brand-light hover:bg-white/5 transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="glass-card rounded-xl p-4 text-center">
                                <div className="text-xs text-gray-600 mb-1 font-bold">Amount to send</div>
                                <div className="text-2xl font-bold text-brand-light">{service.price_algo} ALGO</div>
                            </div>
                        </div>

                        {/* Right: Verify */}
                        <div className="glass-card rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-white mb-4">After Payment</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-[10px] font-bold text-brand-light">1</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Open <strong className="text-gray-200">Pera Wallet</strong> on your phone (ensure it's on <strong className="text-gray-200">Testnet</strong>)</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-[10px] font-bold text-brand-light">2</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Tap <strong className="text-gray-200">Send</strong>, scan the QR code or paste the address</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-[10px] font-bold text-brand-light">3</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Send exactly <strong className="text-brand-light">{service.price_algo} ALGO</strong> and confirm</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-[10px] font-bold text-brand-light">4</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Open transaction details and copy the <strong className="text-gray-200">Transaction ID</strong></p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-300 block mb-2">Transaction ID</label>
                                    <input
                                        type="text"
                                        value={txId}
                                        onChange={(e) => setTxId(e.target.value.trim())}
                                        className="input-dark font-mono text-sm"
                                        placeholder="Paste your Transaction ID here..."
                                    />
                                </div>

                                <button
                                    onClick={handleVerify}
                                    disabled={!txId || isLoading}
                                    className="btn-primary w-full !rounded-xl text-base disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Verifying on Blockchain...' : 'Verify Payment & Get AI Response →'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── STEP 2.5: VERIFYING ─── */}
                {step === 'VERIFY' && (
                    <div className="glass-card rounded-2xl p-12 text-center glow-purple animate-fade-in">
                        <div className="w-12 h-12 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h3 className="text-xl font-bold text-white mb-3">Verifying on Algorand Testnet...</h3>
                        <p className="text-gray-400 text-sm">Checking the blockchain for your transaction and generating your AI response.</p>
                    </div>
                )}

                {/* ─── STEP 3: RESULT ─── */}
                {step === 'DONE' && aiResponse && (
                    <div className="animate-fade-in">
                        <div className="glass-card rounded-2xl p-8 glow-purple mb-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                    <span className="text-green-400 text-lg">✓</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Payment Verified</h3>
                                    <p className="text-xs text-gray-500">Transaction confirmed on Algorand Testnet</p>
                                </div>
                            </div>

                            <div className="flex gap-4 flex-wrap text-xs mb-6">
                                <div className="glass-card rounded-lg px-3 py-2">
                                    <span className="text-gray-500">Service:</span>{' '}
                                    <span className="text-brand-light font-semibold">{aiResponse.service_used}</span>
                                </div>
                                <div className="glass-card rounded-lg px-3 py-2">
                                    <span className="text-gray-500">Tokens:</span>{' '}
                                    <span className="text-brand-light font-semibold">{aiResponse.tokens_used}</span>
                                </div>
                                <div className="glass-card rounded-lg px-3 py-2">
                                    <span className="text-gray-500">Verified:</span>{' '}
                                    <span className="text-green-400 font-semibold">✓ On-chain</span>
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-6">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">AI Response</h4>
                                <div className="bg-black/40 rounded-xl p-6 border border-white/5">
                                    <pre className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed font-sans">
                                        {aiResponse.ai_response}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <button onClick={() => navigate('/services')} className="btn-secondary">
                                ← Back to Services
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;
