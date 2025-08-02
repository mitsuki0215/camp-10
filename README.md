#  - 学生向けアンケートサービス

## 🚀 プロジェクト概要
学生向けの匿名・非匿名アンケートサービス。アンケート作成・回答機能、ポイント・ランクシステム、AIを活用した回答評価などを実装予定。

## 🛠 技術スタック

**Frontend:** React + JavaScript  
**Backend:** FastAPI + Python  
**Database:** PostgreSQL (ローカル) / Supabase (本番)  
**Deploy:** Vercel (Frontend) / Render (Backend)

## クイックスタート

### 1. リポジトリをクローン
```bash
git clone https://github.com/mitsuki0215/camp-10.git
cd camp-10
code .
```
### 2. フロントエンド環境のセットアップ（React）

クローンしたリポジトリのルートディレクトリに移動して、以下のコマンドを実行する

```bash
cd frontend
npm install
npm start
```

ブラウザで `http://localhost:3000`にアクセスし、Reactアプリが動作していることを確認する

`control + C`で止めることができ、

再度動かしたい時は、`cd frontend`をしたことを確認して、`npm start`をターミナルに打ち、Enterを押す

### 3. バックエンド環境のセットアップ（FastAPI）

vscodeで新しいターミナルを開き、バックエンドディレクトリに移動して、以下のコマンドを実行する

```bash
cd backend
python -m venv venv

# 仮想環境の有効化

# Windows:
.\venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# FastAPI開発サーバーの起動

DEVELOPMENT=True uvicorn main:app --reload
```

→ http://localhost:8000/docs でAPI確認

### 4. supabaseの環境変数設定
- `backend/`直下に`.env`ファイルを作成して、LINEに貼り付けたコードをコピーアンドペーストする

## 実行

### 開発環境での起動

**フロントエンド（ターミナル1）**

```bash
cd frontend
npm start
```
→ http://localhost:3000 でアクセス可能

**バックエンド（ターミナル2）**

```bash
cd backend
uvicorn main:app --reload
```
→ http://localhost:8000 でAPIサーバー起動

## 📝 開発フロー

1. `dev` ブランチから新機能ブランチを作成
2. 機能実装
3. プルリクエスト作成
4. マージ

---
**開発チーム:** チームもふもふ


