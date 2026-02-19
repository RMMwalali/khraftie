# Email Configuration Setup Guide

## Overview
The contact form now sends emails directly to `info@stillcraftevents.co.ke` using Nodemailer. This guide will help you set up the email configuration.

## Prerequisites
1. Gmail account (or other email provider)
2. App password for the email account

## Setup Instructions

### 1. Gmail Configuration (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to "Security"
3. Enable 2-Factor Authentication

#### Step 2: Create App Password
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" for the app
3. Select "Other (Custom name)" and enter "StillCraft Events"
4. Click "Generate"
5. Copy the 16-character password (this is your `EMAIL_PASS`)

#### Step 3: Update Environment Variables
Add these to your `.env` file:
```env
EMAIL_USER=info@stillcraftevents.co.ke
EMAIL_PASS=your-16-character-app-password
```

### 2. Alternative Email Providers

If you're not using Gmail, update the transporter configuration in `src/pages/api/contact.mjs`:

```javascript
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-server.com', // e.g., smtp.office365.com
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## Testing the Contact Form

1. Start the development server: `npm run dev`
2. Navigate to `/contact`
3. Fill out the form and submit
4. Check:
   - Your inbox for the contact submission
   - User's inbox for confirmation email
   - Browser console for any errors

## Troubleshooting

### Common Issues

#### "Invalid login" Error
- Verify your email and app password are correct
- Ensure 2-factor authentication is enabled
- Use an app password, not your regular password

#### "Connection refused" Error
- Check your internet connection
- Verify SMTP settings for your email provider
- Try different port (465 with `secure: true`)

#### Form Not Submitting
- Check browser console for JavaScript errors
- Verify the API endpoint is accessible
- Ensure all required fields are filled

### Security Notes

- **Never commit your `.env` file** to version control
- Use app passwords instead of regular passwords
- Consider using environment-specific configurations
- Monitor for unusual email activity

## Features

### What the Contact Form Does:
1. **Validates** all required fields
2. **Sends email** to `info@stillcraftevents.co.ke`
3. **Sends confirmation** to the user
4. **Shows success/error messages** without page reload
5. **Resets form** after successful submission
6. **Includes timestamps** and formatting

### Email Contents:
- Sender name and contact information
- Message details
- Submission timestamp
- Reply-to functionality

## Production Deployment

For production deployment:
1. Set environment variables in your hosting platform
2. Use a dedicated email service (SendGrid, Mailgun, etc.) for higher volume
3. Implement rate limiting to prevent spam
4. Add reCAPTCHA for additional security
5. Set up email monitoring and analytics

## Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Review server logs for email delivery errors
3. Verify your email provider's SMTP settings
4. Test with a different email provider if needed
