import { neoApi } from './neoApi';

export const favoritesAPI = {
  // Получение всех избранных
  getFavorites() {
    return neoApi.get('/favorites');
  },

  // Добавление в избранное
  addFavorite(data: { mediaId: string; mediaType: string; title: string; posterPath?: string }) {
    const { mediaId, mediaType, ...rest } = data;
    return neoApi.post(`/favorites/${mediaId}?mediaType=${mediaType}`, rest);
  },

  // Удаление из избранного
  removeFavorite(mediaId: string) {
    return neoApi.delete(`/favorites/${mediaId}`);
  },

  // Проверка, добавлен ли в избранное
  checkFavorite(mediaId: string) {
    return neoApi.get(`/favorites/check/${mediaId}`);
  }
};
