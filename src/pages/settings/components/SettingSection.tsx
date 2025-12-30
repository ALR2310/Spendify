import { ReactNode } from 'react';

interface SettingSectionProps {
  title: string;
  children: ReactNode;
}

export default function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-base text-base-content/80 px-1">{title}</p>
      <div className="card shadow-sm bg-base-200 rounded-2xl overflow-hidden">{children}</div>
    </div>
  );
}
