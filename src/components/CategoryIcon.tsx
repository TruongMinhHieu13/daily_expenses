import React from 'react';
import {
  Briefcase,
  Gift,
  TrendingUp,
  Laptop,
  PiggyBank,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Home,
  Gamepad2,
  HeartPulse,
  Users,
  UserCheck,
  Tag,
  Coffee,
  Fuel,
  Plane,
  GraduationCap,
  Smartphone,
  Film,
  Dumbbell,
  Music,
  Sparkles,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Briefcase,
  Gift,
  TrendingUp,
  Laptop,
  PiggyBank,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Home,
  Gamepad2,
  HeartPulse,
  Users,
  UserCheck,
  Tag,
  Coffee,
  Fuel,
  Plane,
  GraduationCap,
  Smartphone,
  Film,
  Dumbbell,
  Music,
  Sparkles,
};

interface CategoryIconProps {
  iconName: string;
  className?: string;
  color?: string;
  bgColor?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  className = 'w-5 h-5',
  color,
  bgColor,
  size = 20,
}) => {
  const IconComponent = ICON_MAP[iconName] || HelpCircle;

  if (bgColor) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl shrink-0 transition-transform ${className}`}
        style={{ backgroundColor: bgColor }}
      >
        <IconComponent size={size} color={color || '#FFFFFF'} strokeWidth={2.2} />
      </div>
    );
  }

  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      strokeWidth={2.2}
    />
  );
};

export default CategoryIcon;
