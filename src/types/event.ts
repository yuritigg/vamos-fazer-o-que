export const EVENT_CATEGORIES = [
  "Festa",
  "Show",
  "Gastronomia",
  "Esporte",
  "Cultural",
  "Negócios",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

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
  imageUrl: string;
  organizerName: string;
  location: EventLocation;
  status: EventStatus;
  averageRating: number;
  reviews: EventReview[];
  comments: EventComment[];
}
