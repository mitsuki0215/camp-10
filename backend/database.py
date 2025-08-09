import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# .envファイルから環境変数を読み込む
load_dotenv()

# 環境に応じてデータベースURLを選択
# 開発中はローカルのPostgreSQL、デプロイ時はSupabaseを使用
# 環境変数 DEVELOPMENT=True が設定されている場合 (例: uvicornの起動時に DEVELOPMENT=True uvicorn main:app)
# あるいは .env ファイルに DEVELOPMENT=True がある場合

DATABASE_URL = os.getenv("DATABASE_URL_SUPABASE")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL_LOCAL or DATABASE_URL_SUPABASE is not set in .env or environment variables.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()