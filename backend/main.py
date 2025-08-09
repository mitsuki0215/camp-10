import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_database, create_tables
from routers import surveys, users

# ------------------------------------------------------------
# ログ設定
# ------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ------------------------------------------------------------
# データベース初期化
# ------------------------------------------------------------
if init_database():
    create_tables()
else:
    logger.warning(
        "データベース接続に失敗しましたが、サーバーを起動します。"
        "データベース機能は利用できません。"
    )

# ------------------------------------------------------------
# FastAPIアプリケーション初期化
# ------------------------------------------------------------
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# ------------------------------------------------------------
# CORS設定
# ------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------
# ルーター登録
# ------------------------------------------------------------
app.include_router(surveys.router)
app.include_router(users.router)
