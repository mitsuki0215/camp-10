import { supabase } from '../supabase/config';
import { auth } from '../firebase/config';
import { userService } from './userService';
import { api } from '../utils/api';

export const surveyService = {
  /**
   * アンケート一覧を取得
   */
  async getSurveys() {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select(`
          id,
          title,
          description,
          response_count,
          created_at,
          users!creator_id (
            name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // データを整形
      return data.map(survey => ({
        id: survey.id,
        title: survey.title,
        description: survey.description,
        responseCount: survey.response_count,
        duration: '約3-5分', // 固定値またはquestions数から計算
        createdAt: survey.created_at,
        creatorName: survey.users?.name
      }));
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
      throw error;
    }
  },

  /**
   * ユーザーが作成したアンケートを取得（FastAPI経由）
   */
  async getUserSurveys() {
    try {
      const response = await api.get('/api/user/surveys', true);
      return response.map(survey => ({
        id: survey.id,
        title: survey.title,
        description: survey.description,
        responseCount: survey.response_count,
        createdAt: survey.created_at,
        status: survey.is_active ? '公開中' : '終了',
        isActive: survey.is_active
      }));
    } catch (error) {
      console.error('Failed to fetch user surveys from API:', error);
      // フォールバック：元のSupabase実装
      return this.getUserSurveysSupabase();
    }
  },

  /**
   * Supabaseからユーザーのアンケートを取得（フォールバック）
   */
  async getUserSurveysSupabase() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('認証されたユーザーがいません');

      // SupabaseのユーザーIDを取得
      const supabaseUser = await userService.getUserByFirebaseUid(user.uid);
      if (!supabaseUser) throw new Error('ユーザーが見つかりません');

      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('creator_id', supabaseUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(survey => ({
        id: survey.id,
        title: survey.title,
        description: survey.description,
        responseCount: survey.response_count,
        createdAt: survey.created_at,
        status: survey.is_active ? '公開中' : '終了',
        isActive: survey.is_active
      }));
    } catch (error) {
      console.error('Failed to fetch user surveys:', error);
      throw error;
    }
  },

  /**
   * アンケートを作成
   * @param {Object} surveyData - アンケートデータ
   */
  async createSurvey(surveyData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('認証されたユーザーがいません');

      // SupabaseのユーザーIDを取得
      const supabaseUser = await userService.getUserByFirebaseUid(user.uid);
      if (!supabaseUser) throw new Error('ユーザーが見つかりません');

      const { data, error } = await supabase
        .from('surveys')
        .insert({
          title: surveyData.title,
          description: surveyData.description,
          questions: surveyData.questions,
          creator_id: supabaseUser.id,
          is_active: true,
          response_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to create survey:', error);
      throw error;
    }
  },

  /**
   * アンケートを更新
   * @param {number} surveyId - アンケートID
   * @param {Object} updateData - 更新データ
   */
  async updateSurvey(surveyId, updateData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('認証されたユーザーがいません');

      // SupabaseのユーザーIDを取得
      const supabaseUser = await userService.getUserByFirebaseUid(user.uid);
      if (!supabaseUser) throw new Error('ユーザーが見つかりません');

      const { data, error } = await supabase
        .from('surveys')
        .update(updateData)
        .eq('id', surveyId)
        .eq('creator_id', supabaseUser.id) // 自分のアンケートのみ更新可能
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to update survey:', error);
      throw error;
    }
  },

  /**
   * アンケートを削除
   * @param {number} surveyId - アンケートID
   */
  async deleteSurvey(surveyId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('認証されたユーザーがいません');

      // SupabaseのユーザーIDを取得
      const supabaseUser = await userService.getUserByFirebaseUid(user.uid);
      if (!supabaseUser) throw new Error('ユーザーが見つかりません');

      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', surveyId)
        .eq('creator_id', supabaseUser.id); // 自分のアンケートのみ削除可能

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Failed to delete survey:', error);
      throw error;
    }
  },

  /**
   * アンケートの詳細を取得
   * @param {number} surveyId - アンケートID
   */
  async getSurveyById(surveyId) {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select(`
          *,
          users!creator_id (
            name,
            email
          )
        `)
        .eq('id', surveyId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to fetch survey:', error);
      throw error;
    }
  },

  /**
   * アンケートに回答
   * @param {number} surveyId - アンケートID
   * @param {Object} responses - 回答データ
   */
  async submitSurveyResponse(surveyId, responses) {
    try {
      // FastAPI経由で回答を送信
      const response = await api.post(`/api/surveys/${surveyId}/responses`, {
        responses: responses
      }, true); // 認証付きで送信
      
      return response;
    } catch (error) {
      console.error('Failed to submit survey response:', error);
      throw error;
    }
  },

  /**
   * Supabase経由で回答を送信（フォールバック）
   */
  async submitSurveyResponseSupabase(surveyId, responses) {
    try {
      const user = auth.currentUser;
      let userId = null;

      if (user) {
        // 認証済みユーザーの場合、SupabaseのユーザーIDを取得
        const supabaseUser = await userService.getUserByFirebaseUid(user.uid);
        userId = supabaseUser?.id;
      }

      // 回答を保存
      const { data, error } = await supabase
        .from('survey_responses')
        .insert({
          survey_id: surveyId,
          user_id: userId, // 匿名の場合はNULL
          responses: responses
        })
        .select()
        .single();

      if (error) throw error;

      // アンケートの回答数を更新
      await supabase.rpc('increment_survey_response_count', {
        survey_id: surveyId
      });

      return data;
    } catch (error) {
      console.error('Failed to submit survey response:', error);
      throw error;
    }
  },

  /**
   * アンケートの回答結果を取得
   * @param {number} surveyId - アンケートID
   */
  async getSurveyResponses(surveyId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('認証されたユーザーがいません');

      // SupabaseのユーザーIDを取得
      const supabaseUser = await userService.getUserByFirebaseUid(user.uid);
      if (!supabaseUser) throw new Error('ユーザーが見つかりません');

      // まず、このアンケートが自分のものかチェック
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .select('creator_id')
        .eq('id', surveyId)
        .single();

      if (surveyError) throw surveyError;
      if (survey.creator_id !== supabaseUser.id) {
        throw new Error('このアンケートの結果を見る権限がありません');
      }

      // 回答データを取得
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('survey_id', surveyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to fetch survey responses:', error);
      throw error;
    }
  },

  /**
   * FastAPIからアンケート詳細を取得
   * @param {number} surveyId - アンケートID
   */
  async getSurvey(surveyId) {
    try {
      const response = await api.get(`/api/surveys/${surveyId}`, true);
      return response;
    } catch (error) {
      console.error('Failed to fetch survey from API:', error);
      throw error;
    }
  },

  /**
   * FastAPIからアンケート回答を取得
   * @param {number} surveyId - アンケートID
   */
  async getSurveyResponsesAPI(surveyId) {
    try {
      const response = await api.get(`/api/surveys/${surveyId}/responses`, true);
      return response;
    } catch (error) {
      console.error('Failed to fetch survey responses from API:', error);
      throw error;
    }
  },

  /**
   * アンケート公開状態を切り替え
   * @param {number} surveyId - アンケートID
   */
  async toggleSurveyStatus(surveyId) {
    try {
      const response = await api.patch(`/api/surveys/${surveyId}/toggle-status`, null, true);
      return response;
    } catch (error) {
      console.error('Failed to toggle survey status:', error);
      throw error;
    }
  },

  /**
   * アンケートを削除
   * @param {number} surveyId - アンケートID
   */
  async deleteSurveyAPI(surveyId) {
    try {
      const response = await api.delete(`/api/surveys/${surveyId}`, true);
      return response;
    } catch (error) {
      console.error('Failed to delete survey:', error);
      throw error;
    }
  },

  /**
   * アンケート結果をCSVでエクスポート
   * @param {number} surveyId - アンケートID
   */
  async exportSurveyCSV(surveyId) {
    try {
      const blob = await api.getBlob(`/api/surveys/${surveyId}/export-csv`, true);
      return blob;
    } catch (error) {
      console.error('Failed to export CSV:', error);
      throw error;
    }
  }
};

// 古いメソッド名で新しいAPIメソッドのエイリアスを作成
surveyService.getSurveyResponses = surveyService.getSurveyResponsesAPI;