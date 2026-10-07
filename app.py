"""
AutoHub Kenya - Car Selling Website Backend
Flask Application with SQLite Database
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
import secrets
from functools import wraps
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import json
import uuid

app = Flask(__name__)
os.makedirs(app.instance_path, exist_ok=True)

def _load_env_file():
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(path):
        with open(path) as fh:
            for line in fh:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

_load_env_file()

ALLOWED_ORIGINS = [o.strip() for o in os.environ.get('ALLOWED_ORIGINS', 'http://localhost:5173').split(',') if o.strip()]
CORS(app, origins=ALLOWED_ORIGINS)

_SECRET = os.environ.get('SECRET_KEY') or secrets.token_hex(32)
_serializer = URLSafeTimedSerializer(_SECRET)

def make_admin_token(username):
    return _serializer.dumps({'u': username})

def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '', 1).strip()
        try:
            _serializer.loads(token, max_age=8 * 3600)
        except (BadSignature, SignatureExpired):
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return wrapper

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///autohub.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'autohub-kenya-secret-key-2024'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'vehicles'), exist_ok=True)

db = SQLAlchemy(app)

# ==================== DATABASE MODELS ====================

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Vehicle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    vehicle_type = db.Column(db.String(50), nullable=False)  # car, ebike, motorcycle
    condition = db.Column(db.String(20), nullable=False)  # new, used
    brand = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    mileage = db.Column(db.Integer, default=0)
    fuel_type = db.Column(db.String(50), default='')
    transmission = db.Column(db.String(50), default='')
    color = db.Column(db.String(50), default='')
    seats = db.Column(db.Integer, default=5)
    description = db.Column(db.Text, default='')
    specifications = db.Column(db.Text, default='{}')  # JSON string
    images = db.Column(db.Text, default='[]')  # JSON array of image URLs
    stock_status = db.Column(db.String(20), default='available')  # available, sold, out_of_stock
    featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Inquiry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    message = db.Column(db.Text, nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicle.id'), nullable=True)
    inquiry_type = db.Column(db.String(50), default='general')  # general, vehicle, sell_car
    status = db.Column(db.String(20), default='pending')  # pending, responded, closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SellCarRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    car_brand = db.Column(db.String(100), nullable=False)
    car_model = db.Column(db.String(100), nullable=False)
    car_year = db.Column(db.Integer, nullable=False)
    car_mileage = db.Column(db.Integer, nullable=False)
    expected_price = db.Column(db.Float, nullable=False)
    condition = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, default='')
    status = db.Column(db.String(20), default='pending')  # pending, contacted, rejected, sold
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SparePartRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=False)
    vehicle_type = db.Column(db.String(50), nullable=False)  # car, truck, ebike, motorcycle
    vehicle_brand = db.Column(db.String(100), nullable=False)
    vehicle_model = db.Column(db.String(100), nullable=False)
    part_name = db.Column(db.String(200), nullable=False)
    part_number = db.Column(db.String(100), nullable=True)
    quantity = db.Column(db.Integer, default=1)
    description = db.Column(db.Text, default='')
    status = db.Column(db.String(20), default='pending')  # pending, sourced, delivered, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@app.route('/api/spare-parts-request', methods=['POST'])
def create_spare_part_request():
    data = request.get_json()
    new_request = SparePartRequest(
        name=data.get('name'),
        email=data.get('email', ''),
        phone=data.get('phone'),
        vehicle_type=data.get('vehicleType'),
        vehicle_brand=data.get('vehicleBrand'),
        vehicle_model=data.get('vehicleModel'),
        part_name=data.get('partName'),
        part_number=data.get('partNumber', ''),
        quantity=int(data.get('quantity', 1)),
        description=data.get('description', ''),
        status='pending'
    )
    db.session.add(new_request)
    db.session.commit()
    return jsonify({'message': 'Request submitted successfully', 'id': new_request.id}), 201

@app.route('/api/admin/spare-parts', methods=['GET'])
@admin_required
def get_spare_part_requests():
    requests = SparePartRequest.query.order_by(SparePartRequest.created_at.desc()).all()
    return jsonify([{
        'id': r.id,
        'name': r.name,
        'phone': r.phone,
        'email': r.email,
        'vehicle_type': r.vehicle_type,
        'vehicle_brand': r.vehicle_brand,
        'vehicle_model': r.vehicle_model,
        'part_name': r.part_name,
        'part_number': r.part_number,
        'quantity': r.quantity,
        'description': r.description,
        'status': r.status,
        'created_at': r.created_at.isoformat()
    } for r in requests])

@app.route('/api/admin/spare-parts/<int:request_id>', methods=['PUT'])
@admin_required
def update_spare_part_request(request_id):
    data = request.get_json()
    req = SparePartRequest.query.get_or_404(request_id)
    req.status = data.get('status', req.status)
    db.session.commit()
    return jsonify({'message': 'Updated successfully'})

# ==================== INITIALIZATION ====================

def init_db():
    with app.app_context():
        db.create_all()
        # Create default admin if not exists
        admin = Admin.query.filter_by(username='admin').first()
        if not admin:
            admin = Admin(
                username='admin',
                password_hash=generate_password_hash(os.environ.get('ADMIN_PASSWORD') or secrets.token_urlsafe(24))
            )
            db.session.add(admin)
            db.session.commit()

init_db()

# ==================== AUTH ROUTES ====================

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    admin = Admin.query.filter_by(username=username).first()
    if admin and check_password_hash(admin.password_hash, password):
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': make_admin_token(admin.username),
            'username': admin.username
        })
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

# ==================== VEHICLE ROUTES ====================

@app.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    # Get query parameters
    vehicle_type = request.args.get('vehicle_type', '') or request.args.get('type', '')
    condition = request.args.get('condition', '')
    brand = request.args.get('brand', '')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    year = request.args.get('year', type=int)
    fuel_type = request.args.get('fuel_type', '')
    transmission = request.args.get('transmission', '')
    search = request.args.get('search', '')
    sort = request.args.get('sort', 'newest')
    featured = request.args.get("featured", "").lower() in ["true", "1", "yes"]
    
    # Base query
    query = Vehicle.query.filter_by(stock_status='available')
    
    # Apply filters
    if vehicle_type:
        query = query.filter_by(vehicle_type=vehicle_type)
    if condition:
        query = query.filter_by(condition=condition)
    if brand:
        query = query.filter(Vehicle.brand.ilike(f'%{brand}%'))
    if min_price is not None:
        query = query.filter(Vehicle.price >= min_price)
    if max_price is not None:
        query = query.filter(Vehicle.price <= max_price)
    if year:
        query = query.filter_by(year=year)
    if fuel_type:
        query = query.filter_by(fuel_type=fuel_type)
    if transmission:
        query = query.filter_by(transmission=transmission)
    if featured:
        query = query.filter_by(featured=True)
    if search:
        query = query.filter(
            db.or_(
                Vehicle.title.ilike(f'%{search}%'),
                Vehicle.brand.ilike(f'%{search}%'),
                Vehicle.model.ilike(f'%{search}%')
            )
        )
    
    # Apply sorting
    if sort == 'price_low':
        query = query.order_by(Vehicle.price.asc())
    elif sort == 'price_high':
        query = query.order_by(Vehicle.price.desc())
    elif sort == 'newest':
        query = query.order_by(Vehicle.created_at.desc())
    elif sort == 'popular':
        query = query.order_by(Vehicle.featured.desc(), Vehicle.created_at.desc())
    
    vehicles = query.all()
    return jsonify([{
        'id': v.id,
        'title': v.title,
        'vehicle_type': v.vehicle_type,
        'condition': v.condition,
        'brand': v.brand,
        'model': v.model,
        'year': v.year,
        'price': v.price,
        'mileage': v.mileage,
        'fuel_type': v.fuel_type,
        'transmission': v.transmission,
        'color': v.color,
        'seats': v.seats,
        'description': v.description[:200] + '...' if len(v.description) > 200 else v.description,
        'images': json.loads(v.images),
        'featured': v.featured,
        'stock_status': v.stock_status
    } for v in vehicles])

@app.route('/api/vehicles/<int:vehicle_id>', methods=['GET'])
def get_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    return jsonify({
        'id': vehicle.id,
        'title': vehicle.title,
        'vehicle_type': vehicle.vehicle_type,
        'condition': vehicle.condition,
        'brand': vehicle.brand,
        'model': vehicle.model,
        'year': vehicle.year,
        'price': vehicle.price,
        'mileage': vehicle.mileage,
        'fuel_type': vehicle.fuel_type,
        'transmission': vehicle.transmission,
        'color': vehicle.color,
        'seats': vehicle.seats,
        'description': vehicle.description,
        'specifications': json.loads(vehicle.specifications),
        'images': json.loads(vehicle.images),
        'featured': vehicle.featured,
        'stock_status': vehicle.stock_status,
        'created_at': vehicle.created_at.isoformat()
    })

@app.route('/api/vehicles', methods=['POST'])
@admin_required
def create_vehicle():
    data = request.get_json()
    
    vehicle = Vehicle(
        title=data.get('title') or 'Untitled vehicle',
        vehicle_type=data.get('vehicle_type') or 'other',
        condition=data.get('condition') or 'new',
        brand=data.get('brand') or '',
        model=data.get('model') or '',
        year=data.get('year') or 0,
        price=data.get('price') or 0,
        mileage=data.get('mileage', 0),
        fuel_type=data.get('fuel_type', ''),
        transmission=data.get('transmission', ''),
        color=data.get('color', ''),
        seats=data.get('seats', 5),
        description=data.get('description', ''),
        specifications=json.dumps(data.get('specifications', {})),
        images=json.dumps(data.get('images', [])),
        stock_status=data.get('stock_status', 'available'),
        featured=data.get('featured', False)
    )
    
    db.session.add(vehicle)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Vehicle created', 'id': vehicle.id}), 201

@app.route('/api/vehicles/<int:vehicle_id>', methods=['PUT'])
@admin_required
def update_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    data = request.get_json()
    
    vehicle.title = data.get('title', vehicle.title)
    vehicle.vehicle_type = data.get('vehicle_type', vehicle.vehicle_type)
    vehicle.condition = data.get('condition', vehicle.condition)
    vehicle.brand = data.get('brand', vehicle.brand)
    vehicle.model = data.get('model', vehicle.model)
    vehicle.year = data.get('year', vehicle.year)
    vehicle.price = data.get('price', vehicle.price)
    vehicle.mileage = data.get('mileage', vehicle.mileage)
    vehicle.fuel_type = data.get('fuel_type', vehicle.fuel_type)
    vehicle.transmission = data.get('transmission', vehicle.transmission)
    vehicle.color = data.get('color', vehicle.color)
    vehicle.seats = data.get('seats', vehicle.seats)
    vehicle.description = data.get('description', vehicle.description)
    vehicle.specifications = json.dumps(data.get('specifications', json.loads(vehicle.specifications)))
    vehicle.images = json.dumps(data.get('images', json.loads(vehicle.images)))
    vehicle.stock_status = data.get('stock_status', vehicle.stock_status)
    vehicle.featured = data.get('featured', vehicle.featured)
    vehicle.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Vehicle updated'})

@app.route('/api/vehicles/<int:vehicle_id>', methods=['DELETE'])
@admin_required
def delete_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    db.session.delete(vehicle)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Vehicle deleted'})

# ==================== BRANDS & FILTERS ====================

@app.route('/api/brands', methods=['GET'])
def get_brands():
    brands = db.session.query(Vehicle.brand).distinct().all()
    return jsonify([b[0] for b in brands])

@app.route('/api/filters', methods=['GET'])
def get_filters():
    """Get all available filter options"""
    brands = [b[0] for b in db.session.query(Vehicle.brand).distinct().all()]
    years = sorted([y[0] for y in db.session.query(Vehicle.year).distinct().all()], reverse=True)
    fuel_types = [f[0] for f in db.session.query(Vehicle.fuel_type).distinct().all() if f[0]]
    transmissions = [t[0] for t in db.session.query(Vehicle.transmission).distinct().all() if t[0]]
    
    return jsonify({
        'brands': brands,
        'years': years,
        'fuel_types': fuel_types,
        'transmissions': transmissions
    })

# ==================== INQUIRY ROUTES ====================

@app.route('/api/inquiries', methods=['POST'])
def create_inquiry():
    data = request.get_json(silent=True) or {}
    if data.get('website'):  # hidden trap field, only bots fill it in
        return jsonify({'success': True, 'message': 'Inquiry submitted successfully'}), 201
    if not str(data.get('name') or '').strip() or not (str(data.get('email') or '').strip() or str(data.get('phone') or '').strip()):
        return jsonify({'success': False, 'message': 'Please enter your name and a phone number or email.'}), 400
    
    inquiry = Inquiry(
        name=str(data.get('name'))[:100],
        email=str(data.get('email') or '')[:100],
        phone=str(data.get('phone') or '')[:40],
        message=str(data.get('message') or '(no message)')[:5000],
        vehicle_id=data.get('vehicle_id'),
        inquiry_type=data.get('inquiry_type', 'general')
    )
    
    db.session.add(inquiry)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Inquiry submitted successfully'}), 201

@app.route('/api/admin/inquiries', methods=['GET'])
@admin_required
def get_inquiries():
    inquiries = Inquiry.query.order_by(Inquiry.created_at.desc()).all()
    return jsonify([{
        'id': i.id,
        'name': i.name,
        'email': i.email,
        'phone': i.phone,
        'message': i.message,
        'vehicle_id': i.vehicle_id,
        'inquiry_type': i.inquiry_type,
        'status': i.status,
        'created_at': i.created_at.isoformat()
    } for i in inquiries])

@app.route('/api/admin/inquiries/<int:inquiry_id>', methods=['PUT'])
@admin_required
def update_inquiry(inquiry_id):
    inquiry = Inquiry.query.get_or_404(inquiry_id)
    data = request.get_json()
    inquiry.status = data.get('status', inquiry.status)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Inquiry updated'})

# ==================== SELL CAR ROUTES ====================

@app.route('/api/sell-car', methods=['POST'])
def submit_sell_car():
    data = request.get_json()
    
    sell_request = SellCarRequest(
        name=data.get('name'),
        email=data.get('email'),
        phone=data.get('phone'),
        car_brand=data.get('car_brand'),
        car_model=data.get('car_model'),
        car_year=data.get('car_year'),
        car_mileage=data.get('car_mileage'),
        expected_price=data.get('expected_price'),
        condition=data.get('condition'),
        description=data.get('description', '')
    )
    
    db.session.add(sell_request)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Sell request submitted successfully'}), 201

@app.route('/api/admin/sell-requests', methods=['GET'])
@admin_required
def get_sell_requests():
    requests = SellCarRequest.query.order_by(SellCarRequest.created_at.desc()).all()
    return jsonify([{
        'id': r.id,
        'name': r.name,
        'email': r.email,
        'phone': r.phone,
        'car_brand': r.car_brand,
        'car_model': r.car_model,
        'car_year': r.car_year,
        'car_mileage': r.car_mileage,
        'expected_price': r.expected_price,
        'condition': r.condition,
        'description': r.description,
        'status': r.status,
        'created_at': r.created_at.isoformat()
    } for r in requests])

@app.route('/api/admin/sell-requests/<int:request_id>', methods=['PUT'])
@admin_required
def update_sell_request(request_id):
    sell_request = SellCarRequest.query.get_or_404(request_id)
    data = request.get_json()
    sell_request.status = data.get('status', sell_request.status)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Sell request updated'})


# ==================== ADMIN DASHBOARD STATS ====================

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    total_vehicles = Vehicle.query.count()
    available_vehicles = Vehicle.query.filter_by(stock_status='available').count()
    sold_vehicles = Vehicle.query.filter_by(stock_status='sold').count()
    pending_inquiries = Inquiry.query.filter_by(status='pending').count()
    total_inquiries = Inquiry.query.count()
    pending_sell_requests = SellCarRequest.query.filter_by(status='pending').count()
    
    return jsonify({
        'total_vehicles': total_vehicles,
        'available_vehicles': available_vehicles,
        'sold_vehicles': sold_vehicles,
        'pending_inquiries': pending_inquiries,
        'total_inquiries': total_inquiries,
        'pending_sell_requests': pending_sell_requests,
    })

# ==================== FILE UPLOAD ====================

@app.route('/api/upload', methods=['POST'])
@admin_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected'}), 400
    
    ext = os.path.splitext(file.filename)[1].lower().lstrip('.')
    if ext not in ('png', 'jpg', 'jpeg', 'webp', 'gif'):
        return jsonify({'success': False, 'message': 'Only image files are allowed (JPG, PNG, WebP or GIF)'}), 400
    if request.content_length and request.content_length > 8 * 1024 * 1024:
        return jsonify({'success': False, 'message': 'The image is too large (maximum 8 MB)'}), 413
    if file:
        filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'vehicles', filename)
        file.save(filepath)
        
        return jsonify({
            'success': True,
            'url': f'/uploads/vehicles/{filename}'
        })

@app.route('/uploads/<path:filename>')
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ==================== MAIN ====================

# ==================== SERVE THE WEBSITE ====================
SITE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', 'dist')

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_site(path):
    if path.startswith('api/') or path.startswith('uploads/'):
        return jsonify({'error': 'Not found'}), 404
    if path and os.path.isfile(os.path.join(SITE_DIR, path)):
        return send_from_directory(SITE_DIR, path)
    return send_from_directory(SITE_DIR, 'index.html')

# ==================== LIMIT SPAM ON PUBLIC FORMS ====================
import time as _time

_FORM_HITS = {}
_FORM_PATHS = ('/api/inquiries', '/api/sell-car', '/api/spare-parts-request')

@app.before_request
def _limit_public_forms():
    if request.method == 'POST' and request.path in _FORM_PATHS:
        fwd = request.headers.get('X-Forwarded-For', '')
        ip = (fwd.split(',')[-1].strip() if fwd else request.remote_addr) or 'unknown'
        now = _time.time()
        hits = [t for t in _FORM_HITS.get(ip, []) if now - t < 3600]
        if len(hits) >= 30:
            _FORM_HITS[ip] = hits
            return jsonify({'success': False, 'message': 'Too many submissions. Please try again later.'}), 429
        hits.append(now)
        _FORM_HITS[ip] = hits

# ==================== LIMIT WRONG LOGIN ATTEMPTS ====================
import time as _time

_FAILS = {}
_LOGIN_LIMITS = (('u', 5), ('ip', 20))  # max failures per 15 minutes
_LOGIN_WINDOW = 15 * 60

def _login_keys():
    data = request.get_json(silent=True) or {}
    username = str(data.get('username', '')).strip().lower()[:100]
    fwd = request.headers.get('X-Forwarded-For', '')
    ip = (fwd.split(',')[-1].strip() if fwd else request.remote_addr) or 'unknown'
    return {'u': 'u:' + username, 'ip': 'ip:' + ip}

def _recent_failures(key):
    now = _time.time()
    hits = [t for t in _FAILS.get(key, []) if now - t < _LOGIN_WINDOW]
    _FAILS[key] = hits
    return hits

@app.before_request
def _limit_admin_logins():
    if request.method == 'POST' and request.path == '/api/admin/login':
        keys = _login_keys()
        for kind, limit in _LOGIN_LIMITS:
            if len(_recent_failures(keys[kind])) >= limit:
                return jsonify({'error': 'Too many failed attempts. Please try again in 15 minutes.'}), 429

@app.after_request
def _record_failed_logins(response):
    if request.method == 'POST' and request.path == '/api/admin/login' and response.status_code == 401:
        now = _time.time()
        for key in _login_keys().values():
            _FAILS.setdefault(key, []).append(now)
    return response

# ==================== SECURITY HEADERS ====================
@app.after_request
def _security_headers(response):
    response.headers.setdefault('X-Content-Type-Options', 'nosniff')
    response.headers.setdefault('X-Frame-Options', 'DENY')
    response.headers.setdefault('Referrer-Policy', 'strict-origin-when-cross-origin')
    return response



FRONTEND_DIST = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    'frontend',
    'dist'
)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path:
        full_path = os.path.join(FRONTEND_DIST, path)

        if os.path.isfile(full_path):
            return send_from_directory(FRONTEND_DIST, path)
    print("FRONTEND_DIST =", FRONTEND_DIST)
    print("INDEX EXISTS =", os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')))

    return send_from_directory(FRONTEND_DIST, 'index.html')



if __name__ == '__main__':
    app.run(
        debug=False,
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 8080))
    )
