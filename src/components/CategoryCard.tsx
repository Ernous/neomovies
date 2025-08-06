'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/lib/neoApi';

interface CategoryCardProps {
  category: Category;
  backgroundUrl?: string | null;
}

// Словарь цветов для разных жанров
const genreColors: Record<number, string> = {
  28: '#E53935', // Боевик - красный
  12: '#43A047', // Приключения - зеленый
  16: '#FB8C00', // Мультфильм - оранжевый
  35: '#FFEE58', // Комедия - желтый
  80: '#424242', // Криминал - темно-серый
  99: '#8D6E63', // Документальный - коричневый
  18: '#5E35B1', // Драма - пурпурный
  10751: '#EC407A', // Семейный - розовый
  14: '#7E57C2', // Фэнтези - фиолетовый
  36: '#795548', // История - коричневый
  27: '#212121', // Ужасы - черный
  10402: '#26A69A', // Музыка - бирюзовый
  9648: '#5C6BC0', // Детектив - индиго
  10749: '#EC407A', // Мелодрама - розовый
  878: '#00BCD4', // Фантастика - голубой
  10770: '#9E9E9E', // ТВ фильм - серый
  53: '#FFA000', // Триллер - янтарный
  10752: '#455A64', // Военный - сине-серый
  37: '#8D6E63', // Вестерн - коричневый
  // Добавим цвета для популярных жанров сериалов
  10759: '#1E88E5', // Боевик и приключения - синий
  10762: '#00ACC1', // Детский - циан
  10763: '#546E7A', // Новости - сине-серый
  10764: '#F06292', // Реалити-шоу - розовый
  10765: '#00BCD4', // Фантастика и фэнтези - голубой
  10766: '#5E35B1', // Мыльная опера - пурпурный
  10767: '#4CAF50', // Ток-шоу - зеленый
  10768: '#FFD54F'  // Война и политика - желтый
};

// Получаем цвет для категории или используем запасной вариант
function getCategoryColor(categoryId: number): string {
  return genreColors[categoryId] || '#3949AB'; // Индиго как запасной вариант
}

function CategoryCard({ category, backgroundUrl }: CategoryCardProps) {
  const router = useRouter();
  const [imageUrl] = useState<string>(backgroundUrl || '/images/placeholder.jpg');
  
  const categoryColor = getCategoryColor(category.id);
  
  function handleClick() {
    router.push(`/categories/${category.id}`);
  }
  
  return (
    <div
      onClick={handleClick}
      role="button"
      aria-label={`Категория ${category.name}`}
      className="relative w-full h-44 rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-2xl bg-cover bg-center group"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div
        className="absolute inset-0 transition-opacity duration-300 ease-in-out opacity-70 group-hover:opacity-80"
        style={{ backgroundColor: categoryColor }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300" />
      <div className="relative z-10 flex flex-col justify-center items-center h-full p-4 text-white text-center">
        <h3 className="text-2xl font-bold m-0 drop-shadow-lg">{category.name}</h3>
      </div>
    </div>
  );
}

export default CategoryCard;
