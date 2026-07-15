// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const path = require('path');

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS and parse JSON body payloads
app.use(cors());
app.use(express.json());

// Serve static frontend assets from the root directory
app.use(express.static(__dirname));

// Form submission API endpoint
app.post('/api/book', async (req, res) => {
  const { name, email, phone, dob, tob, pob, notes } = req.body;

  // Basic validation of required inputs
  if (!name || !email || !phone || !dob || !tob || !pob) {
    return res.status(400).json({
      success: false,
      message: 'All fields (Name, Email, Phone, DOB, TOB, POB) are required.'
    });
  }

  // Construct Email Subject & HTML Message Body
  const subject = `New Nadi Astrology Appointment Request - ${name}`;
  const mailHTML = `
    <div style="font-family: 'Cinzel', 'Lora', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4af37; border-radius: 8px; background-color: #0f0f1d; color: #e5d5b0;">
      <h2 style="color: #ffffff; border-bottom: 1px solid rgba(212, 175, 55, 0.3); padding-bottom: 10px; text-transform: uppercase; letter-spacing: 0.1em; text-align: center;">
        Sacred Appointment Request
      </h2>
      <div style="margin-top: 20px; font-family: 'Inter', Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        <p><strong style="color: #d4af37;">Full Name:</strong> <span style="color: #ffffff;">${name}</span></p>
        <p><strong style="color: #d4af37;">Email:</strong> <span style="color: #ffffff;">${email}</span></p>
        <p><strong style="color: #d4af37;">Phone Number:</strong> <span style="color: #ffffff;">${phone}</span></p>
        <p><strong style="color: #d4af37;">Date of Birth:</strong> <span style="color: #ffffff;">${dob}</span></p>
        <p><strong style="color: #d4af37;">Time of Birth:</strong> <span style="color: #ffffff;">${tob}</span></p>
        <p><strong style="color: #d4af37;">Place of Birth:</strong> <span style="color: #ffffff;">${pob}</span></p>
        <p><strong style="color: #d4af37;">Notes / Concerns:</strong></p>
        <div style="background-color: rgba(26, 26, 46, 0.5); padding: 12px; border-left: 2px solid #d4af37; border-radius: 4px; color: rgba(229, 213, 176, 0.9); font-style: italic;">
          ${notes ? notes.replace(/\n/g, '<br>') : 'None provided.'}
        </div>
      </div>
      <div style="margin-top: 30px; text-align: center; border-top: 1px solid rgba(212, 175, 55, 0.1); padding-top: 15px; font-size: 11px; color: rgba(229, 213, 176, 0.5);">
        Sri Agasthiya Maha Siva Nadi Jyothida Nilayam • Nanded Branch
      </div>
    </div>
  `;

  const receiverEmail = process.env.RECEIVER_EMAIL || 'your-receiving-email@example.com';

  try {
    // --- Option A: SendGrid ---
    if (process.env.SENDGRID_API_KEY) {
      console.log('Sending email using SendGrid...');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to: receiverEmail,
        from: process.env.SENDER_EMAIL || 'verified-sendgrid-sender@example.com',
        subject: subject,
        html: mailHTML,
      };

      await sgMail.send(msg);
      console.log('Email sent successfully via SendGrid!');
      
      return res.status(200).json({
        success: true,
        message: 'Appointment booking sent and email notification triggered via SendGrid!'
      });
    }

    // --- Option B: SMTP (Nodemailer) ---
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass && smtpUser !== 'your-smtp-username@gmail.com') {
      console.log(`Sending email using SMTP (${smtpHost})...`);
      
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for port 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_SENDER || smtpUser,
        to: receiverEmail,
        subject: subject,
        html: mailHTML,
      };

      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully via SMTP!');

      return res.status(200).json({
        success: true,
        message: 'Appointment booking sent and email notification triggered via SMTP!'
      });
    }

    // --- Option C: Fallback Simulation ---
    console.warn(
      'WARNING: Neither SendGrid nor SMTP credentials have been configured in your .env file.\n' +
      'Simulating successful booking submission without sending a real email.'
    );

    return res.status(200).json({
      success: true,
      message: 'Booking saved! Note: Setup SendGrid/SMTP in .env to receive real emails.'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to send automated email notification. Please check your credentials.',
      error: error.message
    });
  }
});

// Fallback index.html router for client-side navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening for connections
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  Nadi Astrology server active on port ${PORT}`);
  console.log(`  Local URL: http://localhost:${PORT}/`);
  console.log(`==================================================`);
});
