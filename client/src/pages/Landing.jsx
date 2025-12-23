import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Stats from '../components/landing/Stats';
import Features from '../components/landing/Features';
import Roles from '../components/landing/Roles';
import Footer from '../components/landing/Footer';

const Landing = () => {
    return (
        <div className="font-sans antialiased text-slate-900 bg-white">
            <Navbar />
            <main>
                <Hero />
                <Stats />
                <Features />
                <Roles />
            </main>
            <Footer />
        </div>
    );
};

export default Landing;
