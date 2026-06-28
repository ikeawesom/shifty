'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

type ShiftResult = {
  id: string
  title: string
  orgName: string
  startsAt: string
}

type MemberResult = {
  id: string
  displayName: string | null
  role: string
  realName?: string | null
}

export default function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ shifts: ShiftResult[]; members: MemberResult[] }>({ shifts: [], members: [] })
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setFocused(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const search = useCallback((q: string) => {
    if (q.length < 2) {
      setResults({ shifts: [], members: [] })
      setOpen(false)
      return
    }
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data)
        setOpen(true)
      })
      .catch(() => {})
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(val), 300)
  }

  function close() {
    setOpen(false)
    setFocused(false)
    setQuery('')
    setResults({ shifts: [], members: [] })
  }

  const noResults = results.shifts.length === 0 && results.members.length === 0

  return (
    <div ref={ref} className="relative flex-1 w-full">
      <div
        className="flex items-center gap-2 bg-muted/60 rounded-full px-4 py-2 cursor-text"
        onClick={() => { setFocused(true); setTimeout(() => inputRef.current?.focus(), 0) }}
      >
        <Search className="size-4 text-muted-foreground shrink-0" />
        {focused ? (
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            placeholder="Search shifts, members..."
            className="text-sm bg-transparent outline-none flex-1 placeholder:text-muted-foreground"
            autoFocus
          />
        ) : (
          <span className="text-sm text-muted-foreground">Search shifts, members...</span>
        )}
      </div>

      {open && (
        <div className="absolute left-0 top-12 z-50 w-full bg-white border border-border rounded-2xl shadow-lg overflow-hidden">
          {results.shifts.length > 0 && (
            <>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Shifts
              </p>
              <ul>
                {results.shifts.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/shifts/${s.id}`}
                      onClick={close}
                      className="flex flex-col px-4 py-2.5 hover:bg-muted/40 transition-colors"
                    >
                      <span className="text-sm font-medium">{s.title}</span>
                      <span className="text-xs text-muted-foreground">{s.orgName}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {results.members.length > 0 && (
            <>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Members
              </p>
              <ul>
                {results.members.map((m) => (
                  <li key={m.id}>
                    <button
                      onClick={() => { router.push('/members'); close() }}
                      className="w-full flex flex-col px-4 py-2.5 hover:bg-muted/40 transition-colors text-left"
                    >
                      <span className="text-sm font-medium">{m.displayName ?? '—'}</span>
                      {m.realName != null && (
                        <span className="text-xs text-muted-foreground">{m.realName}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {noResults && (
            <p className="text-sm text-muted-foreground text-center py-6">No results for &ldquo;{query}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  )
}
