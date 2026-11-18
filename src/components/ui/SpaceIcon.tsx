import React from 'react';
import {
  BookOpen,
  Briefcase,
  Coffee,
  Compass,
  Heart,
  Home,
  Music,
  Plane,
  Sprout,
  Sun,
  Users,
  Wallet,
} from 'lucide-react';
import { AccentTone, SpaceIconName } from '../../types/balance';

export const TONE_STYLES: Record<
  AccentTone,
  {
    label: string;
    swatch: string;
    iconBg: string;
    iconText: string;
    bar: string;
    softText: string;
  }
> = {
  petrol: {
    label: 'Verde petróleo',
    swatch: '#135D66',
    iconBg: 'bg-[#ECF4F5]',
    iconText: 'text-[#135D66]',
    bar: 'bg-[#135D66]',
    softText: 'text-[#135D66]',
  },
  sage: {
    label: 'Verde salvia',
    swatch: '#5E8371',
    iconBg: 'bg-[#EEF4F0]',
    iconText: 'text-[#5E8371]',
    bar: 'bg-[#5E8371]',
    softText: 'text-[#5E8371]',
  },
  lavender: {
    label: 'Lavanda',
    swatch: '#7D71A8',
    iconBg: 'bg-[#F3F1F8]',
    iconText: 'text-[#7D71A8]',
    bar: 'bg-[#7D71A8]',
    softText: 'text-[#7D71A8]',
  },
  slate: {
    label: 'Pizarra serena',
    swatch: '#52687A',
    iconBg: 'bg-[#EFF3F6]',
    iconText: 'text-[#52687A]',
    bar: 'bg-[#52687A]',
    softText: 'text-[#52687A]',
  },
  sand: {
    label: 'Arena cálida',
    swatch: '#8A755C',
    iconBg: 'bg-[#F6F2EC]',
    iconText: 'text-[#8A755C]',
    bar: 'bg-[#8A755C]',
    softText: 'text-[#8A755C]',
  },
};

export const TONE_OPTIONS: AccentTone[] = ['petrol', 'sage', 'lavender', 'slate', 'sand'];

export const SPACE_ICON_OPTIONS: { name: SpaceIconName; label: string }[] = [
  { name: 'Briefcase', label: 'Trabajo' },
  { name: 'Compass', label: 'Proyectos' },
  { name: 'Heart', label: 'Bienestar' },
  { name: 'Users', label: 'Relaciones' },
  { name: 'Wallet', label: 'Finanzas' },
  { name: 'BookOpen', label: 'Aprendizaje' },
  { name: 'Sun', label: 'Disfrute' },
  { name: 'Home', label: 'Hogar' },
  { name: 'Plane', label: 'Viajes' },
  { name: 'Sprout', label: 'Crecimiento' },
  { name: 'Music', label: 'Creatividad' },
  { name: 'Coffee', label: 'Pausa' },
];

export function SpaceIcon({
  name,
  className = 'w-4 h-4',
}: {
  name: SpaceIconName;
  className?: string;
}) {
  switch (name) {
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Heart':
      return <Heart className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'Wallet':
      return <Wallet className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Sun':
      return <Sun className={className} />;
    case 'Home':
      return <Home className={className} />;
    case 'Plane':
      return <Plane className={className} />;
    case 'Sprout':
      return <Sprout className={className} />;
    case 'Music':
      return <Music className={className} />;
    case 'Coffee':
      return <Coffee className={className} />;
    default:
      return <Compass className={className} />;
  }
}
