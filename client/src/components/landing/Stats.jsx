import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const StatCard = ({ value, label, sub }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div ref={ref} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <motion.h3
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, type: 'spring' }}
                className="text-4xl md:text-5xl font-extrabold text-emerald-600 mb-2"
            >
                {value}
            </motion.h3>
            <p className="text-lg font-bold text-slate-900">{label}</p>
            <p className="text-sm text-slate-500 mt-1">{sub}</p>
        </div>
    );
};

const Stats = () => {
    return (
        <section id="impact" className="py-20 bg-emerald-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900">Our Collective Impact</h2>
                    <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                        Every day, our community grows stronger, turning potential waste into nourishment for those in need.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard value="12k+" label="Meals Saved" sub="From local restaurants" />
                    <StatCard value="850+" label="Active NGOs" sub="Receiving regular support" />
                    <StatCard value="2.4k" label="Volunteers" sub="Heroes on the ground" />
                    <StatCard value="5.8T" label="CO2 Reduced" sub="By preventing waste" />
                </div>
            </div>
        </section>
    );
};

export default Stats;
