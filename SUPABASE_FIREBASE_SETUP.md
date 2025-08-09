# Firebase Auth + Supabase 連携設定手順

## 概要

このプロジェクトでは、Firebase Authenticationでユーザー認証を行い、Supabaseでデータベースとしてユーザーデータやアンケート情報を保存する構成になっています。

## 設定手順

### 1. Supabaseプロジェクトの作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. 「New project」をクリック
3. Organization、Project名、Database password、Regionを設定
4. 「Create new project」をクリック

### 2. Supabaseの環境変数設定

作成したプロジェクトから以下の情報を取得し、`.env`ファイルを更新：

```bash
# Project Settings > API から取得
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. データベースのセットアップ

1. Supabase Dashboard の「SQL Editor」を開く
2. `backend/supabase_migration.sql` ファイルの内容をコピー
3. SQL Editorに貼り付けて実行

このSQLファイルには以下が含まれています：
- Firebase Auth連携用のusersテーブル
- アンケート関連テーブル（surveys, survey_responses）
- 認証ログテーブル
- Row Level Security (RLS) ポリシー
- ヘルパー関数

### 4. Firebase設定の確認

既存の Firebase 設定が正しく動作していることを確認：

```bash
# .envファイルのFirebase設定
REACT_APP_FIREBASE_API_KEY=AIzaSyDTA3nhXUT_kFkZchQx70uvNisER1_3dEc
REACT_APP_FIREBASE_AUTH_DOMAIN=questly-f6039.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=questly-f6039
```

### 5. Supabase RLS (Row Level Security) の設定

RLSポリシーが正しく設定されていることを確認：

```sql
-- ユーザーは自分のデータのみアクセス可能
-- アンケートは作成者のみ管理可能、他は閲覧のみ
-- 回答は認証ユーザーのみ作成可能
```

### 6. Firebase Auth JWTとSupabaseの連携

Supabaseは Firebase Auth の JWT を使用して認証を行います：

1. Supabase Dashboard の「Authentication」→「Settings」を開く
2. 「JWT Settings」で Firebase の公開鍵を設定（自動設定される場合が多い）

## データフロー

### ユーザー登録/ログイン時

1. **Firebase Auth**でGoogleログイン実行
2. **AuthContext**でFirebase認証状態を監視
3. ログイン成功時、**userService.syncUserWithSupabase()**を呼び出し
4. **Supabase**にユーザーデータを作成/更新
5. 認証ログを記録

### アンケート操作時

1. **Firebase Auth**のJWTトークンを取得
2. **Supabase**のRLSポリシーでアクセス権限をチェック
3. **surveyService**経由でSupabaseのCRUD操作実行

## 主要なファイル構成

```
frontend/
├── .env                          # 環境変数設定
├── src/
│   ├── supabase/
│   │   └── config.js            # Supabaseクライアント設定
│   ├── services/
│   │   ├── userService.js       # ユーザー関連サービス
│   │   └── surveyService.js     # アンケート関連サービス
│   ├── contexts/
│   │   └── AuthContext.js       # Firebase+Supabase認証管理
│   └── firebase/
│       ├── config.js            # Firebase設定
│       └── auth.js              # Firebase認証関数

backend/
└── supabase_migration.sql       # Supabaseデータベース設定
```

## データベーステーブル構成

### users テーブル
- `firebase_uid`: Firebase AuthのUID（ユニーク）
- `email`: メールアドレス
- `name`: 表示名
- `avatar_url`: プロフィール画像URL（Googleから取得）
- `provider`: 認証プロバイダー（google, email）
- `rank`, `experience`, `points`: ゲーミフィケーション要素

### surveys テーブル
- `title`, `description`: アンケート基本情報
- `questions`: 質問データ（JSONB）
- `creator_id`: 作成者のID（usersテーブル参照）
- `response_count`: 回答数

### survey_responses テーブル
- `survey_id`: アンケートID
- `user_id`: 回答者ID（匿名の場合はNULL）
- `responses`: 回答データ（JSONB）

## セキュリティ

- **RLS（Row Level Security）**により、適切なアクセス制御を実装
- Firebase JWTによる認証状態の検証
- SQLインジェクション対策
- CORS設定

## トラブルシューティング

### よくある問題

1. **Supabase接続エラー**
   - 環境変数の設定を確認
   - プロジェクトURLとAPI Keyが正しいか確認

2. **RLS権限エラー**
   - Firebase認証が正しく動作しているか確認
   - JWTトークンがSupabaseに正しく渡されているか確認

3. **データ同期エラー**
   - `upsert_user_from_firebase`関数が正しく実行されているか確認
   - ブラウザのコンソールでエラーログを確認

### デバッグ方法

```javascript
// ブラウザのコンソールで実行
console.log('Firebase User:', auth.currentUser);
console.log('Supabase User:', supabaseUser);

// Supabaseの接続テスト
supabase.from('users').select('count', { count: 'exact', head: true })
  .then(result => console.log('Supabase接続OK:', result));
```

## 本番環境への展開

1. 環境変数を本番用に更新
2. Firebase Authの承認済みドメインに本番ドメインを追加
3. Supabaseのプロジェクト設定を本番用に調整
4. CORS設定の確認

これで Firebase Auth + Supabase の連携設定は完了です！