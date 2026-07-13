'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Wallet, AlertTriangle } from 'lucide-react'
import { getCasas, setCasas as salvarCasas, novoId, type Casa, type CategoriaCasa } from '@/lib/store'
import { brl } from '@/lib/calculos'

const CATEGORIAS: { value: CategoriaCasa; label: string }[] = [
  { value: 'principal', label: 'principal' },
  { value: 'extracao', label: 'extração' },
  { value: 'super-odds', label: 'super odds' },
  { value: 'bingo', label: 'bingo' },
  { value: 'outra', label: 'outra' },
]

export default function ConciliacaoPage() {
  const [casas, setCasas] = useState<Casa[]>([])
  const [carregado, setCarregado] = useState(false)
  const [modalNova, setModalNova] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [ajustandoId, setAjustandoId] = useState<string | null>(null)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  useEffect(() => { setCasas(getCasas()); setCarregado(true) }, [])
  useEffect(() => { if (carregado) salvarCasas(casas) }, [casas, carregado])

  const total = useMemo(() => casas.reduce((acc, c) => acc + c.saldo, 0), [casas])

  function adicionarCasa(nome: string, categoria: CategoriaCasa, saldo: number) {
    setCasas((prev) => [...prev, { id: novoId(), nome: nome.trim(), categoria, saldo }]); setModalNova(false)
  }
  function editarCasa(id: string, nome: string, categoria: CategoriaCasa) {
    setCasas((prev) => prev.map((c) => (c.id === id ? { ...c, nome: nome.trim(), categoria } : c))); setEditandoId(null)
  }
  function ajustarSaldo(id: string, saldo: number) {
    setCasas((prev) => prev.map((c) => (c.id === id ? { ...c, saldo } : c))); setAjustandoId(null)
  }
  function excluirCasa(id: string) { setCasas((prev) => prev.filter((c) => c.id !== id)); setExcluindoId(null) }

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 animate-fadeIn">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">Auditoria</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white md:text-4xl">Conciliação de Saldo</h1>
            <p className="mt-2 text-slate-400">
              Total nas casas: <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text font-semibold text-transparent">{brl(total)}</span>
              <span className="ml-3 text-sm text-slate-500">{casas.length} {casas.length === 1 ? 'casa' : 'casas'}</span>
            </p>
          </div>
          <button onClick={() => setModalNova(true)}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 active:scale-95">
            <Plus size={18} className="transition-transform group-hover:rotate-90" /> Nova casa
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {carregado && casas.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
              <Wallet className="mx-auto text-slate-500" size={32} />
              <p className="mt-3 text-slate-400">Nenhuma casa cadastrada. Clique em <strong>Nova casa</strong> para começar.</p>
            </div>
          )}
          {casas.map((casa) => (
            <CardCasa key={casa.id} casa={casa}
              editando={editandoId === casa.id} ajustando={ajustandoId === casa.id} excluindo={excluindoId === casa.id}
              onEditar={() => { setEditandoId(casa.id); setAjustandoId(null); setExcluindoId(null) }}
              onAjustar={() => { setAjustandoId(casa.id); setEditandoId(null); setExcluindoId(null) }}
              onExcluir={() => { setExcluindoId(casa.id); setEditandoId(null); setAjustandoId(null) }}
              onCancelar={() => { setEditandoId(null); setAjustandoId(null); setExcluindoId(null) }}
              onSalvarEdicao={(nome, cat) => editarCasa(casa.id, nome, cat)}
              onSalvarSaldo={(s) => ajustarSaldo(casa.id, s)}
              onConfirmarExclusao={() => excluirCasa(casa.id)} />
          ))}
        </div>
      </div>
      {modalNova && <ModalNovaCasa onFechar={() => setModalNova(false)} onSalvar={adicionarCasa} nomesExistentes={casas.map((c) => c.nome.toLowerCase())} />}
    </div>
  )
}

