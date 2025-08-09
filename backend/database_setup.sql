-- Firebase Auth + Supabase 連携用データベース設計
-- エラー修正版：テーブル作成→インデックス→RLS設定の順序で実行

-- 1. 既存のテーブルを削除（必要な場合のみ）
-- DROP TABLE IF EXISTS user_auth_logs CASCADE;
-- DROP TABLE IF EXISTS survey_responses CASCADE;
-- DROP TABLE IF EXISTS surveys CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 2. ユーザーテーブルの作成（Firebase Auth連携対応）
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE NOT NULL, -- Firebase AuthのUID
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    grade VARCHAR(50),
    avatar_url TEXT, -- Googleアカウントのプロフィール画像URL
    provider VARCHAR(50) NOT NULL DEFAULT 'firebase', -- 'firebase', 'google', 'email'
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE, -- Firebaseの認証状態と同期
    rank VARCHAR(50) DEFAULT 'Bronze',
    experience INTEGER DEFAULT 0,
    experience_to_next INTEGER DEFAULT 100,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. アンケートテーブル
CREATE TABLE IF NOT EXISTS surveys (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL, -- 質問データをJSONBで保存
    creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    response_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. アンケート回答テーブル
CREATE TABLE IF NOT EXISTS survey_responses (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- 匿名回答の場合はNULL可
    responses JSONB NOT NULL, -- 回答データをJSONBで保存
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ユーザー認証ログテーブル（Firebase認証イベント記録用）
CREATE TABLE IF NOT EXISTS user_auth_logs (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'register', 'profile_update'
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_surveys_creator_id ON surveys(creator_id);
CREATE INDEX IF NOT EXISTS idx_surveys_is_active ON surveys(is_active);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_auth_logs_firebase_uid ON user_auth_logs(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_user_auth_logs_created_at ON user_auth_logs(created_at);

-- 7. トリガー関数（updated_at自動更新）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. トリガーの適用
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at
    BEFORE UPDATE ON surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 関数: Firebase UIDからユーザーID取得
CREATE OR REPLACE FUNCTION get_user_id_by_firebase_uid(firebase_uid_param VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    user_id INTEGER;
BEGIN
    SELECT id INTO user_id FROM users WHERE firebase_uid = firebase_uid_param;
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- 10. 関数: ユーザー作成または更新（Firebase認証後）
CREATE OR REPLACE FUNCTION upsert_user_from_firebase(
    firebase_uid_param VARCHAR,
    email_param VARCHAR,
    name_param VARCHAR,
    avatar_url_param TEXT DEFAULT NULL,
    provider_param VARCHAR DEFAULT 'firebase'
)
RETURNS TABLE(id INTEGER, firebase_uid VARCHAR, email VARCHAR, name VARCHAR) AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- ユーザーが存在するかチェック
    SELECT * INTO user_record FROM users WHERE users.firebase_uid = firebase_uid_param;
    
    IF user_record.id IS NOT NULL THEN
        -- 既存ユーザーの更新
        UPDATE users SET
            email = email_param,
            name = name_param,
            avatar_url = COALESCE(avatar_url_param, users.avatar_url),
            is_verified = TRUE,
            updated_at = NOW()
        WHERE users.firebase_uid = firebase_uid_param;
    ELSE
        -- 新規ユーザーの作成
        INSERT INTO users (firebase_uid, email, name, avatar_url, provider, is_verified)
        VALUES (firebase_uid_param, email_param, name_param, avatar_url_param, provider_param, TRUE);
    END IF;
    
    -- 更新後のユーザー情報を返す
    RETURN QUERY
    SELECT users.id, users.firebase_uid, users.email, users.name
    FROM users
    WHERE users.firebase_uid = firebase_uid_param;
END;
$$ LANGUAGE plpgsql;

-- 11. ヘルパー関数: アンケート回答数を増加
CREATE OR REPLACE FUNCTION increment_survey_response_count(survey_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE surveys 
    SET response_count = response_count + 1,
        updated_at = NOW()
    WHERE id = survey_id;
END;
$$ LANGUAGE plpgsql;

-- 12. ヘルパー関数: ユーザーの経験値を増加
CREATE OR REPLACE FUNCTION add_user_experience(firebase_uid_param VARCHAR, exp_points INTEGER)
RETURNS VOID AS $$
DECLARE
    current_exp INTEGER;
    current_exp_to_next INTEGER;
    new_rank VARCHAR(50);
BEGIN
    -- 現在の経験値を取得
    SELECT experience, experience_to_next INTO current_exp, current_exp_to_next
    FROM users WHERE firebase_uid = firebase_uid_param;
    
    -- 経験値を更新
    UPDATE users SET
        experience = experience + exp_points,
        updated_at = NOW()
    WHERE firebase_uid = firebase_uid_param;
    
    -- ランクアップチェック（簡単な例）
    IF (current_exp + exp_points) >= current_exp_to_next THEN
        -- ランクアップロジック（必要に応じてカスタマイズ）
        SELECT CASE 
            WHEN (current_exp + exp_points) >= 1000 THEN 'Platinum'
            WHEN (current_exp + exp_points) >= 500 THEN 'Gold'
            WHEN (current_exp + exp_points) >= 200 THEN 'Silver'
            ELSE 'Bronze'
        END INTO new_rank;
        
        UPDATE users SET
            rank = new_rank,
            experience_to_next = experience_to_next + 200
        WHERE firebase_uid = firebase_uid_param;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 13. ヘルパー関数: ユーザーのポイントを更新
CREATE OR REPLACE FUNCTION update_user_points(firebase_uid_param VARCHAR, points_change INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE users SET
        points = GREATEST(0, points + points_change),
        updated_at = NOW()
    WHERE firebase_uid = firebase_uid_param;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) 設定は別途実行
-- 以下は基本テーブルが作成された後に実行してください

-- 14. RLS有効化（テーブル作成後に実行）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_auth_logs ENABLE ROW LEVEL SECURITY;

-- 実行完了メッセージ
SELECT 'Firebase Auth + Supabase データベースのベーステーブルとファンクションが作成されました！' AS message;