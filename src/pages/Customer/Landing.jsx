import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Zap, 
  Droplet, 
  Wind, 
  CheckCircle,
  Clock,
  Shield,
  Star,
  Home,
  Tv,
  Scissors,
  Bike,
  Car
} from 'lucide-react';
import DarkVeil from '../../components/DarkVeil';
import MagicBento from '../../components/MagicBento';
import PixelCard from '../../components/PixelCard';

/**
 * Landing Page with Hero Section
 * Public-facing page describing Smart Serve application
 */
const Landing = () => {
  const services = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Electrical',
      description: 'Expert electrical repairs & installations'
    },
    {
      icon: <Droplet className="w-8 h-8" />,
      title: 'Plumbing',
      description: 'Fix leaks and pipe issues fast'
    },
    {
      icon: <Wind className="w-8 h-8" />,
      title: 'HVAC',
      description: 'Heating and cooling system maintenance'
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: 'Cleaning',
      description: 'Spotless cleaning for every corner'
    },
    {
      icon: <Tv className="w-8 h-8" />,
      title: 'Appliance Repair',
      description: 'Repairing your essential home devices'
    },
    {
      icon: <Scissors className="w-8 h-8" />,
      title: 'Lawn Cutting',
      description: 'Professional lawn care and maintenance'
    },
    {
      icon: <Bike className="w-8 h-8" />,
      title: 'Bike Wash',
      description: 'Complete cleaning for your bike'
    },
    {
      icon: <Car className="w-8 h-8" />,
      title: 'Car Wash',
      description: 'Premium car cleaning and detailing'
    }
  ];

  const features = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Verified Technicians',
      description: 'All our technicians are background-checked and certified'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Quick Response',
      description: 'Fast booking and same-day service availability'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Satisfaction Guarantee',
      description: '100% satisfaction guaranteed or your money back'
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Top Quality',
      description: 'Premium quality service at competitive prices'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo.png" alt="Smart Serve Logo" className="h-12 w-auto mr-3 object-contain" />
              <span className="text-2xl font-bold text-gray-900">Smart Serve</span>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register/customer"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden min-h-[calc(100vh-4rem)]">
        {/* Animated Background - Absolutely positioned to fill entire section */}
        <div className="absolute inset-0 w-full h-full z-0">
          <DarkVeil 
            speed={0.5}
            hueShift={-20}
            noiseIntensity={0.03}
            scanlineIntensity={0}
            scanlineFrequency={0}
            warpAmount={0.4}
            resolutionScale={0.8}
          />
        </div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-indigo-900/30 z-[1]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10 flex items-center min-h-[calc(100vh-4rem)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            {/* Hero Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Your Home Services,
                  <span className="block text-blue-200">Simplified</span>
                </h1>
                <p className="text-xl text-blue-100 mb-8">
                  Connect with verified, professional technicians for all your home service needs. 
                  From plumbing to electrical work, we've got you covered.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register/customer"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-semibold text-center shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="bg-blue-500 bg-opacity-30 backdrop-blur-sm text-white hover:bg-opacity-40 px-8 py-4 rounded-lg text-lg font-semibold text-center border-2 border-white border-opacity-30 transition-all duration-200"
                >
                  Book a Service
                </Link>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-blue-200 text-sm">Verified Technicians</div>
                </div>
                <div className="border-l border-blue-400 h-12"></div>
                <div>
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-blue-200 text-sm">Services Completed</div>
                </div>
                <div className="border-l border-blue-400 h-12"></div>
                <div>
                  <div className="text-3xl font-bold">4.9★</div>
                  <div className="text-blue-200 text-sm">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative z-10">
              <div className="relative rounded-2xl overflow-visible shadow-2xl p-8">
                {/* Service Cards Grid with MagicBento */}
                <div className="aspect-square lg:aspect-auto lg:h-[500px] flex items-center justify-center">
                  <div className="w-full">
                    <MagicBento
                      cardData={[
                        {
                          icon: <Droplet className="w-full h-full" />,
                          title: 'Plumbing',
                          color: 'rgba(30, 20, 80, 0.6)'
                        },
                        {
                          icon: <Zap className="w-full h-full" />,
                          title: 'Electrical',
                          color: 'rgba(30, 20, 80, 0.6)'
                        },
                        {
                          icon: <Wind className="w-full h-full" />,
                          title: 'HVAC',
                          color: 'rgba(30, 20, 80, 0.6)'
                        },
                        {
                          icon: <Home className="w-full h-full" />,
                          title: 'Cleaning',
                          color: 'rgba(30, 20, 80, 0.6)'
                        }
                      ]}
                      enableStars={true}
                      enableSpotlight={true}
                      enableBorderGlow={true}
                      enableTilt={false}
                      enableMagnetism={true}
                      clickEffect={true}
                      particleCount={8}
                      glowColor="147, 197, 253"
                      spotlightRadius={250}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 z-[2]">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional home services delivered by skilled technicians
            </p>
          </div>

          <div className="services-bento-wrapper">
            <MagicBento
              cardData={services.map(service => ({
                icon: service.icon,
                title: service.title,
                color: '#ffffff'
              }))}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={true}
              clickEffect={true}
              particleCount={6}
              glowColor="37, 99, 235"
              spotlightRadius={200}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Smart Serve?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make home services easy, reliable, and affordable
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-white">
        <PixelCard
          variant="blue"
          className="w-full py-20 bg-gradient-to-r from-blue-600 to-indigo-700"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl px-6 py-14 sm:px-10 sm:py-16 text-center bg-transparent border border-white/20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of satisfied customers who trust Smart Serve for their home service needs
            </p>
            <Link
              to="/register/customer"
              className="inline-block bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Create Your Account
            </Link>
            </div>
          </div>
        </PixelCard>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/logo.png" alt="Smart Serve Logo" className="h-12 w-auto mr-3 object-contain" />
                <span className="text-xl font-bold text-white">Smart Serve</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for professional home services.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-blue-400">Login</Link></li>
                <li><Link to="/register/customer" className="hover:text-blue-400">Sign Up</Link></li>
                <li><Link to="/register/technician" className="hover:text-blue-400">Become a Technician</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@smartserve.com</li>
                <li>Phone: 1-800-SMART-SV</li>
                <li>24/7 Customer Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Smart Serve. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
