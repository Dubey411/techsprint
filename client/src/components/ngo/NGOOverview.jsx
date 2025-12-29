import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  Users,
  Activity,
  ArrowUpRight,
  Clock,
  TrendingUp
} from 'lucide-react';


const StatCard = ({ icon: Icon, title, value, sub, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group border-b-4 border-b-transparent hover:border-b-blue-500"
    >
        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3">{title}</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
            </div>
            <div className={`p-4 rounded-[1.25rem] ${color} bg-opacity-10 text-slate-900`}>
                <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
        <div className="mt-6 flex items-center text-[10px] relative z-10">
            <span className="text-emerald-600 font-black uppercase tracking-widest flex items-center bg-emerald-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {sub}
            </span>
            <span className="text-slate-400 font-bold uppercase tracking-widest ml-3">Velocity</span>
        </div>

        <div className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full opacity-[0.03] ${color} group-hover:scale-150 transition-transform duration-700`}></div>
    </motion.div>
);

const PredictiveInsights = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-[2rem] relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Demand Forecast</span>
                </div>
                <h4 className="text-lg font-black text-slate-900 leading-tight mb-1 uppercase tracking-tighter">High Surge Detected</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">System predicts 30% increase in demand within the next 48 hours for bakery items.</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <TrendingUp className="h-16 w-16 text-blue-600" />
            </div>
        </div>
        <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <Package className="h-4 w-4 text-emerald-600" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Logistics Insight</span>
                </div>
                <h4 className="text-lg font-black text-slate-900 leading-tight mb-1 uppercase tracking-tighter">Optimize Route Alpha</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Batching 3 nearby pickups could save 4.2kg of fuel and reduce ETA by 15 mins.</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:-rotate-12 transition-transform">
                <ArrowUpRight className="h-16 w-16 text-emerald-600" />
            </div>
        </div>
    </div>
);


const NGOOverview = () => {
    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Operational Grid</h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Real-time Command & Intelligence Center</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-xl">
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div> Network Optimal
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    icon={Package}
                    title="Volume Rescued"
                    value="450 kg"
                    sub="+12%"
                    color="bg-emerald-500"
                    delay={0.1}
                />
                <StatCard
                    icon={Truck}
                    title="Active Missions"
                    value="08"
                    sub="2 Urgent"
                    color="bg-blue-500"
                    delay={0.2}
                />
                <StatCard
                    icon={Users}
                    title="Personnel Active"
                    value="12"
                    sub="Nominal"
                    color="bg-purple-500"
                    delay={0.3}
                />
                <StatCard
                    icon={Activity}
                    title="Total Capacity"
                    value="1.2k"
                    sub="92% Util"
                    color="bg-orange-500"
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Active Incursions</h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">High Priority Task Queue</p>
                            </div>
                            <span className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-red-200">3 CRITICAL</span>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-blue-500 hover:bg-white hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group">
                                    <div className="flex items-center space-x-6">
                                        <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center border border-slate-100 text-red-600 font-black text-2xl shadow-sm group-hover:bg-red-500 group-hover:text-white transition-all">
                                            !
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">Large Donation Expiring Soon</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">From <span className="text-slate-900 font-black">Spice Garden</span> • 25kg Meals</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 justify-end mb-2">
                                            <Clock className="h-3.5 w-3.5 text-red-500" />
                                            <p className="text-xs font-black text-red-600 uppercase tracking-tighter">Expires in 2h</p>
                                        </div>
                                        <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200">Assign Vector</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <PredictiveInsights />
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="h-6 w-6 text-blue-500" />
                                <h3 className="text-xl font-black uppercase tracking-tight">Capacity Metrics</h3>
                            </div>

                            <div className="space-y-8">
                                <div className="group">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 text-slate-400">
                                        <span>Refrigeration</span>
                                        <span className="text-red-400">85% Critical</span>
                                    </div>
                                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '85%' }}
                                            className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                                        ></motion.div>
                                    </div>
                                </div>

                                <div className="group">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 text-slate-400">
                                        <span>Dry Storage</span>
                                        <span className="text-emerald-400">40% Nominal</span>
                                    </div>
                                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '40%' }}
                                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                        ></motion.div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10">
                                <p className="text-xs text-slate-400 leading-relaxed font-bold uppercase tracking-tight">
                                    <span className="text-white">Attention:</span> prioritize dry goods or initiate immediate distribution frequency to clear cold storage overhead.
                                </p>
                            </div>

                            <button className="w-full mt-8 bg-white text-slate-900 py-4 rounded-3xl text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all shadow-2xl shadow-blue-500/20 active:scale-95">
                                Optimize Assets
                            </button>
                        </div>

                        {/* Background decorative */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 bg-blue-600 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group cursor-pointer hover:border-blue-500 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Local Network</h4>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">12 Active Vectors</p>
                            </div>
                        </div>
                        <div className="flex -space-x-3 mb-6">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                            <div className="h-10 w-10 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[10px] font-black text-white">
                                +7
                            </div>
                        </div>
                        <button className="w-full text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:gap-4 transition-all">
                            View Grid Personnel <ArrowUpRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default NGOOverview;
