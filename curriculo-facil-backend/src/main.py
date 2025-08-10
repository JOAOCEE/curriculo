import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from src.models.user import db
from src.routes.user import user_bp
from src.routes.payment import payment_bp
from src.routes.premium_templates import premium_templates_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for all routes
CORS(app)

# Cache básico em memória (para desenvolvimento)
cache_store = {}
cache_timestamps = {}

def simple_cache_get(key):
    """Recuperar item do cache se ainda válido"""
    if key in cache_store and key in cache_timestamps:
        # Verificar se ainda é válido (1 hora = 3600 segundos)
        if datetime.now() - cache_timestamps[key] < timedelta(seconds=3600):
            return cache_store[key]
        else:
            # Remover item expirado
            del cache_store[key]
            del cache_timestamps[key]
    return None

def simple_cache_set(key, value):
    """Armazenar item no cache"""
    cache_store[key] = value
    cache_timestamps[key] = datetime.now()

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(payment_bp, url_prefix='/api')
app.register_blueprint(premium_templates_bp, url_prefix='/api')

# uncomment if you need to use database
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()

# Security Headers Middleware
@app.after_request
def add_security_headers(response):
    """Adicionar headers de segurança a todas as respostas"""
    
    # Prevenir ataques de clickjacking
    response.headers['X-Frame-Options'] = 'DENY'
    
    # Prevenir ataques XSS
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Prevenir MIME type sniffing
    response.headers['X-Content-Type-Options'] = 'nosniff'
    
    # Controlar informações do referrer
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    # Content Security Policy (CSP) - Configuração básica
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://js.stripe.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com https://pagead2.googlesyndication.com; "
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; "
        "img-src 'self' data: https: blob:; "
        "connect-src 'self' https://api.stripe.com; "
        "frame-src https://js.stripe.com; "
        "object-src 'none'; "
        "base-uri 'self';"
    )
    response.headers['Content-Security-Policy'] = csp
    
    # Strict Transport Security (HTTPS only)
    if request.is_secure:
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    # Permissions Policy (Feature Policy)
    response.headers['Permissions-Policy'] = (
        "geolocation=(), "
        "microphone=(), "
        "camera=(), "
        "payment=(self), "
        "usb=(), "
        "magnetometer=(), "
        "gyroscope=(), "
        "speaker=()"
    )
    
    return response

# Rate Limiting (básico) - Em produção, use Flask-Limiter
request_counts = {}
from datetime import datetime, timedelta

@app.before_request
def rate_limit():
    """Rate limiting básico por IP"""
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    
    if client_ip not in request_counts:
        request_counts[client_ip] = []
    
    # Limpar requests antigos (últimos 15 minutos)
    cutoff_time = datetime.now() - timedelta(minutes=15)
    request_counts[client_ip] = [
        req_time for req_time in request_counts[client_ip] 
        if req_time > cutoff_time
    ]
    
    # Verificar limite (100 requests por 15 minutos)
    if len(request_counts[client_ip]) >= 100:
        return jsonify({
            'error': 'Rate limit exceeded',
            'message': 'Muitas requisições. Tente novamente em alguns minutos.'
        }), 429
    
    # Adicionar request atual
    request_counts[client_ip].append(datetime.now())

# Error Handlers
@app.errorhandler(404)
def not_found(error):
    """Handler para erro 404"""
    return jsonify({
        'error': 'Recurso não encontrado',
        'status': 404
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handler para erro 500"""
    return jsonify({
        'error': 'Erro interno do servidor',
        'status': 500
    }), 500

@app.errorhandler(403)
def forbidden(error):
    """Handler para erro 403"""
    return jsonify({
        'error': 'Acesso negado',
        'status': 403
    }), 403

@app.errorhandler(429)
def rate_limit_exceeded(error):
    """Handler para rate limit"""
    return jsonify({
        'error': 'Limite de requisições excedido',
        'message': 'Muitas requisições. Tente novamente em alguns minutos.',
        'status': 429
    }), 429

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    # Aplicar cache para arquivos estáticos (CSS, JS, imagens)
    if path and any(path.endswith(ext) for ext in ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg']):
        # Verificar cache primeiro
        cache_key = f"static_{path}"
        cached_response = simple_cache_get(cache_key)
        if cached_response:
            response = cached_response
        else:
            if os.path.exists(os.path.join(static_folder_path, path)):
                response = send_from_directory(static_folder_path, path)
                # Adicionar headers de cache para arquivos estáticos
                response.headers['Cache-Control'] = 'public, max-age=3600'  # 1 hora
                response.headers['Expires'] = (datetime.now() + timedelta(hours=1)).strftime('%a, %d %b %Y %H:%M:%S GMT')
                # Armazenar no cache
                simple_cache_set(cache_key, response)
            else:
                return "File not found", 404
        return response

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
