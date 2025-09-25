const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface EmailRequest {
  email: string;
  source: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, source }: EmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Email HTML template
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Qylon</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            margin: 20px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
            padding: 30px 20px;
            text-align: center;
        }
        .logo {
            color: white;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .tagline {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            font-style: italic;
        }
        .content {
            padding: 30px 20px;
        }
        .welcome {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #1f2937;
        }
        .feature {
            display: flex;
            align-items: center;
            margin: 15px 0;
            padding: 10px;
            background: #f0f9ff;
            border-radius: 8px;
        }
        .feature-icon {
            font-size: 20px;
            margin-right: 12px;
        }
        .cta {
            background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            font-weight: 600;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
        }
        .social-proof {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        @media (max-width: 600px) {
            .container { margin: 10px; }
            .content { padding: 20px 15px; }
            .welcome { font-size: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚡ Qylon</div>
            <div class="tagline">(Pronounced as KEE-LON)</div>
        </div>
        
        <div class="content">
            <div class="welcome">Welcome to the Future of Meetings! 🚀</div>
            
            <p>Hi there!</p>
            
            <p>Thank you for joining our exclusive waitlist! You're now part of a select group of forward-thinking professionals who will be among the first to experience the power of AI-driven meeting automation.</p>
            
            <div class="social-proof">
                <strong>🎉 You're in excellent company!</strong><br>
                You've joined 50+ innovative professionals who are ready to revolutionize their productivity.
            </div>
            
            <h3>What happens next?</h3>
            
            <div class="feature">
                <span class="feature-icon">⏰</span>
                <div>
                    <strong>Q4 2025 Launch</strong><br>
                    We're putting the finishing touches on Qylon and will launch in Q4 2025.
                </div>
            </div>
            
            <div class="feature">
                <span class="feature-icon">🎯</span>
                <div>
                    <strong>Exclusive Early Access</strong><br>
                    You'll receive priority access before our public launch.
                </div>
            </div>
            
            <div class="feature">
                <span class="feature-icon">💰</span>
                <div>
                    <strong>Early Bird Pricing</strong><br>
                    Special discounted rates for our waitlist members.
                </div>
            </div>
            
            <div class="feature">
                <span class="feature-icon">🔔</span>
                <div>
                    <strong>Product Updates</strong><br>
                    Regular updates on our progress and exclusive previews.
                </div>
            </div>
            
            <p>In the meantime, feel free to:</p>
            <ul>
                <li>Visit our website: <a href="https://www.qylon.io" style="color: #06b6d4;">www.qylon.io</a></li>
                <li>Follow our progress and connect with us</li>
                <li>Share Qylon with your colleagues who struggle with meeting follow-ups</li>
            </ul>
            
            <p>Questions? Simply reply to this email - we read and respond to every message!</p>
            
            <p>Looking forward to transforming your meetings,<br>
            <strong>The Qylon Team</strong></p>
        </div>
        
        <div class="footer">
            <p>© 2025 Qylon. All rights reserved.</p>
            <p>You're receiving this email because you signed up for our waitlist. We'll never spam you, and you can unsubscribe anytime.</p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
Welcome to Qylon!

Thank you for joining our exclusive waitlist! You're now part of a select group of forward-thinking professionals who will be among the first to experience AI-driven meeting automation.

What happens next?

⏰ Q2 2025 Launch - We're launching in Q2 2025
⏰ Q4 2025 Launch - We're launching in Q4 2025
🎯 Exclusive Early Access - Priority access before public launch  
💰 Early Bird Pricing - Special discounted rates for waitlist members
🔔 Product Updates - Regular progress updates and exclusive previews

Visit us: https://www.qylon.io
Questions? Reply to this email!

Looking forward to transforming your meetings,
The Qylon Team

© 2025 Qylon. All rights reserved.
`;

    // In a real implementation, you would use a service like Resend, SendGrid, or Mailgun
    // For now, we'll simulate the email sending
    console.log(`Sending welcome email to: ${email}`);
    console.log(`Source: ${source}`);
    console.log(`HTML Content: ${htmlContent.substring(0, 100)}...`);
    
    // Simulate email sending success
    // Replace this with actual email service integration
    const emailSent = true;

    if (emailSent) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Welcome email sent successfully!" 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    } else {
      throw new Error("Failed to send email");
    }

  } catch (error) {
    console.error("Error sending welcome email:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send welcome email",
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});