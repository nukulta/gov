import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, ClipboardList, Database, FileText, Settings, Building2, Menu, X, ShieldCheck, ChevronRight } from 'lucide-react';

const demoNavigation = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Faculty Management', icon: Users },
  { label: 'Training Management', icon: GraduationCap },
  { label: 'Training Participation', icon: ClipboardList },
  { label: 'Training Database', icon: Database },
  { label: 'Reports', icon: FileText },
  { label: 'Administration', icon: Settings }
];

const demoStats = [
  { label: 'Faculty records', value: '128', icon: Users, tone: 'blue' },
  { label: 'Training programmes', value: '46', icon: GraduationCap, tone: 'teal' },
  { label: 'Participants', value: '1,248', icon: ClipboardList, tone: 'purple' },
  { label: 'Training days', value: '312', icon: FileText, tone: 'orange' },
  { label: 'Database records', value: '684', icon: Database, tone: 'sky' },
  { label: 'Active users', value: '24', icon: ShieldCheck, tone: 'green' }
];

const demoTables = {
  'Faculty Management': {
    description: 'Sample faculty directory',
    columns: ['Ref.', 'Faculty', 'Speciality', 'Service', 'Office'],
    rows: [
      ['D-001', 'Demo Faculty 01', 'Survey methods', 'Statistics', 'North Region'],
      ['D-002', 'Demo Faculty 02', 'Data quality', 'Research', 'Central Office'],
      ['D-003', 'Demo Faculty 03', 'Public policy', 'Administration', 'West Region']
    ]
  },
  'Training Management': {
    description: 'Sample training programmes',
    columns: ['Ref.', 'Programme', 'Type', 'Month', 'Status'],
    rows: [
      ['T-101', 'Survey Operations', 'Workshop', 'April', 'Scheduled'],
      ['T-102', 'Data Quality Essentials', 'Course', 'May', 'In progress'],
      ['T-103', 'Statistical Methods', 'Seminar', 'June', 'Planned']
    ]
  },
  'Training Participation': {
    description: 'Sample participation summary',
    columns: ['Programme', 'Mode', 'Participants', 'Male', 'Female'],
    rows: [
      ['Survey Operations', 'In person', '42', '23', '19'],
      ['Data Quality Essentials', 'Hybrid', '36', '18', '18'],
      ['Statistical Methods', 'Online', '58', '29', '29']
    ]
  },
  'Training Database': {
    description: 'Sample training database records',
    columns: ['Ref.', 'Training', 'Faculty', 'Office', 'Duration'],
    rows: [
      ['R-201', 'Survey Operations', 'Demo Faculty 01', 'North Region', '3 days'],
      ['R-202', 'Data Quality Essentials', 'Demo Faculty 02', 'Central Office', '2 days'],
      ['R-203', 'Statistical Methods', 'Demo Faculty 03', 'West Region', '4 days']
    ]
  }
};

function DemoTable({ columns, rows }) {
  return <div className="table-wrap"><table><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((value, columnIndex) => <td key={columnIndex}>{value}</td>)}</tr>)}</tbody></table></div>;
}

function DemoStat({ label, value, icon: Icon, tone }) {
  return <div className="stat"><div className={`stat-icon ${tone}`}><Icon size={20} /></div><div><span>{label}</span><strong>{value}</strong></div></div>;
}

