import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServices } from '../api/client';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await getServices();
                setServices(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleSelect = (service) => {
        navigate(`/pay/${service.id}`, { state: { service } });
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="text-center mb-16 mt-8">
                <div className="inline-block bg-algo-blue/10 border border-algo-blue/30 text-algo-blue px-4 py-1.5 rounded-full text-sm font-bold mb-6 tracking-wide shadow-[0_0_15px_rgba(0,191,255,0.2)]">
                    🔗 Running on Algorand Testnet
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                    Premium AI Services,<br/>Powered by Blockchain
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
                    Pay per use in ALGO. No subscription. No account. Just verify and query.
                </p>
            </div>

            {loading && <LoadingSpinner message="Orchestrating smart contracts..." />}
            
            {error && (
                <div className="bg-red-900/20 border border-red-800 text-red-400 p-6 rounded-lg text-center font-bold text-lg max-w-2xl mx-auto">
                    API Connection Error: {error}
                </div>
            )}

            {!loading && !error && (
                <div className="grid md:grid-cols-3 gap-8">
                    {services.map(s => (
                        <ServiceCard key={s.id} service={s} onSelect={handleSelect} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
