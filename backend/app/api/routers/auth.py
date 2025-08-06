from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.models import User, EmailVerification, PasswordReset
from app.models.schemas import (
    UserCreate, UserLogin, Token, Message,
    EmailVerificationCreate, EmailVerificationVerify,
    PasswordResetRequest, PasswordResetConfirm
)
from app.core.database import get_db
from app.services.auth_service import auth_service
from app.services.email_service import email_service

router = APIRouter(prefix="/auth", tags=["認証"])

@router.post("/register", response_model=Message, summary="ユーザー登録")
async def register(
    user: UserCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    新規ユーザーを登録します
    
    - **email**: メールアドレス
    - **name**: 氏名
    - **grade**: 学年（任意）
    - **password**: パスワード
    """
    # 既存ユーザーのチェック
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        if db_user.is_verified:
            raise HTTPException(
                status_code=400,
                detail="このメールアドレスは既に登録済みです"
            )
        else:
            # 未認証のユーザーは削除して新しく作成
            db.delete(db_user)
            # 関連する認証記録も削除
            db.query(EmailVerification).filter(EmailVerification.user_id == db_user.id).delete()
            db.commit()
    
    # 新規ユーザーの作成
    hashed_password = auth_service.get_password_hash(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        grade=user.grade,
        hashed_password=hashed_password,
        is_active=True,
        is_verified=False
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # メール認証トークンの作成
    verification_token = auth_service.generate_verification_token()
    expires_at = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=24)
    
    db_verification = EmailVerification(
        user_id=db_user.id,
        token=verification_token,
        expires_at=expires_at
    )
    
    db.add(db_verification)
    db.commit()
    
    # 認証メールの送信
    background_tasks.add_task(
        email_service.send_verification_email,
        user.email,
        user.name,
        verification_token
    )
    
    return {"message": "ユーザー登録が完了しました。メールで認証リンクを送信しましたのでご確認ください。"}

@router.post("/login", response_model=Token, summary="ログイン")
async def login(
    user_credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    ユーザーログイン
    
    - **email**: メールアドレス
    - **password**: パスワード
    """
    user = auth_service.authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが間違っています",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="アカウントが無効化されています",
        )
    
    # トークンの作成
    access_token = auth_service.create_access_token(data={"sub": user.email})
    refresh_token = auth_service.create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token, summary="トークンリフレッシュ")
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    アクセストークンをリフレッシュします
    
    - **refresh_token**: リフレッシュトークン
    """
    token_data = auth_service.verify_token(refresh_token, token_type="refresh")
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="無効なリフレッシュトークンです",
        )
    
    user = db.query(User).filter(User.email == token_data.username).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザーが見つからないか無効です",
        )
    
    # 新しいトークンの作成
    new_access_token = auth_service.create_access_token(data={"sub": user.email})
    new_refresh_token = auth_service.create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.get("/verify-email", summary="メールアドレス認証（URL経由）")
async def verify_email_via_url(
    token: str,
    db: Session = Depends(get_db)
):
    """
    メールのURLからアクセスして認証を行います
    
    - **token**: 認証トークン（URLパラメータ）
    """
    db_verification = db.query(EmailVerification).filter(
        EmailVerification.token == token,
        EmailVerification.is_used == False
    ).first()
    
    if not db_verification:
        return {
            "success": False,
            "message": "無効な認証トークンです"
        }
    
    if db_verification.expires_at < datetime.now(timezone.utc).replace(tzinfo=None):
        return {
            "success": False,
            "message": "認証トークンの有効期限が切れています"
        }
    
    # ユーザーの認証状態を更新
    user = db.query(User).filter(User.id == db_verification.user_id).first()
    user.is_verified = True
    
    # 認証トークンを使用済みにする
    db_verification.is_used = True
    
    db.commit()
    
    # アクセストークンも発行してログイン状態にする
    access_token = auth_service.create_access_token(data={"sub": user.email})
    refresh_token = auth_service.create_refresh_token(data={"sub": user.email})
    
    return {
        "success": True,
        "message": "メールアドレスの認証が完了しました！自動的にログインします。",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "grade": user.grade
        }
    }

@router.post("/verify-email", response_model=Message, summary="メールアドレス認証（トークン入力）")
async def verify_email_via_token(
    verification: EmailVerificationVerify,
    db: Session = Depends(get_db)
):
    """
    トークンを入力して認証を行います（バックアップ用）
    
    - **token**: 認証トークン
    """
    db_verification = db.query(EmailVerification).filter(
        EmailVerification.token == verification.token,
        EmailVerification.is_used == False
    ).first()
    
    if not db_verification:
        raise HTTPException(
            status_code=400,
            detail="無効な認証トークンです"
        )
    
    if db_verification.expires_at < datetime.now(timezone.utc).replace(tzinfo=None):
        raise HTTPException(
            status_code=400,
            detail="認証トークンの有効期限が切れています"
        )
    
    # ユーザーの認証状態を更新
    user = db.query(User).filter(User.id == db_verification.user_id).first()
    user.is_verified = True
    
    # 認証トークンを使用済みにする
    db_verification.is_used = True
    
    db.commit()
    
    return {"message": "メールアドレスの認証が完了しました"}

@router.post("/resend-verification", response_model=Message, summary="認証メール再送")
async def resend_verification(
    email_request: EmailVerificationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    認証メールを再送します
    
    - **email**: メールアドレス
    """
    user = db.query(User).filter(User.email == email_request.email).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="ユーザーが見つかりません"
        )
    
    if user.is_verified:
        raise HTTPException(
            status_code=400,
            detail="メールアドレスは既に認証済みです"
        )
    
    # 新しい認証トークンの作成
    verification_token = auth_service.generate_verification_token()
    expires_at = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=24)
    
    db_verification = EmailVerification(
        user_id=user.id,
        token=verification_token,
        expires_at=expires_at
    )
    
    db.add(db_verification)
    db.commit()
    
    # 認証メールの送信
    background_tasks.add_task(
        email_service.send_verification_email,
        user.email,
        user.name,
        verification_token
    )
    
    return {"message": "認証メールを再送しました"}

