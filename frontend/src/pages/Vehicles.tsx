import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  Grid, 
  List,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  fuel_type: string;
  transmission: string;
  color: string;
  seats: number;
  description: string;
  images: string[];
  featured: boolean;
  stock_status: string;
}

interface Filters {
  type: string;
  condition: string;
  brand: string;
  min_price: string;
  max_price: string;
  year: string;
  fuel_type: string;
  transmission: string;
  search: string;
  sort: string;
}

const Vehicles = ({ type }: { type?: string }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<Filters>({
    type: type || searchParams.get('type') || '',
    condition: searchParams.get('condition') || '',
    brand: searchParams.get('brand') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    year: searchParams.get('year') || '',
    fuel_type: searchParams.get('fuel_type') || '',
    transmission: searchParams.get('transmission') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  const [availableFilters, setAvailableFilters] = useState({
    brands: [] as string[],
    years: [] as number[],
    fuel_types: [] as string[],
    transmissions: [] as string[],
  });

  useEffect(() => {
    fetchVehicles();
    fetchFilters();
  }, [filters]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`${API_URL}/vehicles?${params}`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const response = await axios.get(`${API_URL}/filters`);
      setAvailableFilters(response.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };


  const updateFilter = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      condition: '',
      brand: '',
      min_price: '',
      max_price: '',
      year: '',
      fuel_type: '',
      transmission: '',
      search: '',
      sort: 'newest',
    });
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== 'newest');

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
    <Link to={`/vehicles/${vehicle.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={vehicle.images[0] ? imgSrc(vehicle.images[0]) : '/placeholder-car.jpg'}
            alt={vehicle.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-car.jpg'; }}
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              vehicle.condition === 'new' 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              {vehicle.condition === 'new' ? 'New' : 'Used'}
            </span>
            {vehicle.vehicle_type === 'ebike' && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500 text-white">
                E-Bike
              </span>
            )}
            {vehicle.vehicle_type === 'motorcycle' && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-500 text-white">
                Motorcycle
              </span>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{vehicle.title}</h3>
          <p className="text-sm text-gray-500 mb-2">
            {[vehicle.year, vehicle.condition === 'used' ? vehicle.mileage.toLocaleString() + ' km' : 'New', vehicle.transmission].filter(Boolean).join(' • ')}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-red-600">{vehicle.price ? 'KES ' + vehicle.price.toLocaleString() : 'Contact for price'}</p>
            <span className="text-xs text-gray-400">{vehicle.fuel_type}</span>
          </div>
          <Button className="mt-3 w-full bg-red-600 hover:bg-red-700">View Details</Button>
        </CardContent>
      </Card>
    </Link>
  );

  const VehicleListItem = ({ vehicle }: { vehicle: Vehicle }) => (
    <Link to={`/vehicles/${vehicle.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-72 h-48 md:h-auto overflow-hidden">
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
          </div>
          <CardContent className="flex-1 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{vehicle.title}</h3>
                <p className="text-gray-500 mb-4 line-clamp-2">{vehicle.description}</p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <span className="px-3 py-1 bg-gray-100 rounded-full">{vehicle.year}</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full">{vehicle.mileage.toLocaleString()} km</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full">{vehicle.fuel_type}</span>
                  {vehicle.transmission && <span className="px-3 py-1 bg-gray-100 rounded-full">{vehicle.transmission}</span>}
                  <span className="px-3 py-1 bg-gray-100 rounded-full">{vehicle.seats} Seats</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">{vehicle.price ? 'KES ' + vehicle.price.toLocaleString() : 'Contact for price'}</p>
                <Button className="mt-4 bg-red-600 hover:bg-red-700">View Details</Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search vehicles..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
        <Select value={filters.condition} onValueChange={(v) => updateFilter('condition', v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Conditions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Conditions</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="used">Used</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicle Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
        <Select value={filters.type} onValueChange={(v) => updateFilter('type', v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="tuktuk_cargo">Cargo Tuk-Tuks</SelectItem>
            <SelectItem value="tuktuk_passenger">Passenger Tuk-Tuks</SelectItem>
            <SelectItem value="car">Cars</SelectItem>
            <SelectItem value="ebike">E-Bikes</SelectItem>
            <SelectItem value="motorcycle">Motorcycles</SelectItem>
            <SelectItem value="truck">Trucks and commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
        <Select value={filters.brand} onValueChange={(v) => updateFilter('brand', v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Brands</SelectItem>
            {availableFilters.brands.map((brand) => (
              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
            ))}
            {availableFilters.brands.length === 0 && (
              <>
                <SelectItem value="Toyota">Toyota</SelectItem>
                <SelectItem value="Honda">Honda</SelectItem>
                <SelectItem value="Mercedes">Mercedes</SelectItem>
                <SelectItem value="BMW">BMW</SelectItem>
                <SelectItem value="Audi">Audi</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (KES)</label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.min_price}
            onChange={(e) => updateFilter('min_price', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.max_price}
            onChange={(e) => updateFilter('max_price', e.target.value)}
          />
        </div>
      </div>

      {/* Year */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
        <Select value={filters.year} onValueChange={(v) => updateFilter('year', v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Years</SelectItem>
            {availableFilters.years.map((year) => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
            {availableFilters.years.length === 0 && (
              <>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Fuel Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
        <Select value={filters.fuel_type} onValueChange={(v) => updateFilter('fuel_type', v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Fuel Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Fuel Types</SelectItem>
            <SelectItem value="Petrol">Petrol</SelectItem>
            <SelectItem value="Diesel">Diesel</SelectItem>
            <SelectItem value="Electric">Electric</SelectItem>
            <SelectItem value="Hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transmission */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
        <Select value={filters.transmission} onValueChange={(v) => updateFilter('transmission', v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Transmissions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Transmissions</SelectItem>
            <SelectItem value="Automatic">Automatic</SelectItem>
            <SelectItem value="Manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={clearFilters}
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="pt-28 md:pt-32 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {type === 'new' ? 'New Cars' : 
             type === 'used' ? 'Used Cars' : 
             type === 'tuktuk_cargo' ? 'Cargo Tuk-Tuks' :
             type === 'tuktuk_passenger' ? 'Passenger Tuk-Tuks' :
             type === 'ebike' ? 'Electric Bikes' : 
             type === 'motorcycle' ? 'Motorcycles' : 
             'All Vehicles'}
          </h1>
          <p className="text-gray-500">
            {vehicles.length} vehicles available
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select value={filters.sort} onValueChange={(v) => updateFilter('sort', v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h2>
              <FilterContent />
            </div>
          </aside>

          {/* Vehicle Grid/List */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-5 bg-gray-200 rounded w-1/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No vehicles found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {vehicles.map((vehicle) => (
                  viewMode === 'grid' 
                    ? <VehicleCard key={vehicle.id} vehicle={vehicle} />
                    : <VehicleListItem key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
