import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  return (
    <div className="privacy-container">
      <Link to="/signin" className="back-button">
        ← ログインに戻る
      </Link>
      <div className="privacy-card">
        {/* ヘッダー */}
        <div className="privacy-header">
          <h1 className="privacy-title">プライバシーポリシー</h1>
        </div>

        {/* プライバシーポリシーの内容 */}
        <div className="privacy-content">
          <section className="privacy-section">
            <h2>1. 個人情報の定義</h2>
            <p>
              本プライバシーポリシーにおいて「個人情報」とは、個人情報保護法第2条第1項に定義される個人情報を指します。
              具体的には、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により
              特定の個人を識別することができるものをいいます。
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. 収集する個人情報</h2>
            <p>当サービスでは、以下の個人情報を収集する場合があります：</p>
            <ul>
              <li>Googleアカウントの基本情報（氏名、メールアドレス、プロフィール画像）</li>
              <li>学年・学校情報（任意で登録いただく情報）</li>
              <li>アンケートの回答内容</li>
              <li>サービス利用履歴・ログ情報</li>
              <li>その他、サービス提供に必要な情報</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>3. 個人情報の利用目的</h2>
            <p>収集した個人情報は、以下の目的で利用いたします：</p>
            <ul>
              <li>アカウントの作成・管理</li>
              <li>アンケートサービスの提供</li>
              <li>ユーザーサポート・お問い合わせ対応</li>
              <li>サービスの改善・新機能の開発</li>
              <li>利用状況の分析・統計データの作成</li>
              <li>重要なお知らせの配信</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>4. 個人情報の第三者提供</h2>
            <p>
              当サービスは、以下の場合を除き、個人情報を第三者に提供することはありません：
            </p>
            <ul>
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命、身体又は財産の保護のために必要がある場合</li>
              <li>公衆衛生の向上又は児童の健全な育成の推進のために特に必要がある場合</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>5. 個人情報の管理・保護</h2>
            <p>
              当サービスは、個人情報の正確性を保ち、これを安全に管理いたします。
              個人情報への不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、
              適切なセキュリティ対策を実施しています。
            </p>
          </section>

          <section className="privacy-section">
            <h2>6. Cookie（クッキー）について</h2>
            <p>
              当サービスでは、ユーザーの利便性向上のため、Cookieを使用する場合があります。
              Cookieとは、Webサイトがユーザーのコンピュータに送信する小さなデータファイルです。
              ブラウザの設定により、Cookieの使用を拒否することも可能です。
            </p>
          </section>

          <section className="privacy-section">
            <h2>7. 個人情報の開示・訂正・削除</h2>
            <p>
              ユーザーは、当サービスが保有する自己の個人情報について、開示・訂正・削除を求めることができます。
              これらのご要望については、適切な本人確認を行った上で、合理的な期間内に対応いたします。
            </p>
          </section>

          <section className="privacy-section">
            <h2>8. 個人情報の保存期間</h2>
            <p>
              個人情報は、利用目的の達成に必要な期間のみ保存いたします。
              アカウントを削除された場合、または法令で定められた保存期間が経過した場合、
              適切に削除いたします。
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. プライバシーポリシーの変更</h2>
            <p>
              当サービスは、必要に応じて本プライバシーポリシーを変更することがあります。
              変更後のプライバシーポリシーは、当サービス内で通知した時点で効力を生じるものとします。
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. お問い合わせ</h2>
            <p>
              本プライバシーポリシーに関するお問い合わせは、当サービス内のお問い合わせフォーム、
              またはメールにてご連絡ください。
            </p>
          </section>

          <div className="privacy-date">
            <p>制定日：2025年8月16日</p>
          </div>
        </div>

        {/* フッター */}
        <div className="privacy-footer">
          <Link to="/signin" className="return-button">
            ログインページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
