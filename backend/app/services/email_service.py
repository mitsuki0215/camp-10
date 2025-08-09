import aiosmtplib
from email.message import EmailMessage
from jinja2 import Template
from typing import List

from app.core.config import settings

class EmailService:
    """メールサービス"""
    
    async def send_email(
        self,
        to_emails: List[str],
        subject: str,
        html_content: str,
        text_content: str = None
    ):
        """メールを送信"""
        # 開発環境ではコンソールにメール内容を出力
        if settings.DEBUG or settings.DEVELOPMENT:
            print("\n" + "="*50)
            print(f"📧 メール送信（開発モード）")
            print(f"宛先: {', '.join(to_emails)}")
            print(f"件名: {subject}")
            print("-" * 30)
            print(text_content or "テキスト版なし")
            print("-" * 30)
            print("HTMLバージョン:")
            print(html_content)
            print("="*50 + "\n")
            return
            
        if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
            print("Warning: メール認証情報が設定されていません。メールが送信されませんでした。")
            print(f"メール内容（デバッグ用）:")
            print(f"宛先: {', '.join(to_emails)}")
            print(f"件名: {subject}")
            print(f"内容: {text_content or html_content}")
            return
        
        message = EmailMessage()
        message["From"] = settings.from_email
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
                hostname=settings.SMTP_SERVER,
                port=settings.SMTP_PORT,
                start_tls=True,
                username=settings.SMTP_USERNAME,
                password=settings.SMTP_PASSWORD,
            )
            print(f"メール送信成功: {', '.join(to_emails)}")
        except Exception as e:
            print(f"メール送信失敗: {e}")
            raise
    
    async def send_verification_email(self, email: str, name: str, verification_token: str):
        """メール認証メールを送信"""
        # バックエンドのAPIエンドポイントへのリンク（自動認証とログイン）
        verification_url = f"http://localhost:8000/auth/verify-email?token={verification_token}"
        # フロントエンドの認証確認ページ（バックアップ）
        frontend_verify_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        
        html_template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>メールアドレス認証</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333; margin-bottom: 20px;">メールアドレスの認証が必要です</h2>
                <p>{{ name }}様</p>
                <p>Questlyへのご登録ありがとうございます！下のボタンをクリックしてメールアドレスを認証してください：</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{ verification_url }}" 
                       style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        アカウントを作成してログイン
                    </a>
                </div>
                <p>ボタンが機能しない場合は、以下のリンクをコピーしてブラウザに貼り付けてください：</p>
                <p style="word-break: break-all; color: #666;">{{ verification_url }}</p>
                <p>このリンクをクリックすると、アカウントが作成され、自動的にログインされます。</p>
                <p style="color: #888; font-size: 14px;">
                    ※ 認証がうまくいかない場合は、<a href="{{ frontend_verify_url }}">こちらのページ</a>でトークンを入力してください。
                </p>
                <p>この認証リンクは24時間で有効期限が切れます。</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                    このメールに心当たりがない場合は、このメールを無視してください。
                </p>
            </div>
        </body>
        </html>
        """)
        
        text_template = Template("""
        {{ name }}様
        
        Questlyへのご登録ありがとうございます！以下のリンクをクリックしてアカウントを作成・ログインしてください：
        
        {{ verification_url }}
        
        このリンクをクリックすると、アカウントが作成され、自動的にログインされます。
        
        認証がうまくいかない場合は、フロントエンドページでトークンを入力してください：
        {{ frontend_verify_url }}
        
        この認証リンクは24時間で有効期限が切れます。
        
        このメールに心当たりがない場合は、このメールを無視してください。
        """)
        
        html_content = html_template.render(
            name=name, 
            verification_url=verification_url,
            frontend_verify_url=frontend_verify_url
        )
        text_content = text_template.render(
            name=name, 
            verification_url=verification_url,
            frontend_verify_url=frontend_verify_url
        )
        
        await self.send_email(
            to_emails=[email],
            subject="メールアドレス認証 - Questly",
            html_content=html_content,
            text_content=text_content
        )
    
    async def send_password_reset_email(self, email: str, name: str, reset_token: str):
        """パスワードリセットメールを送信"""
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        
        html_template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>パスワードリセット</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333; margin-bottom: 20px;">パスワードリセットのご依頼</h2>
                <p>{{ name }}様</p>
                <p>パスワードリセットのご依頼を受け付けました。下のボタンをクリックして新しいパスワードを設定してください：</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{ reset_url }}" 
                       style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        パスワードをリセット
                    </a>
                </div>
                <p>ボタンが機能しない場合は、以下のリンクをコピーしてブラウザに貼り付けてください：</p>
                <p style="word-break: break-all; color: #666;">{{ reset_url }}</p>
                <p>このリセットリンクは1時間で有効期限が切れます。</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                    パスワードリセットをご依頼されていない場合は、このメールを無視してください。
                </p>
            </div>
        </body>
        </html>
        """)
        
        text_template = Template("""
        {{ name }}様
        
        パスワードリセットのご依頼を受け付けました。以下のリンクをクリックして新しいパスワードを設定してください：
        
        {{ reset_url }}
        
        このリセットリンクは1時間で有効期限が切れます。
        
        パスワードリセットをご依頼されていない場合は、このメールを無視してください。
        """)
        
        html_content = html_template.render(
            name=name, 
            reset_url=reset_url
        )
        text_content = text_template.render(
            name=name, 
            reset_url=reset_url
        )
        
        await self.send_email(
            to_emails=[email],
            subject="パスワードリセット - Questly",
            html_content=html_content,
            text_content=text_content
        )

# グローバルメールサービスインスタンス
email_service = EmailService()