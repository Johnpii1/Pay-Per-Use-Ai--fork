import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="border-t border-white/5 mt-auto">
            {/* CTA Banner */}
            <div className="py-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/5 to-transparent"></div>
                <div className="relative z-10 max-w-3xl mx-auto px-6">
                    <span className="section-tag">Ready to start?</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mt-4 mb-4">
                        Experience AI, powered by <span className="italic text-brand-light">blockchain.</span>
                    </h2>
                    <p className="text-gray-400 mb-8 text-lg">
                        Pay only for what you use. No subscriptions. No hidden fees.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link to="/login" className="btn-primary">Get Started</Link>
                        <a href="#how-it-works" className="btn-secondary">Learn More</a>
                    </div>
                </div>
            </div>

            {/* Footer Links */}
            <div className="border-t border-white/5 py-12 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-purple to-brand-violet flex items-center justify-center">
                            <span className="text-white font-bold text-xs">P</span>
                        </div>
                        <span className="font-bold text-white">PayPerAI</span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <a href="#about" className="hover:text-white transition-colors">About</a>
                        <a href="#services-preview" className="hover:text-white transition-colors">Services</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">Process</a>
                        <a href="#why-us" className="hover:text-white transition-colors">Features</a>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Built on</span>
                        <span className="text-brand-light font-semibold">Algorand Testnet</span>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/5 text-center text-xs text-gray-600">
                    © {new Date().getFullYear()} PayPerAI — Debuggers United. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
