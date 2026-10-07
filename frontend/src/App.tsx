import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import SellCar from './pages/SellCar';
import About from './pages/About';
import Contact from './pages/Contact';
import Shipping from './pages/Shipping';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminVehicles from './pages/admin/Vehicles';
import AdminInquiries from './pages/admin/Inquiries';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          {/* Admin Routes - No Header/Footer */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/vehicles" element={<AdminVehicles />} />
          <Route path="/admin/inquiries" element={<AdminInquiries />} />
          
          {/* Public Routes */}
          <Route path="*" element={
            <>
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/vehicles/:id" element={<VehicleDetail />} />
                  <Route path="/new-cars" element={<Vehicles type="new" />} />
                  <Route path="/used-cars" element={<Vehicles type="used" />} />
                  <Route path="/ebikes" element={<Vehicles type="ebike" />} />
                  <Route path="/motorcycles" element={<Vehicles type="motorcycle" />} />
                  <Route path="/cargo-tuktuks" element={<Vehicles type="tuktuk_cargo" />} />
                  <Route path="/passenger-tuktuks" element={<Vehicles type="tuktuk_passenger" />} />
                  <Route path="/sell-car" element={<SellCar />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="*" element={<div className="pt-40 pb-24 text-center px-4"><h1 className="mb-4 text-4xl font-bold text-gray-900">Page not found</h1><p className="mb-6 text-gray-600">The page you are looking for does not exist.</p><a href="/" className="font-medium text-red-600 hover:text-red-700">Go to the home page</a></div>} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
