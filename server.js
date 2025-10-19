import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import brevo from '@getbrevo/brevo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://roastcwaft-frontend.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.options('*', cors());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// ✅ Send email endpoint (works with latest SDK)
app.post('/api/send-email', async (req, res) => {
  console.log('=== EMAIL ENDPOINT HIT ===');

  try {
    const { fullName, email, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    if (!process.env.BREVO_API_KEY) {
      return res.status(500).json({ success: false, error: 'BREVO_API_KEY missing' });
    }

    console.log('Initializing Brevo API...');
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    const sendSmtpEmail = {
      subject: `New Contact from ${fullName}`,
      sender: { name: 'Roast Cwaft', email: 'tmtawagon21@gmail.com' },
      to: [{ email: 'tmtawagon21@gmail.com', name: 'Roast Cwaft' }],
      replyTo: { email, name: fullName },
      htmlContent: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    console.log('Sending email...');
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully:', result);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully! We will get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('❌ Email sending error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message. Please try again later.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 BREVO_API_KEY available: ${!!process.env.BREVO_API_KEY}`);
});
