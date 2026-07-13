'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListChecks, Calculator, Gift, PiggyBank, Wallet, Menu, X } from 'lucide-react'
import { useState } from 'react'

const itens = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/operacoes', label: 'Operações', icon: ListChecks },
  { href: '/calculadora', label: 'Calculadora', icon: Calculator },
  { href: '/freebets', label: 'Freebets', icon: Gift },
  { href: '/banca', label: 'Banca', icon: PiggyBank },
  { href: '/conciliacao', label: 'Conciliação', icon: Wallet },
]

export default function Navigation() {
  const pathname = usePathname()
  const [aberto, setAberto] = useState(false)
  const ativo = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500">
              <span className="text-base font-bold text-white">C</span>
            </div>
            <span className="font-semibold text-white">Controle <span className="text-cyan-400">PRO</span></span>
          </Link>

          {/* desktop */}
          <div className="hidden items-center gap-1 lg:flex">
            {itens.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  ativo(href) ? 'border border-cyan-400/40 bg-cyan-400/20 text-cyan-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}>
                <Icon size={17} />{label}
              </Link>
            ))}
          </div>

          {/* botão mobile */}
          <button onClick={() => setAberto(!aberto)} className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden" aria-label="Menu">
            {aberto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* menu mobile */}
        {aberto && (
          <div className="grid grid-cols-2 gap-2 pb-3 lg:hidden animate-fadeIn">
            {itens.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setAberto(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  ativo(href) ? 'border border-cyan-400/40 bg-cyan-400/20 text-cyan-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}>
                <Icon size={17} />{label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
