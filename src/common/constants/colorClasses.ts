export const iconColorClasses = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  accent: 'bg-accent/10 text-accent',
  info: 'bg-info/10 text-info',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  neutral: 'bg-base-content/10',
} as const;

export const hoverColorClasses = {
  primary: 'hover:bg-primary/10 active:bg-primary/20',
  secondary: 'hover:bg-secondary/10 active:bg-secondary/20',
  accent: 'hover:bg-accent/10 active:bg-accent/20',
  info: 'hover:bg-info/10 active:bg-info/20',
  success: 'hover:bg-success/10 active:bg-success/20',
  warning: 'hover:bg-warning/10 active:bg-warning/20',
  error: 'hover:bg-error/10 active:bg-error/20',
  base: 'hover:bg-base-300/50 active:bg-base-300',
} as const;
