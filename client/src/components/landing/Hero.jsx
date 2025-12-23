import { motion } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-stone-50">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 opacity-10">
                <svg width="600" height="600" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#059669" d="M44.1,-76.4C58.9,-69.2,73.8,-61.4,83.8,-49.6C93.8,-37.8,98.9,-22,96.8,-6.8C94.7,8.3,85.3,22.9,74.7,35.6C64.1,48.3,52.2,59.1,39.3,66.4C26.4,73.7,12.5,77.5,-1.9,80.8C-16.3,84.1,-31.2,86.9,-44.6,81.3C-58,75.7,-69.9,61.7,-78.2,46.1C-86.5,30.5,-91.2,13.3,-89.6,-2.9C-87.9,-19,-79.9,-34.1,-69.1,-46.8C-58.3,-59.5,-44.7,-69.8,-30.9,-77.8C-17.1,-85.9,-3.1,-91.7,5.9,-101.9L14.8,-112.1L44.1,-76.4Z" transform="translate(100 100)" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold tracking-wide mb-6">
                            Reimagining Food Rescue
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
                            Turning Surplus Food into <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                                Shared Hope
                            </span>
                        </h1>
                        <p className="mt-4 text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Connect restaurants with local NGOs and volunteers instantly.
                            Smart updates, real-time tracking, and zero waste—powered by community.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white text-lg font-bold rounded-full hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-xl shadow-emerald-200 flex items-center justify-center gap-2"
                            >
                                Start Donating <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                to="/register?role=volunteer"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 text-lg font-bold rounded-full border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
                            >
                                Volunteer Now <Heart className="h-5 w-5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Floating Cards / Visuals Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="mt-20 relative"
                >
                    {/* We can use an image or a generated illustration here. For now, a CSS composition */}
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white p-2">
                        <div className="bg-slate-100 rounded-xl h-64 md:h-96 w-full flex items-center justify-center relative overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=2070"
                                alt="Community Food Sharing"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
                                <div className="text-white">
                                    <p className="font-semibold text-lg">Live Impact</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse" />
                                        <span>320 meals saved in the last hour</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
