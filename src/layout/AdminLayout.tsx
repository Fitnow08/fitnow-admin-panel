import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  ClipboardList,
  Dumbbell,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Moon,
  Sun,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { useTheme } from '@/shared/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'

const nav = [
  { to: '/', label: 'Дашборд', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Пользователи', icon: Users, end: false },
  { to: '/workouts', label: 'Тренировки', icon: Dumbbell, end: false },
  { to: '/programs', label: 'Программы', icon: ClipboardList, end: false },
  { to: '/exercises', label: 'Упражнения', icon: ListChecks, end: false },
]

export function AdminLayout() {
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Затемнение под выезжающим меню — только на мобилке */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          'flex w-60 flex-col border-r bg-card p-4',
          // Мобилка: фиксированный выезжающий drawer
          'fixed inset-y-0 left-0 z-40 transition-transform md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <span className="flex items-center gap-2 text-lg font-bold">
            <Dumbbell className="size-5" /> FitNow Admin
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
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
        <Button variant="ghost" className="justify-start" onClick={toggleTheme}>
          {theme === 'dark' ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
          {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        </Button>
        <Button variant="ghost" className="justify-start" onClick={logout}>
          <LogOut className="size-4" /> Выйти
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Шапка с кнопкой-гамбургером — только на мобилке */}
        <header className="flex items-center gap-2 border-b bg-card p-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Menu className="size-4" />
          </Button>
          <span className="flex items-center gap-2 font-bold">
            <Dumbbell className="size-5" /> FitNow Admin
          </span>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
