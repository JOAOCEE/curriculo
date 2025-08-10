from flask import Blueprint, request, jsonify
from src.models.subscription import db, Subscription
import json

premium_templates_bp = Blueprint('premium_templates', __name__)

# Templates premium disponíveis
PREMIUM_TEMPLATES = {
    'executive': {
        'id': 'executive',
        'name': 'Executivo',
        'description': 'Template elegante para cargos de liderança',
        'preview_url': '/images/templates/template_executivo.jpeg',
        'premium': True,
        'features': ['Layout sofisticado', 'Seção de conquistas', 'Design minimalista'],
        'css_class': 'template-executive'
    },
    'modern': {
        'id': 'modern',
        'name': 'Moderno',
        'description': 'Design contemporâneo para áreas criativas',
        'preview_url': '/images/templates/template_moderno.jpeg',
        'premium': True,
        'features': ['Cores vibrantes', 'Layout criativo', 'Seções personalizáveis'],
        'css_class': 'template-modern'
    },
    'classic': {
        'id': 'classic',
        'name': 'Clássico',
        'description': 'Template tradicional e conservador',
        'preview_url': '/images/templates/template_classico.jpeg',
        'premium': False,
        'features': ['Layout tradicional', 'Fonte serifada', 'Ideal para áreas conservadoras'],
        'css_class': 'template-classic'
    }
}

@premium_templates_bp.route('/templates', methods=['GET'])
def get_templates():
    """Retorna todos os templates disponíveis"""
    try:
        customer_id = request.args.get('customer_id')
        
        # Verificar status da assinatura se customer_id fornecido
        is_premium = False
        if customer_id:
            subscription = Subscription.query.filter_by(customer_id=customer_id).first()
            is_premium = subscription and subscription.status == 'active' and subscription.plan_type == 'premium'
        
        # Filtrar templates baseado no status premium
        available_templates = {}
        for template_id, template_data in PREMIUM_TEMPLATES.items():
            if not template_data['premium'] or is_premium:
                available_templates[template_id] = template_data
            else:
                # Mostrar template premium mas bloqueado
                locked_template = template_data.copy()
                locked_template['locked'] = True
                locked_template['unlock_message'] = 'Assine o plano Premium para desbloquear'
                available_templates[template_id] = locked_template
        
        return jsonify({
            'templates': available_templates,
            'is_premium': is_premium,
            'total_templates': len(PREMIUM_TEMPLATES),
            'available_templates': len([t for t in available_templates.values() if not t.get('locked', False)])
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@premium_templates_bp.route('/templates/<template_id>', methods=['GET'])
def get_template(template_id):
    """Retorna um template específico"""
    try:
        customer_id = request.args.get('customer_id')
        
        if template_id not in PREMIUM_TEMPLATES:
            return jsonify({'error': 'Template não encontrado'}), 404
        
        template = PREMIUM_TEMPLATES[template_id]
        
        # Verificar se o usuário tem acesso ao template premium
        if template['premium']:
            subscription = Subscription.query.filter_by(customer_id=customer_id).first()
            is_premium = subscription and subscription.status == 'active' and subscription.plan_type == 'premium'
            
            if not is_premium:
                return jsonify({
                    'error': 'Template premium requer assinatura',
                    'template_id': template_id,
                    'upgrade_required': True,
                    'upgrade_url': '/premium.html'
                }), 403
        
        return jsonify({
            'template': template,
            'access_granted': True
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@premium_templates_bp.route('/templates/<template_id>/apply', methods=['POST'])
def apply_template(template_id):
    """Aplica um template ao currículo do usuário"""
    try:
        customer_id = request.json.get('customer_id')
        resume_data = request.json.get('resume_data', {})
        
        if template_id not in PREMIUM_TEMPLATES:
            return jsonify({'error': 'Template não encontrado'}), 404
        
        template = PREMIUM_TEMPLATES[template_id]
        
        # Verificar acesso premium se necessário
        if template['premium']:
            subscription = Subscription.query.filter_by(customer_id=customer_id).first()
            is_premium = subscription and subscription.status == 'active' and subscription.plan_type == 'premium'
            
            if not is_premium:
                return jsonify({
                    'error': 'Acesso negado',
                    'message': 'Este template requer assinatura Premium',
                    'upgrade_required': True
                }), 403
        
        # Aplicar configurações do template
        template_config = {
            'template_id': template_id,
            'css_class': template['css_class'],
            'name': template['name'],
            'applied_at': str(db.func.now())
        }
        
        # Aqui você pode salvar a configuração do template no banco
        # Por enquanto, apenas retornamos a configuração
        
        return jsonify({
            'success': True,
            'template_applied': template_config,
            'message': f'Template {template["name"]} aplicado com sucesso!'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@premium_templates_bp.route('/premium-features', methods=['GET'])
def get_premium_features():
    """Retorna lista de recursos premium disponíveis"""
    try:
        customer_id = request.args.get('customer_id')
        
        # Verificar status premium
        subscription = Subscription.query.filter_by(customer_id=customer_id).first()
        is_premium = subscription and subscription.status == 'active' and subscription.plan_type == 'premium'
        
        features = {
            'templates': {
                'name': 'Templates Premium',
                'description': 'Acesso a todos os templates profissionais',
                'available': is_premium,
                'total_count': len([t for t in PREMIUM_TEMPLATES.values() if t['premium']]),
                'unlocked_count': len([t for t in PREMIUM_TEMPLATES.values() if t['premium']]) if is_premium else 0
            },
            'unlimited_resumes': {
                'name': 'Currículos Ilimitados',
                'description': 'Crie quantos currículos quiser',
                'available': is_premium,
                'limit': None if is_premium else 1
            },
            'advanced_ats': {
                'name': 'Análise ATS Avançada',
                'description': 'Feedback detalhado e sugestões personalizadas',
                'available': is_premium
            },
            'ai_assistant': {
                'name': 'Assistente IA Completo',
                'description': 'Geração de conteúdo aprimorada',
                'available': is_premium
            },
            'priority_support': {
                'name': 'Suporte Prioritário',
                'description': 'Atendimento preferencial',
                'available': is_premium
            }
        }
        
        return jsonify({
            'features': features,
            'is_premium': is_premium,
            'subscription_status': subscription.status if subscription else 'none',
            'plan_type': subscription.plan_type if subscription else 'free'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@premium_templates_bp.route('/usage-stats', methods=['GET'])
def get_usage_stats():
    """Retorna estatísticas de uso do usuário"""
    try:
        customer_id = request.args.get('customer_id')
        
        if not customer_id:
            return jsonify({'error': 'Customer ID é obrigatório'}), 400
        
        subscription = Subscription.query.filter_by(customer_id=customer_id).first()
        is_premium = subscription and subscription.status == 'active' and subscription.plan_type == 'premium'
        
        # Simular estatísticas (em produção, buscar do banco)
        stats = {
            'resumes_created': 1 if not is_premium else 15,  # Limite para usuários gratuitos
            'templates_used': 1 if not is_premium else 3,
            'ats_analyses': 5 if not is_premium else 50,
            'ai_generations': 3 if not is_premium else 100,
            'limits': {
                'resumes': 1 if not is_premium else None,
                'templates': 1 if not is_premium else None,
                'ats_analyses': 10 if not is_premium else None,
                'ai_generations': 5 if not is_premium else None
            },
            'is_premium': is_premium
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

