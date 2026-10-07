import { useState } from 'react';
import { Mail, MapPin, Clock, Phone, User, Banknote } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

function WhatsAppIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const whatsappAccounts = [
  { number: '+254 720 549 567' },
  { number: '+254 768276840' },
];

const productTypes = ['Cargo electric tuk-tuk', 'Passenger electric tuk-tuk (10-seater)', 'Cars', 'E-bikes', 'Motorcycles', 'Trucks and commercial vehicles', 'Spare parts', 'Other'];

const iconBox =
  'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 text-slate-900';

export default function Contact() {
  const [form, setForm] = useState({ name: '', contact: '', product: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [trap, setTrap] = useState('');

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setError('');
    setSending(true);
    const contact = form.contact.trim();
    const isEmail = contact.includes('@');
    try {
      await axios.post(`${API_URL}/inquiries`, {
        name: form.name.trim(),
        email: isEmail ? contact : '',
        phone: isEmail ? '' : contact,
        message: (form.product ? `Interested in: ${form.product}\n\n` : '') + (form.message.trim() || '(no message)'),
        inquiry_type: 'contact_page',
        website: trap,
      });
      setSent(true);
      setForm({ name: '', contact: '', product: '', message: '' });
    } catch {
      setError('Sorry, we could not send your inquiry. Please try again, or contact us on WhatsApp.');
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200';

  return (
    <main className="bg-amber-50/60">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-28 lg:grid-cols-[1fr_1.1fr]">
        {/* Contact details */}
        <section>
          <h1 className="mb-8 text-4xl font-bold text-slate-900">Contact Us</h1>

          <div className="space-y-10">
            <div className="flex gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white">
                <WhatsAppIcon />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">WhatsApp</h2>
                <ul className="mt-2 space-y-2 text-lg text-slate-700">
                  {whatsappAccounts.map((a) => (
                    <li key={a.number}>
                      {a.number}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-slate-500">24 hours online</p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className={iconBox}>
                <Phone size={26} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Contact Numbers</h2>
                <p className="mt-2 text-lg text-slate-700">+254768276840 / +254720549567</p>
                <p className="text-lg text-slate-700">+86 18752141637</p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className={iconBox}>
                <Mail size={26} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Email</h2>
                <a href="mailto:kionglogisticsn@gmail.com" className="mt-2 block text-lg text-slate-700 hover:text-amber-600">kionglogisticsn@gmail.com</a>
                <p className="text-slate-500">Response within 24 business hours</p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className={iconBox}>
                <MapPin size={26} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Address</h2>
                <p className="mt-2 text-lg text-slate-700">
                  Kiong Logistics Network (Next to The Adventist University), Ongata Rongai, Magadi Road
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className={iconBox}>
                <User size={26} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Managing Director</h2>
                <p className="mt-2 text-lg text-slate-700">Dr. Jeremiah Machuki</p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className={iconBox}>
                <Banknote size={26} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Financing Provided</h2>
                <p className="mt-2 text-lg text-slate-700">Flexible payment plans to suit your business needs.</p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className={iconBox}>
                <Clock size={26} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Working Hours</h2>
                <p className="mt-2 text-lg text-slate-700">Monday to Friday: 9:00 - 17:30</p>
                <p className="text-lg text-slate-700">Saturday: 9:00 - 12:00</p>
              </div>
            </div>
          </div>
        </section>

        {/* Inquiry form */}
        <section className="relative z-10 rounded-2xl bg-white p-8 shadow-lg lg:self-start">
          <h2 className="mb-2 text-3xl font-bold text-slate-900">Online Inquiry</h2>
          <p className="mb-6 text-slate-600">
            Your inquiry is welcome; we will respond as soon as possible.
          </p>

          {sent && (
            <p role="status" className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-800">
              Inquiry sent. We'll reply within 24 business hours.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="website"
              value={trap}
              onChange={(e) => setTrap(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />
            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-red-700">
                {error}
              </p>
            )}
            <div>
              <label htmlFor="name" className="mb-2 block font-medium text-slate-800">
                Name *
              </label>
              <input
                id="name"
                required
                value={form.name}
                onChange={update('name')}
                placeholder="Enter your name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="contact" className="mb-2 block font-medium text-slate-800">
                Contact Information *
              </label>
              <input
                id="contact"
                required
                value={form.contact}
                onChange={update('contact')}
                placeholder="Phone/Email/WhatsApp"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="product" className="mb-2 block font-medium text-slate-800">
                Product types of interest
              </label>
              <select
                id="product"
                value={form.product}
                onChange={update('product')}
                className={inputClass}
              >
                <option value="">Please select</option>
                {productTypes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block font-medium text-slate-800">
                Message Content
              </label>
              <textarea
                id="message"
                rows={5}
                value={form.message}
                onChange={update('message')}
                placeholder="Describe your specific requirements..."
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 py-3.5 text-lg font-semibold text-slate-900 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              {sending ? 'Sending…' : 'Submit Inquiry'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
