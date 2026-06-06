'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { SCHEDULE, PROJECTS, MANTRAS, ProjectKey } from '@/lib/data'

type Tab = 'today' | 'tasks' | 'hours' | 'weekly' | 'motivation'

interface Task { id: string; text: string; project: string; done: boolean }
interface HourLog { id: string; project: string; note: string; minutes: number; loggedAt: string }
interface ScheduleBlock { blockIndex: number; done: boolean }

function todayStr() { return new Date().toISOString().slice(0, 10) }
function timeStr() {
  const n = new Date()
  return String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0')
}
function getCurrentBlockIdx() {
  const n = new Date(); const now = n.getHours() * 60 + n.getMinutes()
  let best = -1
  SCHEDULE.forEach((s, i) => {
    const [hStr, mStr] = s.t.split(' – ')[0].split(':')
    let h = parseInt(hStr), m = parseInt(mStr)
    if (h < 8) h += 12
    if (h * 60 + m <= now) best = i
  })
  return best
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('today')
  const [clock, setClock] = useState('')
  const [dateLabel, setDateLabel] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [logs, setLogs] = useState<HourLog[]>([])
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([])
  const [newTask, setNewTask] = useState('')
  const [newTaskProj, setNewTaskProj] = useState<ProjectKey>('graph')
  const [logNote, setLogNote] = useState('')
  const [logProj, setLogProj] = useState<ProjectKey>('graph')
  const [mantraIdx, setMantraIdx] = useState(0)
  const [curBlock, setCurBlock] = useState(-1)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/login')
  }, [status, router])

  const tick = useCallback(() => {
    const n = new Date()
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    setClock(String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0') + ':' + String(n.getSeconds()).padStart(2,'0'))
    setDateLabel(days[n.getDay()] + ', ' + n.getDate() + ' ' + months[n.getMonth()] + ' ' + n.getFullYear())
    setCurBlock(getCurrentBlockIdx())
  }, [])

  useEffect(() => { tick(); const t = setInterval(tick, 1000); return () => clearInterval(t) }, [tick])

  const fetchAll = useCallback(async () => {
    const [tRes, hRes, sRes] = await Promise.all([
      fetch('/api/tasks'), fetch('/api/hours?since=' + todayStr() + 'T00:00:00Z'), fetch('/api/schedule?date=' + todayStr())
    ])
    if (tRes.ok) setTasks(await tRes.json())
    if (hRes.ok) setLogs(await hRes.json())
    if (sRes.ok) {
      const blocks: ScheduleBlock[] = await sRes.json()
      setScheduleBlocks(blocks)
    }
  }, [])

  useEffect(() => { if (status === 'authenticated') fetchAll() }, [status, fetchAll])

  const isDoneBlock = (i: number) => scheduleBlocks.some(b => b.blockIndex === i && b.done)

  async function toggleBlock(i: number) {
    const current = isDoneBlock(i)
    setSaving(true)
    await fetch('/api/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: todayStr(), blockIndex: i, done: !current }) })
    await fetchAll(); setSaving(false)
  }

  async function addTask() {
    if (!newTask.trim()) return
    await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: newTask, project: newTaskProj }) })
    setNewTask(''); fetchAll()
  }

  async function toggleTask(id: string, done: boolean) {
    await fetch('/api/tasks/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ done: !done }) })
    fetchAll()
  }

  async function removeTask(id: string) {
    await fetch('/api/tasks/' + id, { method: 'DELETE' })
    fetchAll()
  }

  async function logHours() {
    await fetch('/api/hours', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project: logProj, note: logNote || 'Focus session', minutes: 30 }) })
    setLogNote(''); fetchAll()
  }

  const hoursPerProject = (proj: string) => logs.filter(l => l.project === proj).reduce((a, l) => a + l.minutes / 60, 0)
  const totalHours = logs.reduce((a, l) => a + l.minutes / 60, 0)
  const doneTasks = tasks.filter(t => t.done).length
  const dayPct = Math.max(0, Math.min(100, Math.round((new Date().getHours() * 60 + new Date().getMinutes() - 480) / 960 * 100)))

  const projKeys = Object.keys(PROJECTS) as ProjectKey[]

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'today', label: 'Today', icon: 'ti-sun' },
    { key: 'tasks', label: 'Tasks', icon: 'ti-check' },
    { key: 'hours', label: 'Hours', icon: 'ti-clock' },
    { key: 'weekly', label: 'Weekly', icon: 'ti-chart-bar' },
    { key: 'motivation', label: 'Motivation', icon: 'ti-star' },
  ]

  if (status === 'loading') return <div className="flex items-center justify-center min-h-screen text-sm text-gray-400">Loading...</div>

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f4' }}>
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <i className="ti ti-layout-dashboard" style={{ color: '#534AB7' }} />
              Productivity tracker
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{dateLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200" style={{ fontVariantNumeric: 'tabular-nums' }}>{clock}</div>
            <button onClick={() => signOut({ callbackUrl: '/auth/login' })} className="text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50">
              <i className="ti ti-logout" /> Sign out
            </button>
          </div>
        </div>

        {/* Rule strip */}
        <div className="rounded-xl text-center text-sm py-2.5 px-4 mb-4 font-medium" style={{ background: '#EEEDFE', color: '#3C3489' }}>
          Before 5 PM → Build your future &nbsp;·&nbsp; After 5 PM → Upskill
        </div>

        {/* Nav */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors"
              style={{ background: tab === t.key ? '#534AB7' : 'white', color: tab === t.key ? 'white' : '#6b7280', border: '1px solid', borderColor: tab === t.key ? '#534AB7' : '#e5e7eb' }}>
              <i className={`ti ${t.icon}`} style={{ fontSize: 13 }} /> {t.label}
            </button>
          ))}
        </div>

        {/* TODAY */}
        {tab === 'today' && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
              {[
                { label: 'Current block', val: curBlock >= 0 ? SCHEDULE[curBlock].label.slice(0,18) : '—', sub: curBlock >= 0 ? SCHEDULE[curBlock].t : '' },
                { label: 'Tasks done', val: `${doneTasks}/${tasks.length}`, sub: 'today' },
                { label: 'Hours logged', val: totalHours.toFixed(1) + 'h', sub: 'goal: 10h' },
                { label: 'Day progress', val: dayPct + '%', sub: 'waking hours' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl p-3" style={{ background: '#f0ede8' }}>
                  <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                  <div className="text-base font-medium text-gray-900 leading-tight">{s.val}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <i className="ti ti-calendar" style={{ color: '#534AB7' }} /> Today's schedule
                <span className="text-xs font-normal text-gray-400 ml-1">tap to mark done {saving && '· saving...'}</span>
              </h3>
              <div className="space-y-1.5">
                {SCHEDULE.map((s, i) => {
                  const done = isDoneBlock(i)
                  const isCur = i === curBlock && !done
                  return (
                    <div key={i}>
                      {(i === 6 || i === 12) && <div className="my-2 border-t border-gray-100" />}
                      <div className="grid gap-2" style={{ gridTemplateColumns: '90px 1fr' }}>
                        <div className="text-right text-xs text-gray-400 pt-1.5">{s.t}</div>
                        <button onClick={() => toggleBlock(i)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-xs font-medium transition-opacity ${done ? 'opacity-40 line-through' : ''}`}
                          style={{ border: isCur ? '2px solid #534AB7' : 'none', background: isCur ? '#EEEDFE' : undefined }}
                          {...(!isCur && { style: {} })}>
                          <span className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg w-full tag-${s.cls}`}>
                            <i className={`ti ti-${s.icon}`} style={{ fontSize: 12 }} />
                            {s.label}
                            {done && <i className="ti ti-check ml-auto" style={{ fontSize: 11 }} />}
                          </span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TASKS */}
        {tab === 'tasks' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"><i className="ti ti-list-check" style={{ color: '#534AB7' }} /> Task list</h3>
            <div className="divide-y divide-gray-100">
              {tasks.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No tasks yet. Add one below.</p>}
              {tasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 py-2.5">
                  <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id, t.done)} className="w-4 h-4 rounded cursor-pointer flex-shrink-0" />
                  <span className={`flex-1 text-sm ${t.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{t.text}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md tag-${t.project}`}>{PROJECTS[t.project as ProjectKey]?.label || t.project}</span>
                  <button onClick={() => removeTask(t.id)} className="text-gray-300 hover:text-red-400 transition-colors"><i className="ti ti-x" style={{ fontSize: 13 }} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
              <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()}
                placeholder="Add a task..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
              <select value={newTaskProj} onChange={e => setNewTaskProj(e.target.value as ProjectKey)}
                className="border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none">
                {projKeys.map(k => <option key={k} value={k}>{PROJECTS[k].label}</option>)}
              </select>
              <button onClick={addTask} className="px-3 py-2 rounded-lg text-white text-sm" style={{ background: '#534AB7' }}>
                <i className="ti ti-plus" />
              </button>
            </div>
          </div>
        )}

        {/* HOURS */}
        {tab === 'hours' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2"><i className="ti ti-clock" style={{ color: '#534AB7' }} /> Today's hours</h3>
              {projKeys.map(k => {
                const h = hoursPerProject(k); const goal = PROJECTS[k].goal
                const pct = Math.min(100, Math.round(h / goal * 100))
                return (
                  <div key={k} className="flex items-center gap-3 mb-3">
                    <div className="w-24 text-xs font-medium text-gray-700">{PROJECTS[k].label}</div>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: pct + '%', background: PROJECTS[k].color }} />
                    </div>
                    <div className="text-xs text-gray-500 w-20 text-right">{h.toFixed(1)} / {goal}h</div>
                    <div className="text-xs text-gray-400 w-8 text-right">{pct}%</div>
                  </div>
                )
              })}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"><i className="ti ti-plus" style={{ color: '#534AB7' }} /> Log a session</h3>
              <div className="flex gap-2 flex-wrap">
                <input value={logNote} onChange={e => setLogNote(e.target.value)} placeholder="What did you work on?"
                  className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                <select value={logProj} onChange={e => setLogProj(e.target.value as ProjectKey)}
                  className="border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none">
                  {projKeys.map(k => <option key={k} value={k}>{PROJECTS[k].label}</option>)}
                </select>
                <button onClick={logHours} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#534AB7' }}>
                  Log 30 min
                </button>
              </div>
              <div className="mt-4 divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {logs.length === 0 && <p className="text-xs text-gray-400 py-2">No sessions logged today.</p>}
                {logs.map(l => (
                  <div key={l.id} className="flex items-center gap-2 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-md tag-${l.project} flex-shrink-0`}>{PROJECTS[l.project as ProjectKey]?.label || l.project}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{new Date(l.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-sm text-gray-700 truncate">{l.note}</span>
                    <span className="text-xs text-gray-400 ml-auto flex-shrink-0">+30 min</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WEEKLY */}
        {tab === 'weekly' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {projKeys.map(k => {
                const h = hoursPerProject(k); const goal = PROJECTS[k].goal
                return (
                  <div key={k} className="rounded-xl p-3" style={{ background: '#f0ede8' }}>
                    <div className="text-xs text-gray-500 mb-1">{PROJECTS[k].label}</div>
                    <div className="text-xl font-medium text-gray-900">{h.toFixed(1)}h</div>
                    <div className="text-xs text-gray-400">goal: {goal}h/day</div>
                  </div>
                )
              })}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4"><i className="ti ti-calendar-week mr-2" style={{ color: '#534AB7' }} />Weekly rhythm</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { day: 'Mon – Fri', items: ['GraphMind 5+ hrs', 'CRM 2+ hrs', 'Azure 2 hrs', 'n8n 1.5 hrs'] },
                  { day: 'Saturday', items: ['GraphMind 4 hrs', 'Azure 3 hrs', 'n8n 3 hrs', 'Weekly review 1 hr'] },
                  { day: 'Sunday', items: ['Azure mock tests', 'n8n experiments', 'GraphMind planning', 'Light workload'] },
                ].map(w => (
                  <div key={w.day} className="rounded-xl p-3" style={{ background: '#f5f5f4' }}>
                    <div className="text-xs font-medium text-gray-700 mb-2">{w.day}</div>
                    <ul className="space-y-1">
                      {w.items.map(item => <li key={item} className="text-xs text-gray-500">{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MOTIVATION */}
        {tab === 'motivation' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5 text-center" style={{ background: '#EEEDFE' }}>
              <p className="text-base font-medium leading-relaxed mb-2" style={{ color: '#26215C' }}>{MANTRAS[mantraIdx].text}</p>
              <p className="text-sm" style={{ color: '#534AB7' }}>{MANTRAS[mantraIdx].sub}</p>
              <button onClick={() => setMantraIdx((mantraIdx + 1) % MANTRAS.length)}
                className="mt-4 text-xs px-4 py-1.5 rounded-lg border transition-colors"
                style={{ borderColor: '#AFA9EC', color: '#534AB7', background: 'white' }}>
                <i className="ti ti-refresh mr-1" /> Next mantra
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2"><i className="ti ti-target" style={{ color: '#534AB7' }} /> Priority reminders</h3>
              {[
                { cls: 'graph', text: 'GraphMind is your #1 asset. Morning hours are sacred — no distractions before 1:15 PM.' },
                { cls: 'crm',   text: 'CRM documentation builds the foundation. Every session compounds into a polished system.' },
                { cls: 'azure', text: 'Azure AI cert is a defined finish line. Evening focus sessions add up fast.' },
                { cls: 'n8n',   text: 'n8n automation built tonight saves hours next week. You are building leverage.' },
              ].map((r, i) => (
                <div key={i} className={`rounded-lg p-3 text-sm leading-relaxed tag-${r.cls}`} style={{ borderLeft: '3px solid', borderRadius: '0 8px 8px 0' }}>
                  {r.text}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-400 mt-6 pb-4">
          Logged in as {session?.user?.email} · Data synced across all your devices
        </div>
      </div>
    </div>
  )
}
