'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown, Clock, X, CheckCircle2, XCircle } from 'lucide-react'
import { getOperacoes, setOperacoes, novoId, type Operacao, type TipoOperacao, type StatusOperacao } from '@/lib/store'
import { brl } from '@/lib/calculos'

const TIPOS: { v: TipoOperacao; label: string }[] = [
  { v: 'duplo-green', label: 'Duplo Green' },
  { v: 'freebet', label: 'Freebet' },
  { v: 'super-odd', label: 'Super Odd' },
  { v: 'bingo', label: 'Bingo' },
]

const rotuloTipo = (t: TipoOperacao) => TIPOS.find((x) => x.v === t)?.label ?? t

export default function OperacoesPage() {
  const [ops, setOps] = useState<Operacao[]>([])
  const [carregado, setCarregado] = useState(false)
  const [modal, setModal] = useState(false)
  const [filtro, setFiltro] = useState<'todas' | 'aberta' | 'finalizada'>('todas')

  useEffect(() => { setOps(getOperacoes()); setCarregado(true) }, [])
  useEffect(() => { if (carregado) setOperacoes(ops) }, [ops, carregado])

  const filtradas = useMemo(() => {
    if (filtro === 'aberta') return ops.filter((o) => o.status === 'aberta')
    if (filtro === 'finalizada') return ops.filter((o) => o.status !== 'aberta')
    return ops
  }, [ops, filtro])

  const stats = useMemo(() => {
    const finalizadas = ops.filter((o) => o.status !== 'aberta')
    const lucro = finalizadas.reduce((a, o) => a + o.lucro, 0)
    const abertas = ops.filter((o) => o.status === 'aberta').length
    return { lucro, abertas, total: ops.length }
  }, [ops])

  function adicionar(op: Omit<Operacao, 'id'>) {
    setOps((p) => [{ ...op, id: novoId() }, ...p])
    setModal(false)
  }
  function mudarStatus(id: string, status: StatusOperacao) {
    setOps((p) => p.map((o) => {
      if (o.id !== id) return o
      const lucro = status === 'green' ? o.retornoEsperado - o.investimento : status === 'red' ? -o.investimento : 0
      return { ...o, status, lucro }
    }))
  }
  function excluir(id: string) {
    setOps((p) => p.filter((o) => o.id !== id))
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 animate-fadeIn">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">Registro</p>
            <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Operações</h1>
          </div>
          <button onClick={() => setModal(true)}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 active:scale-95">
            <Plus size={18} className="transition-transform group-hover:rotate-90" /> Nova operação
          </button>
        </div>

        {/* stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <MiniStat label="Lucro realizado" valor={brl(stats.lucro)} verde={stats.lucro > 0} vermelho={stats.lucro < 0} />
          <MiniStat label="Abertas" valor={String(stats.abertas)} />
          <MiniStat label="Total" valor={String(stats.total)} />
        </div>

        {/* filtro */}
        <div className="mt-6 flex gap-2">
          {(['todas', 'aberta', 'finalizada'] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                filtro === f ? 'border border-cyan-400/40 bg-cyan-400/20 text-cyan-300' : 'text-slate-400 hover:bg-white/5'
              }`}>{f}</button>
          ))}
        </div>

        {/* lista */}
        <div className="mt-5 space-y-3">
          {carregado && filtradas.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
              <p className="text-slate-400">Nenhuma operação {filtro !== 'todas' ? filtro : ''} ainda. Clique em <strong>Nova operação</strong>.</p>
            </div>
          )}
          {filtradas.map((op) => (
            <CardOp key={op.id} op={op} onStatus={mudarStatus} onExcluir={excluir} />
          ))}
        </div>
      </div>

      {modal && <ModalNovaOp onFechar={() => setModal(false)} onSalvar={adicionar} />}
    </div>
  )
}

function MiniStat({ label, valor, verde, vermelho }: { label: string; valor: string; verde?: boolean; vermelho?: boolean }) {
  const cor = verde ? 'text-emerald-400' : vermelho ? 'text-red-400' : 'text-white'
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${cor}`}>{valor}</p>
    </div>
  )
}

