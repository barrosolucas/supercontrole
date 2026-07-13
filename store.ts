'use client'

import Link from 'next/link'
import { LayoutDashboard, ListChecks, Calculator, Gift, PiggyBank, Wallet, ArrowRight } from 'lucide-react'

const cards = [
  { href: '/calculadora', titulo: 'Calculadora', desc: 'Extração de freebet e duplo green 3-way. Calcula quanto apostar em cada casa para lucro garantido.', icon: Calculator, cor: 'from-cyan-400/20 to-blue-500/20', tint: 'text-cyan-400' },
  { href: '/operacoes', titulo: 'Operações', desc: 'Registre e acompanhe cada operação: duplo green, freebet, super odd e bingo. Abertas e finalizadas.', icon: ListChecks, cor: 'from-emerald-400/20 to-teal-500/20', tint: 'text-emerald-400' },
  { href: '/dashboard', titulo: 'Dashboard', desc: 'Lucro total, ROI, evolução mensal e desempenho por casa. Sua operação em números.', icon: LayoutDashboard, cor: 'from-amber-400/20 to-orange-500/20', tint: 'text-amber-400' },
  { href: '/freebets', titulo: 'Freebets', desc: 'Controle de freebets ativas com alerta de validade. Nunca perca o prazo de uma freebet.', icon: Gift, cor: 'from-pink-400/20 to-rose-500/20', tint: 'text-pink-400' },
  { href: '/banca', titulo: 'Divisão de Banca', desc: 'Configure sua banca e o percentual por operação. Saiba exatamente quanto alocar em cada entrada.', icon: PiggyBank, cor: 'from-violet-400/20 to-purple-500/20', tint: 'text-violet-400' },
  { href: '/conciliacao', titulo: 'Conciliação', desc: 'Gerencie o saldo de todas as casas. Adicione, edite e reconcilie sua banca em tempo real.', icon: Wallet, cor: 'from-sky-400/20 to-indigo-500/20', tint: 'text-sky-400' },
]

export default function Home() {
  return (
    <div className="min-h-screen px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center animate-fadeIn">
          <div className="mb-5 inline-block rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5">
            <p className="text-sm font-medium text-cyan-300">Gestão de banca profissional</p>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">
            Controle<span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> PRO</span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-400">
            Extração de freebet, duplo green, divisão de banca e controle total das suas operações — tudo em um lugar.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => {
            const Icon = c.icon
            return (
              <Link key={c.href} href={c.href}
                className="group animate-slideUp rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:border-cyan-400/40 hover:bg-white/[0.07]"
                style={{ animationDelay: `${i * 0.06}s` }}>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${c.cor}`}>
                  <Icon className={c.tint} size={24} />
                </div>
                <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-white">
                  {c.titulo}
                  <ArrowRight size={16} className="opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-cyan-400" />
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">{c.desc}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
