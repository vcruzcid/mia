/**
 * MIA Landing Page Scripts
 * Main JavaScript file for MIA (Mujeres en la Industria de la Animación)
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // Initialize AOS animations
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
    
    // Form validation
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          event.preventDefault();
          
          // Verify Cloudflare Turnstile token
          const token = form.querySelector('.cf-turnstile').getAttribute('data-cf-response');
          
          if (!token) {
            // Show error if Turnstile not completed
            const errorAlert = document.createElement('div');
            errorAlert.className = 'alert alert-danger mt-3 fade-in';
            errorAlert.innerHTML = 'Por favor, completa la verificación de seguridad.';
            form.appendChild(errorAlert);
            
            setTimeout(() => {
              errorAlert.remove();
            }, 3000);
            
            return;
          }
          
          // Get form data
          const formData = new FormData(form);
          formData.append('cf-turnstile-response', token);
          
          // Here you would typically send the data to your server with the token
          // For this demo, we'll just show a success message
          showFormSuccess(form);
          
          // Log form submission (remove in production)
          console.log('Form submitted with Turnstile token');
        }
        
        form.classList.add('was-validated');
      }, false);
    });
    
    // Cloudflare Turnstile callbacks for Stripe buttons
    window.enableStripeButton1 = function(token) {
      enableStripeButton('stripe-button-1', token);
    };
    
    window.enableStripeButton2 = function(token) {
      enableStripeButton('stripe-button-2', token);
    };
    
    window.enableStripeButton3 = function(token) {
      enableStripeButton('stripe-button-3', token);
    };
    
    // Enable Stripe button after Turnstile verification
    function enableStripeButton(buttonId, token) {
      const button = document.getElementById(buttonId);
      if (button && token) {
        button.classList.remove('disabled');
        
        // Store the token for verification on click
        button.setAttribute('data-turnstile-token', token);
        
        // Add click handler
        button.addEventListener('click', function(e) {
          e.preventDefault();
          
          const stripeUrl = this.getAttribute('data-stripe-url');
          
          if (stripeUrl) {
            // In a real implementation, you'd verify the token server-side first
            // For this demo we'll redirect directly
            window.location.href = stripeUrl;
          }
        });
      }
    }
    
    // Setup Stripe buttons
    document.querySelectorAll('.stripe-button').forEach(button => {
      button.addEventListener('click', function(e) {
        if (this.classList.contains('disabled')) {
          e.preventDefault();
          alert('Por favor, completa la verificación de seguridad primero.');
        }
      });
    });
    
    // Show success message after form submission
    function showFormSuccess(form) {
      // Create success alert
      const successAlert = document.createElement('div');
      successAlert.className = 'alert alert-success mt-3 fade-in';
      successAlert.innerHTML = '¡Gracias por tu mensaje! Te contactaremos pronto.';
      
      // Hide the form
      form.style.transition = 'opacity 0.5s ease';
      form.style.opacity = '0.5';
      form.style.pointerEvents = 'none';
      
      // Add success message
      form.parentNode.appendChild(successAlert);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        form.reset();
        form.style.opacity = '1';
        form.style.pointerEvents = 'auto';
        form.classList.remove('was-validated');
        successAlert.remove();
        
        // Reset Turnstile
        const turnstileWidget = form.querySelector('.cf-turnstile');
        if (turnstileWidget) {
          turnstile.reset(turnstileWidget);
        }
      }, 3000);
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
        e.preventDefault();
        
        if (this.getAttribute('href') === '#') return;
        
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