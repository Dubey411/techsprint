import { Link } from 'react-router-dom';
import { ChefHat, Heart, Users, ArrowRight } from 'lucide-react';

const RoleCard = ({ icon: Icon, title, desc, link, color }) => (
    <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${color}`}>
            <Icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 mb-8">{desc}</p>
        <Link to={link} className="inline-flex items-center font-semibold text-emerald-600 group-hover:text-emerald-700">
            Get Started <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
    </div>
);

const Roles = () => {
    return (
        <section className="py-24 bg-stone-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Join the Movement</h2>
                    <p className="mt-4 text-slate-600">Choose your role and start making a difference today.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <RoleCard
                        icon={ChefHat}
                        title="Restaurants"
                        desc="Reduce waste, save costs, and help your community by donating surplus food."
                        link="/register?role=restaurant"
                        color="bg-orange-500"
                    />
                    <RoleCard
                        icon={Heart}
                        title="NGOs"
                        desc="Get reliable access to fresh food for the communities you serve."
                        link="/register?role=ngo"
                        color="bg-red-500"
                    />
                    <RoleCard
                        icon={Users}
                        title="Volunteers"
                        desc="Be the bridge. Transport food from donors to those in need."
                        link="/register?role=volunteer"
                        color="bg-blue-500"
                    />
                </div>
            </div>
        </section>
    );
};

export default Roles;
