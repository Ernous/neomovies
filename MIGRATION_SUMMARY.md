# Миграция на новый Go API

## Обзор изменений

Проект успешно мигрирован с Node.js API на новый Go API (https://github.com/Ernous/neomovies-api).

## Основные изменения

### 1. Обновление API endpoints

Все API endpoints обновлены для работы с новым Go API:
- Базовый URL: `/api/v1/`
- Новые endpoints для торрентов с парсингом сезонов
- Обновленные endpoints для фильмов и сериалов

### 2. Новая логика получения сезонов

**Раньше**: Сезоны брались из TMDB API (`number_of_seasons`)
**Теперь**: Сезоны парсятся из названий всех торрентов

#### Преимущества нового подхода:
- Получение реальных доступных сезонов, а не только из TMDB
- Нахождение раздач даже если нумерация сезонов отличается от официальной
- Группировка торрентов по сезонам для удобного выбора

### 3. Обновленные компоненты

#### TorrentSelector
- Добавлена функция `getAvailableSeasons()` для получения сезонов из названий торрентов
- Обновлен интерфейс для работы с новыми типами данных
- Улучшена логика отображения доступных сезонов

#### API файлы
- `src/lib/neoApi.ts` - основной API файл с новыми endpoints
- `src/lib/authApi.ts` - обновлен для нового API
- `src/lib/favoritesApi.ts` - обновлен для нового API
- `src/lib/reactionsApi.ts` - обновлен для нового API

#### Хуки
- `src/hooks/useSearch.ts` - использует новый multiSearch API
- `src/hooks/useMovies.ts` - обновлен для новых категорий
- `src/hooks/useAuth.ts` - обновлен для нового API

### 4. Удаленные файлы

- `src/lib/api.ts` - заменен на neoApi
- `src/hooks/useTMDBMovies.ts` - больше не нужен
- `src/app/api/` - удалены старые API routes

### 5. Обновленные страницы

- `src/app/movie/[id]/` - обновлены для нового API
- `src/app/tv/[id]/` - обновлены для нового API
- `src/app/search/` - использует новый multiSearch
- `src/app/categories/` - обновлены для нового API

## Новые возможности

### Торрент API
```typescript
// Поиск торрентов по IMDB ID
torrentsAPI.searchTorrents(imdbId, type, options)

// Получение доступных сезонов
torrentsAPI.getAvailableSeasons(title, originalTitle, year)

// Универсальный поиск торрентов
torrentsAPI.searchByQuery(query, type, year)
```

### Категории API
```typescript
// Получение всех категорий
categoriesAPI.getCategories()

// Получение фильмов/сериалов по категории
categoriesAPI.getMoviesByCategory(categoryId, page)
categoriesAPI.getTVShowsByCategory(categoryId, page)
```

## Переменные окружения

Обновлен `.env.example`:
```env
NEXT_PUBLIC_API_URL=https://api.neomovies.ru
```

## Тестирование

Проект успешно собирается без ошибок:
```bash
npm run build
✓ Compiled successfully
```

## Совместимость

- ✅ Все существующие функции сохранены
- ✅ Улучшена логика получения сезонов
- ✅ Добавлены новые возможности API
- ✅ Сохранена обратная совместимость интерфейса

## Следующие шаги

1. Протестировать все функции в браузере
2. Проверить работу торрент-поиска с новым парсингом сезонов
3. Убедиться в корректной работе аутентификации
4. Проверить работу избранного и реакций