import { ChevronRight, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

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
  children?: ReactNode;
}

const iconColorClasses = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  accent: 'bg-accent/10 text-accent',
  info: 'bg-info/10 text-info',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  neutral: 'bg-base-content/10',
};

const hoverColorClasses = {
  accent: 'hover:bg-accent/10 active:bg-accent/20',
  info: 'hover:bg-info/10 active:bg-info/20',
  warning: 'hover:bg-warning/10 active:bg-warning/20',
  error: 'hover:bg-error/10 active:bg-error/20',
  base: 'hover:bg-base-300/50 active:bg-base-300',
};

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
  children,
}: SettingItemProps) {
  const isClickable = !!onClick;
  const Container = isClickable ? 'button' : 'div';
  const containerProps = isClickable
    ? {
        onClick,
        className: `w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${hoverColorClasses[hoverColor]}`,
      }
    : {
        className: 'flex items-center gap-4 p-4 rounded-xl',
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
