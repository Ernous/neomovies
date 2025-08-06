import { neoApi } from './neoApi';

export const favoritesAPI = {
  // Получение всех избранных
  getFavorites() {
    return neoApi.get('/api/v1/favorites');
  },

  // Добавление в избранное
  addFavorite(data: { mediaId: string; mediaType: string; title: string; posterPath?: string }) {
    const { mediaId, mediaType, ...rest } = data;
    return neoApi.post(`/api/v1/favorites/${mediaId}?mediaType=${mediaType}`, rest);
  },

  // Удаление из избранного
  removeFavorite(mediaId: string) {
    return neoApi.delete(`/api/v1/favorites/${mediaId}`);
  },

  // Проверка, добавлен ли в избранное
  checkFavorite(mediaId: string) {
    return neoApi.get(`/api/v1/favorites/check/${mediaId}`);
  }
};