export default function DemoPreview() {
  const [active, setActive] = useState('Dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const table = demoTables[active];

  return <div className="app-shell demo-shell">
    {menuOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <aside className={menuOpen ? 'sidebar open demo-sidebar' : 'sidebar demo-sidebar'}>
      <div className="sidebar-header"><div className="mini-mark"><Building2 size={17} /></div><div><strong>GovPortal</strong><small>Training Administration</small></div><button className="icon-btn mobile-only" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
      <nav aria-label="Demo navigation">{demoNavigation.map(({ label, icon: Icon }) => <button key={label} type="button" className={active === label ? 'active' : ''} onClick={() => { setActive(label); setMenuOpen(false); }}><Icon size={18} /><span>{label}</span></button>)}</nav>
      <div className="sidebar-footer"><ShieldCheck size={18} /><div><strong>Read-only preview</strong><small>Fictional sample data</small></div></div>
    </aside>
    <div className="main">
      <div className="demo-banner"><div><strong>Client presentation preview</strong><span>Fictional sample data only · no live database</span></div><Link to="/login">Return to sign-in</Link></div>
      <header><button className="icon-btn mobile-only" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu /></button><div className="page-context"><p>Government administrative portal</p><h2>{active}</h2></div><div className="demo-viewer"><div className="avatar">D</div><div><b>Demo Viewer</b><small>Read-only preview</small></div></div></header>
      <main className="content">
        {active === 'Dashboard' && <div className="stack-lg">
          <section className="welcome"><div><p className="eyebrow">Demo dashboard</p><h1>Welcome to the preview</h1><p className="muted">Explore the faculty and training workspace with presentation-safe sample data.</p></div><span className="demo-badge">Sample data</span></section>
          <div className="stats-grid">{demoStats.map(stat => <DemoStat key={stat.label} {...stat} />)}</div>
          <div className="two-col">
            <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Recent activity</p><h3>Sample audit trail</h3></div><span className="demo-badge">Preview</span></div>
              {[['Record updated', 'Faculty record D-002', 'Today'], ['Training scheduled', 'Survey Operations', 'Yesterday'], ['Report generated', 'Monthly overview', '12 Nov']].map(([action, detail, date]) => <div className="activity" key={action}><div className="activity-dot" /><div><b>{action}</b><p>{detail}</p></div><time>{date}</time></div>)}
            </section>
            <section className="panel"><p className="eyebrow">Explore</p><h3>Workspace sections</h3><div className="demo-quick-links">{demoNavigation.slice(1, 4).map(({ label, icon: Icon }) => <button key={label} type="button" onClick={() => setActive(label)}><Icon size={19} /><span>{label}</span><ChevronRight size={16} /></button>)}</div></section>
          </div>
        </div>}
        {table && <div className="stack-lg"><section className="page-title"><div><p className="eyebrow">Sample records</p><h1>{active}</h1><p className="muted">{table.description} for presentation purposes.</p></div><span className="demo-badge">Read only</span></section><section className="panel"><div className="panel-heading"><div><p className="eyebrow">Preview dataset</p><h3>{table.rows.length} fictional records</h3></div></div><DemoTable columns={table.columns} rows={table.rows} /></section></div>}
        {active === 'Reports' && <div className="stack-lg"><section className="page-title"><div><p className="eyebrow">Sample analytics</p><h1>Training reports</h1><p className="muted">A presentation view of summary reporting.</p></div><span className="demo-badge">Sample data</span></section><div className="stats-grid">{demoStats.slice(0, 4).map(stat => <DemoStat key={stat.label} {...stat} />)}</div><section className="panel"><div className="panel-heading"><div><p className="eyebrow">Programme mix</p><h3>Sample training activity</h3></div></div>{[['Workshops', 74], ['Courses', 58], ['Seminars', 42]].map(([label, value]) => <div className="demo-meter" key={label}><div><span>{label}</span><b>{value}%</b></div><div className="demo-meter-track"><span style={{ width: `${value}%` }} /></div></div>)}</section></div>}
        {active === 'Administration' && <div className="stack-lg"><section className="page-title"><div><p className="eyebrow">Safe demonstration</p><h1>Administration preview</h1><p className="muted">Live account and dataset controls are not available in this read-only demo.</p></div><span className="demo-badge">Disabled</span></section><section className="panel"><p className="eyebrow">Presentation mode</p><h3>Protected administrative tools</h3><p className="muted">Dataset imports, account changes, and audit-log access remain available only after authorized sign-in.</p></section></div>}
      </main>
    </div>
  </div>;
}
