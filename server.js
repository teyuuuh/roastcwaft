import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import brevo from '@getbrevo/brevo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://roastcwaft-frontend.vercel.app' ], // Add both common React ports
  credentials: true
}));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Contact form email route
app.post('/api/send-email', async (req, res) => {
  const { fullName, email, message } = req.body;

  // Validation
  if (!fullName || !email || !message) {
    return res.status(400).json({ 
      error: 'All fields are required: fullName, email, message' 
    });
  }

  try {
    // Initialize Brevo API client
    const defaultClient = brevo.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new brevo.TransactionalEmailsApi();

    // 1. Send notification email to business
    const businessEmail = new brevo.SendSmtpEmail();
    businessEmail.subject = `New Contact Form Message from ${fullName}`;
    businessEmail.sender = { 
      name: 'Roast Cwaft Website', 
      email: 'tmtawagon21@gmail.com' 
    };
    businessEmail.to = [{ 
      email: 'tmtawagon21@gmail.com', 
      name: 'Roast Cwaft Team' 
    }];
    businessEmail.replyTo = { 
      email: email, 
      name: fullName 
    };
    businessEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B4513;">New Contact Form Submission</h2>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #8B4513;">
            ${message.replace(/\n/g, '<br>')}
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          <em>Sent from Roast Cwaft contact form</em>
        </p>
      </div>
    `;

    // 2. Send auto-response to customer
    const customerEmail = new brevo.SendSmtpEmail();
    customerEmail.subject = 'Thank You for Contacting Roast Cwaft!';
    customerEmail.sender = { 
      name: 'Roast Cwaft', 
      email: 'roastcwaft@gmail.com' 
    };
    customerEmail.to = [{ 
      email: email, 
      name: fullName 
    }];
    customerEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B4513;">Thank You for Contacting Roast Cwaft!</h2>
        
        <p>Hi <strong>${fullName}</strong>,</p>
        
        <p>Thank you for reaching out to Roast Cwaft! We have received your message and our team will get back to you within 24 hours.</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #8B4513; margin: 20px 0;">
          <p style="margin: 0;"><strong>Your Message:</strong></p>
          <p style="margin: 10px 0 0 0;">"${message}"</p>
        </div>
        
        <p>In the meantime, feel free to explore our handcrafted coffee blends and follow us on social media for the latest updates!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 0;"><strong>Best regards,</strong><br>
          The Roast Cwaft Team</p>
          
          <div style="margin-top: 20px; font-size: 14px; color: #666;">
            <p style="margin: 5px 0;">📍 2137 Daang Bukid, Baccor City, Philippines</p>
            <p style="margin: 5px 0;">📞 (143) 042-7206 | +63923456789</p>
            <p style="margin: 5px 0;">📧 roastcwaft@gmail.com</p>
            <p style="margin: 5px 0;">🌐 @RoastCwaft on Facebook/Instagram</p>
          </div>
        </div>
      </div>
    `;

    // Send both emails
    const [businessResult, customerResult] = await Promise.all([
      apiInstance.sendTransacEmail(businessEmail),
      apiInstance.sendTransacEmail(customerEmail)
    ]);

    console.log('Emails sent successfully:', {
      business: businessResult.messageId,
      customer: customerResult.messageId
    });

    res.status(200).json({ 
      success: true, 
      message: 'Emails sent successfully' 
    });

  } catch (error) {
    console.error('Brevo API error:', error);
    res.status(500).json({ 
      error: 'Failed to send email. Please try again later.' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email endpoint: http://localhost:${PORT}/api/send-email`);
});