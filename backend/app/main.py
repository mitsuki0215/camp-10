from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.core.database import init_database, create_tables
from app.api.routers import auth, surveys, users

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# データベース初期化
db_connected = init_database()
if db_connected:
    create_tables()
else:
    logger.warning("データベース接続に失敗しましたが、サーバーを起動します。データベース機能は利用できません。")

# FastAPIアプリケーションの初期化
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの登録
app.include_router(auth.router)
app.include_router(surveys.router)
app.include_router(users.router)

# ヘルスチェックエンドポイント
@app.get("/", tags=["ヘルスチェック"], summary="ルートエンドポイント")
async def read_root():
    """APIの基本情報を返します"""
    return {
        "message": "Questly API is running!",
        "version": settings.APP_VERSION,
        "status": "healthy"
    }

@app.get("/health", tags=["ヘルスチェック"], summary="ヘルスチェック")
async def health_check():
    """APIの健全性をチェックします"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }