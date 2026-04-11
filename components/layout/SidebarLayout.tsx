interface SidebarLayoutProps {
  /** Contenido principal (ocupa 2/3) */
  main: React.ReactNode;
  /** Panel lateral (ocupa 1/3) */
  sidebar: React.ReactNode;
  className?: string;
}

export function SidebarLayout({ main, sidebar, className = '' }: SidebarLayoutProps) {
  return (
    <div className={`grid grid-cols-3 gap-6 ${className}`}>
      <div className="col-span-2 flex flex-col gap-6">
        {main}
      </div>
      <div className="space-y-6">
        {sidebar}
      </div>
    </div>
  );
}