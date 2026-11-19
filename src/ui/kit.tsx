import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { dateKey, yangonMidnight } from '../core/fy'
import { go } from './router'

const variants = {
  primary:
    'bg-linear-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-600/25 hover:brightness-110 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none',
  ok: 'bg-linear-to-br from-green-500 to-green-700 text-white shadow-md shadow-green-600/25 hover:brightness-110 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none',
  danger:
    'bg-linear-to-br from-red-500 to-red-700 text-white shadow-md shadow-red-600/25 hover:brightness-110 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none',
  plain:
    'bg-white text-slate-800 ring-1 ring-slate-200 shadow-sm hover:bg-slate-50 hover:ring-slate-300 disabled:text-slate-400 disabled:shadow-none',
}

export function Btn({
  variant = 'primary',
  className = '',
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  // Default text-xl only when the caller sets no size: two text-* classes would fight.
  const size = /\btext-(xs|sm|base|lg|xl|\dxl)\b/.test(className) ? '' : 'text-lg'
  return <button {...p} className={`rounded-xl px-4 font-bold transition duration-150 active:scale-[0.97] disabled:active:scale-100 ${size} ${variants[variant]} ${className}`} />
}

export function Screen({
  title,
  back = '#/menu',
  actions,
  children,
}: {
  title: string
  back?: string | null
  actions?: ReactNode
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="no-print sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-slate-200/70 bg-white/75 px-3 py-2 backdrop-blur-xl sm:px-5">
        {back !== null && (
          <button
            className="min-h-10 shrink-0 rounded-full bg-slate-100 px-3.5 text-base font-bold text-slate-700 transition hover:bg-slate-200"
            onClick={() => go(back)}
          >
            ← {t('common.back')}
          </button>
        )}
        <h1 className="min-w-32 flex-1 truncate text-xl font-bold text-slate-900">{title}</h1>
        {actions}
      </header>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-base font-bold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-base text-slate-600">{hint}</span>}
    </label>
  )
}

export const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-lg outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100'

export function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        className="max-h-[90dvh] w-full max-w-xl overflow-auto rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

const DAY = 86_400_000

/** ◀ [label 📅] ▶ — tapping the label opens the phone's calendar to jump straight to a date. Yangon days; no future days. */
export function DateNav(p: { label: string; value: number; onPick: (ms: number) => void; onPrev: () => void; onNext: () => void; nextDisabled: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Btn variant="plain" onClick={p.onPrev}>
        ◀
      </Btn>
      <label className="relative flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-2 text-center text-xl font-bold shadow-sm ring-1 ring-slate-200">
        <span data-testid="period">{p.label}</span>
        <span aria-hidden>📅</span>
        {/* Invisible input over the label: a tap anywhere opens the native calendar (showPicker for desktop browsers). */}
        <input
          type="date"
          aria-label="date"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          value={dateKey(p.value)}
          max={dateKey(Date.now())}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker()
            } catch {
              /* older browsers open it on tap anyway */
            }
          }}
          onChange={(e) => {
            const [y, m, d] = e.target.value.split('-').map(Number)
            if (y && m && d) p.onPick(Math.min(yangonMidnight(y, m, d), Date.now()))
          }}
        />
      </label>
      <Btn variant="plain" disabled={p.nextDisabled} onClick={p.onNext}>
        ▶
      </Btn>
    </div>
  )
}

export function DayPicker({ day, onChange }: { day: number; onChange: (ms: number) => void }) {
  return (
    <DateNav
      label={dateKey(day)}
      value={day}
      onPick={onChange}
      onPrev={() => onChange(day - DAY)}
      onNext={() => onChange(day + DAY)}
      nextDisabled={dateKey(day) === dateKey(Date.now())}
    />
  )
}

/** "12,500" / "၁၂,၅၀၀" / "" -> integer or undefined */
export function toInt(s: string): number | undefined {
  const ascii = s.replace(/[၀-၉]/g, (d) => String(d.charCodeAt(0) - 0x1040)).replace(/[,\s]/g, '')
  return /^\d+$/.test(ascii) ? Number(ascii) : undefined
}
