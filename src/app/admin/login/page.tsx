import type { Metadata } from 'next'
import { loginAdmin } from '@/actions/admin'
import { SubmitButton } from '@/components/submit-button'
import { demoNursery, demoStaff } from '@/lib/demo'
import { tx } from '@/lib/text'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: '員工登入',
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams
  const showDemo = process.env.NODE_ENV !== 'production'
  return (
    <div className="min-h-screen bg-paper px-4 py-10 text-ink">
      <form action={loginAdmin} className="mx-auto max-w-md space-y-4">
        <h1 className="text-3xl text-yinyou-dark">{tx('admin.title')}</h1>
        <label className="block">
          <span className="lbl">{tx('admin.email')}</span>
          <input name="email" type="email" required autoComplete="username" className="field" />
        </label>
        <label className="block">
          <span className="lbl">{tx('admin.password')}</span>
          <input name="password" type="password" required autoComplete="current-password" className="field" />
        </label>
        {query.error === 'bad' ? (
          <p role="alert" className="text-terra">
            {tx('admin.errorLogin')}
          </p>
        ) : null}
        {query.error === 'locked' ? (
          <p role="alert" className="text-terra">
            {tx('admin.errorLocked')}
          </p>
        ) : null}
        <SubmitButton pendingLabel={tx('common.pleaseWait')}>{tx('admin.login')}</SubmitButton>
        {showDemo ? (
          <aside className="card bg-cream text-[16px]">
            <p>{tx('admin.demoHint')}</p>
            <p>
              {tx('admin.roleStaff')}：{demoStaff.email}　{demoStaff.password}
            </p>
            <p>
              {tx('admin.roleNursery')}：{demoNursery.email}　{demoNursery.password}
            </p>
          </aside>
        ) : null}
      </form>
    </div>
  )
}
