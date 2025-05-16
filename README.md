# MIA Website Production Setup Guide

This document explains how to set up and deploy the MIA landing page in a production environment.

## File Structure

The landing page follows this structure:

```
mia-website/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Custom CSS styles
├── js/
│   └── main.js             # Custom JavaScript
├── assets/
│   ├── images/
│   │   ├── logo.png        # MIA logo (replace with actual logo)
│   │   ├── hero-bg.jpg     # Hero section background
│   │   └── favicon.ico     # Website favicon
│   └── fonts/              # Custom fonts (if needed)
└── README.md               # This file
```

## Getting Started

1. Clone or download this repository
2. Replace placeholder images with actual MIA assets
3. Update the Stripe payment links in the index.html file
4. Test locally before deploying to your server

## Requirements

- Web server with HTTPS support
- Domain with SSL certificate (for secure form submissions and Stripe integration)

## Configuration Steps

### 1. Update Stripe Links

In `index.html`, locate the Stripe payment links and replace them with your actual Stripe payment links:

```html

  Renovar ahora

```

### 2. Add Your Logo & Images

1. Replace the placeholder images in the `/assets/images/` directory:
   - `logo.png` - The MIA logo
   - `hero-bg.jpg` - Background image for the hero section
   - `favicon.ico` - Website favicon

2. Update image references in the HTML if the filenames differ

### 3. Form Setup

The contact form needs to be connected to a backend service to process form submissions. Options include:

- Server-side script (PHP, Node.js, etc.)
- Third-party form services (Formspree, Netlify Forms, etc.)

Example server-side endpoint setup can be found in the comments of `main.js`.

### 4. Analytics Integration

Add your analytics tracking code before the closing `</body>` tag in `index.html`:

```html



  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR_GA_ID');

```

## Browser Support

This landing page has been tested and supports:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Deployment Checklist

Before pushing to production, verify these items:

- [ ] Stripe payment links are updated with your actual links
- [ ] Contact form is connected to a form processing service
- [ ] All placeholder images are replaced with actual MIA assets
- [ ] SEO meta tags are properly configured
- [ ] Analytics tracking is implemented
- [ ] Site loads correctly on mobile devices
- [ ] Cross-browser compatibility verified
- [ ] SSL certificate is properly installed (HTTPS working)

## SEO Optimization

The landing page includes basic SEO elements. For optimal SEO:

1. Update the meta tags in `index.html`:
   - Title
   - Description
   - Keywords

2. Add structured data for better search results:
   - Organization schema
   - Event schema (if applicable)

## Cloudflare Turnstile Integration

The landing page uses Cloudflare Turnstile for human verification to:
1. Protect the contact form from spam
2. Verify humans before redirecting to Stripe payment

### Setup Steps:

1. Create a Cloudflare Turnstile site key:
   - Go to https://dash.cloudflare.com/
   - Navigate to "Turnstile" section
   - Create a new site key
   - Choose "Invisible" or "Managed" widget type (recommended: Managed)
   - Set the domain to your website domain

2. Update the site key in the HTML:
   - Replace `YOUR_CLOUDFLARE_SITE_KEY` with your actual site key in all Turnstile widgets

3. Server-side validation (required for production):
   - When processing form submissions or before redirecting to Stripe, verify the Turnstile token server-side
   - Use the secret key from Cloudflare to verify tokens
   - Sample server verification code is provided in the comments of `main.js`

### Server-side verification example (PHP):

```php
<?php
// Get the token from the POST request
$token = $_POST['cf-turnstile-response'];
$secret_key = 'YOUR_CLOUDFLARE_SECRET_KEY';

// Verify with Cloudflare
$data = array(
  'secret' => $secret_key,
  'response' => $token
);

$verify = curl_init();
curl_setopt($verify, CURLOPT_URL, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
curl_setopt($verify, CURLOPT_POST, true);
curl_setopt($verify, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($verify, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($verify);
curl_close($verify);

$result = json_decode($response, true);

if ($result['success'] == true) {
  // Token is valid - process the form or redirect to Stripe
  // ...
} else {
  // Token is invalid - handle error
  // ...
}
?>
```

## Performance Optimization

For optimal performance:

1. Compress all images (use tools like TinyPNG)
2. Minify CSS and JavaScript files for production
3. Enable GZIP compression on your server
4. Set up browser caching (via .htaccess or server configuration)

## Maintenance

Regular maintenance tasks:

1. Update the countdown timer date when you have a specific launch date
2. Keep Stripe payment links current
3. Update content as needed

## Support

For technical support or questions about this implementation, contact:
- Email: victor@navic.us

## License

For internal use by MIA only. All rights reserved.