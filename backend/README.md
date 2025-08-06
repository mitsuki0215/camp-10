# Questly API ドキュメント

## 概要
JWT認証、メール認証、ユーザー管理機能を備えた包括的なアンケート作成・管理APIです。

## ベースURL
- 本番環境: `https://camp-10.onrender.com`
- 開発環境: `http://localhost:8000`

## 主な機能
- 🔐 リフレッシュトークン付きJWT認証
- 📧 メール認証とパスワードリセット
- 📝 アンケート作成・管理
- 📊 ゲーミフィケーション機能付きユーザープロフィール（ランク、経験値、ポイント）
- 📈 アンケート回答収集・分析

## ディレクトリ構成
```
backend/
├── app/
│   ├── api/
│   │   └── routers/          # APIルーター
│   │       ├── auth.py       # 認証関連
│   │       ├── surveys.py    # アンケート関連
│   │       └── users.py      # ユーザー関連
│   ├── core/                 # アプリケーションコア
│   │   ├── config.py         # 設定管理
│   │   └── database.py       # データベース設定
│   ├── models/               # データモデル
│   │   ├── schemas.py        # Pydanticスキーマ
│   │   ├── user_models.py    # ユーザーモデル
│   │   └── survey_models.py  # アンケートモデル
│   ├── services/             # ビジネスロジック
│   │   ├── auth_service.py   # 認証サービス
│   │   ├── email_service.py  # メールサービス
│   │   ├── survey_service.py # アンケートサービス
│   │   └── user_service.py   # ユーザーサービス
│   ├── utils/                # ユーティリティ
│   │   └── dependencies.py   # 依存性注入
│   └── main.py               # アプリケーションエントリポイント
├── main.py                   # サーバー起動スクリプト
├── requirements.txt          # 依存関係
└── README.md                 # このファイル
```

## 認証

### ユーザー登録
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "田中太郎",
  "grade": "B3",
  "password": "securepassword"
}
```

### ログイン
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

レスポンス:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

### メール認証
```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_here"
}
```

### パスワードリセット
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "new_password": "newpassword123"
}
```

## アンケート

### アンケート一覧取得
```http
GET /api/surveys?skip=0&limit=100
```

### アンケート詳細取得
```http
GET /api/surveys/{survey_id}
```

### アンケート作成
```http
POST /api/surveys
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "大学生活に関するアンケート",
  "description": "大学生活の満足度について",
  "questions": [
    {
      "text": "大学生活に満足していますか？",
      "type": "radio",
      "options": ["とても満足", "満足", "普通", "不満", "とても不満"],
      "required": true
    },
    {
      "text": "改善点があれば教えてください",
      "type": "paragraph",
      "options": [],
      "required": false
    }
  ]
}
```

### アンケート回答
```http
POST /api/surveys/{survey_id}/responses
Content-Type: application/json

{
  "responses": {
    "question_1": "満足",
    "question_2": "特にありません"
  }
}
```

### アンケート回答一覧取得（作成者のみ）
```http
GET /api/surveys/{survey_id}/responses
Authorization: Bearer {access_token}
```

## ユーザープロフィール

### プロフィール取得
```http
GET /api/user/profile
Authorization: Bearer {access_token}
```

### プロフィール更新
```http
PUT /api/user/profile
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "田中花子",
  "grade": "B4"
}
```

### 作成したアンケート一覧
```http
GET /api/user/surveys
Authorization: Bearer {access_token}
```

### ユーザー統計情報
```http
GET /api/user/stats
Authorization: Bearer {access_token}
```

レスポンス:
```json
{
  "created_surveys": 5,
  "active_surveys": 3,
  "total_responses_received": 45,
  "responses_given": 12,
  "rank": "Silver",
  "experience": 1250,
  "experience_to_next": 1500,
  "points": 340
}
```

## 質問タイプ
- `short`: 短文回答
- `paragraph`: 長文回答
- `radio`: 単一選択（ラジオボタン）
- `checkbox`: 複数選択（チェックボックス）

## ゲーミフィケーションシステム
- **ポイント**: アンケート作成（10ポイント）・回答（5ポイント）で獲得
- **経験値**: 活動により獲得（作成50XP・回答20XP）
- **ランク**: Bronze → Silver → Gold → Platinum

## エラーハンドリング
全てのエンドポイントは適切なHTTPステータスコードを返します：
- `200`: 成功
- `201`: 作成完了
- `400`: リクエストエラー
- `401`: 認証エラー
- `403`: 権限エラー
- `404`: 見つからない
- `422`: バリデーションエラー

エラーレスポンス形式:
```json
{
  "detail": "エラーメッセージ"
}
```

## 環境変数
```bash
# データベース
DATABASE_URL_SUPABASE=postgresql://user:pass@host:port/db
DATABASE_URL_LOCAL=postgresql://user:pass@localhost:5432/db
DEVELOPMENT=False

# JWT認証
SECRET_KEY=your-secret-key-here

# メール設定（任意 - メール認証用）
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com

# フロントエンド設定
FRONTEND_URL=https://your-frontend-domain.com

# デバッグ設定
DEBUG=False

# サーバー設定
HOST=0.0.0.0
PORT=8000
```

## 起動方法

### 開発環境
```bash
# 依存関係のインストール
pip install -r requirements.txt

# 環境変数の設定（.envファイルを作成）
cp .env.example .env

# サーバー起動
python main.py
```

### 本番環境
```bash
# Gunicornでの起動
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

## 推奨セキュリティ設定

本番環境では以下のレート制限の実装を推奨：
- ユーザー登録: IPあたり1時間に5回
- ログイン: IPあたり1分間に10回
- パスワードリセット: メールあたり1時間に3回

## API仕様書
サーバー起動後、以下のURLでSwagger UIにアクセス可能：
- 開発環境: `http://localhost:8000/docs`
- 本番環境: ドキュメントは無効化されています（セキュリティのため）