function CardOp({ op, onStatus, onExcluir }: { op: Operacao; onStatus: (id: string, s: StatusOperacao) => void; onExcluir: (id: string) => void }) {
  const [confirmar, setConfirmar] = useState(false)
  const data = new Date(op.data).toLocaleDateString('pt-BR')
  const badge = op.status === 'aberta'
    ? { txt: 'Aberta', cls: 'border-amber-400/30 bg-amber-400/10 text-amber-300', icon: Clock }
    : op.status === 'green'
    ? { txt: 'Green', cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300', icon: TrendingUp }
    : { txt: 'Red', cls: 'border-red-400/30 bg-red-400/10 text-red-300', icon: TrendingDown }
  const BadgeIcon = badge.icon

  return (
    <div className="animate-slideUp rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-300">{rotuloTipo(op.tipo)}</span>
            <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${badge.cls}`}>
              <BadgeIcon size={12} /> {badge.txt}
            </span>
            <span className="text-xs text-slate-500">{data}</span>
          </div>
          {op.descricao && <p className="mt-2 text-white">{op.descricao}</p>}
          {op.casas.length > 0 && <p className="mt-1 text-sm text-slate-400">{op.casas.join(' · ')}</p>}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <span className="text-slate-400">Investido: <span className="text-slate-200">{brl(op.investimento)}</span></span>
            {op.status !== 'aberta' && (
              <span className="text-slate-400">Lucro: <span className={op.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}>{brl(op.lucro)}</span></span>
            )}
            {op.status === 'aberta' && (
              <span className="text-slate-400">Retorno esperado: <span className="text-cyan-300">{brl(op.retornoEsperado)}</span></span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {op.status === 'aberta' ? (
            <>
              <button onClick={() => onStatus(op.id, 'green')} title="Marcar Green"
                className="rounded-lg border border-transparent p-2 text-emerald-400 transition-colors hover:border-emerald-400/40 hover:bg-emerald-400/10">
                <CheckCircle2 size={18} />
              </button>
              <button onClick={() => onStatus(op.id, 'red')} title="Marcar Red"
                className="rounded-lg border border-transparent p-2 text-red-400 transition-colors hover:border-red-400/40 hover:bg-red-400/10">
                <XCircle size={18} />
              </button>
            </>
          ) : (
            <button onClick={() => onStatus(op.id, 'aberta')} title="Reabrir"
              className="rounded-lg border border-transparent p-2 text-slate-400 transition-colors hover:border-white/20 hover:bg-white/5">
              <Clock size={18} />
            </button>
          )}
          <button onClick={() => setConfirmar(true)} title="Excluir"
            className="rounded-lg border border-transparent p-2 text-slate-500 transition-colors hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-400">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {confirmar && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 animate-fadeIn">
          <span className="text-sm text-red-300">Excluir esta operação?</span>
          <div className="flex gap-2">
            <button onClick={() => onExcluir(op.id)} className="rounded-lg bg-red-500/80 px-3 py-1 text-sm text-white hover:bg-red-500">Excluir</button>
            <button onClick={() => setConfirmar(false)} className="rounded-lg border border-white/10 px-3 py-1 text-sm text-slate-300 hover:bg-white/5">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ModalNovaOp({ onFechar, onSalvar }: { onFechar: () => void; onSalvar: (op: Omit<Operacao, 'id'>) => void }) {
  const [tipo, setTipo] = useState<TipoOperacao>('duplo-green')
  const [descricao, setDescricao] = useState('')
  const [casas, setCasas] = useState('')
  const [investimento, setInvestimento] = useState('')
  const [retorno, setRetorno] = useState('')

  const valido = parseFloat(investimento) > 0

  function salvar() {
    if (!valido) return
    onSalvar({
      data: new Date().toISOString(),
      tipo,
      descricao: descricao.trim(),
      casas: casas.split(',').map((c) => c.trim()).filter(Boolean),
      investimento: parseFloat(investimento) || 0,
      retornoEsperado: parseFloat(retorno) || 0,
      lucro: 0,
      status: 'aberta',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn" onClick={onFechar}>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Nova operação</h3>
          <button onClick={onFechar} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5"><X size={20} /></button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-slate-400">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS.map((t) => (
                <button key={t.v} onClick={() => setTipo(t.v)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    tipo === t.v ? 'border-cyan-400/40 bg-cyan-400/20 text-cyan-300' : 'border-white/10 text-slate-400 hover:bg-white/5'
                  }`}>{t.label}</button>
              ))}
            </div>
          </div>
          <CampoModal label="Descrição (opcional)" valor={descricao} onChange={setDescricao} placeholder="Ex.: Flamengo x Palmeiras" tipo="text" />
          <CampoModal label="Casas (separe por vírgula)" valor={casas} onChange={setCasas} placeholder="Bet365, Betano" tipo="text" />
          <div className="grid grid-cols-2 gap-3">
            <CampoModal label="Investimento (R$)" valor={investimento} onChange={setInvestimento} placeholder="100,00" tipo="number" />
            <CampoModal label="Retorno esperado (R$)" valor={retorno} onChange={setRetorno} placeholder="120,00" tipo="number" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onFechar} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:bg-white/5">Cancelar</button>
          <button onClick={salvar} disabled={!valido}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
            Registrar
          </button>
        </div>
      </div>
    </div>
  )
}

function CampoModal({ label, valor, onChange, placeholder, tipo }: { label: string; valor: string; onChange: (v: string) => void; placeholder?: string; tipo: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-slate-400">{label}</label>
      <input type={tipo} inputMode={tipo === 'number' ? 'decimal' : undefined} step={tipo === 'number' ? '0.01' : undefined}
        value={valor} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-white outline-none transition-colors focus:border-cyan-400" />
    </div>
  )
}
