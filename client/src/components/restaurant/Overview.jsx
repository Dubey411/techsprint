import { motion } from 'framer-motion';
import { TrendingUp, Package, Truck, Smile } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, sub, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-600 font-medium flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {sub}
            </span>
            <span className="text-slate-400 ml-2">vs last week</span>
        </div>
    </motion.div>
);

const Overview = () => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Today's Impact</h2>
                <p className="text-slate-500">Here's what's happening in your kitchen today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Package}
                    title="Surplus Listed"
                    value="12 kg"
                    sub="+2.4%"
                    color="bg-orange-500"
                    delay={0.1}
                />
                <StatCard
                    icon={Truck}
                    title="Pickups Scheduled"
                    value="3"
                    sub="On Track"
                    color="bg-blue-500"
                    delay={0.2}
                />
                <StatCard
                    icon={TrendingUp}
                    title="Waste Reduced"
                    value="85%"
                    sub="+5%"
                    color="bg-emerald-500"
                    delay={0.3}
                />
                <StatCard
                    icon={Smile}
                    title="Meals Provided"
                    value="45"
                    sub="+12"
                    color="bg-purple-500"
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Placeholder */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">Live Donation Feed</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                                        <Package className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Spicy Pasta Batch #{100 + i}</p>
                                        <p className="text-xs text-slate-500">Listed 2 hours ago • Expires in 4h</p>
                                    </div>
                                </div>
                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Matched</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tip Card */}
                <div className="bg-gradient-to-br from-orange-400 to-red-500 p-6 rounded-2xl text-white">
                    <h3 className="font-bold text-lg mb-2">Did you know?</h3>
                    <p className="text-orange-50 text-sm leading-relaxed mb-4">
                        Donating just 5kg of food saves approximately 12.5kg of CO2 emissions. That's equivalent to driving a car for 30 miles!
                    </p>
                    <button className="bg-white/20 hover:bg-white/30 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-lg w-full text-center">
                        View Impact Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Overview;
