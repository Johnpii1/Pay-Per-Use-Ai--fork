import React, { useState } from 'react';

const PaymentModal = ({ paymentInfo, onWalletSubmit, isLoading }) => {
    const [wallet, setWallet] = useState('');
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onWalletSubmit(wallet, prompt);
    };

    return (
        <div className="bg-algo-card border border-algo-border p-8 rounded-xl shadow-2xl">
            <h2 className="text-3xl font-extrabold mb-8 text-white border-b border-gray-800 pb-4">Secure Payment Session</h2>
            
            <div className="grid md:grid-cols-2 gap-10">
                {/* Left Side: Setup & Instructions */}
                <div>
                    <h3 className="text-xl font-bold text-algo-blue mb-4">Step 1: Payment Instructions</h3>
                    
                    <div className="mb-6 bg-gray-900/60 p-4 rounded-lg flex justify-center border border-gray-800">
                         {paymentInfo?.qr_code_base64 ? (
                            <img src={`data:image/png;base64,${paymentInfo.qr_code_base64}`} alt="QR Code" className="w-48 h-48 rounded" />
                         ) : (
                            <div className="w-48 h-48 bg-gray-800 flex items-center justify-center animate-pulse"><span className="text-gray-500">Loading QR...</span></div>
                         )}
                    </div>
                    
                    <div className="mb-6">
                        <label className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">Smart Contract Address</label>
                        <div className="flex bg-gray-900 border border-gray-700 rounded overflow-hidden">
                            <code className="text-sm text-gray-300 p-3 overflow-x-auto whitespace-nowrap flex-grow">{paymentInfo?.contract_address || 'Loading...'}</code>
                            <button 
                                onClick={() => navigator.clipboard.writeText(paymentInfo?.contract_address)}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 font-medium transition"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <label className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Instructions</label>
                        <ul className="space-y-2">
                            {paymentInfo?.instructions?.map((inst, i) => (
                                <li key={i} className="flex text-sm text-gray-400">
                                    <span className="mr-2 text-algo-blue opacity-50">&bull;</span> {inst}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div>
                    <h3 className="text-xl font-bold text-algo-blue mb-4">Step 2: Reserve Your Query</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-gray-300 mb-2 block">Your Algorand Wallet Address</label>
                            <input 
                                required
                                type="text"
                                maxLength={58}
                                minLength={58}
                                value={wallet}
                                onChange={e => setWallet(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-algo-blue focus:border-transparent outline-none font-mono text-sm"
                                placeholder="Address sending the payment..."
                            />
                            <p className="text-xs text-gray-500 mt-2">Required to verify your transaction on-chain.</p>
                        </div>
                        
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold text-gray-300 block">Your Prompt / Question</label>
                                <span className={`text-xs ${prompt.length > 1900 ? 'text-red-400' : 'text-gray-500'}`}>{prompt.length} / 2000</span>
                            </div>
                            <textarea 
                                required
                                rows={6}
                                maxLength={2000}
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-algo-blue focus:border-transparent outline-none resize-none"
                                placeholder="Enter the code to review or essay topic..."
                            />
                        </div>
                        
                        <button 
                            type="submit"
                            disabled={isLoading || !wallet || !prompt}
                            className="w-full py-4 bg-algo-blue hover:bg-blue-400 text-algo-dark rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Creating Session...' : 'Create Session & Start Payment Wait'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
