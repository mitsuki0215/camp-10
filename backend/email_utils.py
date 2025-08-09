import aiosmtplib
from email.message import EmailMessage
from jinja2 import Template
import os
from typing import List

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USERNAME)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

async def send_email(
    to_emails: List[str],
    subject: str,
    html_content: str,
    text_content: str = None
):
    """Send an email"""
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("Warning: Email credentials not configured. Email not sent.")
        return
    
    message = EmailMessage()
    message["From"] = FROM_EMAIL
    message["To"] = ", ".join(to_emails)
    message["Subject"] = subject
    
    if text_content:
        message.set_content(text_content)
        message.add_alternative(html_content, subtype="html")
    else:
        message.set_content(html_content, subtype="html")
    
    try:
        await aiosmtplib.send(
            message,
            hostname=SMTP_SERVER,
            port=SMTP_PORT,
            start_tls=True,
            username=SMTP_USERNAME,
            password=SMTP_PASSWORD,
        )
        print(f"Email sent successfully to {', '.join(to_emails)}")
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise

async def send_verification_email(email: str, name: str, verification_token: str):
    """Send email verification email"""
    verification_url = f"{FRONTEND_URL}/verify-email?token={verification_token}"
    
    html_template = Template("""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Email Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">Email Verification Required</h2>
            <p>Hello {{ name }},</p>
            <p>Thank you for registering with Questly! Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ verification_url }}" 
                   style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Verify Email Address
                </a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">{{ verification_url }}</p>
            <p>This verification link will expire in 24 hours.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
                If you didn't create an account with us, please ignore this email.
            </p>
        </div>
    </body>
    </html>
    """)
    
    text_template = Template("""
    Hello {{ name }},
    
    Thank you for registering with Questly! Please visit the following link to verify your email address:
    
    {{ verification_url }}
    
    This verification link will expire in 24 hours.
    
    If you didn't create an account with us, please ignore this email.
    """)
    
    html_content = html_template.render(
        name=name, 
        verification_url=verification_url
    )
    text_content = text_template.render(
        name=name, 
        verification_url=verification_url
    )
    
    await send_email(
        to_emails=[email],
        subject="Verify your email address - Questly",
        html_content=html_content,
        text_content=text_content
    )

async def send_password_reset_email(email: str, name: str, reset_token: str):
    """Send password reset email"""
    reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    
    html_template = Template("""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Password Reset</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            <p>Hello {{ name }},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ reset_url }}" 
                   style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">{{ reset_url }}</p>
            <p>This password reset link will expire in 1 hour.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
                If you didn't request a password reset, please ignore this email.
            </p>
        </div>
    </body>
    </html>
    """)
    
    text_template = Template("""
    Hello {{ name }},
    
    We received a request to reset your password. Please visit the following link to create a new password:
    
    {{ reset_url }}
    
    This password reset link will expire in 1 hour.
    
    If you didn't request a password reset, please ignore this email.
    """)
    
    html_content = html_template.render(
        name=name, 
        reset_url=reset_url
    )
    text_content = text_template.render(
        name=name, 
        reset_url=reset_url
    )
    
    await send_email(
        to_emails=[email],
        subject="Password Reset - Questly",
        html_content=html_content,
        text_content=text_content
    )