/**
 * MIA Landing Page Scripts
 * Main JavaScript file for MIA (Mujeres en la Industria de la Animación)
 */

// Import configuration and modules
import config from './config.js';
import CookieManager from './cookieManager.js';

// Initialize EmailJS
emailjs.init(config.emailjs.userID);

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // Initialize cookie manager
    const cookieManager = new CookieManager();
    
    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }
    
    // Form validation
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                form.classList.add('was-validated');
            } else {
                event.preventDefault();
                
                // Show Turnstile widget if not already shown
                const turnstileContainer = document.getElementById('contact-turnstile-container');
                if (turnstileContainer && !turnstileContainer.querySelector('.cf-turnstile iframe')) {
                    // Show the container
                    turnstileContainer.style.display = 'block';
                    
                    // Check if Turnstile is available
                    if (typeof turnstile !== 'undefined') {
                        // Render Turnstile widget
                        turnstile.render(turnstileContainer, {
                            sitekey: config.turnstile.sitekey,
                            theme: 'dark',
                            callback: function(token) {
                                // Process form submission after Turnstile verification
                                processFormSubmission(form, token);
                            }
                        });
                        
                        // Add message above the widget
                        const message = document.createElement('p');
                        message.className = 'text-center mb-2';
                        message.innerHTML = 'Por favor, complete la verificación de seguridad para continuar:';
                        turnstileContainer.insertBefore(message, turnstileContainer.firstChild);
                        
                        return; // Stop here until Turnstile is completed
                    } else {
                        console.error('Turnstile not loaded');
                        showFormError(form, null, null, 'Error de carga del sistema de seguridad. Por favor, recarga la página.');
                        return;
                    }
                }
                
                // If we already have a token, process the form
                const token = form.querySelector('.cf-turnstile') ? 
                            form.querySelector('.cf-turnstile').getAttribute('data-cf-response') : null;
                
                if (token) {
                    processFormSubmission(form, token);
                }
            }
            
            form.classList.add('was-validated');
        }, false);
    });
    
    // Process form submission after Turnstile verification
    function processFormSubmission(form, token) {
      try {
        // Get form data
        const formData = new FormData(form);
        formData.append('cf-turnstile-response', token);
        
        // Get form field values
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message') || 'No message provided';
        
        // Validate message length
        if (message.length > 1000) {
          throw new Error('El mensaje no puede exceder los 1000 caracteres');
        }
        
        // Disable form while sending
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Enviando...';
        submitButton.disabled = true;
        
        // Prepare template parameters
        const templateParams = {
          name: name,
          email: email,
          message: message,
          turnstile_token: token
        };
        
        // Send email using EmailJS
        emailjs.send(config.emailjs.serviceID, config.emailjs.templateID, templateParams, config.emailjs.userID)
          .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            showFormSuccess(form);
            
            // Reset button
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
          })
          .catch(function(error) {
            console.error('FAILED...', error);
            showFormError(form, submitButton, originalButtonText, 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
          });
      } catch (error) {
        console.error('Error processing form:', error);
        showFormError(form, null, null, error.message);
      }
    }
    
    // Show error message after form submission
    function showFormError(form, button, originalText, errorMessage) {
      // Reset button if provided
      if (button && originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
      }
      
      // Show error message
      const errorAlert = document.createElement('div');
      errorAlert.className = 'alert alert-danger mt-3 fade-in';
      errorAlert.setAttribute('role', 'alert');
      errorAlert.setAttribute('aria-live', 'assertive');
      errorAlert.innerHTML = errorMessage || 'Ha ocurrido un error. Por favor, inténtalo de nuevo.';
      form.parentNode.appendChild(errorAlert);
      
      // Remove error message after 5 seconds
      setTimeout(() => {
        errorAlert.remove();
      }, 5000);
    }
    
    // Setup Stripe buttons
    document.querySelectorAll('.stripe-button').forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get the button ID number
        const buttonNum = this.id.split('-').pop();
        const turnstileContainerId = `turnstile-container-${buttonNum}`;
        const container = document.getElementById(turnstileContainerId);
        
        // If Turnstile not rendered yet, render it
        if (container && !container.querySelector('.cf-turnstile iframe')) {
          // Show container
          container.style.display = 'block';
          
          // Add message
          const message = document.createElement('p');
          message.className = 'text-center mb-2';
          message.innerHTML = 'Por favor, complete la verificación de seguridad para continuar:';
          container.insertBefore(message, container.firstChild);
          
          // Render Turnstile
          turnstile.render(container, {
            sitekey: config.turnstile.sitekey,
            theme: 'dark',
            callback: function(token) {
              // After verification, redirect to Stripe
              const stripeUrl = button.getAttribute('data-stripe-url');
              if (stripeUrl) {
                window.location.href = stripeUrl;
              }
            }
          });
        } else if (container.querySelector('.cf-turnstile iframe')) {
          // If already rendered, just check if verified
          const token = container.querySelector('.cf-turnstile').getAttribute('data-cf-response');
          if (token) {
            const stripeUrl = button.getAttribute('data-stripe-url');
            if (stripeUrl) {
              window.location.href = stripeUrl;
            }
          }
        }
      });
    });
    
    // Show success message after form submission
    function showFormSuccess(form) {
      // Create success alert
      const successAlert = document.createElement('div');
      successAlert.className = 'alert alert-success mt-3 fade-in';
      successAlert.setAttribute('role', 'alert');
      successAlert.setAttribute('aria-live', 'assertive');
      successAlert.innerHTML = '¡Gracias por tu mensaje! Te contactaremos pronto.';
      
      // Hide the form
      form.style.transition = 'opacity 0.5s ease';
      form.style.opacity = '0.5';
      form.style.pointerEvents = 'none';
      
      // Hide the Turnstile container
      const turnstileContainer = document.getElementById('contact-turnstile-container');
      if (turnstileContainer) {
        turnstileContainer.style.display = 'none';
      }
      
      // Add success message
      form.parentNode.appendChild(successAlert);
      
      // Reset form after 5 seconds
      setTimeout(() => {
        form.reset();
        form.style.opacity = '1';
        form.style.pointerEvents = 'auto';
        form.classList.remove('was-validated');
        successAlert.remove();
      }, 5000);
    }
    
    // Back to top button
    const backToTopButton = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
      } else {
        backToTopButton.classList.remove('show');
      }
    });
    
    backToTopButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    // Cookie consent
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptCookies = document.getElementById('acceptCookies');
    
    // Check if user has previously accepted cookies
    if (!localStorage.getItem('cookiesAccepted')) {
      // Show cookie consent with delay for better UX
      setTimeout(() => {
        cookieConsent.classList.add('show');
      }, 1000);
    }
    
    acceptCookies.addEventListener('click', () => {
      localStorage.setItem('cookiesAccepted', 'true');
      cookieConsent.classList.remove('show');
    });
    
    // Navbar scroll behavior
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 100) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    });
    
    // Smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#') return;
        
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          // Calculate navbar height for offset
          const navbarHeight = document.querySelector('.navbar').offsetHeight;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
    
    // Add some animations to elements
    const animateElements = () => {
      // Add animation to hero section when page loads
      const heroSection = document.getElementById('hero');
      if (heroSection) {
        heroSection.classList.add('fade-in');
      }
      
      // Add animation to cards on hover
      const cards = document.querySelectorAll('.membership-card, .contact-card');
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-10px)';
          card.style.boxShadow = '0 15px 30px rgba(255, 51, 51, 0.15)';
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
        });
      });
    };
    
    // Initialize animations
    animateElements();
    
    // Preload images for better performance
    const preloadImages = () => {
      const imagesToPreload = [
        '../assets/images/hero-bg.jpg',
        '../assets/images/logo.png'
      ];
      
      imagesToPreload.forEach(imageSrc => {
        const img = new Image();
        img.src = imageSrc;
      });
    };
    
    // Call the preload function
    preloadImages();
    
    // Simulate loading screen
    const fadeOutLoader = () => {
      const body = document.body;
      body.classList.add('loaded');
    };
    
    // Remove loader after page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(fadeOutLoader, 500);
    });
    
    // Add active class to navbar links based on scroll position
    const highlightNavLinks = () => {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
      
      window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
          const sectionTop = section.offsetTop - 100;
          const sectionHeight = section.offsetHeight;
          
          if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
          }
        });
        
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
          }
        });
      });
    };
    
    // Call the highlight function
    highlightNavLinks();
  });