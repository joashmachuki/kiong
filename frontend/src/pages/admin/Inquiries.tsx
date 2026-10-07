import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  MessageSquare, 
  LogOut,
  Search,
  Check,
  X,
  Mail,
  Phone,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from '../../lib/adminAxios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  vehicle_id: number | null;
  inquiry_type: string;
  status: string;
  created_at: string;
}

interface SellRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  car_brand: string;
  car_model: string;
  car_year: number;
  car_mileage: number;
  expected_price: number;
  condition: string;
  description: string;
  status: string;
  created_at: string;
}

const AdminInquiries = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'inquiries' | 'sell'>('inquiries');

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const fetchData = async () => {
    try {
      const [inquiriesRes, sellRes] = await Promise.all([
        axios.get(`${API_URL}/admin/inquiries`),
        axios.get(`${API_URL}/admin/sell-requests`),
      ]);
      setInquiries(inquiriesRes.data);
      setSellRequests(sellRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Could not load the inquiries. Please log in again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  const updateInquiryStatus = async (id: number, status: string) => {
    try {
      await axios.put(`${API_URL}/admin/inquiries/${id}`, { status });
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Could not update the status. Please log in again.');
    }
  };

  const updateSellRequestStatus = async (id: number, status: string) => {
    try {
      await axios.put(`${API_URL}/admin/sell-requests/${id}`, { status });
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Could not update the status. Please log in again.');
    }
  };

  const filteredInquiries = inquiries.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSellRequests = sellRequests.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.car_brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.car_model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <Car className="w-5 h-5" />, label: 'Vehicles', path: '/admin/vehicles' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Inquiries', path: '/admin/inquiries', active: true },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Kiong Logistics Network" className="h-24 w-24 object-contain" />
            <div>
              <span className="font-bold text-lg">Kiong Logistics Network</span>
              <span className="text-xs text-gray-400 block">Admin</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                item.active 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Inquiries & Requests</h1>
          </div>
        </header>

        {/* Mobile Menu */}
        <div className="md:hidden bg-gray-900 text-white px-4 py-2 flex gap-2 overflow-x-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                item.active ? 'bg-red-600' : 'bg-gray-800'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 p-6">
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'inquiries'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              General Inquiries
              {inquiries.filter(i => i.status === 'pending').length > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {inquiries.filter(i => i.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Sell Car Requests
              {sellRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {sellRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Inquiries List */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredInquiries.length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900">No inquiries found</h3>
                </div>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <Card key={inquiry.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{inquiry.name}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(inquiry.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={
                              inquiry.status === 'pending' ? 'bg-yellow-500' :
                              inquiry.status === 'responded' ? 'bg-green-500' : 'bg-gray-500'
                            }>
                              {inquiry.status}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-3">{inquiry.message}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <a href={`mailto:${inquiry.email}`} className="flex items-center gap-1 hover:text-red-600">
                              <Mail className="w-4 h-4" />
                              {inquiry.email}
                            </a>
                            <a href={`tel:${inquiry.phone}`} className="flex items-center gap-1 hover:text-red-600">
                              <Phone className="w-4 h-4" />
                              {inquiry.phone}
                            </a>
                            {inquiry.vehicle_id && (
                              <span className="text-red-600">Vehicle ID: {inquiry.vehicle_id}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {inquiry.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateInquiryStatus(inquiry.id, 'responded')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Mark Responded
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateInquiryStatus(inquiry.id, 'closed')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Close
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Sell Requests List */}
          {activeTab === 'sell' && (
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredSellRequests.length === 0 ? (
                <div className="text-center py-16">
                  <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900">No sell requests found</h3>
                </div>
              ) : (
                filteredSellRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <Car className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{request.car_brand} {request.car_model}</h3>
                              <p className="text-sm text-gray-500">
                                {request.car_year} • {request.car_mileage.toLocaleString()} km
                              </p>
                            </div>
                            <Badge className={
                              request.status === 'pending' ? 'bg-yellow-500' :
                              request.status === 'contacted' ? 'bg-blue-500' :
                              request.status === 'sold' ? 'bg-green-500' : 'bg-red-500'
                            }>
                              {request.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Expected Price</p>
                              <p className="font-semibold text-red-600">KES {request.expected_price.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Condition</p>
                              <p className="font-semibold capitalize">{request.condition}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Seller</p>
                              <p className="font-semibold">{request.name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Contact</p>
                              <p className="font-semibold">{request.phone}</p>
                            </div>
                          </div>
                          {request.description && (
                            <p className="text-gray-600 text-sm">{request.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateSellRequestStatus(request.id, 'contacted')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Mark Contacted
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSellRequestStatus(request.id, 'sold')}
                            className="bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            Mark Sold
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminInquiries;
