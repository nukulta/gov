import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, ClipboardList, ChevronRight, Database, Download, Eye, FileText,
  GraduationCap, LayoutDashboard, Menu, Pencil, Plus, RotateCcw, Search,
  Settings, ShieldCheck, Trash2, Users, X
} from 'lucide-react';

const demoNavigation = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Faculty Management', icon: Users },
  { label: 'Training Management', icon: GraduationCap },
  { label: 'Training Participation', icon: ClipboardList },
  { label: 'Training Database', icon: Database },
  { label: 'Reports', icon: FileText },
  { label: 'Administration', icon: Settings }
];

const demoTables = {
  'Faculty Management': {
    description: 'Sample faculty directory',
    prefix: 'D',
    columns: [['reference', 'Ref.'], ['faculty', 'Faculty'], ['speciality', 'Speciality'], ['service', 'Service'], ['office', 'Office']],
    fields: [
      { key: 'faculty', label: 'Faculty name', required: true },
      { key: 'speciality', label: 'Speciality' },
      { key: 'service', label: 'Service' },
      { key: 'office', label: 'Office' }
    ],
    rows: [
      { id: 'faculty-1', reference: 'D-001', faculty: 'Demo Faculty 01', speciality: 'Survey methods', service: 'Statistics', office: 'North Region' },
      { id: 'faculty-2', reference: 'D-002', faculty: 'Demo Faculty 02', speciality: 'Data quality', service: 'Research', office: 'Central Office' },
      { id: 'faculty-3', reference: 'D-003', faculty: 'Demo Faculty 03', speciality: 'Public policy', service: 'Administration', office: 'West Region' }
    ]
  },
  'Training Management': {
    description: 'Sample training programmes',
    prefix: 'T',
    columns: [['reference', 'Ref.'], ['programme', 'Programme'], ['type', 'Type'], ['month', 'Month'], ['status', 'Status']],
    fields: [
      { key: 'programme', label: 'Programme name', required: true },
      { key: 'type', label: 'Training type' },
      { key: 'month', label: 'Month' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      { id: 'training-1', reference: 'T-101', programme: 'Survey Operations', type: 'Workshop', month: 'April', status: 'Scheduled' },
      { id: 'training-2', reference: 'T-102', programme: 'Data Quality Essentials', type: 'Course', month: 'May', status: 'In progress' },
      { id: 'training-3', reference: 'T-103', programme: 'Statistical Methods', type: 'Seminar', month: 'June', status: 'Planned' }
    ]
  },
  'Training Participation': {
    description: 'Sample participation summary',
    columns: [['programme', 'Programme'], ['mode', 'Mode'], ['participants', 'Participants'], ['male', 'Male'], ['female', 'Female']],
    fields: [
      { key: 'programme', label: 'Programme', required: true },
      { key: 'mode', label: 'Mode' },
      { key: 'participants', label: 'Participants', type: 'number' },
      { key: 'male', label: 'Male', type: 'number' },
      { key: 'female', label: 'Female', type: 'number' }
    ],
    rows: [
      { id: 'participation-1', programme: 'Survey Operations', mode: 'In person', participants: 42, male: 23, female: 19 },
      { id: 'participation-2', programme: 'Data Quality Essentials', mode: 'Hybrid', participants: 36, male: 18, female: 18 },
      { id: 'participation-3', programme: 'Statistical Methods', mode: 'Online', participants: 58, male: 29, female: 29 }
    ]
  },
  'Training Database': {
    description: 'Sample training database records',
    prefix: 'R',
    columns: [['reference', 'Ref.'], ['training', 'Training'], ['faculty', 'Faculty'], ['office', 'Office'], ['duration', 'Duration']],
    fields: [
      { key: 'training', label: 'Training', required: true },
      { key: 'faculty', label: 'Faculty' },
      { key: 'office', label: 'Office' },
      { key: 'duration', label: 'Duration', type: 'number' }
    ],
    rows: [
      { id: 'database-1', reference: 'R-201', training: 'Survey Operations', faculty: 'Demo Faculty 01', office: 'North Region', duration: 3 },
      { id: 'database-2', reference: 'R-202', training: 'Data Quality Essentials', faculty: 'Demo Faculty 02', office: 'Central Office', duration: 2 },
      { id: 'database-3', reference: 'R-203', training: 'Statistical Methods', faculty: 'Demo Faculty 03', office: 'West Region', duration: 4 }
    ]
  }
};

const initialActivity = [
  { action: 'Record updated', detail: 'Faculty record D-002', date: 'Today' },
  { action: 'Training scheduled', detail: 'Survey Operations', date: 'Yesterday' },
  { action: 'Report generated', detail: 'Monthly overview', date: '12 Nov' }
];

function DemoStat({ label, value, icon: Icon, tone }) {
  return <div className="stat"><div className={`stat-icon ${tone}`}><Icon size={20} /></div><div><span>{label}</span><strong>{value}</strong></div></div>;
}

function makeInitialRecords() {
  return Object.fromEntries(Object.entries(demoTables).map(([name, table]) => [name, table.rows]));
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export default function DemoPreview() {
  const [active, setActive] = useState('Dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [records, setRecords] = useState(makeInitialRecords);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState('');
  const [activity, setActivity] = useState(initialActivity);
  const table = demoTables[active];
  const rows = table ? records[active] : [];
  const visibleRows = rows.filter(row => !query || Object.values(row).some(value => String(value).toLowerCase().includes(query.toLowerCase())));
  const participationCount = records['Training Participation'].reduce((sum, row) => sum + Number(row.participants || 0), 0);
  const trainingDays = records['Training Database'].reduce((sum, row) => sum + Number(row.duration || 0), 0);
  const stats = [
    { label: 'Faculty records', value: (125 + records['Faculty Management'].length).toLocaleString(), icon: Users, tone: 'blue' },
    { label: 'Training programmes', value: (43 + records['Training Management'].length).toLocaleString(), icon: GraduationCap, tone: 'teal' },
    { label: 'Participants', value: (1112 + participationCount).toLocaleString(), icon: ClipboardList, tone: 'purple' },
    { label: 'Training days', value: (303 + trainingDays).toLocaleString(), icon: FileText, tone: 'orange' },
    { label: 'Database records', value: (681 + records['Training Database'].length).toLocaleString(), icon: Database, tone: 'sky' },
    { label: 'Active users', value: '24', icon: ShieldCheck, tone: 'green' }
  ];

  function changeSection(section) {
    setActive(section);
    setQuery('');
    setNotice('');
    setMenuOpen(false);
  }

  function startAdd(section) {
    changeSection(section);
    setModal({ mode: 'add' });
  }

  function addActivity(action, detail) {
    setActivity(current => [{ action, detail, date: 'Just now' }, ...current].slice(0, 5));
  }

  function saveRecord(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const editing = modal.mode === 'edit';
    let saved = { ...(editing ? modal.row : {}), ...values };

    if (!editing) {
      const referenceField = table.columns.some(([key]) => key === 'reference');
      if (referenceField) {
        const nextNumber = rows.reduce((max, row) => Math.max(max, Number(row.reference?.match(/\d+$/)?.[0] || 0)), 0) + 1;
        saved.reference = `${table.prefix}-${String(nextNumber).padStart(3, '0')}`;
      }
      saved.id = `demo-${Date.now()}`;
    }

    setRecords(current => ({
      ...current,
      [active]: editing
        ? current[active].map(row => row.id === saved.id ? saved : row)
        : [saved, ...current[active]]
    }));
    setNotice(editing ? 'Demo record updated.' : 'Demo record added.');
    addActivity(editing ? 'Record updated' : 'Record added', saved[table.fields[0].key] || active);
    setModal(null);
  }

  function removeRecord(row) {
    if (!window.confirm('Remove this fictional demo record?')) return;
    setRecords(current => ({ ...current, [active]: current[active].filter(item => item.id !== row.id) }));
    setNotice('Demo record removed.');
    addActivity('Record removed', row[table.fields[0].key] || active);
  }

  function exportCsv(section = active) {
    const exportTable = demoTables[section];
    const exportRows = records[section];
    const csv = [
      exportTable.columns.map(([, label]) => csvCell(label)).join(','),
      ...exportRows.map(row => exportTable.columns.map(([key]) => csvCell(row[key])).join(','))
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${section.toLowerCase().replaceAll(' ', '-')}-demo.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice('Sample CSV downloaded.');
  }

  function resetDemo() {
    if (!window.confirm('Reset all demo records to the original fictional sample data?')) return;
    setRecords(makeInitialRecords());
    setActivity(initialActivity);
    setNotice('Demo data reset.');
  }

  return <div className="app-shell demo-shell">
    {menuOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <aside className={menuOpen ? 'sidebar open demo-sidebar' : 'sidebar demo-sidebar'}>
      <div className="sidebar-header"><div className="mini-mark"><Building2 size={17} /></div><div><strong>GovPortal</strong><small>Training Administration</small></div><button className="icon-btn mobile-only" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
      <nav aria-label="Demo navigation">{demoNavigation.map(({ label, icon: Icon }) => <button key={label} type="button" className={active === label ? 'active' : ''} onClick={() => changeSection(label)}><Icon size={18} /><span>{label}</span></button>)}</nav>
      <div className="sidebar-footer"><ShieldCheck size={18} /><div><strong>Interactive demo</strong><small>Fictional sample data</small></div></div>
    </aside>
    <div className="main">
      <div className="demo-banner"><div><strong>Client presentation preview</strong><span>Fictional data only · changes stay in this browser session</span></div><Link to="/login">Return to sign-in</Link></div>
      <header><button className="icon-btn mobile-only" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu /></button><div className="page-context"><p>Government administrative portal</p><h2>{active}</h2></div><div className="demo-viewer"><div className="avatar">D</div><div><b>Demo Viewer</b><small>Interactive preview</small></div></div></header>
      <main className="content">
        {notice && <div className="alert success demo-notice" role="status">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice('')}><X size={15} /></button></div>}
        {active === 'Dashboard' && <div className="stack-lg">
          <section className="welcome"><div><p className="eyebrow">Demo dashboard</p><h1>Welcome to the preview</h1><p className="muted">Explore the workspace and try adding, editing, and removing fictional records.</p></div><button className="primary" onClick={() => startAdd('Training Management')}><Plus size={17} /> Add training</button></section>
          <div className="stats-grid">{stats.map(stat => <DemoStat key={stat.label} {...stat} />)}</div>
          <div className="two-col">
            <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Recent activity</p><h3>Demo activity trail</h3></div><span className="demo-badge">This session</span></div>
              {activity.map((item, index) => <div className="activity" key={`${item.action}-${item.date}-${index}`}><div className="activity-dot" /><div><b>{item.action}</b><p>{item.detail}</p></div><time>{item.date}</time></div>)}
            </section>
            <section className="panel"><p className="eyebrow">Explore</p><h3>Workspace sections</h3><div className="demo-quick-links">{demoNavigation.slice(1, 4).map(({ label, icon: Icon }) => <button key={label} type="button" onClick={() => changeSection(label)}><Icon size={19} /><span>{label}</span><ChevronRight size={16} /></button>)}</div></section>
          </div>
        </div>}
        {table && <div className="stack-lg"><section className="page-title"><div><p className="eyebrow">Interactive sample records</p><h1>{active}</h1><p className="muted">{table.description}. Add, view, edit, search, or remove records in this demo.</p></div><button className="primary" onClick={() => setModal({ mode: 'add' })}><Plus size={17} /> Add record</button></section>
          <section className="panel"><div className="demo-record-tools"><div><p className="eyebrow">Preview dataset</p><h3>{visibleRows.length} of {rows.length} fictional records</h3></div><div className="demo-record-actions"><label className="search"><Search size={17} /><input aria-label="Search demo records" placeholder="Search records…" value={query} onChange={event => setQuery(event.target.value)} /></label><button className="secondary" onClick={exportCsv}><Download size={15} /> Export CSV</button></div></div>
            <div className="table-wrap"><table><thead><tr>{table.columns.map(([, label]) => <th key={label}>{label}</th>)}<th>Actions</th></tr></thead><tbody>
              {visibleRows.map(row => <tr key={row.id}>{table.columns.map(([key]) => <td key={key}>{row[key] || '—'}{key === 'duration' && row[key] ? ' days' : ''}</td>)}<td className="demo-row-actions"><button className="table-action" title="View details" aria-label={`View ${row[table.fields[0].key]}`} onClick={() => setModal({ mode: 'view', row })}><Eye size={15} /></button><button className="table-action" title="Edit record" aria-label={`Edit ${row[table.fields[0].key]}`} onClick={() => setModal({ mode: 'edit', row })}><Pencil size={15} /></button><button className="table-action danger" title="Remove record" aria-label={`Remove ${row[table.fields[0].key]}`} onClick={() => removeRecord(row)}><Trash2 size={15} /></button></td></tr>)}
              {!visibleRows.length && <tr><td colSpan={table.columns.length + 1} className="empty">No records match your search.</td></tr>}
            </tbody></table></div>
          </section>
        </div>}
        {active === 'Reports' && <div className="stack-lg"><section className="page-title"><div><p className="eyebrow">Sample analytics</p><h1>Training reports</h1><p className="muted">Summary reporting updates as you change demo records.</p></div><button className="secondary" onClick={() => changeSection('Training Participation')}><ClipboardList size={15} /> View participation</button></section><div className="stats-grid">{stats.slice(0, 4).map(stat => <DemoStat key={stat.label} {...stat} />)}</div>        <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Programme mix</p><h3>Sample training activity</h3></div></div>{[['Workshops', 74], ['Courses', 58], ['Seminars', 42]].map(([label, value]) => <div className="demo-meter" key={label}><div><span>{label}</span><b>{value}%</b></div><div className="demo-meter-track"><span style={{ width: `${value}%` }} /></div></div>)}<div className="report-links"><button className="secondary" onClick={() => exportCsv('Training Management')}><Download size={15} /> Export sample report</button></div></section></div>}
        {active === 'Administration' && <div className="stack-lg"><section className="page-title"><div><p className="eyebrow">Safe demonstration</p><h1>Administration preview</h1><p className="muted">Real account and access controls stay protected behind authorized sign-in.</p></div><span className="demo-badge">Demo mode</span></section><section className="panel"><p className="eyebrow">Presentation controls</p><h3>Reset demo data</h3><p className="muted">Restore all sample records to their starting state. This only affects this browser session; real accounts and databases are never changed.</p><button className="secondary demo-reset" onClick={resetDemo}><RotateCcw size={15} /> Reset sample data</button></section><section className="panel"><p className="eyebrow">Protected tools</p><h3>Authorized administration</h3><p className="muted">User accounts, imports, and real audit logs require an authorized sign-in to the secured application.</p><Link className="secondary demo-login-link" to="/login">Go to sign-in <ChevronRight size={15} /></Link></section></div>}
      </main>
    </div>
    {modal && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null); }}>
      {modal.mode === 'view'
        ? <section className="modal stack" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title"><div className="modal-head"><div><p className="eyebrow">Fictional sample record</p><h2 id="demo-modal-title">Record details</h2></div><button type="button" className="icon-btn" aria-label="Close details" onClick={() => setModal(null)}><X /></button></div><div className="detail-grid">{table.columns.map(([key, label]) => <div key={key}><span>{label}</span><b>{modal.row[key] || '—'}{key === 'duration' && modal.row[key] ? ' days' : ''}</b></div>)}</div><div className="modal-actions"><button className="secondary" onClick={() => setModal(null)}>Close</button><button className="primary" onClick={() => setModal({ mode: 'edit', row: modal.row })}><Pencil size={15} /> Edit record</button></div></section>
        : <form className="modal stack" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title" onSubmit={saveRecord}><div className="modal-head"><div><p className="eyebrow">{modal.mode === 'edit' ? 'Edit fictional record' : 'New fictional record'}</p><h2 id="demo-modal-title">{active}</h2></div><button type="button" className="icon-btn" aria-label="Close form" onClick={() => setModal(null)}><X /></button></div><div className="form-grid">{table.fields.filter(field => field.key !== 'reference').map(field => <label key={field.key}>{field.label}<input name={field.key} type={field.type || 'text'} min={field.type === 'number' ? '0' : undefined} required={field.required} defaultValue={modal.row?.[field.key] || ''} /></label>)}</div><p className="hint">Changes are temporary demo data and are not sent to a server.</p><div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Cancel</button><button className="primary"><Plus size={15} /> {modal.mode === 'edit' ? 'Save changes' : 'Add record'}</button></div></form>}
    </div>}
  </div>;
}
