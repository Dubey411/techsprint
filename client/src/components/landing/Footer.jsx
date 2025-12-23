import { ChefHat, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300">
            {/* CTA Section */}
            <div className="bg-emerald-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to make a difference?</h2>
                    <p className="text-emerald-100 max-w-2xl mx-auto mb-10 text-lg">
                        Join thousands of others in the fight against hunger and food waste.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block bg-white text-emerald-800 font-bold px-10 py-4 rounded-full hover:bg-emerald-50 transition-colors shadow-lg"
                    >
                        Join Free Now
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-6">
                            <ChefHat className="h-8 w-8 text-emerald-500" />
                            <span className="text-2xl font-bold text-white">FoodConnect</span>
                        </div>
                        <p className="text-slate-400 mb-8 max-w-sm">
                            Leveraging technology to bridge the gap between abundance and need, creating a hunger-free world one meal at a time.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-emerald-400 transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="hover:text-emerald-400 transition-colors"><Facebook className="h-5 w-5" /></a>
                            <a href="#" className="hover:text-emerald-400 transition-colors"><Instagram className="h-5 w-5" /></a>
                            <a href="#" className="hover:text-emerald-400 transition-colors"><Linkedin className="h-5 w-5" /></a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-6">Platform</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">How it Works</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Browse NGOs</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Restaurants</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Success Stories</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-6">Company</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} FoodConnect. All rights reserved. Built for Social Impact.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
