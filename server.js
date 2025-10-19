import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import brevo from '@getbrevo/brevo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Fix CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://roastcwaft-frontend.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Contact form email route - SIMPLIFIED VERSION
app.post('/api/send-email', async (req, res) => {
  try {
    const { fullName, email, message } = req.body;

    console.log('Received form data:', { fullName, email, message });

    // Basic validation
    if (!fullName || !email || !message) {
      return res.status(400).json({ 
        error: 'All fields are required' 
      });
    }

    // Check if Brevo API key is available
    if (!process.env.BREVO_API_KEY) {
      console.error('BREVO_API_KEY is missing');
      return res.status(500).json({ 
        error: 'Email service not configured' 
      });
    }

    // Initialize Brevo
    const defaultClient = brevo.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new brevo.TransactionalEmailsApi();

    // Send only business notification email (simpler)
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = `New Contact from ${fullName}`;
    sendSmtpEmail.sender = { 
      name: 'Roast Cwaft Website', 
      email: 'noreply@roastcwaft.com' 
    };
    sendSmtpEmail.to = [{ 
      email: 'tmtawagon21@gmail.com', // Change to your actual email
      name: 'Roast Cwaft Team' 
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

    // Send email
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully:', result);

    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('Brevo API response error:', error.response.body);
    }
    
    res.status(500).json({ 
      error: 'Failed to send message. Please try again later.' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});