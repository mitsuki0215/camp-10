# Firebase 設定手順

## 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力し、設定を完了

## 2. Authentication の設定

1. Firebase Console で作成したプロジェクトを選択
2. 左側メニューから「Authentication」をクリック
3. 「始める」をクリック
4. 「Sign-in method」タブを選択
5. 以下のプロバイダーを有効にする：
   - **Email/Password**: 有効にする
   - **Google**: 有効にして、プロジェクトサポートメールを設定

## 3. Web アプリの追加

1. プロジェクト概要ページで「</> (Web)」アイコンをクリック
2. アプリ名を入力
3. Firebase Hosting は必要に応じて設定（今回は不要）
4. 設定オブジェクトをコピー

## 4. 設定ファイルの更新

`src/firebase/config.js` ファイルの firebaseConfig オブジェクトを、コピーした設定に置き換えてください：

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 5. Google認証の設定

Google認証を使用する場合：
1. [Google Cloud Console](https://console.cloud.google.com/)で同じプロジェクトを選択
2. 「APIとサービス」→「認証情報」を開く
3. OAuth 2.0 クライアント ID の設定を確認
4. 承認済みのJavaScriptオリジンに `http://localhost:3000` を追加（開発環境用）

## 6. セキュリティルールの設定

Firebase Console の「Authentication」→「Settings」で：
- 承認されたドメインに本番環境のドメインを追加
- 必要に応じてセキュリティルールを調整

## 機能

- Googleアカウントによるワンクリックログイン
- メール/パスワードでの従来の認証
- メール認証
- 自動ログアウト
- 認証状態の自動管理

## 注意事項

- Firebase設定情報は機密情報です。本番環境では環境変数を使用してください
- Googleログインを使用する場合は、適切なドメインを承認済みドメインに追加してください