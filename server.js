import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import brevo from '@getbrevo/brevo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://roastcwaft-frontend.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.options('*', cors());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

app.post('/api/send-email', async (req, res) => {
  console.log('=== EMAIL ENDPOINT HIT ===');

  try {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        error: 'Full name and email are required'
      });
    }

    if (!process.env.BREVO_API_KEY) {
      console.error('❌ BREVO_API_KEY is missing');
      return res.status(500).json({
        success: false,
        error: 'Email service not configured'
      });
    }

    const defaultClient = brevo.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    const apiInstance = new brevo.TransactionalEmailsApi();

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: 'Roast Cwaft', email: 'tmtawagon21@gmail.com' };
    sendSmtpEmail.to = [{ email, name: fullName }];
    sendSmtpEmail.subject = 'Welcome to Roast Cwaft’s Coffee Community!';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #3e2a18;">
        <h2>Welcome, ${fullName}!</h2>
        <p>Thank you for subscribing to <strong>Roast Cwaft</strong>.</p>
        <p>You'll now receive updates about our latest coffee blends, brewing tips, and exclusive offers straight to your inbox ☕.</p>
        <br/>
        <p>Stay aromatic,<br/>The Roast Cwaft Team</p>
      </div>
    `;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Confirmation email sent successfully:', result);

    res.status(200).json({
      success: true,
      message: 'Subscription successful! Confirmation email sent.'
    });

  } catch (error) {
    console.error('❌ Email sending error:', error);
    if (error.response) console.error('Brevo API response:', error.response.body);

    res.status(500).json({
      success: false,
      error: 'Failed to send confirmation email.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
