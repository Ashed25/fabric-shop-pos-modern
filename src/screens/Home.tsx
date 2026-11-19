import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { hasDemo, loadDemo, removeDemo } from '../db/demo'
import { setSetting } from '../db/settings'
import { useSettings } from '../db/useSettings'
import { Btn, Screen } from '../ui/kit'
import { go } from '../ui/router'
import { CtWarning } from './Reports'
import { NEED } from '../access'
import { atLeast } from '../db/users'
import { useSession } from '../session'
import { SyncBadge } from '../sync/runner'

// Icon chip tint per group: money, goods, setup.
const MONEY = 'bg-blue-100 ring-blue-200'
const GOODS = 'bg-green-100 ring-green-200'
const SETUP = 'bg-slate-100 ring-slate-200'

const TILES = [
  ['today', '📊', 'today.title', MONEY],
  ['sales', '🧾', 'history.title', MONEY],
  ['debts', '📒', 'debt.title', MONEY],
  ['reports', '📈', 'reports.title', MONEY],
  ['stock', '📦', 'stock.title', GOODS],
  ['products', '👕', 'products.title', GOODS],
  ['labels', '🏷', 'labels.title', GOODS],
  ['tagging', '✅', 'tagging.title', GOODS],
  ['import', '📥', 'import.title', GOODS],
  ['units', '📏', 'units.title', SETUP],
  ['scanner', '🔍', 'scanner.title', SETUP],
  ['backup', '💾', 'backup.title', SETUP],
  ['cloud', '☁️', 'cloud.title', SETUP],
  ['settings', '⚙️', 'settings.title', SETUP],
  ['users', '👥', 'users.title', SETUP],
  ['audit', '📜', 'audit.title', SETUP],
] as const

const tileCls =
  'group flex min-h-28 items-center gap-3 rounded-2xl bg-white p-3.5 text-left text-base font-bold shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-blue-200 active:translate-y-0 sm:flex-col sm:items-start sm:justify-between sm:p-4'
const chipCls = 'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ring-1 transition group-hover:scale-105'

export function Home() {
  const { t } = useTranslation()
  const settings = useSettings()
  const { user, lock } = useSession()
  const hasDemoData = useLiveQuery(hasDemo, [])
  const [busy, setBusy] = useState(false)
  if (!settings || hasDemoData === undefined) return null
  const run = (fn: () => Promise<unknown>) => async () => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }
  return (
    <Screen
      title={`${t('sell.menu')} — ${user?.name ?? ''}`}
      back="#/"
      actions={
        <>
          <Btn variant="plain" className="min-h-10 px-3 text-sm sm:text-base" onClick={() => setSetting('largeText', !settings.largeText)}>
            {t(settings.largeText ? 'home.normalText' : 'home.largeText')}
          </Btn>
          <Btn variant="plain" className="min-h-10 px-3 text-sm sm:text-base" onClick={() => setSetting('lang', settings.lang === 'my' ? 'en' : 'my')}>
            {t('lang.toggle')}
          </Btn>
          <SyncBadge always />
          <Btn variant="plain" className="min-h-10 px-3 text-sm sm:text-base" aria-label={t('lock.lock')} onClick={lock}>
            🔒<span className="hidden sm:inline"> {t('lock.lock')}</span>
          </Btn>
        </>
      }
    >
      <section className="relative mx-auto mb-5 max-w-5xl overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-blue-700 to-blue-950 p-6 text-white shadow-xl shadow-blue-900/20 sm:p-8">
        <div aria-hidden className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-wide text-blue-200 uppercase">{new Date().toLocaleDateString(settings.lang === 'my' ? 'my-MM' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p className="truncate text-3xl font-bold sm:text-4xl">{settings.shopName}</p>
            <p className="text-lg text-blue-100">👤 {user?.name}</p>
          </div>
          <button className="rounded-2xl bg-white px-6 text-lg font-bold text-blue-800 shadow-lg transition hover:bg-blue-50 active:scale-[0.97]" onClick={() => go('#/')}>
            🛒 {t('lock.toSell')}
          </button>
        </div>
      </section>
      <div className="mx-auto mb-5 max-w-5xl space-y-3">
        {settings.deviceRole === 'viewer' && <p className="rounded-xl bg-sky-100 p-3 text-base">👁 {t('cloud.viewerBanner')}</p>}
        {atLeast(user, 'owner') && Date.now() - settings.lastBackupAt > 86_400_000 && (
          <button className="block w-full rounded-xl bg-amber-100 p-3 text-left text-base" onClick={() => go('#/backup')} data-testid="backup-reminder">
            💾 {t(settings.lastBackupAt ? 'backup.reminder' : 'backup.reminderNever', { days: Math.floor((Date.now() - settings.lastBackupAt) / 86_400_000) })}
          </button>
        )}
        <CtWarning />
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {TILES.filter(([route]) => atLeast(user, NEED[route])).map(([route, icon, label, tint]) => (
          <button key={route} className={tileCls} onClick={() => go(`#/${route}`)}>
            <span className={`${chipCls} ${tint}`} aria-hidden>
              {icon}
            </span>
            {t(label)}
          </button>
        ))}
        <a href="guide.html" target="_blank" className={tileCls}>
          <span className={`${chipCls} bg-amber-100 ring-amber-200`} aria-hidden>
            📖
          </span>
          {t('home.guide')}
        </a>
      </div>
      {atLeast(user, 'owner') && (
      <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-dashed border-amber-300 bg-amber-50/80 p-5">
        <p className="mb-3 text-base">{t(hasDemoData ? 'demo.loadedHint' : 'demo.hint')}</p>
        {hasDemoData ? (
          <Btn variant="danger" disabled={busy} onClick={run(removeDemo)}>
            {t('demo.remove')}
          </Btn>
        ) : (
          <Btn disabled={busy} onClick={run(loadDemo)}>
            {t('demo.load')}
          </Btn>
        )}
      </div>
      )}
    </Screen>
  )
}
