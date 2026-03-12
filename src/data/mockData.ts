import banner1 from "@/assets/banner1.jpg";
import banner2 from "@/assets/banner2.jpg";
import banner3 from "@/assets/banner3.jpg";
import catRomance from "@/assets/cat-romance.jpg";
import catAction from "@/assets/cat-action.jpg";
import catComedy from "@/assets/cat-comedy.jpg";
import catThriller from "@/assets/cat-thriller.jpg";
import catFantasy from "@/assets/cat-fantasy.jpg";
import thumb1 from "@/assets/thumb1.jpg";
import thumb2 from "@/assets/thumb2.jpg";
import thumb3 from "@/assets/thumb3.jpg";
import thumb4 from "@/assets/thumb4.jpg";

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  isVip: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  slug: string;
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  category: string;
  isVip: boolean;
  description: string;
  previewUrl?: string;
}

export const banners: Banner[] = [
  {
    id: "1",
    title: "CONTEÚDO EXCLUSIVO",
    subtitle: "Assista aos melhores vídeos premium com acesso VIP",
    image: banner1,
    isVip: true,
  },
  {
    id: "2",
    title: "NOVOS LANÇAMENTOS",
    subtitle: "Descubra os últimos vídeos adicionados à plataforma",
    image: banner2,
    isVip: false,
  },
  {
    id: "3",
    title: "EXPLORE CATEGORIAS",
    subtitle: "Navegue por centenas de vídeos em diversas categorias",
    image: banner3,
    isVip: false,
  },
];

export const categories: Category[] = [
  { id: "1", name: "Romance", image: catRomance, slug: "romance" },
  { id: "2", name: "Ação", image: catAction, slug: "acao" },
  { id: "3", name: "Comédia", image: catComedy, slug: "comedia" },
  { id: "4", name: "Thriller", image: catThriller, slug: "thriller" },
  { id: "5", name: "Fantasia", image: catFantasy, slug: "fantasia" },
];

export const videos: Video[] = [
  {
    id: "1",
    title: "Sombras da Noite",
    thumbnail: thumb1,
    duration: "12:34",
    views: 15420,
    category: "thriller",
    isVip: false,
    description: "Uma jornada sombria pelas ruas da cidade. Mistérios se revelam a cada esquina nesta produção cinematográfica de tirar o fôlego.",
  },
  {
    id: "2",
    title: "Amor ao Pôr do Sol",
    thumbnail: thumb2,
    duration: "18:22",
    views: 32100,
    category: "romance",
    isVip: true,
    description: "Uma história de amor que transcende o tempo. Dois corações se encontram em um cenário de tirar o fôlego.",
  },
  {
    id: "3",
    title: "Fúria Explosiva",
    thumbnail: thumb3,
    duration: "22:15",
    views: 45600,
    category: "acao",
    isVip: true,
    description: "Ação sem limites. Explosões, perseguições e adrenalina pura nesta aventura eletrizante.",
  },
  {
    id: "4",
    title: "O Encapuzado",
    thumbnail: thumb4,
    duration: "15:48",
    views: 8900,
    category: "thriller",
    isVip: false,
    description: "Quem é o misterioso encapuzado que assombra a cidade? Descubra neste thriller de suspense.",
  },
  {
    id: "5",
    title: "Noite Vermelha",
    thumbnail: thumb1,
    duration: "20:10",
    views: 27800,
    category: "romance",
    isVip: true,
    description: "Paixão e mistério se encontram em uma noite que mudará tudo para sempre.",
  },
  {
    id: "6",
    title: "Chamas do Destino",
    thumbnail: thumb3,
    duration: "25:33",
    views: 51200,
    category: "acao",
    isVip: false,
    description: "O destino de muitos está nas mãos de um herói improvável. Ação épica e emocionante.",
  },
];
