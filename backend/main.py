from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, database  # 相対インポートを絶対インポートに変更
import os
from dotenv import load_dotenv
import uvicorn

load_dotenv() # .envファイルから環境変数を読み込む

app = FastAPI()


# Hello Worldエンドポイント
@app.get("/")
async def read_root():
    return {"message": "Hello, FastAPI! (PostgreSQL configured)"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "main:app",  # ファイル名:アプリ名
        host="0.0.0.0",  # 重要：0.0.0.0でバインド
        port=port,
        reload=False  # 本番環境ではFalse
    )

# 簡易的なデータ追加・取得の例
# models.py と schemas.py を別途作成する必要あり
# 例として、コメントアウトしておく
"""
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users
"""