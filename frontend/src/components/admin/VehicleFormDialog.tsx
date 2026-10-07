import { useEffect, useState } from 'react';
import type { ChangeEvent, DragEvent, FormEvent, ReactNode } from 'react';
import { Battery, Bike, Bus, Car, Fan, Package, Plus, Star, Sun, Truck, Upload, Wrench, X, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from '../../lib/adminAxios';

/* ------------------------------------------------------------------ */
/*  Settings                                                           */
/* ------------------------------------------------------------------ */

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
const API_ORIGIN = API_URL.startsWith('http') ? new URL(API_URL).origin : '';
const MAX_PHOTOS = 8;

const imgSrc = (url: string) => (/^(https?:)?\/\//.test(url) ? url : API_ORIGIN + url);

/* ------------------------------------------------------------------ */
/*  Vehicle types and the extra fields each one shows                  */
/* ------------------------------------------------------------------ */

interface Spec {
  key: string;
  label: string;
  kind: 'text' | 'number' | 'select' | 'toggle';
  options?: string[];
  unit?: string;
  placeholder?: string;
}

interface TypeConfig {
  value: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  fuelOptions: string[];
  transmissionOptions: string[];
  seatsLabel: string | null;
  defaultSeats: number;
  specs: Spec[];
}

const batterySpecs: Spec[] = [
  { key: 'battery_type', label: 'Battery type', kind: 'select', options: ['Lithium-ion', 'Lead-acid', 'LiFePO4'] },
  { key: 'battery_capacity', label: 'Battery capacity', kind: 'text', placeholder: 'e.g. 72V 100Ah' },
  { key: 'range_km', label: 'Range', kind: 'number', unit: 'km' },
  { key: 'motor_power_kw', label: 'Motor power', kind: 'number', unit: 'kW' },
  { key: 'top_speed_kmh', label: 'Top speed', kind: 'number', unit: 'km/h' },
  { key: 'charging_time_hours', label: 'Charging time', kind: 'number', unit: 'hours' },
];

const chargerToggle: Spec = { key: 'charger_provided', label: 'Charger provided', kind: 'toggle' };
const swapToggle: Spec = { key: 'battery_swapping', label: 'Battery swapping available', kind: 'toggle' };

const TYPES: TypeConfig[] = [
  {
    value: 'tuktuk_cargo',
    label: 'Cargo tuk-tuk',
    hint: 'Electric, for goods',
    icon: Truck,
    fuelOptions: ['Electric'],
    transmissionOptions: [],
    seatsLabel: 'Seats (driver + passenger)',
    defaultSeats: 2,
    specs: [
      { key: 'body_type', label: 'Body type', kind: 'select', options: ['Open cargo bed', 'Closed box body', 'Tipper'] },
      { key: 'cargo_bed_size', label: 'Cargo bed size', kind: 'text', placeholder: 'e.g. 1.8 m x 1.2 m' },
      { key: 'load_capacity_kg', label: 'Load capacity', kind: 'number', unit: 'kg' },
      { key: 'power_system', label: 'Power system (motor)', kind: 'text', placeholder: 'e.g. 60/72V 1800W' },
      { key: 'control_system', label: 'Control system (controller)', kind: 'text', placeholder: 'e.g. 70H, 24-tube' },
      { key: 'suspension', label: 'Suspension system', kind: 'text', placeholder: 'e.g. 37# spring shock absorber' },
      { key: 'tire_spec', label: 'Tire specification', kind: 'text', placeholder: 'e.g. Front 375, Rear 400, wire tires' },
      { key: 'other_features', label: 'Other configuration', kind: 'text', placeholder: 'e.g. One-foot three-brake, integrated gear shift, steel door core, suspended rear axle' },
      ...batterySpecs,
      chargerToggle,
      swapToggle,
    ],
  },
  {
    value: 'tuktuk_passenger',
    label: 'Passenger tuk-tuk',
    hint: 'Electric, carries people',
    icon: Bus,
    fuelOptions: ['Electric'],
    transmissionOptions: [],
    seatsLabel: 'Seats (including driver)',
    defaultSeats: 10,
    specs: [
      { key: 'cabin_type', label: 'Cabin type', kind: 'select', options: ['Enclosed cabin', 'Open with canopy'] },
      { key: 'power_system', label: 'Power system (motor)', kind: 'text', placeholder: 'e.g. 60/72V 1800W' },
      { key: 'control_system', label: 'Control system (controller)', kind: 'text', placeholder: 'e.g. 70H, 24-tube' },
      { key: 'suspension', label: 'Suspension system', kind: 'text', placeholder: 'e.g. 37# spring shock absorber' },
      { key: 'tire_spec', label: 'Tire specification', kind: 'text', placeholder: 'e.g. Front 375, Rear 400, wire tires' },
      { key: 'other_features', label: 'Other configuration', kind: 'text', placeholder: 'e.g. One-foot three-brake, integrated gear shift, steel door core, suspended rear axle' },
      ...batterySpecs,
      chargerToggle,
      swapToggle,
    ],
  },
  {
    value: 'car',
    label: 'Car',
    hint: 'New or used',
    icon: Car,
    fuelOptions: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    transmissionOptions: ['Automatic', 'Manual'],
    seatsLabel: 'Seats',
    defaultSeats: 5,
    specs: [
      { key: 'body_type', label: 'Body type', kind: 'select', options: ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Coupe'] },
      { key: 'engine_size', label: 'Engine size', kind: 'text', placeholder: 'e.g. 2.0L' },
      { key: 'drive_type', label: 'Drive type', kind: 'select', options: ['2WD', '4WD', 'AWD'] },
    ],
  },
  {
    value: 'ebike',
    label: 'E-bike',
    hint: 'Electric bike or scooter',
    icon: Zap,
    fuelOptions: ['Electric'],
    transmissionOptions: [],
    seatsLabel: null,
    defaultSeats: 1,
    specs: [...batterySpecs, chargerToggle],
  },
  {
    value: 'motorcycle',
    label: 'Motorcycle',
    hint: 'Petrol or electric',
    icon: Bike,
    fuelOptions: ['Petrol', 'Electric'],
    transmissionOptions: ['Manual', 'Automatic'],
    seatsLabel: null,
    defaultSeats: 2,
    specs: [
      { key: 'body_type', label: 'Style', kind: 'select', options: ['Standard', 'Sport', 'Cruiser', 'Scooter', 'Off-road'] },
      { key: 'engine_size', label: 'Engine size', kind: 'text', placeholder: 'e.g. 150 cc' },
    ],
  },
  {
    value: 'truck',
    label: 'Truck / commercial',
    hint: 'Trucks and vans',
    icon: Package,
    fuelOptions: ['Diesel', 'Petrol', 'Electric'],
    transmissionOptions: ['Manual', 'Automatic'],
    seatsLabel: 'Seats',
    defaultSeats: 3,
    specs: [
      { key: 'body_type', label: 'Body type', kind: 'select', options: ['Flatbed', 'Box', 'Tipper', 'Refrigerated', 'Tanker'] },
      { key: 'load_capacity_kg', label: 'Load capacity', kind: 'number', unit: 'kg' },
      { key: 'engine_size', label: 'Engine size', kind: 'text', placeholder: 'e.g. 4.0L' },
      { key: 'drive_type', label: 'Drive type', kind: 'select', options: ['2WD', '4WD', 'AWD'] },
    ],
  },
  {
    value: 'solar_storage',
    label: 'Solar Energy Storage System',
    hint: 'Batteries, inverters & panels',
    icon: Battery,
    fuelOptions: ['N/A'],
    transmissionOptions: [],
    seatsLabel: null,
    defaultSeats: 1,
    specs: [
      { key: 'capacity', label: 'Storage capacity', kind: 'text', placeholder: 'e.g. 5kWh / 100Ah' },
      { key: 'battery_type', label: 'Battery type', kind: 'select', options: ['Lithium-ion', 'Lead-acid', 'LiFePO4'] },
      { key: 'inverter_power', label: 'Inverter power', kind: 'text', placeholder: 'e.g. 3000W' },
      { key: 'panel_wattage', label: 'Panel wattage', kind: 'text', placeholder: 'e.g. 4 x 300W panels' },
    ],
  },
  {
    value: 'solar_fan',
    label: 'Solar Powered Fan',
    hint: 'Fans that run on solar power',
    icon: Fan,
    fuelOptions: ['N/A'],
    transmissionOptions: [],
    seatsLabel: null,
    defaultSeats: 1,
    specs: [
      { key: 'panel_wattage', label: 'Panel wattage', kind: 'text', placeholder: 'e.g. 20W' },
      { key: 'fan_size', label: 'Fan size', kind: 'text', placeholder: 'e.g. 12 inch' },
      { key: 'battery_backup', label: 'Battery backup', kind: 'toggle' },
    ],
  },
  {
    value: 'solar_light',
    label: 'Solar Light',
    hint: 'Flood lights, lanterns & street lights',
    icon: Sun,
    fuelOptions: ['N/A'],
    transmissionOptions: [],
    seatsLabel: null,
    defaultSeats: 1,
    specs: [
      { key: 'light_type', label: 'Light type', kind: 'select', options: ['Flood light', 'Street light', 'Lantern', 'Garden light'] },
      { key: 'lumens', label: 'Brightness', kind: 'text', placeholder: 'e.g. 2000 lumens' },
      { key: 'panel_wattage', label: 'Panel wattage', kind: 'text', placeholder: 'e.g. 10W' },
    ],
  },
  {
    value: 'spare_part',
    label: 'Spare Part',
    hint: 'Parts and accessories',
    icon: Wrench,
    fuelOptions: ['N/A'],
    transmissionOptions: [],
    seatsLabel: null,
    defaultSeats: 1,
    specs: [
      { key: 'compatible_vehicle_type', label: 'Compatible vehicle type', kind: 'select', options: ['Cargo tuk-tuk', 'Passenger tuk-tuk', 'Car', 'E-bike', 'Motorcycle', 'Truck', 'Universal / Any'] },
      { key: 'part_number', label: 'Part number (optional)', kind: 'text', placeholder: 'e.g. BP-2201' },
    ],
  },
  {
    value: 'other',
    label: 'Other',
    hint: 'Anything else',
    icon: Plus,
    fuelOptions: ['Electric', 'Petrol', 'Diesel', 'Hybrid'],
    transmissionOptions: [],
    seatsLabel: null,
    defaultSeats: 1,
    specs: [],
  },
];

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
];

const STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'sold', label: 'Sold' },
  { value: 'out_of_stock', label: 'Out of stock' },
];

