import { WifiOff, Droplets, Flame, Users, Tent, Sun, TreePine, Mountain, Waves, Car, Dog, Coffee } from "lucide-react";

export interface Review {
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Amenity {
  icon: string;
  label: string;
  description: string;
}

/** Локация в том виде, в котором её потребляет интерфейс */
export interface Location {
  id: string;
  name: string;
  location: string;
  description: string;
  rating: number;
  price: number;
  image: string;
  images: string[];
  features: string[];
  featured: boolean;
  amenities: Amenity[];
  details: string[];
  reviews: Review[];
  sortOrder: number;
  /** «сырые» пути к фото в хранилище (для админки) */
  imagePath: string | null;
  imagePaths: string[];
}

export const amenityIcons = {
  Flame,
  Droplets,
  WifiOff,
  Users,
  Tent,
  Sun,
  TreePine,
  Mountain,
  Waves,
  Car,
  Dog,
  Coffee,
} as const;

export type AmenityIconKey = keyof typeof amenityIcons;

export const amenityIconLabels: Record<AmenityIconKey, string> = {
  Flame: "Костёр",
  Droplets: "Вода / душ",
  WifiOff: "Без связи",
  Users: "Гости",
  Tent: "Палатка",
  Sun: "Солнце",
  TreePine: "Лес",
  Mountain: "Горы",
  Waves: "Вода / озеро",
  Car: "Парковка",
  Dog: "С животными",
  Coffee: "Кухня",
};

export const getAmenityIcon = (key: string) =>
  amenityIcons[(key as AmenityIconKey)] ?? Tent;

export const formatRub = (value: number) =>
  `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;
