import { motion } from 'framer-motion';
import { ChefHat, Heart, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const roles = [
    {
        id: 'restaurant',
        title: 'Restaurant',
        description: 'Donate surplus food, reduce waste, and earn tax benefits.',
        icon: ChefHat,
        color: 'bg-orange-500',
        lightColor: 'bg-orange-50',
        hoverBorder: 'hover:border-orange-500',
        textColor: 'text-orange-600',
    },
    {
        id: 'ngo',
        title: 'NGO / Charity',
        description: 'Receive fresh food donations for the communities you serve.',
        icon: Heart,
        color: 'bg-red-500',
        lightColor: 'bg-red-50',
        hoverBorder: 'hover:border-red-500',
        textColor: 'text-red-600',
    },
    {
        id: 'volunteer',
        title: 'Volunteer',
        description: 'Be the hero. Pickup and deliver food to those in need.',
        icon: Users,
        color: 'bg-blue-500',
        lightColor: 'bg-blue-50',
        hoverBorder: 'hover:border-blue-500',
        textColor: 'text-blue-600',
    },
];

const RoleSelection = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-5xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Join the Movement</h1>
                    <p className="text-lg text-slate-600">Choose how you want to make an impact today.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {roles.map((role, index) => (
                        <Link key={role.id} to={`/signup/${role.id}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-white rounded-2xl p-8 border-2 border-transparent ${role.hoverBorder} shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full group`}
                            >
                                <div className={`${role.lightColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                                    <role.icon className={`h-8 w-8 ${role.textColor}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-slate-700">{role.title}</h3>
                                <p className="text-slate-500 leading-relaxed mb-8">{role.description}</p>
                                <div className={`flex items-center font-semibold ${role.textColor}`}>
                                    Get Started <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                <p className="text-center mt-12 text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 underline decoration-2 underline-offset-2">
                        Log in here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RoleSelection;
