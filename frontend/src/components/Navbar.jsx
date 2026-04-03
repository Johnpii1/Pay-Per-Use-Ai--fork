import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

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
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-purple to-brand-violet flex items-center justify-center">
                        <span className="text-white font-bold text-sm">P</span>
                    </div>
                    <span className="text-lg font-bold text-white group-hover:text-brand-light transition-colors">
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
                    <Link
                        to="/login"
                        className="btn-primary text-sm !px-6 !py-2.5"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-white p-2"
                >
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
                    <Link to="/login" className="btn-primary block text-center text-sm !py-2.5 mt-4" onClick={() => setIsOpen(false)}>
                        Get Started
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
