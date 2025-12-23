import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TrendingUp,
    Leaf,
    Utensils,
    Users,
    Download,
    Share2,
    ChevronRight,
    Info,
    Calendar,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MetricCard = ({ title, value, unit, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${color}-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>
        <div className="relative z-10">
            <div className={`p-3 bg-${color}-50 text-${color}-600 rounded-xl w-fit mb-4`}>
                <Icon className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
                <span className="text-sm font-semibold text-slate-400 capitalize">{unit}</span>
            </div>
        </div>
    </motion.div>
);

const TrendChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const maxKg = Math.max(...data.map(d => d.kg)) || 1;
    const height = 160;
    const width = 400;
    const padding = 20;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((d.kg / maxKg) * (height - padding * 2) + padding);
        return { x, y };
    });

    const pathData = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    const areaData = pathData + ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
        <div className="relative w-full h-[200px] mt-4">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Area */}
                <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    d={areaData}
                    fill="url(#chartGradient)"
                />

                {/* Line */}
                <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d={pathData}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Points */}
                {points.map((p, i) => (
                    <motion.circle
                        key={i}
                        initial={{ r: 0 }}
                        animate={{ r: 4 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        cx={p.x} cy={p.y}
                        fill="white"
                        stroke="#10b981"
                        strokeWidth="2"
                    />
                ))}
            </svg>
            <div className="flex justify-between mt-2 px-4">
                {data.map((d, i) => (
                    <span key={i} className="text-xs font-medium text-slate-400">{d.date}</span>
                ))}
            </div>
        </div>
    );
};

const FunnelChart = ({ data }) => {
    const funnelSteps = [
        { label: 'Posted', value: 100, color: 'bg-slate-200' },
        { label: 'Claimed', value: 85, color: 'bg-blue-200' },
        { label: 'Picked Up', value: 72, color: 'bg-emerald-200' },
        { label: 'Distributed', value: 68, color: 'bg-emerald-500' }
    ];

    return (
        <div className="space-y-4 mt-6">
            {funnelSteps.map((step, i) => (
                <div key={i} className="relative">
                    <div className="flex justify-between items-center mb-1 px-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{step.label}</span>
                        <span className="text-xs font-black text-slate-900">{step.value}%</span>
                    </div>
                    <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${step.value}%` }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                            className={`h-full rounded-full ${step.color} shadow-sm`}
                        ></motion.div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ImpactAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await axios.get('/api/analytics/ngo');
                setStats(data.stats);
                setTrends(data.trends);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="p-2 border-4 border-emerald-500 border-t-transparent rounded-full"
            ></motion.div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Impact Analysis</h2>
                    <p className="text-slate-500">Measuring your contribution to social and environmental sustainability.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                        {['7d', '30d', 'all'].map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase ${timeRange === range ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                        <Download className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Food Rescued"
                    value={stats?.totalWeight || 0}
                    unit="kg"
                    icon={TrendingUp}
                    color="emerald"
                    delay={0.1}
                />
                <MetricCard
                    title="Meals Provided"
                    value={stats?.totalMeals || 0}
                    unit="meals"
                    icon={Utensils}
                    color="blue"
                    delay={0.2}
                />
                <MetricCard
                    title="CO₂ Offset"
                    value={stats?.totalCO2Reduced || 0}
                    unit="kg CO₂e"
                    icon={Leaf}
                    color="green"
                    delay={0.3}
                />
                <MetricCard
                    title="Comm. Served"
                    value={stats?.communitiesServed || 0}
                    unit="people"
                    icon={Users}
                    color="purple"
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Impact Trend */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Recovery Trends</h3>
                            <p className="text-sm text-slate-400">Daily food rescue volume (kg)</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                            <TrendingUp className="h-3.5 w-3.5" />
                            +12.5% from last week
                        </div>
                    </div>
                    <TrendChart data={trends} />
                </div>

                {/* Narrative & Insight */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <StarIcon className="h-20 w-20 rotate-12" />
                        </div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            Impact Narrative
                        </h3>
                        <p className="text-emerald-50 text-sm leading-relaxed">
                            "This month, your organization prevented <strong>{stats?.totalCO2Reduced}kg</strong> of CO₂ from entering the atmosphere. That's equivalent to planting roughly <strong>{Math.ceil(stats?.totalCO2Reduced / 20)}</strong> trees!"
                        </p>
                        <button className="mt-6 w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                            Share My Impact <Share2 className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                        <h4 className="font-black text-slate-900 mb-2 flex items-center gap-2 uppercase tracking-tight">
                            <TrendingUp className="h-5 w-5 text-blue-600" /> Rescue Funnel
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Efficiency Pipeline (Last 30 Days)</p>
                        <FunnelChart />
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-tight">
                            <Info className="h-4 w-4 text-blue-500" /> AI Insights
                        </h4>
                        <div className="space-y-4">

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Peak Times</p>
                                    <p className="text-xs text-slate-500">70% of donations occur Sat-Sun. Consider increasing volunteer capacity.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Filter className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Donor Mix</p>
                                    <p className="text-xs text-slate-500">85% of rescued food is Bakery/Grains. You may need more refrigeration for protein growth.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Donor Ready Table/List Preview */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Partner Contribution</h3>
                    <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                        View All Partners <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
                <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <th className="pb-4 pr-4">Partner</th>
                                <th className="pb-4 px-4 text-right">Total Rescued</th>
                                <th className="pb-4 px-4 text-right">Last Pickup</th>
                                <th className="pb-4 pl-4 text-right">Impact Score</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-50">
                            {[
                                { name: "Green Garden Bistro", total: "124 kg", date: "2h ago", score: "Premium" },
                                { name: "Oceanic Seafood", total: "82 kg", date: "Yesterday", score: "Gold" },
                                { name: "Downtown Pastry", total: "215 kg", date: "3 days ago", score: "Elite" }
                            ].map((partner, i) => (
                                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 pr-4 font-bold text-slate-900">{partner.name}</td>
                                    <td className="py-4 px-4 text-right text-slate-600 font-medium">{partner.total}</td>
                                    <td className="py-4 px-4 text-right text-slate-400">{partner.date}</td>
                                    <td className="py-4 pl-4 text-right">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${partner.score === 'Elite' ? 'bg-purple-50 text-purple-600' :
                                            partner.score === 'Premium' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                                            }`}>
                                            {partner.score}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Simple Star Icon for Narrative background
const StarIcon = ({ className }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

export default ImpactAnalytics;
