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
import { NAV } from '../nav'

// Icon chip tint per sidebar group: money, goods, admin.
const TINT = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-slate-200 text-slate-700']

const tileCls =
  'group flex min-h-24 items-center gap-3 rounded-lg border border-slate-200 bg-white p-3.5 text-left text-base font-bold shadow-sm transition hover:border-blue-400 hover:shadow-md'
const chipCls = 'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-2xl'

export function Home() {
  const { t } = useTranslation()
  const settings = useSettings()
  const { user } = useSession()
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
        </>
      }
    >
      <section className="mx-auto mb-5 flex max-w-5xl flex-wrap items-center justify-between gap-4 rounded-lg border-l-8 border-blue-800 bg-blue-600 p-5 text-white shadow-sm sm:p-6">
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-wide text-blue-100 uppercase">{new Date().toLocaleDateString(settings.lang === 'my' ? 'my-MM' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <p className="truncate text-3xl font-bold">{settings.shopName}</p>
          <p className="text-lg text-blue-100">👤 {user?.name}</p>
        </div>
        <button className="rounded-lg bg-white px-6 text-lg font-bold text-blue-700 shadow-sm transition hover:bg-blue-50" onClick={() => go('#/')}>
          🛒 {t('lock.toSell')}
        </button>
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
        {NAV.flatMap(([, items], g) =>
          items
            .filter(([route]) => atLeast(user, NEED[route]))
            .map(([route, icon, label]) => (
              <button key={route} className={tileCls} onClick={() => go(`#/${route}`)}>
                <span className={`${chipCls} ${TINT[g]}`} aria-hidden>
                  {icon}
                </span>
                {t(label)}
              </button>
            )),
        )}
        <a href="guide.html" target="_blank" className={tileCls}>
          <span className={`${chipCls} bg-amber-100`} aria-hidden>
            📖
          </span>
          {t('home.guide')}
        </a>
      </div>
      {atLeast(user, 'owner') && (
      <div className="mx-auto mt-6 max-w-5xl rounded-lg border border-dashed border-amber-300 bg-amber-50 p-5">
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
