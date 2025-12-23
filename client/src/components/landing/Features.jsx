import { MapPin, Bell, Truck, CheckCircle } from 'lucide-react';

const Step = ({ icon: Icon, title, desc, number }) => (
    <div className="relative flex flex-col items-center text-center max-w-xs mx-auto">
        <div className="bg-emerald-100 p-4 rounded-2xl mb-6 relative z-10">
            <Icon className="h-8 w-8 text-emerald-600" />
            <span className="absolute -top-3 -right-3 h-8 w-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white">
                {number}
            </span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
);

const Features = () => {
    return (
        <section id="how-it-works" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <span className="text-emerald-600 font-semibold tracking-wider uppercase text-sm">Simple Process</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">How FoodConnect Works</h2>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Connecting Line (Desktop Only) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-100 -z-0 transform -translate-y-1/2"></div>

                    <Step
                        number="1"
                        icon={Bell}
                        title="List Surplus Food"
                        desc="Restaurants post surplus food details instantly. Our AI optimizes listing visibility."
                    />
                    <Step
                        number="2"
                        icon={MapPin}
                        title="Geo-Matching"
                        desc="Nearby NGOs receive real-time alerts based on location and food preferences."
                    />
                    <Step
                        number="3"
                        icon={Truck}
                        title="Quick Pickup"
                        desc="Volunteers or NGOs claim the donation and coordinate pickup via optimized routes."
                    />
                    <Step
                        number="4"
                        icon={CheckCircle}
                        title="Impact Verified"
                        desc="Delivery is confirmed, and impact metrics are updated for everyone to see."
                    />
                </div>
            </div>
        </section>
    )
}

export default Features;
