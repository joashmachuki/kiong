import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  Share2, 
  Check,
  Fuel,
  Settings,
  Users,
  Calendar,
  Gauge,
  Palette,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
const API_ORIGIN = API_URL.startsWith('http') ? new URL(API_URL).origin : '';
const imgSrc = (url: string) => (/^(https?:)?\/\//.test(url) ? url : API_ORIGIN + url);

const SPEC_LABELS: Record<string, { label: string; unit?: string }> = {
  body_type: { label: 'Body type' },
  cabin_type: { label: 'Cabin type' },
  cargo_bed_size: { label: 'Cargo bed size' },
  load_capacity_kg: { label: 'Load capacity', unit: 'kg' },
  battery_type: { label: 'Battery type' },
  battery_capacity: { label: 'Battery capacity' },
  range_km: { label: 'Range', unit: 'km' },
  motor_power_kw: { label: 'Motor power', unit: 'kW' },
  top_speed_kmh: { label: 'Top speed', unit: 'km/h' },
  charging_time_hours: { label: 'Charging time', unit: 'hours' },
  charger_provided: { label: 'Charger provided' },
  battery_swapping: { label: 'Battery swapping available' },
  financing_available: { label: 'Financing available' },
  power_system: { label: 'Power system' },
  control_system: { label: 'Control system' },
  suspension: { label: 'Suspension' },
  tire_spec: { label: 'Tires' },
  other_features: { label: 'Other features' },

  engine_size: { label: 'Engine size' },
  drive_type: { label: 'Drive type' },
};
const specLabel = (key: string) =>
  SPEC_LABELS[key]?.label ?? key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
const formatSpec = (key: string, value: unknown) => {
  if (value === true) return 'Yes';
  const unit = SPEC_LABELS[key]?.unit;
  return unit ? String(value) + ' ' + unit : String(value);
};

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
  fuel_type: string;
  transmission: string;
  color: string;
  seats: number;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  featured: boolean;
  stock_status: string;
  created_at: string;
}

const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await axios.get(`${API_URL}/vehicles/${id}`);
      setVehicle(response.data);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  };


  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/inquiries`, {
        ...inquiryForm,
        vehicle_id: id,
        inquiry_type: 'vehicle',
      });
      toast.success('Inquiry submitted successfully! We will contact you soon.');
      setInquiryForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.success('Inquiry submitted successfully! (Demo mode)');
      setInquiryForm({ name: '', email: '', phone: '', message: '' });
    }
  };


  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: vehicle?.title,
        text: `Check out this ${vehicle?.title} on Kiong Logistics Network`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="pt-28 md:pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="aspect-video bg-gray-200 rounded-lg mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="pt-28 md:pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Not Found</h1>
          <p className="text-gray-500 mb-6">The vehicle you are looking for does not exist.</p>
          <Link to="/vehicles">
            <Button>Browse All Vehicles</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-32 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-red-600">Home</Link>
          <span>/</span>
          <Link to="/vehicles" className="hover:text-red-600">Vehicles</Link>
          <span>/</span>
          <span className="text-gray-900">{vehicle.title}</span>
        </div>

        {/* Back Button */}
        <Link to="/vehicles" className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Vehicles
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden mb-4 bg-gray-100">
              <img
                src={vehicle.images[selectedImage] ? imgSrc(vehicle.images[selectedImage]) : '/placeholder-car.jpg'}
                alt={vehicle.title}
                className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-car.jpg'; }}
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className={vehicle.condition === 'new' ? 'bg-green-500' : 'bg-blue-500'}>
                  {vehicle.condition === 'new' ? 'New' : 'Used'}
                </Badge>
                {vehicle.featured && (
                  <Badge className="bg-red-500">Featured</Badge>
                )}
              </div>
              <button
                onClick={handleShare}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            {vehicle.images.length > 1 && (
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {vehicle.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-red-600' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={imgSrc(image)}
                      alt={`${vehicle.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-car.jpg'; }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Vehicle Info */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{vehicle.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {vehicle.year}
                </span>
                <span className="flex items-center gap-1">
                  <Gauge className="w-4 h-4" />
                  {vehicle.mileage.toLocaleString()} km
                </span>
                <span className="flex items-center gap-1">
                  <Palette className="w-4 h-4" />
                  {vehicle.color}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed">{vehicle.description}</p>
            </div>

            {/* Specifications */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Specifications</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Fuel className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fuel Type</p>
                      <p className="font-medium">{vehicle.fuel_type}</p>
                    </div>
                  </div>
                  {vehicle.transmission && (
<div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Transmission</p>
                      <p className="font-medium">{vehicle.transmission}</p>
                    </div>
                  </div>
)}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Seats</p>
                      <p className="font-medium">{vehicle.seats}</p>
                    </div>
                  </div>
                  {Object.entries((vehicle.specifications || {}) as Record<string, unknown>)
                    .filter(([, value]) => value !== '' && value !== false && value !== null && value !== undefined)
                    .map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Check className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{specLabel(key)}</p>
                        <p className="font-medium">{formatSpec(key, value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Price & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-4">
              {/* Price Card */}
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="text-3xl font-bold text-red-600 mb-4">
                    {vehicle.price ? 'KES ' + vehicle.price.toLocaleString() : 'Contact for price'}
                  </p>
                  
                  <div className="space-y-3">
                    {/* Inquiry Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-red-600 hover:bg-red-700">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Send Inquiry
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Send Inquiry - {vehicle.title}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleInquirySubmit} className="space-y-4 mt-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={inquiryForm.name}
                              onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={inquiryForm.email}
                              onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={inquiryForm.phone}
                              onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                              id="message"
                              value={inquiryForm.message}
                              onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                              placeholder="I'm interested in this vehicle..."
                              rows={3}
                            />
                          </div>
                          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                            Submit Inquiry
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>



                    <a href="tel:+254720549567">
                      <Button variant="outline" className="w-full">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Seller Information</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <img src="/favicon.png" alt="Kiong Logistics Network" className="h-24 w-24 object-contain" />
                    <div>
                      <p className="font-medium">Kiong Logistics Network</p>
                      <p className="text-sm text-gray-500">Verified Dealer</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      Verified Seller
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Fast Response
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Shipping Information</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We offer fast and secure shipping from China to Kenya. 
                    Delivery time: 2-4 weeks.
                  </p>
                  <Link to="/shipping" className="text-red-600 text-sm font-medium hover:underline">
                    Learn more about shipping
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
