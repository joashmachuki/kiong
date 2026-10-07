import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Search, Phone } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/vehicles?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const navItems = [
    { name: 'Home', path: '/', dropdown: false },
    {
      name: 'Vehicles',
      path: '/vehicles',
      dropdown: true,
      items: [
        { name: 'All Vehicles', path: '/vehicles' },
        { name: 'Cargo Tuk-Tuks', path: '/cargo-tuktuks' },
        { name: 'Passenger Tuk-Tuks', path: '/passenger-tuktuks' },
        { name: 'Ebikes', path: '/ebikes' },
        { name: 'Motorcycles', path: '/motorcycles' },
      ],
    },
    {
      name: 'Sell Your Car',
      path: '/sell-car',
      dropdown: true,
      items: [
        { name: 'Sell Your Car', path: '/sell-car' },
        { name: 'How It Works', path: '/sell-car#how-it-works' },
        { name: 'Get Valuation', path: '/sell-car#valuation' },
      ],
    },
    {
      name: 'Ebikes & Motorcycles',
      path: '/ebikes',
      dropdown: true,
      items: [
        { name: 'Electric Bikes', path: '/ebikes' },
        { name: 'Motorcycles', path: '/motorcycles' },
        { name: 'Spare Parts', path: '/ebikes#parts' },
      ],
    },
    { name: 'About', path: '/about', dropdown: false },
    { name: 'Contact', path: '/contact', dropdown: false },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-lg'
          : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <a href="tel:+254720549567" className="flex items-center gap-2 hover:text-red-400 transition-colors">
              <Phone className="w-4 h-4" />
              <span>+254 720 549 567</span>
            </a>
            <a href="tel:+254768276840" className="hidden sm:flex items-center gap-2 hover:text-red-400 transition-colors">
              <Phone className="w-4 h-4" />
              <span>+254 768 276 840</span>
            </a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span>Free Shipping Across Kenya</span>
            <span className="text-gray-400">|</span>
            <span>Quality Guaranteed</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="Kiong Logistics Network" className="h-48 w-48 object-contain" />
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-gray-900">Kiong Logistics Network</span>
              <span className="text-xs text-red-600 block -mt-1">Kenya</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) =>
              item.dropdown ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition-colors">
                      {item.name}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border shadow-lg">
                    {item.items?.map((subItem) => (
                      <DropdownMenuItem key={subItem.name} asChild>
                        <Link
                          to={subItem.path}
                          className="px-4 py-2 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        >
                          {subItem.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-red-600'
                      : 'text-gray-700 hover:text-red-600'
                  }`}
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-600"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navItems.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.path}
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                  >
                    {item.name}
                  </Link>
                  {item.dropdown && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.items?.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile Contact */}
            <div className="mt-4 pt-4 border-t">
              <a
                href="tel:+254720549567"
                className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg font-medium"
              >
                <Phone className="w-5 h-5" />
                Call Now: +254 720 549 567
              </a>
              <a
                href="tel:+254768276840"
                className="flex items-center justify-center gap-2 mt-2 text-gray-700 py-2 text-sm"
              >
                <Phone className="w-4 h-4" />
                +254 768 276 840
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
