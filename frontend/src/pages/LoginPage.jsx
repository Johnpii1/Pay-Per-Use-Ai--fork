import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [walletAddress, setWalletAddress] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (!walletAddress || walletAddress.length !== 58) {
            setError('Please enter a valid 58-character Algorand wallet address.');
            return;
        }

        // Store wallet in session
        sessionStorage.setItem('wallet_address', walletAddress);
        navigate('/services');
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12 relative">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-violet flex items-center justify-center mx-auto mb-6 glow-purple">
                        <span className="text-white font-bold text-2xl">P</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">
                        Welcome to <span className="italic text-brand-light">PayPerAI</span>
                    </h1>
                    <p className="text-gray-400">
                        Connect your Algorand wallet to access premium AI services.
                    </p>
                </div>

                <div className="glass-card rounded-2xl p-8 glow-purple">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Your Algorand Wallet Address
                            </label>
                            <input
                                type="text"
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value.toUpperCase())}
                                className="input-dark font-mono text-sm"
                                placeholder="e.g. B5BMUKJFHX6..."
                                maxLength={58}
                                minLength={58}
                                required
                            />
                            <p className="text-xs text-gray-600 mt-2">
                                Your 58-character Algorand address from Pera Wallet
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn-primary w-full !rounded-xl text-base">
                            Connect Wallet →
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-xs text-gray-600 leading-relaxed">
                            No account creation needed. We only use your wallet address to verify blockchain payments. Your data stays yours.
                        </p>
                    </div>
                </div>

                <div className="mt-6 glass-card rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-brand-light text-lg mt-0.5">💡</span>
                        <div>
                            <p className="text-sm text-gray-400 font-medium mb-1">Don't have a wallet?</p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Download <a href="https://perawallet.app" target="_blank" rel="noreferrer" className="text-brand-light hover:underline">Pera Wallet</a> on your phone, switch to <strong className="text-gray-400">Testnet</strong> in settings, and get free test ALGO from the <a href="https://bank.testnet.algorand.network/" target="_blank" rel="noreferrer" className="text-brand-light hover:underline">Algorand Dispenser</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
