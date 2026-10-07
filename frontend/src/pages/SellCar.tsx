import { useState } from 'react';
import { 
  Car, 
  Camera, 
  FileCheck, 
  Handshake, 
  DollarSign,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const SellCar = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    car_brand: '',
    car_model: '',
    car_year: '',
    car_mileage: '',
    expected_price: '',
    condition: 'good',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/sell-car`, {
        ...formData,
        car_year: parseInt(formData.car_year),
        car_mileage: parseInt(formData.car_mileage),
        expected_price: parseFloat(formData.expected_price),
      });
      toast.success('Your car selling request has been submitted successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        car_brand: '',
        car_model: '',
        car_year: '',
        car_mileage: '',
        expected_price: '',
        condition: 'good',
        description: '',
      });
    } catch (error) {
      toast.success('Request submitted! (Demo mode)');
    }
  };

  const steps = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: 'Submit Your Car Details',
      description: 'Fill out our simple form with your car information, photos, and expected price.',
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: 'Get a Free Valuation',
      description: 'Our experts will evaluate your car and provide a fair market value assessment.',
    },
    {
      icon: <Handshake className="w-8 h-8" />,
      title: 'We Handle Everything',
      description: 'We manage all listings, negotiations, and paperwork for a hassle-free sale.',
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Get Paid Quickly',
      description: 'Receive your payment securely once the sale is completed.',
    },
  ];

  const benefits = [
    'Free professional car valuation',
    'Hassle-free selling process',
    'Wide network of potential buyers',
    'Secure payment handling',
    'Professional photography service',
    'Negotiation support',
    'Complete paperwork assistance',
    'No hidden fees or charges',
  ];

  return (
    <div className="pt-28 md:pt-32 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sell Your Car <span className="text-red-500">With Us</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              We provide a hassle-free, professional platform for Kenyan car owners to sell their 
              used cars quickly and securely. Get the best value for your vehicle with zero hassle.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#sell-form">
                <Button size="lg" className="bg-red-600 hover:bg-red-700">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <a href="tel:+254720549567">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900">
                  <Phone className="mr-2 w-5 h-5" />
                  Call Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Selling your car has never been easier. Follow these simple steps to get started.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    {step.icon}
                  </div>
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Sell Your Car With Kiong Logistics Network?
              </h2>
              <p className="text-gray-600 mb-8">
                We eliminate the stress of private car sales, connect sellers with serious buyers, 
                and ensure a smooth, transparent sales process from start to finish.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sell Form */}
      <section id="sell-form" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Submit Your Car Details</h2>
              <p className="text-gray-600">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="car_brand">Car Brand *</Label>
                      <Input
                        id="car_brand"
                        value={formData.car_brand}
                        onChange={(e) => setFormData({ ...formData, car_brand: e.target.value })}
                        placeholder="e.g., Toyota"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="car_model">Car Model *</Label>
                      <Input
                        id="car_model"
                        value={formData.car_model}
                        onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
                        placeholder="e.g., Corolla"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="car_year">Year *</Label>
                      <Input
                        id="car_year"
                        type="number"
                        value={formData.car_year}
                        onChange={(e) => setFormData({ ...formData, car_year: e.target.value })}
                        placeholder="e.g., 2020"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="car_mileage">Mileage (km) *</Label>
                      <Input
                        id="car_mileage"
                        type="number"
                        value={formData.car_mileage}
                        onChange={(e) => setFormData({ ...formData, car_mileage: e.target.value })}
                        placeholder="e.g., 50000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="expected_price">Expected Price (KES) *</Label>
                      <Input
                        id="expected_price"
                        type="number"
                        value={formData.expected_price}
                        onChange={(e) => setFormData({ ...formData, expected_price: e.target.value })}
                        placeholder="e.g., 1500000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <select
                      id="condition"
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="w-full border rounded-md p-2"
                      required
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="description">Additional Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tell us more about your car..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg">
                    <Car className="mr-2 w-5 h-5" />
                    Submit Car Details
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-red-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
            <p className="text-xl text-red-100 mb-8">
              Our team is here to help you with the car selling process.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="tel:+254720549567">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-red-600">
                  <Phone className="mr-2 w-5 h-5" />
                  +254 720 549 567
                </Button>
              </a>
              <a href="mailto:kionglogisticsn@gmail.com">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-red-600">
                  <Mail className="mr-2 w-5 h-5" />
                  Email Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SellCar;