const findType = (value: string): TypeConfig => TYPES.find((t) => t.value === value) ?? TYPES[TYPES.length - 1];

/* ------------------------------------------------------------------ */
/*  Form data                                                          */
/* ------------------------------------------------------------------ */

export interface VehicleRecord {
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
  specifications?: unknown;
}

interface FormState {
  vehicle_type: string;
  title: string;
  brand: string;
  model: string;
  year: string;
  condition: string;
  price: string;
  mileage: string;
  fuel_type: string;
  transmission: string;
  color: string;
  seats: string;
  description: string;
  images: string[];
  featured: boolean;
  stock_status: string;
}

type Specs = Record<string, string | boolean>;

const blankForm = (typeValue: string): FormState => {
  const c = findType(typeValue);
  return {
    vehicle_type: c.value,
    title: '',
    brand: '',
    model: '',
    year: String(new Date().getFullYear()),
    condition: 'new',
    price: '',
    mileage: '0',
    fuel_type: c.fuelOptions[0],
    transmission: c.transmissionOptions[0] ?? '',
    color: '',
    seats: String(c.defaultSeats),
    description: '',
    images: [],
    featured: false,
    stock_status: 'available',
  };
};

const fromVehicle = (v: VehicleRecord): FormState => ({
  vehicle_type: v.vehicle_type,
  title: v.title ?? '',
  brand: v.brand ?? '',
  model: v.model ?? '',
  year: String(v.year ?? ''),
  condition: v.condition || 'new',
  price: String(Math.round(Number(v.price) || 0)),
  mileage: String(v.mileage ?? 0),
  fuel_type: v.fuel_type ?? '',
  transmission: v.transmission ?? '',
  color: v.color ?? '',
  seats: String(v.seats ?? ''),
  description: v.description ?? '',
  images: Array.isArray(v.images) ? v.images : [],
  featured: Boolean(v.featured),
  stock_status: v.stock_status || 'available',
});

