export const EVENT_CATEGORIES = [
  "Música",
  "Esporte",
  "Gastronomia",
  "Festa",
  "Natureza",
  "Família",
  "Teatro e Dança",
  "Educação",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const AGE_RATINGS = [
  "Livre",
  "10 anos ou mais",
  "12 anos ou mais",
  "14 anos ou mais",
  "16 anos ou mais",
  "18 anos ou mais",
] as const;

export type AgeRating = (typeof AGE_RATINGS)[number];

export type EventStatus = "pendente" | "aprovado" | "reprovado";

export interface EventLocation {
  cidade: string;
  estado: string;
  endereco: string;
  latitude: number;
  longitude: number;
}

export interface EventComment {
  id: string;
  author: string;
  message: string;
  createdAt: string;
}

export interface EventReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
}

export interface RegionalEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  startTime: string;
  imageUrl: string | null;
  organizerName: string;
  location: EventLocation;
  status: EventStatus;
  ageRating: AgeRating;
  averageRating: number;
  reviews: EventReview[];
  comments: EventComment[];
}
