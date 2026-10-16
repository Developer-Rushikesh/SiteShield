from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils.html import strip_tags

def send_otp_email(to_email, otp_code, purpose="REGISTER", user_name=""):
    """
    Sends a beautifully designed HTML OTP verification email to the user.
    """
    subject_map = {
        'REGISTER': f"Your SiteShield Verification Code: {otp_code}",
        'RESET_PASSWORD': f"Password Reset Code: {otp_code}",
    }
    subject = subject_map.get(purpose, f"Your Verification Code: {otp_code}")

    display_name = user_name.strip() if user_name else "User"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>{subject}</title>
      <style>
        body {{
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f1f5f9;
          color: #1e293b;
        }}
        .container {{
          max-width: 580px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }}
        .header {{
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          padding: 32px 30px;
          text-align: center;
          color: #ffffff;
        }}
        .header h1 {{
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }}
        .header p {{
          margin: 6px 0 0 0;
          font-size: 13px;
          color: #bfdbfe;
          letter-spacing: 0.5px;
        }}
        .content {{
          padding: 36px 32px;
        }}
        .greeting {{
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 12px;
        }}
        .body-text {{
          font-size: 14px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 24px;
        }}
        .otp-box {{
          background-color: #f8fafc;
          border: 2px dashed #3b82f6;
          border-radius: 10px;
          padding: 24px;
          text-align: center;
          margin: 28px 0;
        }}
        .otp-label {{
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 8px;
        }}
        .otp-code {{
          font-family: 'Courier New', Courier, monospace;
          font-size: 38px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #1e40af;
          margin: 4px 0;
        }}
        .otp-expiry {{
          font-size: 12px;
          color: #ef4444;
          font-weight: 600;
          margin-top: 6px;
        }}
        .security-notice {{
          background-color: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 12px 16px;
          border-radius: 4px;
          font-size: 13px;
          color: #991b1b;
          line-height: 1.5;
          margin-top: 24px;
        }}
        .footer {{
          background-color: #f8fafc;
          padding: 20px 32px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
        }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SiteShield 24 Monitor</h1>
          <p>Real-Time Availability & Performance Intelligence</p>
        </div>
        <div class="content">
          <div class="greeting">Hello {display_name},</div>
          <div class="body-text">
            Thank you for registering with <strong>SiteShield 24 Monitor</strong>. To complete your account registration and secure your monitoring workspace, please enter the one-time verification code below:
          </div>

          <div class="otp-box">
            <div class="otp-label">One-Time Verification Code</div>
            <div class="otp-code">{otp_code}</div>
            <div class="otp-expiry">Valid for 10 minutes only</div>
          </div>

          <div class="body-text">
            Enter this code into your registration window to activate your account. Do not share this OTP with anyone.
          </div>

          <div class="security-notice">
            <strong>Security Warning:</strong> SiteShield personnel will never ask for this code. If you did not attempt to register an account, please disregard this email.
          </div>
        </div>
        <div class="footer">
          &copy; SiteShield 24 Monitor Platform. All rights reserved.<br>
          Automated Notification • Please do not reply directly to this email.
        </div>
      </div>
    </body>
    </html>
    """

    plain_text = f"""
Hello {display_name},

Thank you for registering with SiteShield 24 Monitor.

Your One-Time Verification Code is: {otp_code}
This code is valid for 10 minutes.

If you did not request this code, please ignore this email.

SiteShield 24 Monitor
    """.strip()

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'SiteShield 24 Monitor <rushikeshpawar977@gmail.com>')
    msg = EmailMultiAlternatives(subject, plain_text, from_email, [to_email])
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)
    return True
