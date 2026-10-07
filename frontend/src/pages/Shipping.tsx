import { 
  Ship, 
  Plane, 
  Package, 
  Clock, 
  Shield, 
  CheckCircle,
  MapPin,
  Phone,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Shipping = () => {
  const process = [
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Order Placement',
      description: 'Select your vehicle and complete the purchase process.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Quality Inspection',
      description: 'We inspect your vehicle thoroughly before shipping.',
    },
    {
      icon: <Ship className="w-8 h-8" />,
      title: 'Sea Freight',
      description: 'Vehicle shipped via secure container shipping.',
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Delivery',
      description: 'Vehicle delivered to your specified location in Kenya.',
    },
  ];

  const shippingMethods = [
    {
      icon: <Ship className="w-12 h-12" />,
      title: 'Sea Freight',
      description: 'Most economical option for vehicle shipping. Delivery time: 3-5 weeks.',
      features: ['Container shipping', 'Full insurance coverage', 'Tracking available'],
      price: 'From KES 150,000',
    },
    {
      icon: <Plane className="w-12 h-12" />,
      title: 'Air Freight',
      description: 'Fastest shipping option for smaller vehicles and parts. Delivery time: 1-2 weeks.',
      features: ['Express delivery', 'Priority handling', 'Real-time tracking'],
      price: 'From KES 500,000',
    },
  ];

  const faqs = [
    {
      question: 'How long does shipping take?',
      answer: 'Sea freight typically takes 3-5 weeks from China to Kenya, while air freight takes 1-2 weeks.',
    },
    {
      question: 'Is my vehicle insured during shipping?',
      answer: 'Yes, all vehicles are fully insured during transit. We provide comprehensive marine insurance coverage.',
    },
    {
      question: 'What documents do I need?',
      answer: 'You will need a copy of your ID/passport, KRA PIN, and import declaration form (IDF) which we help you obtain.',
    },
    {
      question: 'Can I track my shipment?',
      answer: 'Yes, we provide tracking information so you can monitor your vehicle\'s journey from China to Kenya.',
    },
    {
      question: 'Are there any hidden charges?',
      answer: 'No, we provide transparent pricing. All costs including shipping, insurance, and customs clearance are quoted upfront.',
    },
  ];

  return (
    <div className="pt-28 md:pt-32 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-16 md:py-24">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920)' }}
        />
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Shipping <span className="text-red-500">Information</span>
            </h1>
            <p className="text-xl text-gray-300">
              Fast, secure, and reliable vehicle shipping from China to Kenya
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Process */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Shipping Process</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We handle the entire shipping process from start to finish, ensuring your vehicle arrives safely.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
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

      {/* Shipping Methods */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shipping Options</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the shipping method that best suits your needs and budget.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {shippingMethods.map((method, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="text-red-600 mb-4">{method.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{method.title}</h3>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <ul className="space-y-2 mb-6">
                    {method.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xl font-bold text-red-600">{method.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Our Shipping */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Our Shipping?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Full Insurance Coverage</h3>
                    <p className="text-gray-600 text-sm">Your vehicle is fully insured from pickup to delivery.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">On-Time Delivery</h3>
                    <p className="text-gray-600 text-sm">We stick to our promised delivery timelines.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Quality Assurance</h3>
                    <p className="text-gray-600 text-sm">Thorough inspection before and after shipping.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Door-to-Door Service</h3>
                    <p className="text-gray-600 text-sm">We deliver directly to your specified location.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800"
                alt="Shipping"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our shipping process.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-red-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Ship Your Vehicle?</h2>
            <p className="text-xl text-red-100 mb-8">
              Contact us today to get a personalized shipping quote.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-red-600">
                  Contact Us
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="tel:+254720549567">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-red-600">
                  <Phone className="mr-2 w-5 h-5" />
                  Call Now
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shipping;
