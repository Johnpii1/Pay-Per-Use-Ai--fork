import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
    const location = useLocation();
    if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/onboarding') || location.pathname.startsWith('/workspace')) {
        return null;
    }
    return (
        <footer className="border-t border-white/5 mt-auto">
            <div className="py-6 px-6 text-center text-sm text-gray-500">
                © 2026 PayPerAI — Debuggers United. All rights reserved
            </div>
        </footer>
    );
};

export default Footer;
