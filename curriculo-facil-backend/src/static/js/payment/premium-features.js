/**
 * Premium Features for CurrículoFácil
 * Controls access to premium features based on subscription status
 */

// Premium features configuration
const premiumFeatures = {
  // Templates available in premium version
  templates: [
    'executivo',
    'moderno',
    'classico',
    'criativo',
    'minimalista',
    'tecnologia',
    'academico',
    'corporativo',
    'startup'
  ],
  
  // Maximum number of saved resumes
  maxResumes: {
    free: 1,
    premium: 999 // Unlimited for practical purposes
  },
  
  // ATS analysis features
  atsAnalysis: {
    free: ['basic-score', 'keyword-check'],
    premium: ['detailed-score', 'keyword-check', 'industry-comparison', 'improvement-suggestions', 'recruiter-insights']
  },
  
  // AI content generation
  aiContent: {
    free: ['basic-summary'],
    premium: ['detailed-summary', 'job-specific-content', 'skill-suggestions', 'achievement-formatter']
  }
};

// Check if user has premium access
async function hasPremiumAccess() {
  try {
    // Use the payment integration to check subscription status
    if (window.curriculoFacilPayment) {
      const subscription = await window.curriculoFacilPayment.checkSubscriptionStatus();
      return subscription.status === 'active' && subscription.plan_type === 'premium';
    }
    return false;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}

// Update premium features based on subscription status
async function updatePremiumFeatures(isPremium = null) {
  if (isPremium === null) {
    isPremium = await hasPremiumAccess();
  }
  
  // Update UI based on premium status
  document.querySelectorAll('.premium-only').forEach(element => {
    if (isPremium) {
      element.classList.remove('hidden');
      element.classList.remove('opacity-50');
      element.classList.remove('cursor-not-allowed');
      
      // Remove premium badges and unlock buttons
      const badges = element.querySelectorAll('.premium-badge');
      badges.forEach(badge => badge.remove());
      
      const unlockButtons = element.querySelectorAll('.unlock-premium-button');
      unlockButtons.forEach(button => button.remove());
      
      // Remove disabled state from inputs and buttons
      const inputs = element.querySelectorAll('input, button, select, textarea');
      inputs.forEach(input => {
        input.removeAttribute('disabled');
      });
    } else {
      // If not premium, show premium badge and make element semi-transparent
      if (!element.querySelector('.premium-badge')) {
        const badge = document.createElement('div');
        badge.className = 'premium-badge absolute top-0 right-0 bg-indigo-600 text-white text-xs px-2 py-1 rounded-bl-md z-10';
        badge.textContent = 'Premium';
        element.appendChild(badge);
        
        // Add unlock button
        const unlockButton = document.createElement('button');
        unlockButton.className = 'unlock-premium-button absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity z-10';
        unlockButton.innerHTML = '<span class="bg-indigo-600 text-white px-3 py-2 rounded-md">Desbloquear Premium</span>';
        unlockButton.addEventListener('click', redirectToPremium);
        element.appendChild(unlockButton);
      }
      
      element.classList.add('opacity-50');
      element.classList.add('relative');
      element.classList.add('cursor-not-allowed');
      
      // Disable inputs and buttons
      const inputs = element.querySelectorAll('input, button, select, textarea');
      inputs.forEach(input => {
        input.setAttribute('disabled', 'disabled');
      });
    }
  });
  
  // Update template options
  updateTemplateOptions(isPremium);
  
  // Update ATS analysis features
  updateAtsAnalysisFeatures(isPremium);
  
  // Update AI content generation options
  updateAiContentOptions(isPremium);
  
  // Update resume limit display
  updateResumeLimitDisplay(isPremium);
  
  return isPremium;
}

// Update available template options based on subscription
function updateTemplateOptions(isPremium) {
  const templateContainer = document.querySelector('.template-options');
  if (!templateContainer) return;
  
  const allTemplates = ['classico', 'moderno', 'executivo'];
  const availableTemplates = isPremium ? allTemplates : allTemplates.slice(0, 1);
  
  // Update existing template elements
  const templateElements = templateContainer.querySelectorAll('.template-option');
  templateElements.forEach((element, index) => {
    const templateName = allTemplates[index];
    
    if (isPremium || index === 0) {
      // Enable template
      element.classList.remove('opacity-50', 'cursor-not-allowed');
      element.classList.add('cursor-pointer');
      
      // Remove premium overlay
      const overlay = element.querySelector('.premium-overlay');
      if (overlay) overlay.remove();
      
      // Enable click functionality
      element.onclick = function() {
        selectTemplate(templateName);
      };
    } else {
      // Disable premium templates
      element.classList.add('opacity-50', 'cursor-not-allowed');
      element.classList.remove('cursor-pointer');
      
      // Add premium overlay if not exists
      if (!element.querySelector('.premium-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'premium-overlay absolute inset-0 flex items-center justify-center bg-black bg-opacity-50';
        overlay.innerHTML = `
          <div class="text-center text-white">
            <div class="bg-indigo-600 px-3 py-1 rounded-md mb-2">Premium</div>
            <button class="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-sm" onclick="redirectToPremium()">
              Desbloquear
            </button>
          </div>
        `;
        element.appendChild(overlay);
      }
      
      // Disable click functionality
      element.onclick = function(e) {
        e.preventDefault();
        redirectToPremium();
      };
    }
  });
}

// Update ATS analysis features based on subscription
function updateAtsAnalysisFeatures(isPremium) {
  const atsContainer = document.querySelector('.ats-analysis');
  if (!atsContainer) return;
  
  if (isPremium) {
    // Enable detailed analysis
    const detailedAnalysis = document.querySelector('.detailed-analysis');
    if (detailedAnalysis) {
      detailedAnalysis.classList.remove('hidden');
    }
    
    // Show premium ATS features
    const premiumFeatures = document.querySelectorAll('.ats-premium-feature');
    premiumFeatures.forEach(feature => {
      feature.classList.remove('hidden');
    });
    
    // Update analysis button
    const analyzeButton = document.querySelector('.analyze-ats-button');
    if (analyzeButton) {
      analyzeButton.textContent = 'Análise Completa ATS';
      analyzeButton.classList.remove('opacity-50');
      analyzeButton.removeAttribute('disabled');
    }
  } else {
    // Hide detailed analysis
    const detailedAnalysis = document.querySelector('.detailed-analysis');
    if (detailedAnalysis) {
      detailedAnalysis.classList.add('hidden');
    }
    
    // Hide premium ATS features
    const premiumFeatures = document.querySelectorAll('.ats-premium-feature');
    premiumFeatures.forEach(feature => {
      feature.classList.add('hidden');
    });
    
    // Update analysis button
    const analyzeButton = document.querySelector('.analyze-ats-button');
    if (analyzeButton) {
      analyzeButton.textContent = 'Análise Básica ATS';
    }
  }
}

// Update AI content generation options based on subscription
function updateAiContentOptions(isPremium) {
  const aiButtons = document.querySelectorAll('.ai-generate-button');
  
  aiButtons.forEach(button => {
    if (isPremium) {
      button.removeAttribute('disabled');
      button.classList.remove('opacity-50', 'cursor-not-allowed');
      button.classList.add('hover:bg-indigo-700', 'cursor-pointer');
      
      // Remove any premium badges
      const badge = button.querySelector('.premium-badge');
      if (badge) badge.remove();
      
      // Remove premium click handler
      button.onclick = null;
    } else {
      // If feature is premium-only, add badge and disable
      if (button.classList.contains('premium-only')) {
        button.setAttribute('disabled', 'disabled');
        button.classList.add('opacity-50', 'cursor-not-allowed');
        button.classList.remove('hover:bg-indigo-700', 'cursor-pointer');
        
        if (!button.querySelector('.premium-badge')) {
          const badge = document.createElement('span');
          badge.className = 'premium-badge ml-2 bg-indigo-800 text-white text-xs px-2 py-1 rounded';
          badge.textContent = 'Premium';
          button.appendChild(badge);
        }
        
        // Add click handler to redirect to premium page
        button.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          redirectToPremium();
        };
      }
    }
  });
}

// Update resume limit display
function updateResumeLimitDisplay(isPremium) {
  const limitDisplay = document.querySelector('.resume-limit-display');
  if (!limitDisplay) return;
  
  const currentCount = parseInt(localStorage.getItem('resumeCount') || '0');
  const maxResumes = isPremium ? premiumFeatures.maxResumes.premium : premiumFeatures.maxResumes.free;
  
  if (isPremium) {
    limitDisplay.innerHTML = `<span class="text-green-600">✓ Currículos ilimitados</span>`;
  } else {
    limitDisplay.innerHTML = `<span class="text-gray-600">${currentCount}/${maxResumes} currículos</span>`;
    
    if (currentCount >= maxResumes) {
      limitDisplay.innerHTML += `<button class="ml-2 text-indigo-600 hover:text-indigo-800 text-sm" onclick="redirectToPremium()">Upgrade para mais</button>`;
    }
  }
}

// Check if user can create new resume
function canCreateNewResume(isPremium = null) {
  if (isPremium === null) {
    // This will be async, but for immediate checks we'll use localStorage
    isPremium = localStorage.getItem('isPremiumUser') === 'true';
  }
  
  if (isPremium) return true;
  
  const currentCount = parseInt(localStorage.getItem('resumeCount') || '0');
  const maxResumes = premiumFeatures.maxResumes.free;
  
  return currentCount < maxResumes;
}

// Increment resume count
function incrementResumeCount() {
  const currentCount = parseInt(localStorage.getItem('resumeCount') || '0');
  localStorage.setItem('resumeCount', (currentCount + 1).toString());
}

// Redirect to premium subscription page
function redirectToPremium() {
  window.location.href = 'premium.html';
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize premium features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for payment integration to load
  setTimeout(() => {
    updatePremiumFeatures();
  }, 500);
  
  // Add premium buttons
  const premiumButtons = document.querySelectorAll('.premium-button');
  premiumButtons.forEach(button => {
    button.addEventListener('click', redirectToPremium);
  });
});

// Export functions for use in other modules
window.curriculoFacilPremium = {
  hasPremiumAccess,
  updatePremiumFeatures,
  redirectToPremium,
  canCreateNewResume,
  incrementResumeCount
};

