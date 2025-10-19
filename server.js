import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// CORRECT Brevo import - use default import
import brevo from '@getbrevo/brevo';

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
    const defaultClient = brevo.ApiClient.instance;
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

// Contact form email route - FIXED VERSION
app.post('/api/send-email', async (req, res) => {
  console.log('=== EMAIL ENDPOINT HIT ===');
  
  try {
    const { fullName, email, message } = req.body;

    console.log('Received form data:', { fullName, email, message });

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

    // Initialize Brevo - FIXED SYNTAX
    const defaultClient = brevo.ApiClient.instance;
    console.log('Brevo ApiClient instance:', defaultClient);
    
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const transactionalEmailsApi = new brevo.TransactionalEmailsApi();

    // Create email
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = `New Contact from ${fullName}`;
    sendSmtpEmail.sender = { 
      name: 'Roast Cwaft', 
      email: 'noreply@roastcwaft.com' 
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
    sendSmtpEmail.textContent = `
      New Contact Form Submission
      Name: ${fullName}
      Email: ${email}
      Message: ${message}
    `;

    console.log('Sending email via Brevo...');
    
    // Send email
    const result = await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
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