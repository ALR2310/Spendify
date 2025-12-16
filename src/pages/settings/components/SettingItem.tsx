import { ChevronRight, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

import { hoverColorClasses, iconColorClasses } from '@/common/constants/colorClasses';

interface SettingItemProps {
  icon: LucideIcon;
  iconColor?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'neutral';
  title: string;
  description?: string;
  action?: ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  showBorder?: boolean;
  hoverColor?: 'accent' | 'info' | 'warning' | 'error' | 'base';
  className?: string;
  children?: ReactNode;
}

export default function SettingItem({
  icon: Icon,
  iconColor = 'accent',
  title,
  description,
  action,
  onClick,
  showChevron = false,
  showBorder = false,
  hoverColor = 'accent',
  className = '',
  children,
}: SettingItemProps) {
  const isClickable = !!onClick;
  const Container = isClickable ? 'button' : 'label';
  const containerProps = isClickable
    ? {
        onClick,
        className: `w-full flex items-center gap-4 p-4 rounded-xl transition-colors cursor-pointer ${className} ${hoverColorClasses[hoverColor]}`,
      }
    : {
        className: `flex items-center gap-4 p-4 rounded-xl ${className}`,
      };

  return (
    <div className={`${showBorder ? 'border-t border-base-300/50' : ''} p-1`}>
      <Container {...containerProps}>
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-xl ${iconColorClasses[iconColor]} ${iconColor === 'neutral' ? 'opacity-60' : ''}`}
        >
          <Icon size={20} className={iconColor === 'neutral' ? 'opacity-60' : ''} />
        </div>
        <div className={`flex flex-col flex-1 ${isClickable ? 'text-left' : ''}`}>
          <span className="font-semibold text-sm">{title}</span>
          {description && <span className="text-xs opacity-60">{description}</span>}
          {children}
        </div>
        {action}
        {showChevron && !action && <ChevronRight size={18} className="opacity-40" />}
      </Container>
    </div>
  );
}
