export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameRu: string;
  icon: string;
  color: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: Category;
  date: string;
  placeName: string;
  difficulty: Difficulty;
  maxParticipants: number;
  currentParticipants: number;
  creator: User;
  imageUrl?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  city?: string;
  rating: number;
  level: number;
  xp: number;
}

  export const CATEGORIES: Category[] = [
  { id: "1",  slug: "football",     nameRu: "Футбол",             name: "Football",      icon: "⚽", color: "bg-green-100 text-green-800" },
  { id: "2",  slug: "basketball",   nameRu: "Баскетбол",          name: "Basketball",    icon: "🏀", color: "bg-orange-100 text-orange-800" },
  { id: "3",  slug: "volleyball",   nameRu: "Волейбол",           name: "Volleyball",    icon: "🏐", color: "bg-yellow-100 text-yellow-800" },
  { id: "4",  slug: "padel",        nameRu: "Падл",               name: "Padel",         icon: "🎾", color: "bg-lime-100 text-lime-800" },
  { id: "5",  slug: "tennis",       nameRu: "Теннис",             name: "Tennis",        icon: "🏸", color: "bg-teal-100 text-teal-800" },
  { id: "6",  slug: "running",      nameRu: "Бег",                name: "Running",       icon: "🏃", color: "bg-blue-100 text-blue-800" },
  { id: "7",  slug: "yoga",         nameRu: "Йога",               name: "Yoga",          icon: "🧘", color: "bg-purple-100 text-purple-800" },
  { id: "8",  slug: "boardgames",   nameRu: "Настольные игры",    name: "Board games",   icon: "🎲", color: "bg-indigo-100 text-indigo-800" },
  { id: "9",  slug: "workout",      nameRu: "Воркаут",            name: "Workout",       icon: "💪", color: "bg-red-100 text-red-800" },
  { id: "10", slug: "esports",      nameRu: "Киберспорт-встречи", name: "Esports",       icon: "🎮", color: "bg-violet-100 text-violet-800" },
  { id: "11", slug: "quests",       nameRu: "Квесты",             name: "Quests",        icon: "🗺️", color: "bg-amber-100 text-amber-800" },
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "1",
    title: "Велопрогулка по набережной",
    description: "Неспешная поездка вдоль реки, потом кофе. Берём велосипеды в прокате у моста.",
    category: CATEGORIES[0],
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    placeName: "Набережная, у Большого моста",
    difficulty: "beginner",
    maxParticipants: 8,
    currentParticipants: 5,
    creator: { id: "u1", name: "Алёна К.", username: "alena_k", rating: 4.9, level: 3, xp: 3200 },
  },
  {
    id: "2",
    title: "Баня с веником в субботу",
    description: "Русская баня, берёзовые веники, чай с мёдом. Опыт не нужен, главное желание!",
    category: CATEGORIES[11],
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    placeName: "Банный комплекс «Медведково»",
    difficulty: "beginner",
    maxParticipants: 6,
    currentParticipants: 4,
    creator: { id: "u2", name: "Дмитрий В.", username: "dima_v", rating: 4.7, level: 2, xp: 1800 },
  },
  {
    id: "3",
    title: "Глэмпинг у озера Сенеж",
    description: "Два дня на природе — костёр, палатки, SUP-доски на озере. Всё снаряжение есть.",
    category: CATEGORIES[4],
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    placeName: "Оз. Сенеж, Подмосковье",
    difficulty: "beginner",
    maxParticipants: 10,
    currentParticipants: 6,
    creator: { id: "u3", name: "Наташа О.", username: "natasha_o", rating: 5.0, level: 4, xp: 5100 },
  },
  {
    id: "4",
    title: "Утренний бег в парке",
    description: "5 км по Сокольникам. Темп средний, разминка вместе. Берём воду и хорошее настроение.",
    category: CATEGORIES[1],
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    placeName: "Парк Сокольники, центральный вход",
    difficulty: "intermediate",
    maxParticipants: 12,
    currentParticipants: 7,
    creator: { id: "u4", name: "Петр С.", username: "petr_s", rating: 4.8, level: 3, xp: 2900 },
  },
  {
    id: "5",
    title: "Йога на свежем воздухе",
    description: "Хатха-йога в парке. Коврики нужно взять с собой. Подходит для начинающих.",
    category: CATEGORIES[6],
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    placeName: "Парк Горького, поляна у пруда",
    difficulty: "beginner",
    maxParticipants: 15,
    currentParticipants: 9,
    creator: { id: "u5", name: "Маша Т.", username: "masha_t", rating: 4.9, level: 3, xp: 3800 },
  },
  {
    id: "6",
    title: "Футбол 5x5 в выходные",
    description: "Дружеский матч, команды по 5 человек. Аренда поля оплачена, нужны бутсы или кроссовки.",
    category: CATEGORIES[7],
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    placeName: "Стадион «Олимп», Измайлово",
    difficulty: "intermediate",
    maxParticipants: 10,
    currentParticipants: 7,
    creator: { id: "u6", name: "Артём Н.", username: "artem_n", rating: 4.6, level: 2, xp: 2100 },
  },
];
