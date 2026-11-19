import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export async function GuestFrame({ children, home = false }: { children: React.ReactNode; home?: boolean }) {
  const brand = await getTranslations('brand')
  const footer = await getTranslations('footer')
  const common = await getTranslations('common')
  const phone = footer('phone').replace(/\s/g, '')
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="screen">
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:bg-white focus:p-3">
          {common('skip')}
        </a>
        {home ? null : (
          <header className="no-print flex items-center gap-3 px-5 pt-5">
            <Link href="/">
              <img src="/assets/logo/logo-green-lowres.png" alt={brand('name')} className="h-14 w-auto rounded-[12px]" />
            </Link>
          </header>
        )}
        <main id="content" className="flex-1">
          {children}
        </main>
        <footer className="no-print space-y-2 px-5 py-8 text-[16px]">
          <p className="kai text-yinyou-dark">{footer('brand')}</p>
          <p>{footer('address')}</p>
          <p>
            <a className="text-yinyou-dark underline" href={`tel:${phone}`}>
              {footer('phone')}
            </a>
          </p>
          <p>
            <a className="text-yinyou-dark underline" href={`mailto:${footer('email')}`}>
              {footer('email')}
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
