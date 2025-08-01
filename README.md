# camp-10
学生向けのアンケートサービス

## 使用技術スタック

### フロントエンド (React)
* **フレームワーク:** React
* **言語:** JavaScript
* **パッケージ管理:** npm

### バックエンド (FastAPI)
* **フレームワーク:** FastAPI
* **言語:** Python
* **データベース:** SQLite, Supabase
* **Webサーバー:** Uvicorn

### デプロイ

- **フロントエンド**: Vercel
- **バックエンド**: Render
- **データベース**: Supabase


## 開発環境構築ガイド

1. リポジトリをクローン
```bash
git clone https://github.com/mitsuki0215/camp-10.git
cd camp-10
code .
```

2. フロントエンド環境のセットアップ（React）
クローンしたリポジトリのルートディレクトリに移動して、以下のコマンドを実行する
```bash
cd frontend
npm install
npm start
```

ブラウザで http://localhost:3000 にアクセスし、Reactアプリが動作していることを確認する

`control + C`で止めることができ、

再度動かしたい時は、`cd frontend`をしたことを確認して、`npm start`をターミナルに打ち、Enterを押す

3. バックエンド環境のセットアップ（FastAPI）

vscodeで新しいターミナルを開き、バックエンドディレクトリに移動して、以下のコマンドを実行する
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 必要なPythonパッケージをインソール(backendディレクトリのまま以下のコマンドを実行する)
pip install -r requirements.txt

# FastAPI開発サーバーの起動
uvicorn main:app --reload
```

ブラウザで http://localhost:8000/docs にアクセスし、FastAPIのSwagger UIが表示されることを確認する

`control + C`で止めることができ、

再度動かしたい時は、`cd backend`をしたことを確認して、`uvicorn main:app --reload`をターミナルに打ち、Enterを押す


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

### 動作確認
- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:8000/docs


