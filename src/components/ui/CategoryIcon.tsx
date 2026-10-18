import React from 'react';
import { Zap, Droplets, Monitor, Sparkles, Wrench } from 'lucide-react';
import { ReportCategory } from '@/types/database';

interface CategoryIconProps {
  category: ReportCategory;
  className?: string;
}

export function CategoryIcon({ category, className = 'w-4 h-4' }: CategoryIconProps) {
  switch (category) {
    case 'electrical':
      return <Zap className={className} />;
    case 'plumbing':
      return <Droplets className={className} />;
    case 'classroom_equipment':
      return <Monitor className={className} />;
    case 'cleanliness':
      return <Sparkles className={className} />;
    case 'other':
    default:
      return <Wrench className={className} />;
  }
}
