import { type ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NEED } from '../access'
import { useSettings } from '../db/useSettings'
import { atLeast } from '../db/users'
import { NAV } from '../nav'
import { useSession } from '../session'
import { SyncBadge } from '../sync/runner'
import { useRoute } from './router'

// Sub-screens light up their parent in the sidebar.
const PARENT: Record<string, string> = { count: 'stock', ct: 'reports', return: 'sales' }

const itemCls = 'flex min-h-11 items-center gap-3 border-l-4 px-4 text-base transition'
const idle = 'border-transparent text-white/90 hover:bg-blue-700'
const active = 'border-white bg-blue-800 font-bold text-white'

/** App frame for a logged-in user: top bar + blue sidebar (a drawer on small screens). */
export function Shell({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const settings = useSettings()
  const { user, lock } = useSession()
  const { path } = useRoute()
  const [open, setOpen] = useState(false)
  const cur = PARENT[path[0] ?? ''] ?? path[0] ?? ''
  useEffect(() => setOpen(false), [cur])

  const link = (route: string, icon: string, label: string) => (
    <a key={route} href={`#/${route}`} className={`${itemCls} ${cur === route ? active : idle}`}>
      <span aria-hidden className="w-6 text-center">
        {icon}
      </span>
      {t(label)}
    </a>
  )

  return (
    <div className="flex h-dvh flex-col print:block print:h-auto">
      <header className="no-print flex h-14 shrink-0 items-center gap-2 bg-blue-800 px-2 text-white shadow-md sm:px-3">
        <button className="min-h-10 rounded px-3 text-2xl hover:bg-blue-900 lg:hidden" aria-label={t('sell.menu')} aria-expanded={open} onClick={() => setOpen(!open)}>
          ☰
        </button>
        <span aria-hidden className="text-2xl">
          🧵
        </span>
        <span className="min-w-0 flex-1 truncate text-lg font-bold">
          {settings?.shopName} <span className="font-normal text-blue-200">POS</span>
        </span>
        <SyncBadge always />
        <span className="hidden items-center gap-2 px-2 text-base sm:flex">
          <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            👤
          </span>
          {user?.name}
        </span>
        <button className="min-h-10 rounded px-3 text-base hover:bg-blue-900" aria-label={t('lock.lock')} onClick={lock}>
          🔒<span className="hidden sm:inline"> {t('lock.lock')}</span>
        </button>
      </header>
      <div className="relative flex min-h-0 flex-1 print:block">
        {open && <div className="no-print fixed inset-0 top-14 z-20 bg-slate-950/40 lg:hidden" onClick={() => setOpen(false)} />}
        <nav
          className={`no-print fixed top-14 bottom-0 left-0 z-30 w-64 shrink-0 overflow-y-auto bg-blue-600 pb-4 shadow-lg transition-transform lg:static lg:translate-x-0 lg:shadow-none ${open ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="py-2">
            {link('menu', '🏠', 'sell.menu')}
            {link('', '🛒', 'nav.sell')}
          </div>
          {NAV.map(([group, items]) => {
            const mine = items.filter(([route]) => atLeast(user, NEED[route]))
            if (!mine.length) return null
            return (
              <div key={group}>
                <div className="bg-blue-500 px-4 py-1.5 text-sm font-bold tracking-wide text-white uppercase">{t(group)}</div>
                <div className="py-1">{mine.map(([route, icon, label]) => link(route, icon, label))}</div>
              </div>
            )
          })}
          <div className="border-t border-blue-500 pt-1">
            <a href="guide.html" target="_blank" className={`${itemCls} ${idle}`}>
              <span aria-hidden className="w-6 text-center">
                📖
              </span>
              {t('home.guide')}
            </a>
          </div>
        </nav>
        <main className="min-w-0 flex-1 overflow-y-auto print:overflow-visible">{children}</main>
      </div>
    </div>
  )
}
