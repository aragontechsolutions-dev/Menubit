import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: 'Usuarios', icon: Users },
];

export function Sidebar() {
  const { tenant } = useAuth();

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-card">
      <div className="flex items-center gap-2 px-6 py-5">
        <Store className="h-6 w-6 text-primary" />
        <div>
          <p className="text-lg font-bold leading-none">Menubit</p>
          <p className="text-xs text-muted-foreground">{tenant?.name ?? '—'}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t px-6 py-3 text-xs text-muted-foreground">
        Plan {tenant?.plan ?? 'STARTER'}
      </div>
    </aside>
  );
}
