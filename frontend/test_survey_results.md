# アンケート管理機能 テスト手順

## 実装済み機能

### 1. バックエンドAPI
- **公開終了/開始**: `PATCH /api/surveys/{survey_id}/toggle-status`
- **削除**: `DELETE /api/surveys/{survey_id}`
- **結果取得**: `GET /api/surveys/{survey_id}/responses`
- **CSV出力**: `GET /api/surveys/{survey_id}/export-csv`

### 2. フロントエンド
- **Profile.js**: アンケート一覧に管理ボタンを追加
- **SurveyResults.js**: アンケート結果表示ページ
- **ルート追加**: `/survey-results/:surveyId`

## テスト手順

### 1. Profile.jsでの機能テスト
1. プロフィールページにアクセス
2. 作成したアンケート一覧で以下を確認：
   - **📊 結果を見る**: SurveyResultsページに遷移
   - **🚫 公開終了** / **▶️ 公開開始**: ステータス切り替え
   - **🗑️ 削除**: 確認ダイアログ後削除

### 2. SurveyResultsでの機能テスト
1. 結果ページで以下を確認：
   - アンケート基本情報表示
   - 回答データの統計表示
   - 選択肢質問: 棒グラフと割合表示
   - 自由記述質問: 回答一覧表示
   - **📊 CSV出力**: CSVファイルダウンロード

### 3. API呼び出しテスト
```javascript
// 開発者ツールのコンソールで実行可能

// ステータス切り替え
await surveyService.toggleSurveyStatus(1);

// 削除
await surveyService.deleteSurveyAPI(1);

// CSV出力
const csvData = await surveyService.exportSurveyCSV(1);
```

## 期待される動作

### Profile.js
- アンケート作成者のみが管理ボタンを表示
- 削除時に確認ダイアログ表示
- 操作後にアンケート一覧を再読み込み

### SurveyResults.js
- アンケート作成者のみがアクセス可能
- 回答データの可視化
- CSV出力でファイルダウンロード

### API
- 認証チェック（作成者のみ操作可能）
- データベース操作の正常性
- エラーハンドリング

## 注意事項
- Firebase認証が必要
- バックエンドサーバーが起動済みである必要
- CSVファイルは日本語対応（UTF-8 BOM付き）