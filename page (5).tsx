'use client'

import { useEffect, useMemo, useState } from 'react'
import { PiggyBank, Info, TrendingUp } from 'lucide-react'
import { getBanca, setBanca, getCasas } from '@/lib/store'
import { brl } from '@/lib/calculos'

export default function BancaPage() {
  const [bancaTotal, setBancaTotal] = useState('')
  const [pctOp, setPctOp] = useState('5')
  const [carregado, setCarregado] = useState(false)
  const [totalCasas, setTotalCasas] = useState(0)

  useEffect(() => {
    const b = getBanca()
    setBancaTotal(b.bancaTotal ? String(b.bancaTotal) : '')
    setPctOp(String(b.pctPorOperacao || 5))
    setTotalCasas(getCasas().reduce((a, c) => a + c.saldo, 0))
    setCarregado(true)
  }, [])

  useEffect(() => {
    if (!carregado) return
    setBanca({ bancaTotal: parseFloat(bancaTotal) || 0, pctPorOperacao: parseFloat(pctOp) || 0 })
  }, [bancaTotal, pctOp, carregado])

  const total = parseFloat(bancaTotal) || 0
  const pct = parseFloat(pctOp) || 0
  const valorPorOp = (total * pct) / 100

  const faixas = useMemo(() => [2, 3, 5, 10].map((p) => ({ p, valor: (total * p) / 100 })), [total])

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 animate-fadeIn">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">Gestão</p>
        <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Divisão de Banca</h1>
        <p className="mt-2 text-slate-400">Defina sua banca e quanto arriscar por operação.</p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md animate-slideUp">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-slate-400">Banca total (R$)</label>
              <input type="number" inputMode="decimal" step="0.01" value={bancaTotal}
                onChange={(e) => setBancaTotal(e.target.value)} placeholder="10000,00"
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-white outline-none focus:border-cyan-400" />
              {totalCasas > 0 && (
                <button onClick={() => setBancaTotal(String(totalCasas))}
                  className="mt-1.5 text-xs text-cyan-400 hover:text-cyan-300">
                  Usar saldo das casas: {brl(totalCasas)}
                </button>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-400">% por operação</label>
              <input type="number" inputMode="decimal" step="0.5" value={pctOp}
                onChange={(e) => setPctOp(e.target.value)} placeholder="5"
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-white outline-none focus:border-cyan-400" />
            </div>
          </div>
        </div>

        {total > 0 && (
          <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-blue-600/5 p-6 backdrop-blur-md animate-slideUp">
            <div className="flex items-center gap-2 text-cyan-300">
              <TrendingUp size={18} />
              <span className="text-sm font-medium">Valor recomendado por operação</span>
            </div>
            <p className="mt-2 text-4xl font-bold text-white">{brl(valorPorOp)}</p>
            <p className="mt-1 text-sm text-slate-400">{pct}% de {brl(total)}</p>
          </div>
        )}

        {total > 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md animate-slideUp">
            <h3 className="mb-4 text-lg font-semibold text-white">Comparar percentuais</h3>
            <div className="space-y-2.5">
              {faixas.map(({ p, valor }) => (
                <div key={p} className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-950/40 px-4 py-3">
                  <span className="text-sm text-slate-400">{p}% da banca</span>
                  <span className="font-semibold text-white">{brl(valor)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400 animate-slideUp">
          <Info size={16} className="mt-0.5 shrink-0 text-cyan-400" />
          <p>A recomendação geral do mercado é arriscar entre 2% e 5% da banca por operação. Percentuais menores protegem contra sequências ruins; maiores aceleram o crescimento com mais risco.</p>
        </div>
      </div>
    </div>
  )
}
