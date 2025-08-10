import { supabase } from '../supabase/config';
import { auth } from '../firebase/config';

export const userService = {
  /**
   * Firebase認証後にSupabaseのユーザー情報を作成/更新
   * @param {Object} firebaseUser - Firebase認証ユーザー情報
   */
  async syncUserWithSupabase(firebaseUser) {
    try {
      const { uid, email, displayName, photoURL, providerData } = firebaseUser;
      
      // プロバイダー情報を取得（Google, Email, etc.）
      const provider = providerData?.[0]?.providerId || 'firebase';
      
      console.log('syncUserWithSupabase called for:', { uid, email, displayName });
      
      // まず既存のユーザーデータを確認
      const existingUser = await this.getUserByFirebaseUid(uid);
      
      if (existingUser) {
        console.log('Existing user found:', existingUser);
        
        // 既存ユーザーの場合、カスタムアバター（絵文字）がある場合は保持
        let avatarToUse = existingUser.avatar_url;
        
        // 既存のアバターが無効（URL形式）またはnullの場合のみデフォルトアイコンを設定
        if (!avatarToUse || !this.isValidEmojiAvatar(avatarToUse)) {
          avatarToUse = '👤';
          console.log('Using default avatar for existing user');
        } else {
          console.log('Preserving existing custom avatar:', avatarToUse);
        }
        
        // 既存ユーザーのカスタム名前も保持
        let nameToUse = existingUser.name;
        
        // 既存の名前が空またはデフォルト値（メールアドレスベース）の場合のみ、Firebaseの表示名を使用
        const emailUsername = email.split('@')[0];
        if (!nameToUse || nameToUse === emailUsername || nameToUse === 'user') {
          nameToUse = displayName || emailUsername;
          console.log('Using Firebase displayName for existing user with default name');
        } else {
          console.log('Preserving existing custom name:', nameToUse);
        }
        
        // 基本情報のみを更新（名前とアバターは既存のものを保持）
        const { data, error } = await supabase
          .from('users')
          .update({
            name: nameToUse,
            email: email,
            provider: provider.includes('google') ? 'google' : 'email'
            // avatar_urlは更新しない（既存のカスタムアバターを保持）
          })
          .eq('firebase_uid', uid)
          .select()
          .single();

        if (error) {
          console.error('Supabase user update error:', error);
          throw error;
        }

        return data;
      } else {
        console.log('Creating new user');
        
        // 新規ユーザーの場合のみFirebaseのphotoURLをチェック
        const validAvatarUrl = this.isValidEmojiAvatar(photoURL) ? photoURL : '👤';
        
        // Supabaseの関数を呼び出してユーザーを作成
        const { data, error } = await supabase.rpc('upsert_user_from_firebase', {
          firebase_uid_param: uid,
          email_param: email,
          name_param: displayName || email.split('@')[0],
          avatar_url_param: validAvatarUrl,
          provider_param: provider.includes('google') ? 'google' : 'email'
        });

        if (error) {
          console.error('Supabase user creation error:', error);
          throw error;
        }

        return data[0];
      }
    } catch (error) {
      console.error('Failed to sync user with Supabase:', error);
      throw error;
    }
  },

  /**
   * Firebase UIDでSupabaseのユーザー情報を取得
   * @param {string} firebaseUid - Firebase UID
   */
  async getUserByFirebaseUid(firebaseUid) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching user:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get user from Supabase:', error);
      throw error;
    }
  },

  /**
   * アバターが有効な絵文字かチェック
   * @param {string} avatarUrl - アバターURL
   */
  isValidEmojiAvatar(avatarUrl) {
    if (!avatarUrl) return false;
    
    // URLっぽい文字列（http, https, データURLなど）は除外
    if (avatarUrl.includes('http') || avatarUrl.includes('data:')) {
      console.log('Invalid avatar (URL detected):', avatarUrl);
      return false;
    }
    
    // 許可されたアバター絵文字のホワイトリスト
    const allowedAvatars = [
      "👤", "😀", "😊", "🤓", "😎", "🤗", "🙂", "😌", "🥸", 
      "👨‍🎓", "👩‍🎓", "🧑‍💻"
    ];
    
    const isValid = allowedAvatars.includes(avatarUrl);
    console.log('Avatar validation:', { 
      avatarUrl, 
      isValid, 
      length: avatarUrl.length, 
      byteLength: new Blob([avatarUrl]).size 
    });
    
    return isValid;
  },

  /**
   * ユーザープロフィールを更新
   * @param {Object} updateData - 更新データ
   */
  async updateUserProfile(updateData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('認証されたユーザーがいません');
      }

      console.log('Profile update request:', updateData);

      // アバターURLが絵文字でない場合はデフォルトに設定
      if (updateData.avatar_url) {
        const isValid = this.isValidEmojiAvatar(updateData.avatar_url);
        if (!isValid) {
          console.log('Invalid avatar detected, using default:', updateData.avatar_url);
          updateData.avatar_url = '👤';
        } else {
          console.log('Valid avatar confirmed:', updateData.avatar_url);
        }
      }

      console.log('Final update data:', updateData);

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('firebase_uid', user.uid)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      console.log('Profile update successful:', data);
      return data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  /**
   * 認証ログを記録（制限付き）
   * @param {string} eventType - イベントタイプ ('login', 'logout', 'register', etc.)
   */
  async logAuthEvent(eventType) {
    // 開発時はログを無効化（本番では有効にしてください）
    if (process.env.NODE_ENV === 'development') {
      console.log(`Auth log (disabled in dev): ${eventType}`);
      return;
    }
    
    try {
      const user = auth.currentUser;
      if (!user) return;

      const { error } = await supabase
        .from('user_auth_logs')
        .insert({
          firebase_uid: user.uid,
          event_type: eventType,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Auth log error:', error);
        // ログエラーはサイレントに処理（アプリケーションの動作は止めない）
      }
    } catch (error) {
      console.error('Failed to log auth event:', error);
      // ログエラーはサイレントに処理
    }
  },

  /**
   * ユーザーの統計情報を取得
   */
  async getUserStats() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('認証されたユーザーがいません');
      }

      // ユーザーIDを取得
      const userData = await this.getUserByFirebaseUid(user.uid);
      if (!userData) {
        throw new Error('ユーザーが見つかりません');
      }

      // 作成したアンケート数を取得
      const { count: createdSurveys, error: surveysError } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', userData.id);

      if (surveysError) throw surveysError;

      // アクティブなアンケート数を取得
      const { count: activeSurveys, error: activeError } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', userData.id)
        .eq('is_active', true);

      if (activeError) throw activeError;

      // 回答数を取得
      const { count: responsesGiven, error: responsesError } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.id);

      if (responsesError) throw responsesError;

      return {
        created_surveys: createdSurveys || 0,
        active_surveys: activeSurveys || 0,
        responses_given: responsesGiven || 0,
        rank: userData.rank,
        experience: userData.experience,
        experience_to_next: userData.experience_to_next,
        points: userData.points
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      throw error;
    }
  }
};