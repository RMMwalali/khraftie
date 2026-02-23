import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '..', '..', '.env');
const envContent = readFileSync(envPath, 'utf8');

// Parse .env file manually
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Using Gmail as example - replace with your email provider
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'info@stillcraftevents.co.ke',
    pass: process.env.EMAIL_PASS // You'll need to set this in your environment
  }
});

export async function POST({ request }) {
  try {
    // Debug environment variables
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length);
    const data = await request.formData();
    
    // Extract form data
    const firstName = data.get('hs-firstname-contacts');
    const lastName = data.get('hs-lastname-contacts');
    const email = data.get('hs-email-contacts');
    const phone = data.get('hs-phone-number');
    const details = data.get('hs-about-contacts');

    // Validate required fields
    if (!firstName || !lastName || !email || !details) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Please fill in all required fields' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create email content
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Message:</strong></p>
      <p>${details}</p>
      <hr>
      <p><small>Submitted on: ${new Date().toLocaleString()}</small></p>
    `;

    // Send email to company
    console.log('Sending email to company...');
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'info@stillcraftevents.co.ke',
        to: 'infolivingstatues@gmail.com', // Send to the business email
        subject: `New Contact Form: ${firstName} ${lastName}`,
        html: emailContent,
        replyTo: email
      });
      console.log('Company email sent successfully');
    } catch (error) {
      console.error('Failed to send company email:', error);
    }

    // Send confirmation email to user
    console.log('Sending confirmation email to user...');
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'info@stillcraftevents.co.ke',
        to: email,
        subject: 'Thank you for contacting StillCraft Events',
        html: `
          <h2>Thank You for Contacting Us!</h2>
          <p>Dear ${firstName} ${lastName},</p>
          <p>We have received your message and will get back to you within 1-2 business days.</p>
          <p>Best regards,<br>StillCraft Events Team</p>
          <hr>
          <p><small>This is an automated message. Please do not reply to this email.</small></p>
        `
      });
      console.log('Confirmation email sent successfully');
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message sent successfully! We will respond within 1-2 business days.' 
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Failed to send message. Please try again or contact us directly.' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
