import { NavLink, Outlet } from 'react-router-dom'
import { Dumbbell, LayoutDashboard, LogOut, Users } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/', label: 'Дашборд', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Пользователи', icon: Users, end: false },
  { to: '/workouts', label: 'Тренировки', icon: Dumbbell, end: false },
]

export function AdminLayout() {
  const { logout } = useAuth()

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r bg-card p-4">
        <div className="mb-6 flex items-center gap-2 px-2 text-lg font-bold">
          <Dumbbell className="size-5" /> FitNow Admin
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <Button variant="ghost" className="justify-start" onClick={logout}>
          <LogOut className="size-4" /> Выйти
        </Button>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
