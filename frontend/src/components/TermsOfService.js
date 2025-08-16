import React from 'react';
import { Link } from 'react-router-dom';
import './TermsOfService.css';

export default function TermsOfService() {
  return (
    <div className="terms-container">
      <Link to="/signin" className="back-button">
        ← ログインに戻る
      </Link>
      <div className="terms-card">
        {/* ヘッダー */}
        <div className="terms-header">
          <h1 className="terms-title">利用規約</h1>
        </div>

        {/* 利用規約の内容 */}
        <div className="terms-content">
          <section className="terms-section">
            <h2>第1条（適用）</h2>
            <p>
              本規約は、Questly（以下「当サービス」といいます）を利用するすべてのユーザー（以下「利用者」といいます）に適用されます。
              利用者は、当サービスを利用することにより、本規約に同意したものとみなします。
            </p>
          </section>

          <section className="terms-section">
            <h2>第2条（利用登録）</h2>
            <p>
              利用者は、Googleアカウントを使用して当サービスに登録することができます。
              登録時に提供される情報は、正確かつ最新のものである必要があります。
            </p>
          </section>

          <section className="terms-section">
            <h2>第3条（禁止事項）</h2>
            <p>利用者は、当サービスの利用にあたり、以下の行為を行ってはなりません：</p>
            <ul>
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>他の利用者、第三者、または当サービスの権利を侵害する行為</li>
              <li>虚偽の情報を登録する行為</li>
              <li>当サービスの運営を妨害する行為</li>
              <li>その他、当サービスが不適切と判断する行為</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>第4条（アンケートの利用）</h2>
            <p>
              利用者は、当サービスを通じてアンケートの作成、回答、結果の閲覧を行うことができます。
              アンケートの内容については、利用者が責任を負うものとします。
            </p>
          </section>

          <section className="terms-section">
            <h2>第5条（個人情報の取扱い）</h2>
            <p>
              当サービスは、利用者の個人情報を適切に取り扱います。
              詳細については、別途定める<Link to="/privacy" className="link">プライバシーポリシー</Link>をご確認ください。
            </p>
          </section>

          <section className="terms-section">
            <h2>第6条（免責事項）</h2>
            <p>
              当サービスは、利用者による当サービスの利用によって生じた損害について、一切の責任を負わないものとします。
              また、当サービスの内容、正確性、安全性について保証するものではありません。
            </p>
          </section>

          <section className="terms-section">
            <h2>第7条（規約の変更）</h2>
            <p>
              当サービスは、必要に応じて本規約を変更することがあります。
              変更後の規約は、当サービス内で通知した時点で効力を生じるものとします。
            </p>
          </section>

          <section className="terms-section">
            <h2>第8条（準拠法・管轄裁判所）</h2>
            <p>
              本規約は日本法に準拠するものとし、当サービスに関する紛争については、
              日本の裁判所を専属的合意管轄とします。
            </p>
          </section>

          <div className="terms-date">
            <p>制定日：2025年8月16日</p>
          </div>
        </div>

        {/* フッター */}
        <div className="terms-footer">
          <Link to="/signin" className="return-button">
            ログインページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
