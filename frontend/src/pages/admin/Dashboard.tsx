import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  MessageSquare, 
  LogOut,
  Package,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from '../../lib/adminAxios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

interface Stats {
  total_vehicles: number;
  available_vehicles: number;
  sold_vehicles: number;
  pending_inquiries: number;
  total_inquiries: number;
  pending_sell_requests: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    total_vehicles: 0,
    available_vehicles: 0,
    sold_vehicles: 0,
    pending_inquiries: 0,
    total_inquiries: 0,
    pending_sell_requests: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Demo data
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const menuItems = [
    { 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: 'Dashboard', 
      path: '/admin/dashboard',
      active: true 
    },
    { 
      icon: <Car className="w-5 h-5" />, 
      label: 'Vehicles', 
      path: '/admin/vehicles',
      active: false 
    },
    { 
      icon: <MessageSquare className="w-5 h-5" />, 
      label: 'Inquiries', 
      path: '/admin/inquiries',
      active: false 
    },
  ];

  const statCards = [
    { 
      title: 'Total Vehicles', 
      value: stats.total_vehicles, 
      icon: <Car className="w-6 h-6" />,
      color: 'bg-blue-500',
      link: '/admin/vehicles'
    },
    { 
      title: 'Available', 
      value: stats.available_vehicles, 
      icon: <Package className="w-6 h-6" />,
      color: 'bg-green-500',
      link: '/admin/vehicles'
    },
    { 
      title: 'Pending Inquiries', 
      value: stats.pending_inquiries, 
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-yellow-500',
      link: '/admin/inquiries'
    },
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
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Welcome, {localStorage.getItem('adminUsername') || 'Admin'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="md:hidden"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        <div className="md:hidden bg-gray-900 text-white px-4 py-2 flex gap-2 overflow-x-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                item.active 
                  ? 'bg-red-600' 
                  : 'bg-gray-800'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(card.link)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                      <p className="text-2xl font-bold">{card.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white`}>
                      {card.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/admin/vehicles')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-red-600" />
                      <span>Manage Vehicles</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => navigate('/admin/inquiries')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-yellow-600" />
                      <span>View Inquiries</span>
                      {stats.pending_inquiries > 0 && (
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                          {stats.pending_inquiries}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </CardContent>
            </Card>


          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
