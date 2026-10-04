import { Link } from 'react-router-dom'

import { Card, EmptyState } from '@/components/common'

export function NotFoundPage() {
  return (
    <Card>
      <EmptyState
        icon="404"
        title="That screen does not exist"
        message="The address you followed is not part of the Bengaluru Civic Brain. Nothing has gone wrong with the civic data."
        action={
          <Link
            to="/"
            className="inline-flex h-8 items-center rounded-md border border-line-strong bg-ink-800 px-2.5 text-xs font-semibold text-mist-100 transition-colors hover:border-cyan-signal/50 hover:text-cyan-signal"
          >
            Back to overview
          </Link>
        }
      />
    </Card>
  )
}

export default NotFoundPage