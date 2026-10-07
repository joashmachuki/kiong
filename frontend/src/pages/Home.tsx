import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  Truck, 
  Award, 
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
const API_ORIGIN = API_URL.startsWith('http') ? new URL(API_URL).origin : '';
const imgSrc = (url: string) => (/^(https?:)?\/\//.test(url) ? url : API_ORIGIN + url);

interface Vehicle {
  id: number;
  title: string;
  vehicle_type: string;
  condition: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  images: string[];
  featured: boolean;
}

const Home = () => {
  const [cargoTuktuks, setCargoTuktuks] = useState<Vehicle[]>([]);
  const [passengerTuktuks, setPassengerTuktuks] = useState<Vehicle[]>([]);
  const [otherVehicles, setOtherVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    fetchFeaturedVehicles();
  }, []);


  const pickFeaturedFirst = (list: Vehicle[], count: number) => {
    const featured = list.filter((v) => v.featured);
    const rest = list.filter((v) => !v.featured);
    return [...featured, ...rest].slice(0, count);
  };

  const fetchFeaturedVehicles = async () => {
    try {
      const cargoRes = await axios.get(`${API_URL}/vehicles?type=tuktuk_cargo`);
      setCargoTuktuks(pickFeaturedFirst(cargoRes.data, 4));

      const passengerRes = await axios.get(`${API_URL}/vehicles?type=tuktuk_passenger`);
      setPassengerTuktuks(pickFeaturedFirst(passengerRes.data, 4));

      const allRes = await axios.get(`${API_URL}/vehicles`);
      const others = (allRes.data as Vehicle[]).filter((v) => !v.vehicle_type.startsWith('tuktuk'));
      setOtherVehicles(pickFeaturedFirst(others, 4));
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };


  const priceRanges = [
    { label: 'Under 300K', min: 0, max: 300000 },
    { label: '300K - 400K', min: 300000, max: 400000 },
    { label: '400K - 500K', min: 400000, max: 500000 },
    { label: '500K - 700K', min: 500000, max: 700000 },
    { label: '700K+', min: 700000, max: 999999999 },
  ];

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
    <Link to={`/vehicles/${vehicle.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={vehicle.images[0] ? imgSrc(vehicle.images[0]) : '/placeholder-car.jpg'}
            alt={vehicle.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-car.jpg'; }}
          />
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              vehicle.condition === 'new' 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              {vehicle.condition === 'new' ? 'New' : 'Used'}
            </span>
          </div>
          {vehicle.featured && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500 text-white">
                Featured
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{vehicle.title}</h3>
          <p className="text-sm text-gray-500 mb-2">{vehicle.year} • {vehicle.mileage.toLocaleString()} km</p>
          <p className="text-lg font-bold text-red-600">{vehicle.price ? 'KES ' + vehicle.price.toLocaleString() : 'Contact for price'}</p>
          <Button className="mt-3 w-full bg-red-600 hover:bg-red-700">View Details</Button>
        </CardContent>
      </Card>
    </Link>
  );

  const heroSlides = [
    {
      image: '/hero-tuktuks.jpg',
      prefix: "Powering Kenya's Move to",
      highlight: 'Electric',
      subtitle: "Reliable electric tuk-tuks, e-bikes and motorcycles imported directly from China, built to work hard on Kenya's roads. Quality guaranteed with nationwide delivery.",
    },
    {
      image: '/solar-storage.jpg',
      prefix: 'Never Run Out of',
      highlight: 'Power',
      subtitle: 'Solar energy storage systems built to keep your home and business running, day and night.',
    },
    {
      image: '/solar-fans.jpg',
      prefix: 'Stay Cool, Powered by the',
      highlight: 'Sun',
      subtitle: 'Solar powered fans for reliable cooling anywhere, even off-grid.',
    },
    {
      image: '/solar-lights.jpg',
      prefix: 'Light Up Every Corner,',
      highlight: 'Sustainably',
      subtitle: 'Solar lights for homes, compounds and streets — bright, reliable and eco-friendly.',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="pt-28 md:pt-32">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.image}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>
        ))}
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {heroSlides[currentSlide].prefix} <span className="text-red-500">{heroSlides[currentSlide].highlight}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              {heroSlides[currentSlide].subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/vehicles">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8">
                  Browse All Vehicles
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/sell-car">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900 px-8">
                  Sell Your Car
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Price Range Filter */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Browse by Price Range</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {priceRanges.map((range) => (
              <Link
                key={range.label}
                to={`/vehicles?min_price=${range.min}&max_price=${range.max}`}
                className="px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md hover:bg-red-600 hover:text-white transition-all text-sm font-medium text-gray-700"
              >
                {range.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured New Cars */}
      {cargoTuktuks.length > 0 && (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Cargo Electric Tuk-Tuks</h2>
              <p className="text-gray-500 mt-1">Latest arrivals with zero mileage</p>
            </div>
            <Link to="/cargo-tuktuks" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cargoTuktuks.map((car) => (
              <VehicleCard key={car.id} vehicle={car} />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Featured Used Cars */}
      {passengerTuktuks.length > 0 && (
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Passenger Electric Tuk-Tuks</h2>
              <p className="text-gray-500 mt-1">Quality pre-owned vehicles at great prices</p>
            </div>
            <Link to="/passenger-tuktuks" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {passengerTuktuks.map((car) => (
              <VehicleCard key={car.id} vehicle={car} />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Featured Ebikes & Motorcycles */}
      {otherVehicles.length > 0 && (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">More Vehicles</h2>
              <p className="text-gray-500 mt-1">Eco-friendly rides for urban commuting</p>
            </div>
            <Link to="/vehicles" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherVehicles.map((bike) => (
              <VehicleCard key={bike.id} vehicle={bike} />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Why Choose Us */}
      <section className="py-12 md:py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Why Choose Kiong Logistics Network?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We are committed to providing the best vehicle buying experience with quality assurance 
              and professional service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-gray-400 text-sm">All vehicles undergo strict quality inspection before shipping.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast Shipping</h3>
              <p className="text-gray-400 text-sm">Direct shipping from China to Kenya with tracking.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-400 text-sm">Competitive pricing with no hidden fees or charges.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-400 text-sm">Professional team to assist you at every step.</p>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1920)' }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your Dream Vehicle?
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Browse our range of electric tuk-tuks, cars, e-bikes and motorcycles. 
            Contact us today for the best deals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/vehicles">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8">
                Browse Vehicles
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900 px-8">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
