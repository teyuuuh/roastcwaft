import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// CORRECT Brevo import - use named imports
import { ApiClient, TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Fix CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://roastcwaft-frontend.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Handle preflight requests
app.options('*', cors());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Test Brevo configuration
app.get('/api/test-brevo', (req, res) => {
  try {
    console.log('Testing Brevo configuration...');
    
    // Check if API key exists
    if (!process.env.BREVO_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'BREVO_API_KEY is missing'
      });
    }

    // Test Brevo initialization
    const defaultClient = ApiClient.instance;
    console.log('Brevo ApiClient:', defaultClient);
    
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    
    console.log('Brevo configured successfully');
    
    res.json({
      success: true,
      message: 'Brevo configuration is correct',
      apiKeyExists: !!process.env.BREVO_API_KEY
    });
    
  } catch (error) {
    console.error('Brevo configuration error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

app.post('/api/send-email', async (req, res) => {
  console.log('=== EMAIL ENDPOINT HIT ===');
  
  try {
    const { fullName, email, message } = req.body;

    // Basic validation
    if (!fullName || !email || !message) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required' 
      });
    }

    // Check if Brevo API key is available
    if (!process.env.BREVO_API_KEY) {
      console.error('BREVO_API_KEY is missing');
      return res.status(500).json({ 
        success: false,
        error: 'Email service not configured' 
      });
    }

    console.log('Initializing Brevo API...');

    // **FIXED: Correct Brevo initialization with named imports**
    const defaultClient = ApiClient.instance;
    
    if (!defaultClient) {
      throw new Error('ApiClient.instance is undefined - check Brevo package import');
    }
    
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new TransactionalEmailsApi();
    
    // Create sendSmtpEmail object
    const sendSmtpEmail = new SendSmtpEmail();
    
    sendSmtpEmail.subject = `New Contact from ${fullName}`;
    sendSmtpEmail.sender = { 
      name: 'Roast Cwaft', 
      email: 'tmtawagon21@gmail.com'  // Must be verified in Brevo
    };
    sendSmtpEmail.to = [{ 
      email: 'tmtawagon21@gmail.com',
      name: 'Roast Cwaft' 
    }];
    sendSmtpEmail.replyTo = { 
      email: email, 
      name: fullName 
    };
    sendSmtpEmail.htmlContent = `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
    `;

    console.log('Sending email via Brevo...');
    
    // Send email
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully:', result);

    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully! We will get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('❌ Email sending error:', error);
    
    // Detailed error logging
    if (error.response) {
      console.error('Brevo API response error:', error.response.body);
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to send message. Please try again later.' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Brevo API Key available: ${!!process.env.BREVO_API_KEY}`);
});