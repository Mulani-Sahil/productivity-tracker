export const SCHEDULE = [
  { t: '8:00 – 8:30',   label: 'Freshen up & breakfast',          cls: 'neutral', icon: 'coffee' },
  { t: '8:30 – 11:30',  label: 'GraphMind — Deep work 1',         cls: 'graph',   icon: 'git-branch', proj: 'graph' },
  { t: '11:30 – 11:45', label: 'Short break',                     cls: 'neutral', icon: 'walk' },
  { t: '11:45 – 1:15',  label: 'GraphMind — Deep work 2',         cls: 'graph',   icon: 'git-branch', proj: 'graph' },
  { t: '1:15 – 1:30',   label: 'Zuhr namaaz',                     cls: 'namaaz',  icon: 'moon' },
  { t: '1:30 – 2:15',   label: 'Lunch + relax',                   cls: 'neutral', icon: 'bowl-spoon' },
  { t: '2:15 – 4:30',   label: 'CRM documentation',               cls: 'crm',     icon: 'database', proj: 'crm' },
  { t: '4:30 – 5:15',   label: 'Azure AI certification',          cls: 'azure',   icon: 'cloud', proj: 'azure' },
  { t: '5:15 – 5:45',   label: 'Asr namaaz + break',              cls: 'namaaz',  icon: 'moon' },
  { t: '5:45 – 7:15',   label: 'Azure AI certification',          cls: 'azure',   icon: 'cloud', proj: 'azure' },
  { t: '7:15 – 7:30',   label: 'Maghrib namaaz',                  cls: 'namaaz',  icon: 'moon' },
  { t: '7:30 – 8:30',   label: 'Dinner + family time',            cls: 'neutral', icon: 'users' },
  { t: '8:45 – 9:00',   label: 'Isha namaaz',                     cls: 'namaaz',  icon: 'moon' },
  { t: '9:00 – 10:30',  label: 'n8n automation',                  cls: 'n8n',     icon: 'refresh', proj: 'n8n' },
  { t: '10:30 – 11:30', label: 'GraphMind planning + next-day',   cls: 'neutral', icon: 'notes' },
  { t: '11:30 – 12:00', label: 'Wind down + reading',             cls: 'neutral', icon: 'book' },
]

export const PROJECTS = {
  graph: { label: 'GraphMind',  color: '#534AB7', bg: '#EEEDFE', text: '#3C3489', goal: 5 },
  crm:   { label: 'CRM',        color: '#1D9E75', bg: '#E1F5EE', text: '#085041', goal: 2 },
  azure: { label: 'Azure AI',   color: '#378ADD', bg: '#E6F1FB', text: '#0C447C', goal: 2 },
  n8n:   { label: 'n8n',        color: '#EF9F27', bg: '#FAEEDA', text: '#633806', goal: 1.5 },
}

export const MANTRAS = [
  { text: "Your best work happens before noon — protect that time like it's sacred.", sub: 'GraphMind gets the morning. No exceptions.' },
  { text: 'Consistency beats intensity. Show up every day, even for one hour.', sub: 'Progress compounds over weeks, not days.' },
  { text: 'The Azure cert is a defined finish line. Every session moves you closer.', sub: 'Certifications open doors. Put in the hours.' },
  { text: 'Automation built today saves hours tomorrow. n8n is your force multiplier.', sub: 'Work smarter, not just harder.' },
  { text: "You don't need motivation every day — you need discipline and a system.", sub: 'This dashboard is your system. Trust it.' },
  { text: 'CRM documentation makes you a professional, not just a developer.', sub: 'Clean docs show you care about craft.' },
]

export type ProjectKey = keyof typeof PROJECTS
