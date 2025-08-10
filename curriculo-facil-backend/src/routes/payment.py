from flask import Blueprint, request, jsonify
import stripe
import os
from src.models.subscription import db, Subscription

payment_bp = Blueprint('payment', __name__)

# Configure Stripe (use environment variables in production)
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_...')  # Replace with your test key
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', 'whsec_...')  # Replace with your webhook secret

@payment_bp.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        
        if not customer_id:
            return jsonify({'error': 'Customer ID is required'}), 400
        
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': 'price_1234567890',  # Replace with your actual price ID
                'quantity': 1,
            }],
            mode='subscription',
            success_url='http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='http://localhost:5000/cancel',
            client_reference_id=customer_id,
            metadata={
                'customer_id': customer_id
            }
        )
        
        return jsonify({'checkout_url': checkout_session.url})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/subscription-status/<customer_id>', methods=['GET'])
def get_subscription_status(customer_id):
    try:
        subscription = Subscription.query.filter_by(customer_id=customer_id).first()
        
        if not subscription:
            # Create a new free subscription record
            subscription = Subscription(
                customer_id=customer_id,
                status='inactive',
                plan_type='free'
            )
            db.session.add(subscription)
            db.session.commit()
        
        return jsonify(subscription.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError:
        return jsonify({'error': 'Invalid signature'}), 400
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        customer_id = session.get('client_reference_id')
        subscription_id = session.get('subscription')
        
        if customer_id:
            # Update or create subscription record
            subscription = Subscription.query.filter_by(customer_id=customer_id).first()
            if not subscription:
                subscription = Subscription(customer_id=customer_id)
                db.session.add(subscription)
            
            subscription.subscription_id = subscription_id
            subscription.status = 'active'
            subscription.plan_type = 'premium'
            db.session.commit()
    
    elif event['type'] == 'customer.subscription.deleted':
        subscription_data = event['data']['object']
        subscription_id = subscription_data['id']
        
        # Update subscription status to inactive
        subscription = Subscription.query.filter_by(subscription_id=subscription_id).first()
        if subscription:
            subscription.status = 'inactive'
            subscription.plan_type = 'free'
            db.session.commit()
    
    elif event['type'] == 'invoice.payment_failed':
        subscription_data = event['data']['object']
        subscription_id = subscription_data['subscription']
        
        # Update subscription status to past_due
        subscription = Subscription.query.filter_by(subscription_id=subscription_id).first()
        if subscription:
            subscription.status = 'past_due'
            db.session.commit()
    
    return jsonify({'status': 'success'})

@payment_bp.route('/cancel-subscription', methods=['POST'])
def cancel_subscription():
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        
        if not customer_id:
            return jsonify({'error': 'Customer ID is required'}), 400
        
        subscription = Subscription.query.filter_by(customer_id=customer_id).first()
        
        if not subscription or not subscription.subscription_id:
            return jsonify({'error': 'No active subscription found'}), 404
        
        # Cancel the subscription in Stripe
        stripe.Subscription.delete(subscription.subscription_id)
        
        # Update local database
        subscription.status = 'cancelled'
        subscription.plan_type = 'free'
        db.session.commit()
        
        return jsonify({'message': 'Subscription cancelled successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

