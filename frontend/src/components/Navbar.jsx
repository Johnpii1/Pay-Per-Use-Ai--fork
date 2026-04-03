import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PeraWalletConnect } from "@perawallet/connect";

const peraWallet = new PeraWalletConnect();

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [accountAddress, setAccountAddress] = useState(sessionStorage.getItem('wallet_address'));
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Reconnect session
        peraWallet.reconnectSession().then((accounts) => {
            peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
            if (peraWallet.isConnected && accounts.length) {
                const addr = accounts[0];
                setAccountAddress(addr);
                sessionStorage.setItem('wallet_address', addr);
            }
        }).catch(e => console.log(e));
    }, []);

    const handleConnectWalletClick = (e) => {
        if (e) e.preventDefault();
        peraWallet.connect()
            .then((newAccounts) => {
                peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
                const addr = newAccounts[0];
                setAccountAddress(addr);
                sessionStorage.setItem('wallet_address', addr);
                navigate('/services');
            })
            .catch((error) => {
                if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
                    console.log(error);
                }
            });
    };

    const handleDisconnectWalletClick = (e) => {
        if (e) e.preventDefault();
        peraWallet.disconnect();
        setAccountAddress(null);
        sessionStorage.removeItem('wallet_address');
        navigate('/');
    };

    const navLinks = [
        { to: '/#about', label: 'About' },
        { to: '/#how-it-works', label: 'How It Works' },
        { to: '/#services-preview', label: 'Services' },
        { to: '/#why-us', label: 'Why Us' },
    ];

    const scrollToSection = (e, hash) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const el = document.querySelector(hash);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            setIsOpen(false);
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
            <div className="max-w-6xl mx-auto floating-nav rounded-2xl px-6 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <span className="text-xl font-serif font-bold text-white group-hover:text-brand-light transition-colors">
                        PayPerAI
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <a
                            key={link.label}
                            href={link.to}
                            onClick={(e) => scrollToSection(e, link.to.replace('/', ''))}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-3">
                    {accountAddress ? (
                        <>
                            <Link to="/services" className="text-sm text-gray-300 hover:text-white mr-4">Dashboard</Link>
                            <button onClick={handleDisconnectWalletClick} className="btn-secondary text-sm !px-4 !py-2">
                                Disconnect
                            </button>
                        </>
                    ) : (
                        <button onClick={handleConnectWalletClick} className="btn-primary text-sm !px-6 !py-2.5">
                            Connect to your wallet
                        </button>
                    )}
                </div>

                {/* Mobile toggle */}
                <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2">
                    {isOpen ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden mt-2 mx-auto max-w-6xl floating-nav rounded-2xl p-6 space-y-4 animate-fade-in">
                    {navLinks.map(link => (
                        <a
                            key={link.label}
                            href={link.to}
                            onClick={(e) => scrollToSection(e, link.to.replace('/', ''))}
                            className="block text-gray-400 hover:text-white transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                    {accountAddress ? (
                        <>
                            <Link to="/services" className="block text-center text-gray-300 hover:text-white mt-4" onClick={() => setIsOpen(false)}>Dashboard</Link>
                            <button onClick={(e) => { handleDisconnectWalletClick(e); setIsOpen(false); }} className="btn-secondary block w-full text-center text-sm !py-2.5 mt-4">
                                Disconnect
                            </button>
                        </>
                    ) : (
                        <button onClick={(e) => { handleConnectWalletClick(e); setIsOpen(false); }} className="btn-primary w-full text-center text-sm !py-2.5 mt-4">
                            Connect to your wallet
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
