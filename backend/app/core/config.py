import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """アプリケーション設定"""
    
    # アプリケーション設定
    APP_NAME: str = "Questly API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "アンケート作成・管理API"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # データベース設定
    DATABASE_URL_LOCAL: Optional[str] = os.getenv("DATABASE_URL_LOCAL")
    DATABASE_URL_SUPABASE: Optional[str] = os.getenv("DATABASE_URL_SUPABASE")
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY")
    DEVELOPMENT: bool = os.getenv("DEVELOPMENT", "False").lower() == "true"
    
    @property
    def database_url(self) -> str:
        """環境に応じてデータベースURLを返す"""
        if self.DEVELOPMENT:
            url = self.DATABASE_URL_LOCAL
        else:
            # Render本番環境用：Supabaseの環境変数から直接構築
            if self.SUPABASE_URL and not self.DATABASE_URL_SUPABASE:
                # SUPABASEのURLからPostgreSQLの接続URLを構築
                supabase_host = self.SUPABASE_URL.replace('https://', '').replace('http://', '')
                project_id = supabase_host.split('.')[0]
                # Supabase Postgresの標準接続URL形式
                url = f"postgresql://postgres:[YOUR_PASSWORD]@db.{project_id}.supabase.co:5432/postgres"
            else:
                url = self.DATABASE_URL_SUPABASE
            
        if not url:
            # 開発用のデフォルトSQLiteデータベース
            if self.DEVELOPMENT or self.DEBUG:
                return "sqlite:///./test.db"
            raise ValueError("DATABASE_URL が設定されていません")
        return url
    
    # JWT設定
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # メール設定
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: Optional[str] = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    FROM_EMAIL: Optional[str] = os.getenv("FROM_EMAIL")
    
    @property
    def from_email(self) -> str:
        """送信者メールアドレスを返す"""
        return self.FROM_EMAIL or self.SMTP_USERNAME or ""
    
    # フロントエンド設定
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # CORS設定（動的に生成）
    @property
    def allowed_origins(self) -> list:
        """許可するオリジンのリストを返す"""
        origins = [
            "http://localhost:3000",
            "https://localhost:3000",
            self.FRONTEND_URL
        ]
        
        # 本番環境では"*"を避ける
        if self.DEBUG or self.DEVELOPMENT:
            origins.append("*")
        
        return list(set(origins))  # 重複を除去
    
    # サーバー設定
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("PORT", "8000"))

# グローバル設定インスタンス
settings = Settings()