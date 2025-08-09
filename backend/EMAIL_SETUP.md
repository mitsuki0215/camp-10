# メール送信設定ガイド

## Gmail使用時の設定手順

### 1. Gmail App Password の作成

1. [Google Account Settings](https://myaccount.google.com/) にアクセス
2. 「セキュリティ」→「2段階認証プロセス」を有効化
3. 「アプリパスワード」を生成
   - アプリ: メール
   - デバイス: カスタム名（例：Questly Backend）
4. 生成された16文字のパスワードをメモ

### 2. 環境変数の設定

`.env`ファイルを以下のように更新：

```bash
# メール設定
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
FROM_EMAIL=your-email@gmail.com
```

### 3. テスト手順

1. バックエンドを再起動
2. フロントエンドでサインアップ
3. 指定したGmailアドレスに認証メールが送信される
4. メール内のリンクをクリックして認証完了

## その他のメールプロバイダー

### Outlook/Hotmail
```bash
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo Mail
```bash
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
```

### SendGrid（推奨：本番環境用）
```bash
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

## トラブルシューティング

### メールが送信されない場合
1. App Passwordが正しく設定されているか確認
2. ファイアウォールがSMTPポート（587）をブロックしていないか確認
3. Gmail以外の場合は、そのプロバイダーの「安全性の低いアプリへのアクセス」を許可

### メールが迷惑メールに分類される場合
1. SPFレコードの設定（DNS）
2. DKIMの設定
3. 信頼できるメールプロバイダー（SendGrid等）の使用を検討

## 開発モード

メール設定がない場合、コンソールにメール内容が出力されます：
- メール送信のテスト
- 認証トークンの確認
- メール内容の検証