/**
 * Cookie Management Module
 * Handles cookie consent and preferences
 */

class CookieManager {
    constructor() {
        this.cookieConsent = document.getElementById('cookieConsent');
        this.acceptCookies = document.getElementById('acceptCookies');
        this.cookieExpiryDays = 365; // Cookie consent expires after 1 year
        this.cookieName = 'cookiesAccepted';
        this.cookiePreferencesName = 'cookiePreferences';
        
        this.init();
    }
    
    init() {
        // Check if user has previously accepted cookies
        if (!this.getCookie(this.cookieName)) {
            // Show cookie consent with delay for better UX
            setTimeout(() => {
                this.cookieConsent.classList.add('show');
            }, 1000);
        }
        
        // Add event listener for accept button
        this.acceptCookies.addEventListener('click', () => this.acceptAllCookies());
    }
    
    acceptAllCookies() {
        // Set cookie consent
        this.setCookie(this.cookieName, 'true', this.cookieExpiryDays);
        
        // Set default preferences
        const preferences = {
            necessary: true,
            analytics: true,
            marketing: false
        };
        this.setCookie(this.cookiePreferencesName, JSON.stringify(preferences), this.cookieExpiryDays);
        
        // Hide consent banner
        this.cookieConsent.classList.remove('show');
        
        // Initialize analytics if accepted
        if (preferences.analytics) {
            this.initializeAnalytics();
        }
    }
    
    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
    }
    
    getCookie(name) {
        const nameEQ = `${name}=`;
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    
    deleteCookie(name) {
        this.setCookie(name, '', -1);
    }
    
    getPreferences() {
        const preferences = this.getCookie(this.cookiePreferencesName);
        return preferences ? JSON.parse(preferences) : null;
    }
    
    updatePreferences(preferences) {
        this.setCookie(this.cookiePreferencesName, JSON.stringify(preferences), this.cookieExpiryDays);
        
        // Update analytics based on preferences
        if (preferences.analytics) {
            this.initializeAnalytics();
        } else {
            this.disableAnalytics();
        }
    }
    
    initializeAnalytics() {
        // Initialize analytics here
        console.log('Analytics initialized');
    }
    
    disableAnalytics() {
        // Disable analytics here
        console.log('Analytics disabled');
    }
}

export default CookieManager; 