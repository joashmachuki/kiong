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

    cd frontend
    npm ci
    npm run dev

Runs the dev server at http://localhost:5173

### Backend

The backend is `app.py` in this repository's root. From the root:

    python -m pip install -r requirements.txt
    python app.py

Runs the API server at http://localhost:8080. Set `PORT=5000` for the frontend's
default development API URL.

## Project Structure

    app.py               Flask API and production frontend server
    Dockerfile           Builds frontend and backend into one image
    frontend/src/
      components/       Reusable UI components (including admin/ for dashboard forms)
      pages/             Route-level pages (Home, Vehicles, VehicleDetail, Contact, etc.)
      pages/admin/       Admin dashboard pages (Login, Dashboard, Vehicles, Inquiries)
    frontend/public/     Static assets (logo, favicon, hero images)

## DigitalOcean App Platform

Deploy this repository as **one Web Service** using the root `Dockerfile`.
The image builds React into `frontend/dist`, then Gunicorn runs Flask, which
serves both the website and `/api`. No separate frontend process is needed.

- Source directory: repository root (`/`), not `frontend`.
- Dockerfile path: `Dockerfile`.
- Build command: leave blank; the Dockerfile builds both parts.
- Run command: leave blank to use the Dockerfile's startup command. A custom
  App Platform run command overrides the image startup command.
- Public HTTP port: `8080` (keep `PORT` consistent if overriding it).
- HTTP health check path: `/api/health`.
- Runtime environment variables: set a stable, random `SECRET_KEY` and a
  strong `ADMIN_PASSWORD`. The latter sets the initial `admin` password only
  when creating a new database; it does not reset an existing account.
- Leave `VITE_API_URL` unset for this single-service deployment; the frontend
  uses `/api` on the same origin.

After pushing changes, deploy the latest commit and inspect deployment/runtime
logs. `Non-Zero Exit Code` alone does not identify the cause; capture the Python
traceback or Gunicorn error immediately before the exit. Access and error logs
are written to the container's standard output/error.

The current database (`instance/autohub.db`) and uploaded images (`uploads/`)
are local files. App Platform's filesystem is ephemeral, so this setup does
not preserve new data through container replacement or share it across
instances. Persistent production data requires an external database and object
storage; those integrations are not implemented here.

## Admin Access

Admin dashboard available at /admin/login. Contact the site administrator for credentials.

## Contact

- Phone: +254 768 276 840 / +254 720 549 567
- Email: kionglogisticsn@gmail.com
- Location: Kiong Logistics Center, Ongata Rongai, Magadi Road (next to The Adventist University)
