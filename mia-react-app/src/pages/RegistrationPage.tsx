import { useState, useCallback, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registrationSchema,
  type RegistrationFormData,
  calculateDiscountedPrice,
} from '../schemas/registrationSchema';
import { membershipTypes } from '../utils/memberships';
import { siteConfig } from '../config/site.config';
import { Card, CardContent } from '@/components/ui/card';

// Import step components (we'll create these)
import { PersonalInfoStep } from '../components/registration/PersonalInfoStep';
import { MembershipPaymentStep } from '../components/registration/MembershipPaymentStep';
import { ProfileDetailsStep } from '../components/registration/ProfileDetailsStep';
import { RegistrationProgress } from '../components/registration/RegistrationProgress';

type FormStep = 1 | 2 | 3;

interface RegistrationState {
  currentStep: FormStep;
  completedSteps: Set<FormStep>;
  formData: Record<string, unknown>; // Using generic object type to avoid type conflicts with partial data
  isSubmitting: boolean;
  submitError: string | null;
}

export function RegistrationPage() {
  const [state, setState] = useState<RegistrationState>({
    currentStep: 1,
    completedSteps: new Set(),
    formData: {},
    isSubmitting: false,
    submitError: null,
  });

  // Form setup with React Hook Form
  const methods = useForm({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange' as const, // Real-time validation
    defaultValues: {
      address: {
        country: 'España',
      },
      galleryVisibility: {
        showProfile: true,
        showContact: true,
        showSocialMedia: true,
        showProjects: false,
      },
      preferences: {
        newsletterFrequency: 'monthly' as const,
        eventNotifications: true,
        jobNotifications: true,
        whatsappCommunity: false,
        mentorshipProgram: false,
      },
      socialMedia: {
        website: '',
        linkedin: '',
        twitter: '',
        instagram: '',
        behance: '',
        artstation: '',
      },
      marketingConsent: false,
    },
  });

  const { handleSubmit, watch, trigger, getValues } = methods;

  // Watch membership type to show/hide university field
  const membershipType = watch('membershipType');
  const discountCode = watch('discountCode');

  // Calculate pricing with discount
  const selectedMembership = membershipTypes.find(m => m.id === membershipType);
  const pricingInfo = selectedMembership 
    ? calculateDiscountedPrice(selectedMembership.price, discountCode)
    : null;

  // Progress calculation
  const totalSteps = 3;
  const progressPercentage = (state.completedSteps.size / totalSteps) * 100;

  // Step navigation functions
  const goToNextStep = useCallback(async () => {
    const currentStepValid = await trigger();
    
    if (currentStepValid) {
      const newCompletedSteps = new Set(state.completedSteps);
      newCompletedSteps.add(state.currentStep);
      
      setState(prev => ({
        ...prev,
        currentStep: Math.min(3, prev.currentStep + 1) as FormStep,
        completedSteps: newCompletedSteps,
        formData: { ...prev.formData, ...getValues() },
      }));
    }
  }, [trigger, getValues, state.completedSteps, state.currentStep]);

  const goToPreviousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1) as FormStep,
    }));
  }, []);

  const goToStep = useCallback((step: FormStep) => {
    // Only allow navigation to completed steps or current step + 1
    if (state.completedSteps.has(step) || step <= state.currentStep) {
      setState(prev => ({
        ...prev,
        currentStep: step,
      }));
    }
  }, [state.completedSteps, state.currentStep]);

  // Auto-save form data to localStorage
  useEffect(() => {
    const formData = getValues();
    localStorage.setItem('mia-registration-draft', JSON.stringify(formData));
  }, [getValues, state.currentStep]);

  // Load saved form data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('mia-registration-draft');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        methods.reset(parsedData);
        setState(prev => ({
          ...prev,
          formData: parsedData,
        }));
      } catch (error) {
        console.error('Error loading saved registration data:', error);
      }
    }
  }, [methods]);

  // Form submission
  const onSubmit = async (data: RegistrationFormData) => {
    setState(prev => ({ ...prev, isSubmitting: true, submitError: null }));

    try {
      // Handle free newsletter subscription
      if (data.membershipType === 'newsletter') {
        await handleNewsletterSubscription(data);
        return;
      }

      // Handle paid memberships
      await handlePaidMembershipRegistration(data);

    } catch (error) {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        submitError: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  };

  const handleNewsletterSubscription = async (data: RegistrationFormData) => {
    // In a real app, this would send data to your backend/Mailchimp
    console.log('Newsletter subscription:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clear saved data and redirect to success page
    localStorage.removeItem('mia-registration-draft');
    alert('¡Gracias! Te has suscrito exitosamente a nuestro newsletter.');
    
    setState(prev => ({ ...prev, isSubmitting: false }));
  };

  const handlePaidMembershipRegistration = async (data: RegistrationFormData) => {
    // In a real app, this would:
    // 1. Send registration data to your backend
    // 2. Create user account
    // 3. Create dynamic Stripe Checkout Session
    // 4. Redirect to Stripe payment
    
    console.log('Paid membership registration:', data);
    
    try {
      // Simulate API call to create user and checkout session
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, you would call your backend API like this:
      /*
      const checkoutData = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        membershipType: data.membershipType,
        finalPrice: pricingInfo?.finalPrice || 0,
        discountCode: data.discountCode,
        address: data.address,
        // Include any additional registration data
        bio: data.bio,
        company: data.company,
        position: data.position,
        experience: data.experience,
        categories: data.categories,
        socialMedia: data.socialMedia,
        preferences: data.preferences,
      };

      // Option 1: Create session and redirect with Stripe.js
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData),
      });
      
      const { sessionId } = await response.json();
      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      await stripe.redirectToCheckout({ sessionId });

      // Option 2: Direct URL redirect (simpler)
      // const { url } = await response.json();
      // window.location.href = url;
      */
      
      // Fallback to payment link with prefilled email (for now)
      const membership = membershipTypes.find(m => m.id === data.membershipType);
      if (membership && membership.stripeLinkKey !== 'newsletter') {
        const stripeUrl = siteConfig.stripe[membership.stripeLinkKey as keyof typeof siteConfig.stripe];
        if (stripeUrl) {
          // Add email as URL parameter
          const url = new URL(stripeUrl);
          url.searchParams.set('prefilled_email', data.email);
          
          localStorage.removeItem('mia-registration-draft');
          window.location.href = url.toString();
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setState(prev => ({
        ...prev,
        submitError: 'Error al procesar el pago. Por favor, inténtalo de nuevo.',
        isSubmitting: false,
      }));
    }
    
    setState(prev => ({ ...prev, isSubmitting: false }));
  };

  // Render step content
  const renderStepContent = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <PersonalInfoStep 
            membershipType={membershipType}
            onNext={goToNextStep}
          />
        );
      case 2:
        return (
          <MembershipPaymentStep
            pricingInfo={pricingInfo}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        );
      case 3:
        return (
          <ProfileDetailsStep
            membershipType={membershipType}
            isSubmitting={state.isSubmitting}
            submitError={state.submitError}
            onPrevious={goToPreviousStep}
            onSubmit={handleSubmit(onSubmit)}
          />
        );
      default:
        return null;
    }
  };

  const stepTitles = {
    1: 'Información Personal',
    2: 'Membresía y Pago',
    3: 'Detalles del Perfil',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Únete a MIA
          </h1>
          <p className="text-lg text-gray-600">
            Completa tu registro para formar parte de nuestra comunidad
          </p>
        </div>

        {/* Progress Indicator */}
        <RegistrationProgress
          currentStep={state.currentStep}
          completedSteps={state.completedSteps}
          stepTitles={stepTitles}
          progressPercentage={progressPercentage}
          onStepClick={goToStep}
        />

        {/* Form */}
        <Card className="bg-white">
          <CardContent className="p-6 sm:p-8">
            <FormProvider {...methods}>
              <form className="space-y-6">
                {/* Step Header */}
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Paso {state.currentStep}: {stepTitles[state.currentStep]}
                  </h2>
                  {state.currentStep === 1 && (
                    <p className="mt-1 text-sm text-gray-600">
                      Información básica y categorías profesionales
                    </p>
                  )}
                  {state.currentStep === 2 && (
                    <p className="mt-1 text-sm text-gray-600">
                      Selecciona tu tipo de membresía y método de pago
                    </p>
                  )}
                  {state.currentStep === 3 && (
                    <p className="mt-1 text-sm text-gray-600">
                      Completa tu perfil profesional y preferencias
                    </p>
                  )}
                </div>

                {/* Step Content */}
                {renderStepContent()}
              </form>
            </FormProvider>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            ¿Necesitas ayuda? {' '}
            <a 
              href="/contacto" 
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Contáctanos
            </a>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Tu información está protegida
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Utilizamos conexión SSL y cumplimos con el RGPD. Tus datos personales están seguros y 
                  nunca los compartiremos con terceros sin tu consentimiento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}