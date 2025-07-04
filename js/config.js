/**
 * Configuration file for MIA website
 * Contains sensitive information and configuration values
 */

const config = {
    // Development flag - set to true to disable Turnstile for local testing
    development: true,
    
    emailjs: {
        userID: 'YOUR_USER_ID', // Replace with actual EmailJS user ID
        serviceID: 'default_service',
        templateID: 'template_contact_form'
    },
    turnstile: {
        sitekey: '0x4AAAAAABddjw-SDSpgjBDI'
    },
    stripe: {
        plenoDerecho: 'https://pagos.animacionesmia.com/b/9B69ASapSeBh13e81x7g401',
        estudiante: 'https://pagos.animacionesmia.com/b/00w28qcy0gJp27i3Lh7g402',
        colaborador: 'https://pagos.animacionesmia.com/b/9B65kC41ubp5eU495B7g403Og2Sz5ju2Hd7g400'
    }
};

// Prevent modification of config object
Object.freeze(config);

// Export config
export default config; 