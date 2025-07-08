import { api } from './api';

export interface Reaction {
  _id: string;
  userId: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  type: 'fire' | 'nice' | 'think' | 'bore' | 'shit';
  createdAt: string;
}

export const reactionsAPI = {
  // [PUBLIC] Получить счетчики для всех типов реакций
  getReactionCounts(mediaType: string, mediaId: string): Promise<{ data: Record<string, number> }> {
    return api.get(`/reactions/${mediaType}/${mediaId}/counts`);
  },

  // [AUTH] Получить реакцию пользователя для медиа
  getMyReaction(mediaType: string, mediaId: string): Promise<{ data: Reaction | null }> {
    return api.get(`/reactions/${mediaType}/${mediaId}/my-reaction`);
  },

  // [AUTH] Установить/обновить/удалить реакцию
  setReaction(mediaType: string, mediaId: string, type: Reaction['type']): Promise<{ data: Reaction }> {
    const fullMediaId = `${mediaType}_${mediaId}`;
    return api.post('/reactions', { mediaId: fullMediaId, type });
  },
};