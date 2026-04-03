import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-algo-dark border-b border-algo-border shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2 group">
                    <span className="text-2xl font-extrabold tracking-tight text-white group-hover:text-algo-blue transition-colors">
                        ⚡ PayPerAI
                    </span>
                </Link>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400 font-mono hidden md:inline">Built on Algorand</span>
                    <div className="text-xs text-green-400 bg-green-900/40 px-3 py-1 rounded-full font-bold border border-green-800">
                        Testnet
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
