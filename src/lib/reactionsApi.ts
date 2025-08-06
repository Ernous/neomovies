import { neoApi } from './neoApi';

export interface Reaction {
  type: 'like' | 'dislike';
  mediaId: string;
  mediaType: 'movie' | 'tv';
}

export const reactionsAPI = {
  // Получение счетчиков реакций
  getReactionCounts(mediaType: string, mediaId: string) {
    return neoApi.get(`/api/v1/reactions/${mediaType}/${mediaId}/counts`);
  },

  // Получение моей реакции
  getMyReaction(mediaType: string, mediaId: string) {
    return neoApi.get(`/api/v1/reactions/${mediaType}/${mediaId}/my-reaction`);
  },

  // Установка реакции
  setReaction(mediaType: string, mediaId: string, type: 'like' | 'dislike') {
    const fullMediaId = `${mediaType}_${mediaId}`;
    return neoApi.post('/api/v1/reactions', { mediaId: fullMediaId, type });
  },

  // Удаление реакции
  removeReaction(mediaType: string, mediaId: string) {
    return neoApi.delete(`/api/v1/reactions/${mediaType}/${mediaId}`);
  }
};