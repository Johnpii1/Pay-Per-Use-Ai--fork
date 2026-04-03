import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ResponseDisplay from '../components/ResponseDisplay';

const ResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;

    if (!result) {
        return (
            <div className="text-center mt-32">
                <p className="text-2xl text-gray-400 font-bold mb-6">No active session result found.</p>
                <button 
                    onClick={() => navigate('/')} 
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg border border-gray-700 transition font-bold"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="pb-16 w-full">
            <ResponseDisplay 
                result={result} 
                onReset={() => navigate('/')} 
            />
        </div>
    );
};

export default ResultPage;
