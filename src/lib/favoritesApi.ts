import { neoApi } from './neoApi';

export const favoritesAPI = {
  // Получить все избранные
  getFavorites() {
    return neoApi.get('/api/v1/favorites');
  },

  // Добавить в избранное
  addFavorite(data: { mediaId: string; mediaType: 'movie' | 'tv', title: string, posterPath: string }) {
    const { mediaId, mediaType, title, posterPath } = data;
    return neoApi.post(`/api/v1/favorites/${mediaId}?mediaType=${mediaType}`, { title, posterPath });
  },

  // Удалить из избранного
  removeFavorite(mediaId: string) {
    return neoApi.delete(`/api/v1/favorites/${mediaId}`);
  },

  // Проверить есть ли в избранном
  checkFavorite(mediaId: string) {
    return neoApi.get(`/api/v1/favorites/check/${mediaId}`);
  }
};
