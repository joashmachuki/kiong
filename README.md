# Kiong Logistics Network

Official website for **Kiong Logistics Network** - a Kenya-based dealer of electric tuk-tuks, e-bikes, motorcycles, cars, and solar-powered products (energy storage systems, solar fans, and solar lights).

## Features

- Browse and filter vehicles by type, price, brand, and condition
- Detailed vehicle listing pages with image galleries and specifications
- "Sell Your Car" submission form for customer trade-ins
- Solar product categories (energy storage, fans, lights) integrated into the same listing system
- Admin dashboard for managing vehicle/product listings, viewing customer inquiries, and tracking stock status
- Contact and inquiry forms connected to the backend

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Router

**Backend**
- Python (Flask)
- SQLite database
- REST API

## Getting Started

### Frontend

    npm install
    npm run dev

Runs the dev server at http://localhost:5173

### Backend

The backend lives in a separate project at k-tech-backend. From that folder:

    source venv/bin/activate
    python app.py

Runs the API server at http://localhost:5000

## Project Structure

    src/
      components/       Reusable UI components (including admin/ for dashboard forms)
      pages/             Route-level pages (Home, Vehicles, VehicleDetail, Contact, etc.)
      pages/admin/       Admin dashboard pages (Login, Dashboard, Vehicles, Inquiries)
    public/              Static assets (logo, favicon, hero images)

## Admin Access

Admin dashboard available at /admin/login. Contact the site administrator for credentials.

## Contact

- Phone: +254 768 276 840 / +254 720 549 567
- Email: kionglogisticsn@gmail.com
- Location: Kiong Logistics Center, Ongata Rongai, Magadi Road (next to The Adventist University)
