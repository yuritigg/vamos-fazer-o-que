import { RegionalEvent } from "@/types/event";

export const mockEvents: RegionalEvent[] = [
  {
    id: "1",
    slug: "festa-junina-de-campina",
    title: "Festa Junina de Campina",
    description: "Quadrilhas, comidas típicas e shows regionais no coração da cidade.",
    category: "Festa",
    ageRating: "Livre",
    date: "2026-06-18",
    startTime: "19:00",
    imageUrl:
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80",
    organizerName: "Prefeitura de Campina",
    location: {
      cidade: "Campina Grande",
      estado: "PB",
      endereco: "Parque do Povo, Centro",
      latitude: -7.2307,
      longitude: -35.8817,
    },
    status: "aprovado",
    averageRating: 4.8,
    reviews: [
      { id: "r1", author: "Ana", rating: 5, comment: "Ambiente incrível e muito organizado." },
      { id: "r2", author: "Carlos", rating: 4, comment: "Ótimo evento para família." },
    ],
    comments: [
      { id: "c1", author: "Juliana", message: "Vai ter estacionamento no local?", createdAt: "2026-04-10T10:30:00Z" },
    ],
  },
  {
    id: "2",
    slug: "circuito-regional-de-corrida",
    title: "Circuito Regional de Corrida",
    description: "Percurso de 5km e 10km com premiação para categorias por idade.",
    category: "Esporte",
    ageRating: "Livre",
    date: "2026-07-12",
    startTime: "06:00",
    imageUrl:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80",
    organizerName: "Associação Atleta Regional",
    location: {
      cidade: "Recife",
      estado: "PE",
      endereco: "Orla de Boa Viagem",
      latitude: -8.1172,
      longitude: -34.8941,
    },
    status: "aprovado",
    averageRating: 4.5,
    reviews: [{ id: "r3", author: "Igor", rating: 5, comment: "Estrutura excelente para corrida." }],
    comments: [],
  },
  {
    id: "3",
    slug: "feira-sabores-do-sertao",
    title: "Feira Sabores do Sertão",
    description: "Produtores locais, oficinas gastronômicas e música ao vivo.",
    category: "Gastronomia",
    ageRating: "Livre",
    date: "2026-05-28",
    startTime: "15:00",
    imageUrl:
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80",
    organizerName: "Coletivo Sabores do Nordeste",
    location: {
      cidade: "Petrolina",
      estado: "PE",
      endereco: "Centro de Convenções de Petrolina",
      latitude: -9.3891,
      longitude: -40.5031,
    },
    status: "pendente",
    averageRating: 0,
    reviews: [],
    comments: [],
  },
];

export function getApprovedEvents() {
  return mockEvents.filter((event) => event.status === "aprovado");
}

export function getEventBySlug(slug: string) {
  return mockEvents.find((event) => event.slug === slug);
}