function CardCasa(props: {
  casa: Casa; editando: boolean; ajustando: boolean; excluindo: boolean
  onEditar: () => void; onAjustar: () => void; onExcluir: () => void; onCancelar: () => void
  onSalvarEdicao: (nome: string, categoria: CategoriaCasa) => void; onSalvarSaldo: (saldo: number) => void; onConfirmarExclusao: () => void
}) {
  const { casa } = props
  const [nome, setNome] = useState(casa.nome)
  const [categoria, setCategoria] = useState<CategoriaCasa>(casa.categoria)
  const [saldoStr, setSaldoStr] = useState(String(casa.saldo))

  useEffect(() => { setNome(casa.nome); setCategoria(casa.categoria); setSaldoStr(String(casa.saldo)) }, [casa, props.editando, props.ajustando])
  const labelCategoria = CATEGORIAS.find((c) => c.value === casa.categoria)?.label ?? casa.categoria

  return (
    <div className="animate-slideUp rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-colors hover:border-cyan-400/30 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {props.editando ? (
          <div className="flex flex-wrap items-center gap-3">
            <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && nome.trim()) props.onSalvarEdicao(nome, categoria); if (e.key === 'Escape') props.onCancelar() }}
              className="rounded-lg border border-cyan-400/40 bg-slate-900/80 px-3 py-2 text-lg font-medium text-white outline-none focus:border-cyan-400" placeholder="Nome da casa" />
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaCasa)}
              className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-300 outline-none focus:border-cyan-400">
              {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <BotaoIcone titulo="Salvar" tom="ok" onClick={() => nome.trim() && props.onSalvarEdicao(nome, categoria)}><Check size={16} /></BotaoIcone>
            <BotaoIcone titulo="Cancelar" tom="neutro" onClick={props.onCancelar}><X size={16} /></BotaoIcone>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-white">{casa.nome}</h2>
            <span className="mt-1 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs text-slate-400">{labelCategoria}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {props.ajustando ? (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-cyan-400/40 bg-slate-900/80 px-3 py-2">
                <span className="text-sm text-slate-400">R$</span>
                <input autoFocus type="number" step="0.01" value={saldoStr} onChange={(e) => setSaldoStr(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') props.onSalvarSaldo(parseFloat(saldoStr) || 0); if (e.key === 'Escape') props.onCancelar() }}
                  className="w-28 bg-transparent text-right text-lg font-semibold text-cyan-300 outline-none" />
              </div>
              <BotaoIcone titulo="Salvar saldo" tom="ok" onClick={() => props.onSalvarSaldo(parseFloat(saldoStr) || 0)}><Check size={16} /></BotaoIcone>
              <BotaoIcone titulo="Cancelar" tom="neutro" onClick={props.onCancelar}><X size={16} /></BotaoIcone>
            </>
          ) : (
            <>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-2xl font-semibold text-transparent">{brl(casa.saldo)}</span>
              <button onClick={props.onAjustar} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-cyan-400/40 hover:bg-cyan-400/10">Ajustar</button>
              <BotaoIcone titulo="Editar" tom="neutro" onClick={props.onEditar}><Pencil size={16} /></BotaoIcone>
              <BotaoIcone titulo="Excluir" tom="perigo" onClick={props.onExcluir}><Trash2 size={16} /></BotaoIcone>
            </>
          )}
        </div>
      </div>

      {props.excluindo && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 animate-fadeIn">
          <p className="flex items-center gap-2 text-sm text-red-300"><AlertTriangle size={16} />Excluir <strong>{casa.nome}</strong> ({brl(casa.saldo)})?</p>
          <div className="flex gap-2">
            <button onClick={props.onConfirmarExclusao} className="rounded-lg bg-red-500/80 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-500">Excluir</button>
            <button onClick={props.onCancelar} className="rounded-lg border border-white/10 px-4 py-1.5 text-sm text-slate-300 hover:bg-white/5">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ModalNovaCasa({ onFechar, onSalvar, nomesExistentes }: { onFechar: () => void; onSalvar: (nome: string, categoria: CategoriaCasa, saldo: number) => void; nomesExistentes: string[] }) {
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState<CategoriaCasa>('principal')
  const [saldoStr, setSaldoStr] = useState('')
  const nomeDuplicado = nomesExistentes.includes(nome.trim().toLowerCase())
  const valido = nome.trim().length > 0 && !nomeDuplicado

  function salvar() { if (valido) onSalvar(nome, categoria, parseFloat(saldoStr) || 0) }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn" onClick={onFechar}>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold text-white">Nova casa</h3>
        <p className="mt-1 text-sm text-slate-400">Cadastre a casa e o saldo atual.</p>
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Nome</label>
            <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && salvar()} placeholder="Ex.: KTO, Superbet…"
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-white outline-none focus:border-cyan-400" />
            {nomeDuplicado && <p className="mt-1 text-xs text-amber-400">Já existe uma casa com esse nome.</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Categoria</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaCasa)}
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-white outline-none focus:border-cyan-400">
              {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Saldo inicial (R$)</label>
            <input type="number" step="0.01" value={saldoStr} onChange={(e) => setSaldoStr(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && salvar()} placeholder="0,00"
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-white outline-none focus:border-cyan-400" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onFechar} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:bg-white/5">Cancelar</button>
          <button onClick={salvar} disabled={!valido}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">Adicionar casa</button>
        </div>
      </div>
    </div>
  )
}

function BotaoIcone({ titulo, tom, onClick, children }: { titulo: string; tom: 'ok' | 'neutro' | 'perigo'; onClick: () => void; children: React.ReactNode }) {
  const tons = {
    ok: 'text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/40',
    neutro: 'text-slate-400 hover:bg-white/5 hover:border-white/20',
    perigo: 'text-red-400 hover:bg-red-400/10 hover:border-red-400/40',
  }
  return (
    <button title={titulo} aria-label={titulo} onClick={onClick} className={`rounded-lg border border-transparent p-2 transition-colors ${tons[tom]}`}>{children}</button>
  )
}