@router.post("/forgot-password", response_model=Message, summary="パスワードリセット申請")
async def forgot_password(
    password_request: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    パスワードリセットを申請します
    
    - **email**: メールアドレス
    """
    user = db.query(User).filter(User.email == password_request.email).first()
    if not user:
        # セキュリティのためにユーザーの存在を明かさない
        return {"message": "該当するアカウントが存在する場合、リセットリンクを送信しました。"}
    
    # パスワードリセットトークンの作成
    reset_token = auth_service.generate_password_reset_token()
    expires_at = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=1)
    
    db_reset = PasswordReset(
        user_id=user.id,
        token=reset_token,
        expires_at=expires_at
    )
    
    db.add(db_reset)
    db.commit()
    
    # リセットメールの送信
    background_tasks.add_task(
        email_service.send_password_reset_email,
        user.email,
        user.name,
        reset_token
    )
    
    return {"message": "該当するアカウントが存在する場合、リセットリンクを送信しました。"}

@router.post("/reset-password", response_model=Message, summary="パスワードリセット実行")
async def reset_password(
    password_reset: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    パスワードをリセットします
    
    - **token**: リセットトークン
    - **new_password**: 新しいパスワード
    """
    db_reset = db.query(PasswordReset).filter(
        PasswordReset.token == password_reset.token,
        PasswordReset.is_used == False
    ).first()
    
    if not db_reset:
        raise HTTPException(
            status_code=400,
            detail="無効なリセットトークンです"
        )
    
    if db_reset.expires_at < datetime.now(timezone.utc).replace(tzinfo=None):
        raise HTTPException(
            status_code=400,
            detail="リセットトークンの有効期限が切れています"
        )
    
    # ユーザーのパスワードを更新
    user = db.query(User).filter(User.id == db_reset.user_id).first()
    user.hashed_password = auth_service.get_password_hash(password_reset.new_password)
    
    # リセットトークンを使用済みにする
    db_reset.is_used = True
    
    db.commit()
    
    return {"message": "パスワードが正常にリセットされました"}

@router.get("/me", summary="現在のユーザー情報")
async def get_current_user_info(current_user: User = Depends(auth_service.get_current_user)):
    """現在ログイン中のユーザー情報を取得します"""
    return current_user