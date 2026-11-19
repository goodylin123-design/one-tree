import { GuestFrame } from '@/components/guest-frame'
import { Link } from '@/i18n/navigation'
import { tx } from '@/lib/text'

export default function NotFound() {
  return (
    <GuestFrame>
      <div className="space-y-4 px-5 py-10">
        <h1 className="text-3xl text-yinyou-dark">{tx('notFound.title')}</h1>
        <p>{tx('notFound.body')}</p>
        <Link href="/" className="btn-primary">
          {tx('notFound.home')}
        </Link>
      </div>
    </GuestFrame>
  )
}
