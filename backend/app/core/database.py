from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings
import logging

logger = logging.getLogger(__name__)

# ベースクラス
Base = declarative_base()

# グローバル変数
engine = None
SessionLocal = None

def init_database():
    """データベースを初期化"""
    global engine, SessionLocal
    
    try:
        # データベースエンジンとセッションの作成
        engine = create_engine(settings.database_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        logger.info("データベース接続が確立されました")
        return True
    except Exception as e:
        logger.error(f"データベース接続に失敗しました: {e}")
        return False

def get_db():
    """データベースセッションの依存性注入"""
    if SessionLocal is None:
        raise RuntimeError("データベースが初期化されていません")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """データベーステーブルを作成"""
    if engine is None:
        logger.warning("データベースエンジンが利用できません。テーブル作成をスキップします")
        return False
    
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("データベーステーブルが作成されました")
        return True
    except Exception as e:
        logger.error(f"テーブル作成に失敗しました: {e}")
        return False