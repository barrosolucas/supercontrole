'use client'

import { useMemo, useState } from 'react'
import { Calculator, Gift, TrendingUp, Info, Plus, Trash2 } from 'lucide-react'
import { calcularDutching, calcularExtracaoFreebet, brl, pct } from '@/lib/calculos'

type Aba = 'freebet' | 'duplo-green'

export default function CalculadoraPage() {
  const [aba, setAba] = useState<Aba>('freebet')

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 animate-fadeIn">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">Ferramentas</p>
        <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Calculadora 3-way</h1>
        <p className="mt-2 text-slate-400">Cobertura em casas normais, sem exchange. Lucro igual em qualquer resultado.</p>

        {/* abas */}
        <div className="mt-6 flex gap-2 rounded-xl border border-white/10 bg-white/5 p-1.5">
          <button onClick={() => setAba('freebet')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              aba === 'freebet' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}>
            <Gift size={17} /> Extração de Freebet
          </button>
          <button onClick={() => setAba('duplo-green')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              aba === 'duplo-green' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}>
            <TrendingUp size={17} /> Duplo Green
          </button>
        </div>

        <div className="mt-6">
          {aba === 'freebet' ? <AbaFreebet /> : <AbaDuploGreen />}
        </div>
      </div>
    </div>
  )
}

// ---------- Extração de Freebet ----------
function AbaFreebet() {
  const [valorFB, setValorFB] = useState('')
  const [oddFB, setOddFB] = useState('')
  const [odd2, setOdd2] = useState('')
  const [odd3, setOdd3] = useState('')

  const res = useMemo(() => {
    const v = parseFloat(valorFB) || 0
    const ofb = parseFloat(oddFB) || 0
    const coberturas = [parseFloat(odd2) || 0, parseFloat(odd3) || 0]
    return calcularExtracaoFreebet(v, ofb, coberturas)
  }, [valorFB, oddFB, odd2, odd3])

  const temResultado = res.lucroGarantido !== 0 || res.investimento !== 0

  return (
    <div className="animate-slideUp space-y-5">
      <Card>
        <p className="mb-4 flex items-center gap-2 text-sm text-slate-400">
          <Info size={15} className="text-cyan-400" />
          A freebet vai na perna 1 (não retorna o valor apostado). As pernas 2 e 3 você cobre com dinheiro real.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Valor da freebet (R$)" valor={valorFB} onChange={setValorFB} placeholder="50,00" />
          <Campo label="Odd da perna 1 (freebet)" valor={oddFB} onChange={setOddFB} placeholder="4.00" />
          <Campo label="Odd da perna 2 (cobrir)" valor={odd2} onChange={setOdd2} placeholder="3.00" />
          <Campo label="Odd da perna 3 (cobrir)" valor={odd3} onChange={setOdd3} placeholder="3.20" />
        </div>
      </Card>

      {temResultado && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-white">Resultado</h3>
          <div className="space-y-3">
            <Linha label="Apostar na perna 2" valor={brl(res.stakesCobertura[0])} destaque />
            <Linha label="Apostar na perna 3" valor={brl(res.stakesCobertura[1])} destaque />
            <div className="my-3 h-px bg-white/10" />
            <Linha label="Investimento real (cobertura)" valor={brl(res.investimento)} />
            <Linha label="Lucro garantido" valor={brl(res.lucroGarantido)} verde={res.lucroGarantido > 0} />
            <Linha label="Extração da freebet" valor={pct(res.pctExtracao)} verde={res.pctExtracao > 0} />
          </div>
          <p className="mt-4 rounded-lg border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-500">
            Extração típica fica entre 60% e 80%. Acima disso, o jogo tem odds muito boas — confira antes de apostar.
          </p>
        </Card>
      )}
    </div>
  )
}

// ---------- Duplo Green (Dutching) ----------
function AbaDuploGreen() {
  const [total, setTotal] = useState('')
  const [odds, setOdds] = useState<string[]>(['', '', ''])

  const res = useMemo(() => {
    const t = parseFloat(total) || 0
    const o = odds.map((x) => parseFloat(x) || 0)
    return calcularDutching(t, o)
  }, [total, odds])

  const temResultado = res.retorno > 0

  function setOdd(i: number, v: string) {
    setOdds((prev) => prev.map((x, idx) => (idx === i ? v : x)))
  }
  function addPerna() {
    if (odds.length < 5) setOdds((p) => [...p, ''])
  }
  function removePerna(i: number) {
    if (odds.length > 2) setOdds((p) => p.filter((_, idx) => idx !== i))
  }

  return (
    <div className="animate-slideUp space-y-5">
      <Card>
        <p className="mb-4 flex items-center gap-2 text-sm text-slate-400">
          <Info size={15} className="text-cyan-400" />
          Divide o valor total entre as pernas para retorno igual em qualquer resultado.
        </p>
        <div className="mb-4">
          <Campo label="Valor total a investir (R$)" valor={total} onChange={setTotal} placeholder="100,00" />
        </div>
        <div className="space-y-3">
          {odds.map((o, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1">
                <Campo label={`Odd da perna ${i + 1}`} valor={o} onChange={(v) => setOdd(i, v)} placeholder="3.00" />
              </div>
              {odds.length > 2 && (
                <button onClick={() => removePerna(i)} className="mb-0.5 rounded-lg border border-transparent p-2.5 text-red-400 transition-colors hover:border-red-400/40 hover:bg-red-400/10" aria-label="Remover perna">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        {odds.length < 5 && (
          <button onClick={addPerna} className="mt-3 flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300">
            <Plus size={16} /> Adicionar perna
          </button>
        )}
      </Card>

      {temResultado && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-white">Resultado</h3>
          <div className="space-y-3">
            {res.stakes.map((s, i) =>
              odds[i] && parseFloat(odds[i]) > 1 ? (
                <Linha key={i} label={`Apostar na perna ${i + 1}`} valor={brl(s)} destaque />
              ) : null
            )}
            <div className="my-3 h-px bg-white/10" />
            <Linha label="Retorno (qualquer resultado)" valor={brl(res.retorno)} />
            <Linha label="Lucro" valor={brl(res.lucro)} verde={res.lucro > 0} vermelho={res.lucro < 0} />
            <Linha label="ROI" valor={pct(res.roi)} verde={res.roi > 0} vermelho={res.roi < 0} />
          </div>
          {!res.ehSurebet && res.lucro < 0 && (
            <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
              Estas odds dão prejuízo (não é surebet). Só cobre assim se for parte de uma operação com freebet ou super odd.
            </p>
          )}
          {res.ehSurebet && (
            <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              Surebet detectada — lucro garantido independente do resultado.
            </p>
          )}
        </Card>
      )}
    </div>
  )
}

// ---------- componentes auxiliares ----------
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md md:p-6">{children}</div>
}

function Campo({ label, valor, onChange, placeholder }: { label: string; valor: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-slate-400">{label}</label>
      <input
        type="number" inputMode="decimal" step="0.01" value={valor}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-white outline-none transition-colors focus:border-cyan-400"
      />
    </div>
  )
}

function Linha({ label, valor, destaque, verde, vermelho }: { label: string; valor: string; destaque?: boolean; verde?: boolean; vermelho?: boolean }) {
  const cor = verde ? 'text-emerald-400' : vermelho ? 'text-red-400' : destaque ? 'text-cyan-300' : 'text-white'
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`font-semibold ${cor} ${destaque ? 'text-lg' : ''}`}>{valor}</span>
    </div>
  )
}