const parseSpecs = (raw: unknown): Specs => {
  let obj: unknown = raw;
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw);
    } catch {
      obj = {};
    }
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
  const out: Specs = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof v === 'string' || typeof v === 'boolean') out[k] = v;
    else if (typeof v === 'number') out[k] = String(v);
  }
  return out;
};

const digits = (s: string) => s.replace(/\D/g, '');
const money = (s: string) => (digits(s) ? Number(digits(s)).toLocaleString() : '');

const errorMessage = (err: unknown, fallback: string) => {
  const e = err as { response?: { data?: { message?: string; error?: string } } };
  return e?.response?.data?.message || e?.response?.data?.error || fallback;
};

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

const selectClass =
  'h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100';

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="space-y-3">
    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
    {children}
  </div>
);

const Field = ({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) => (
  <div className={className}>
    <Label className="mb-1.5 block text-sm">{label}</Label>
    {children}
  </div>
);

const Pills = ({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
          value === o.value
            ? 'border-red-600 bg-red-600 text-white'
            : 'border-gray-300 bg-white text-gray-700 hover:border-red-400'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const Toggle = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm hover:bg-gray-50"
  >
    <span>{label}</span>
    <span
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-red-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
          checked ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </span>
  </button>
);

/* ------------------------------------------------------------------ */
/*  The dialog                                                         */
/* ------------------------------------------------------------------ */

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: VehicleRecord | null;
  onSaved: () => void;
}

const VehicleFormDialog = ({ open, onOpenChange, vehicle, onSaved }: Props) => {
  const [form, setForm] = useState<FormState>(() => blankForm('tuktuk_cargo'));
  const [specs, setSpecs] = useState<Specs>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (vehicle) {
      setForm(fromVehicle(vehicle));
      setSpecs(parseSpecs(vehicle.specifications));
    } else {
      setForm(blankForm('tuktuk_cargo'));
      setSpecs({});
    }
  }, [open, vehicle]);

  const cfg = findType(form.vehicle_type);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const chooseType = (value: string) => {
    const c = findType(value);
    setForm((f) => ({
      ...f,
      vehicle_type: c.value,
      fuel_type: c.fuelOptions.includes(f.fuel_type) ? f.fuel_type : c.fuelOptions[0],
      transmission: c.transmissionOptions.length
        ? c.transmissionOptions.includes(f.transmission)
          ? f.transmission
          : c.transmissionOptions[0]
        : '',
      seats: c.seatsLabel ? f.seats || String(c.defaultSeats) : String(c.defaultSeats),
    }));
    setSpecs((s) => {
      const keep: Specs = { financing_available: s.financing_available === true };
      const allowedKeys = new Set(c.specs.map((spec) => spec.key));
      for (const [k, v] of Object.entries(s)) {
        if (allowedKeys.has(k)) keep[k] = v;
      }
      return keep;
    });
  };

  /* ---------- photos ---------- */

  const uploadFiles = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) {
      toast.error('Please choose image files (JPG, PNG or WebP).');
      return;
    }
    const room = MAX_PHOTOS - form.images.length;
    if (room <= 0) {
      toast.error(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    if (images.length > room) toast.message(`Only the first ${room} photo(s) were added (max ${MAX_PHOTOS}).`);

    setUploading(true);
    const added: string[] = [];
    for (const file of images.slice(0, room)) {
      try {
        const body = new FormData();
        body.append('file', file);
        const res = await axios.post(`${API_URL}/upload`, body);
        if (res.data?.url) added.push(res.data.url as string);
        else toast.error(`Could not upload ${file.name}`);
      } catch (err) {
        toast.error(errorMessage(err, `Could not upload ${file.name}`));
      }
    }
    setForm((f) => ({ ...f, images: [...f.images, ...added] }));
    setUploading(false);
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) void uploadFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) void uploadFiles(Array.from(e.dataTransfer.files));
  };

  const makeMain = (url: string) =>
    setForm((f) => ({ ...f, images: [url, ...f.images.filter((u) => u !== url)] }));

  const removePhoto = (index: number) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));

  /* ---------- save ---------- */

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const brand = form.brand.trim();
    const model = form.model.trim();
    const price = Number(digits(form.price));
    const year = Number(form.year);
    if (year && (year < 1980 || year > new Date().getFullYear() + 1)) return toast.error('Please enter a valid year, or leave it empty.');

    const specifications: Record<string, string | number | boolean> = {};
    for (const s of cfg.specs) {
      const v = specs[s.key];
      if (s.kind === 'toggle') specifications[s.key] = v === true;
      else if (typeof v === 'string' && v !== '') {
        if (s.kind === 'number') {
          const n = Number(v);
          if (!Number.isNaN(n)) specifications[s.key] = n;
        } else specifications[s.key] = v;
      }
    }
    specifications.financing_available = specs.financing_available === true;

    const payload = {
      title: form.title.trim() || `${year} ${brand} ${model}`,
      vehicle_type: form.vehicle_type,
      condition: form.condition,
      brand,
      model,
      year,
      price,
      mileage: form.condition === 'used' ? Number(digits(form.mileage)) || 0 : 0,
      fuel_type: form.fuel_type,
      transmission: form.transmission,
      color: form.color.trim(),
      seats: cfg.seatsLabel ? Number(form.seats) || cfg.defaultSeats : cfg.defaultSeats,
      description: form.description.trim(),
      specifications,
      images: form.images,
      featured: form.featured,
      stock_status: form.stock_status,
    };

    setSaving(true);
    try {
      if (vehicle) await axios.put(`${API_URL}/vehicles/${vehicle.id}`, payload);
      else await axios.post(`${API_URL}/vehicles`, payload);
      toast.success(vehicle ? 'Vehicle updated' : 'Vehicle added');
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save the vehicle. Please log in again and retry.'));
    } finally {
      setSaving(false);
    }
  };

  /* ---------- extra fields for the chosen type ---------- */

  const renderSpec = (s: Spec) => {
    if (s.kind === 'toggle') {
      return (
        <Toggle
          key={s.key}
          label={s.label}
          checked={specs[s.key] === true}
          onChange={(v) => setSpecs((p) => ({ ...p, [s.key]: v }))}
        />
      );
    }
    const value = typeof specs[s.key] === 'string' ? (specs[s.key] as string) : '';
    const setValue = (v: string) => setSpecs((p) => ({ ...p, [s.key]: v }));
    return (
      <Field key={s.key} label={s.unit ? `${s.label} (${s.unit})` : s.label}>
        {s.kind === 'select' ? (
          <select value={value} onChange={(e) => setValue(e.target.value)} className={selectClass}>
            <option value="">Select…</option>
            {s.options?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : (
          <Input
            value={value}
            onChange={(e) => setValue(s.kind === 'number' ? e.target.value.replace(/[^\d.]/g, '') : e.target.value)}
            placeholder={s.placeholder}
            inputMode={s.kind === 'number' ? 'decimal' : undefined}
          />
        )}
      </Field>
    );
  };

  const fieldSpecs = cfg.specs.filter((s) => s.kind !== 'toggle');
  const toggleSpecs = cfg.specs.filter((s) => s.kind === 'toggle');
  const fuelOptions =
    !form.fuel_type || cfg.fuelOptions.includes(form.fuel_type)
      ? cfg.fuelOptions
      : [form.fuel_type, ...cfg.fuelOptions];

  /* ---------- live preview ---------- */

  const chips = [
    ...fieldSpecs
      .filter((s) => typeof specs[s.key] === 'string' && specs[s.key] !== '')
      .map((s) => `${s.label}: ${specs[s.key] as string}${s.unit ? ' ' + s.unit : ''}`),
    ...toggleSpecs.filter((s) => specs[s.key] === true).map((s) => s.label),
    ...(specs.financing_available === true ? ['Financing available'] : []),
  ].slice(0, 4);

  const previewTitle = form.title.trim() || [form.year, form.brand.trim(), form.model.trim()].filter(Boolean).join(' ') || 'Vehicle title';
  const statusLabel = STATUSES.find((s) => s.value === form.stock_status)?.label ?? '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-[95vw] overflow-y-auto p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{vehicle ? 'Edit vehicle' : 'Add a vehicle'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 px-6 py-5 lg:grid-cols-[1fr_280px]">
            <div className="space-y-7">
              {/* Type */}
              <Section title="1. What are you adding?">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TYPES.map((t) => {
                    const Icon = t.icon;
                    const selected = form.vehicle_type === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => chooseType(t.value)}
                        className={`flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-colors ${
                          selected
                            ? 'border-red-600 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-red-300'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-semibold leading-tight">{t.label}</span>
                        <span className="text-xs text-gray-500">{t.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Basics */}
              <Section title="2. Basic details">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Brand *">
                    <Input value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Kiong" />
                  </Field>
                  <Field label="Model *">
                    <Input value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="e.g. Cargo 2000" />
                  </Field>
                  <Field label="Listing title (optional)" className="sm:col-span-2">
                    <Input
                      value={form.title}
                      onChange={(e) => set('title', e.target.value)}
                      placeholder="Left empty, the year, brand and model are used"
                    />
                  </Field>
                  <Field label="Year *">
                    <Input
                      value={form.year}
                      onChange={(e) => set('year', digits(e.target.value).slice(0, 4))}
                      inputMode="numeric"
                    />
                  </Field>
                  <Field label="Price (KES) *">
                    <Input
                      value={money(form.price)}
                      onChange={(e) => set('price', digits(e.target.value))}
                      inputMode="numeric"
                      placeholder="e.g. 650,000"
                    />
                  </Field>
                  <Field label="Colour">
                    <Input value={form.color} onChange={(e) => set('color', e.target.value)} />
                  </Field>
                  {cfg.seatsLabel && (
                    <Field label={cfg.seatsLabel}>
                      <Input
                        value={form.seats}
                        onChange={(e) => set('seats', digits(e.target.value).slice(0, 2))}
                        inputMode="numeric"
                      />
                    </Field>
                  )}
                  <Field label="Fuel / power">
                    <select value={form.fuel_type} onChange={(e) => set('fuel_type', e.target.value)} className={selectClass}>
                      {fuelOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {cfg.transmissionOptions.length > 0 && (
                    <Field label="Transmission">
                      <select
                        value={form.transmission}
                        onChange={(e) => set('transmission', e.target.value)}
                        className={selectClass}
                      >
                        {cfg.transmissionOptions.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Condition">
                    <Pills options={CONDITIONS} value={form.condition} onChange={(v) => set('condition', v)} />
                  </Field>
                  <Field label="Availability">
                    <Pills options={STATUSES} value={form.stock_status} onChange={(v) => set('stock_status', v)} />
                  </Field>
                  {form.condition === 'used' && (
                    <Field label="Mileage (km)">
                      <Input
                        value={money(form.mileage)}
                        onChange={(e) => set('mileage', digits(e.target.value))}
                        inputMode="numeric"
                      />
                    </Field>
                  )}
                </div>
              </Section>

              {/* Type specific */}
              {cfg.specs.length > 0 && (
                <Section title={`3. ${cfg.label} specifications`}>
                  {fieldSpecs.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{fieldSpecs.map(renderSpec)}</div>}
                  {toggleSpecs.length > 0 && <div className="grid gap-2 sm:grid-cols-2">{toggleSpecs.map(renderSpec)}</div>}
                </Section>
              )}

              {/* Photos */}
              <Section title="4. Photos">
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${
                    dragging ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={onPick}
                  />
                  {uploading ? (
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                  ) : (
                    <Upload className="h-6 w-6 text-gray-400" />
                  )}
                  <span className="font-medium text-gray-700">
                    {uploading ? 'Uploading…' : 'Click to choose photos, or drag them here'}
                  </span>
                  <span className="text-xs text-gray-500">
                    JPG, PNG or WebP, up to 8 MB each, max {MAX_PHOTOS} photos. The first photo is the main one.
                  </span>
                </label>

                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {form.images.map((url, i) => (
                      <div key={url + i} className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-gray-100">
                        <img src={imgSrc(url)} alt="" className="h-full w-full object-cover" />
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            Main
                          </span>
                        )}
                        <div className="absolute right-1 top-1 flex gap-1">
                          {i !== 0 && (
                            <button
                              type="button"
                              title="Make main photo"
                              onClick={() => makeMain(url)}
                              className="rounded bg-white/90 p-1 text-gray-700 shadow hover:text-amber-500"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            title="Remove photo"
                            onClick={() => removePhoto(i)}
                            className="rounded bg-white/90 p-1 text-gray-700 shadow hover:text-red-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Description and options */}
              <Section title="5. Description and options">
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={4}
                  placeholder="Key features, what it is best for, warranty, delivery..."
                  className="w-full rounded-md border border-gray-300 p-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Toggle
                    label="Financing available"
                    checked={specs.financing_available === true}
                    onChange={(v) => setSpecs((p) => ({ ...p, financing_available: v }))}
                  />
                  <Toggle label="Featured on homepage" checked={form.featured} onChange={(v) => set('featured', v)} />
                </div>
              </Section>
            </div>

            {/* Live preview */}
            <aside className="hidden lg:block">
              <div className="sticky top-2 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Preview</p>
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                  <div className="aspect-[4/3] bg-gray-100">
                    {form.images[0] ? (
                      <img src={imgSrc(form.images[0])} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">No photo yet</div>
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="flex flex-wrap gap-1">
                      <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">{cfg.label}</span>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-700">{form.condition}</span>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{statusLabel}</span>
                    </div>
                    <p className="font-semibold leading-snug text-gray-900">{previewTitle}</p>
                    <p className="text-lg font-bold text-red-600">
                      {form.price ? `KES ${money(form.price)}` : 'KES —'}
                    </p>
                    {chips.length > 0 && (
                      <ul className="space-y-1 text-xs text-gray-600">
                        {chips.map((c) => (
                          <li key={c}>• {c}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-white px-6 py-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading} className="bg-red-600 hover:bg-red-700">
              {saving ? 'Saving…' : vehicle ? 'Save changes' : 'Add vehicle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleFormDialog;
