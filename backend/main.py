from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, database  # 相対インポートを絶対インポートに変更
import os
from dotenv import load_dotenv

load_dotenv() # .envファイルから環境変数を読み込む

app = FastAPI()


# Hello Worldエンドポイント
@app.get("/")
async def read_root():
    return {"message": "Hello, FastAPI! (PostgreSQL configured)"}

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