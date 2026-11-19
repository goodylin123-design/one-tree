import { tx } from '@/lib/text'

export default function Loading() {
  return <p className="px-5 py-16 text-center">{tx('common.pleaseWait')}</p>
}
