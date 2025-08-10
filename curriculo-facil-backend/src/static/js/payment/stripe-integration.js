/**
 * Stripe Integration for CurrículoFácil
 * Handles payment processing for Premium subscription
 */

// Stripe configuration
const stripeConfig = {
  publishableKey: 'pk_test_51234567890', // Replace with your actual Stripe publishable key when deploying
  priceId: 'price_1234567890', // Replace with your actual Stripe price ID when deploying
  currency: 'brl',
  productName: 'CurrículoFácil Premium',
  productDescription: 'Assinatura mensal do plano Premium',
  amount: 700 // R$7.00 in cents
};

// Generate unique customer ID for this session
function getCustomerId() {
  let customerId = localStorage.getItem('curriculo_customer_id');
  if (!customerId) {
    customerId = 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('curriculo_customer_id', customerId);
  }
  return customerId;
}

// Create checkout session
async function createCheckoutSession() {
  try {
    const customerId = getCustomerId();
    
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Handle subscription checkout
async function handleSubscription() {
  try {
    showLoading(true);
    const session = await createCheckoutSession();
    
    // Redirect to Stripe Checkout
    window.location.href = session.checkout_url;
    
  } catch (error) {
    console.error('Error handling subscription:', error);
    showError('Ocorreu um erro ao processar sua assinatura. Por favor, tente novamente.');
    showLoading(false);
  }
}

// Check subscription status
async function checkSubscriptionStatus() {
  try {
    const customerId = getCustomerId();
    const response = await fetch(`/api/subscription-status/${customerId}`);
    
    if (!response.ok) {
      throw new Error('Failed to check subscription status');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { status: 'inactive', plan_type: 'free' };
  }
}

// Cancel subscription
async function cancelSubscription() {
  try {
    const customerId = getCustomerId();
    
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

// Show loading state
function showLoading(show) {
  const loadingElements = document.querySelectorAll('.loading-spinner');
  const buttonElements = document.querySelectorAll('.subscribe-button');
  
  loadingElements.forEach(element => {
    element.style.display = show ? 'block' : 'none';
  });
  
  buttonElements.forEach(button => {
    button.disabled = show;
    button.textContent = show ? 'Processando...' : 'Assinar Premium';
  });
}

// Show error message
function showError(message) {
  const errorElement = document.getElementById('payment-error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  } else {
    alert(message);
  }
}

// Show success message
function showSuccess(message) {
  const successElement = document.getElementById('payment-success');
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = 'block';
    setTimeout(() => {
      successElement.style.display = 'none';
    }, 5000);
  } else {
    alert(message);
  }
}

// Update UI based on subscription status
async function updateSubscriptionUI() {
  try {
    const subscription = await checkSubscriptionStatus();
    const isPremium = subscription.status === 'active' && subscription.plan_type === 'premium';
    
    // Update premium status indicators
    const premiumIndicators = document.querySelectorAll('.premium-status');
    premiumIndicators.forEach(indicator => {
      indicator.textContent = isPremium ? 'Premium Ativo' : 'Plano Gratuito';
      indicator.className = isPremium ? 'premium-status active' : 'premium-status inactive';
    });
    
    // Update subscribe buttons
    const subscribeButtons = document.querySelectorAll('.subscribe-button');
    subscribeButtons.forEach(button => {
      if (isPremium) {
        button.textContent = 'Cancelar Assinatura';
        button.onclick = handleCancelSubscription;
      } else {
        button.textContent = 'Assinar Premium';
        button.onclick = handleSubscription;
      }
    });
    
    // Enable/disable premium features
    window.curriculoFacilPremium.updatePremiumFeatures(isPremium);
    
    return isPremium;
    
  } catch (error) {
    console.error('Error updating subscription UI:', error);
    return false;
  }
}

// Handle subscription cancellation
async function handleCancelSubscription() {
  if (!confirm('Tem certeza que deseja cancelar sua assinatura Premium?')) {
    return;
  }
  
  try {
    showLoading(true);
    await cancelSubscription();
    showSuccess('Assinatura cancelada com sucesso!');
    await updateSubscriptionUI();
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    showError('Erro ao cancelar assinatura. Tente novamente.');
  } finally {
    showLoading(false);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Update UI based on current subscription status
  updateSubscriptionUI();
  
  // Handle URL parameters for payment success/cancel
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (sessionId) {
    showSuccess('Pagamento processado com sucesso! Sua assinatura Premium está ativa.');
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
    // Update UI
    setTimeout(updateSubscriptionUI, 2000);
  }
  
  if (window.location.pathname.includes('cancel')) {
    showError('Pagamento cancelado. Você pode tentar novamente a qualquer momento.');
  }
});

// Export functions for use in other modules
window.curriculoFacilPayment = {
  handleSubscription,
  checkSubscriptionStatus,
  updateSubscriptionUI,
  cancelSubscription: handleCancelSubscription
};

