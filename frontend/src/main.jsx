import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, ClipboardList, Database, FileText, Settings, LogOut, Menu, X, ShieldCheck, Plus, Search, Trash2, Eye, EyeOff, ChevronRight, Building2, Bell, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import axios from 'axios';
import './styles.css';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api'), withCredentials: true });
const AuthContext = React.createContext(null);
function AuthProvider({ children }) { const [user, setUser] = useState(null); const [loading, setLoading] = useState(true); useEffect(() => { api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => {}).finally(() => setLoading(false)); }, []); return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>; }
const useAuth = () => React.useContext(AuthContext);

function Login() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  if (user) return <Navigate to="/" />;
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      const r = await api.post('/auth/login', { email: form.get('email'), password: form.get('password'), remember: form.get('remember') === 'on' });
      setUser(r.data.user);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in');
    } finally {
      setBusy(false);
    }
  }
  return <main className="login-shell">
    <div className="login-ornament ornament-one" /><div className="login-ornament ornament-two" />
    <section className="login-layout">
      <div className="login-brand-panel">
        <div className="brand-line"><div className="brand-seal"><Building2 size={30} /></div><div><span>Government of India</span><small>Ministry of Statistics & Programme Implementation</small></div></div>
        <div className="brand-copy"><p className="eyebrow light">Authorized administrative portal</p><h1>Faculty & Training<br />Management System</h1><p>One secure workspace for faculty records, training programmes, participant statistics and the central training database.</p></div>
        <div className="brand-features"><div><CheckCircle2 size={18} /><span>Secure employee access</span></div><div><CheckCircle2 size={18} /><span>PostgreSQL database</span></div><div><CheckCircle2 size={18} /><span>Excel dataset synchronization</span></div></div>
      </div>
      <section className="login-card">
        <p className="eyebrow">Employee login</p><h2>Welcome back</h2><p className="muted">Sign in using your assigned government account.</p>
        <form onSubmit={submit} className="stack">
          <label>Email address<input name="email" type="email" placeholder="name@gov.in" autoComplete="username" required /></label>
          <label>Password<div className="password-input"><input name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          <div className="login-options"><label className="check"><input name="remember" type="checkbox" /> Remember me</label><button type="button" className="text-button" onClick={() => setError('For password recovery, contact the Super Admin or department IT administrator.')}>Forgot password?</button></div>
          {error && <div className="alert error">{error}</div>}
          <button className="primary full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'} {!busy && <ChevronRight size={17} />}</button>
        </form>
      </section>
    </section>
  </main>;
}

const navItems = [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }, { to: '/faculty', label: 'Faculty Management', icon: Users }, { to: '/training', label: 'Training Management', icon: GraduationCap }, { to: '/participation', label: 'Training Participation', icon: ClipboardList }, { to: '/training-database', label: 'Training Database', icon: Database }, { to: '/reports', label: 'Reports', icon: FileText }, { to: '/admin', label: 'Administration', icon: Settings }];
function Shell() {
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const nav = useNavigate();
  const location = useLocation();
  async function logout() { await api.post('/auth/logout'); setUser(null); nav('/login'); }
  return <div className="app-shell">
    {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={open ? 'sidebar open' : 'sidebar'}>
      <div className="sidebar-header"><div className="mini-mark"><Building2 size={17} /></div><div><strong>GovPortal</strong><small>Training Administration</small></div><button className="icon-btn mobile-only" onClick={() => setOpen(false)}><X size={18} /></button></div>
      <nav>{navItems.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={location.pathname === to ? 'active' : ''} onClick={() => setOpen(false)}><Icon size={18} /><span>{label}</span></Link>)}</nav>
      <div className="sidebar-footer"><ShieldCheck size={18} /><div><strong>Secure workspace</strong><small>Session protected</small></div></div>
    </aside>
    <div className="main">
      <header><button className="icon-btn mobile-only" onClick={() => setOpen(true)}><Menu /></button><div className="page-context"><p>Government administrative portal</p><h2>{navItems.find(x => x.to === location.pathname)?.label || 'Dashboard'}</h2></div><div className="header-actions"><div className="notification-wrap"><button className="icon-btn notification" title="Notifications" onClick={() => setNoticeOpen(!noticeOpen)}><Bell size={18} /><span /></button>{noticeOpen && <div className="notification-popover"><b>Notifications</b><p>No unread security alerts.</p></div>}</div><div className="profile"><div className="avatar">{user?.name?.slice(0, 1)}</div><div><b>{user?.name}</b><small>{user?.role?.replace('_', ' ')}</small></div><button className="icon-btn" title="Sign out" onClick={logout}><LogOut size={18} /></button></div></div></header>
      <main className="content"><Outlet /></main>
    </div>
  </div>;
}
function Protected() { const { user, loading } = useAuth(); if (loading) return <div className="loading">Loading secure workspace…</div>; return user ? <Shell /> : <Navigate to="/login" replace />; }

function Stat({ label, value, icon: Icon, tone = 'blue' }) { return <div className="stat"><div className={`stat-icon ${tone}`}><Icon size={20} /></div><div><span>{label}</span><strong>{value ?? '—'}</strong></div></div>; }
function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/dashboard').then(r => setData(r.data)); }, []);
  const firstName = user?.name?.split(' ')[0] || 'Administrator';
  return <div className="stack-lg dashboard-page">
    <section className="welcome"><div><p className="eyebrow">Dashboard overview</p><h1>Welcome, {firstName}</h1><p className="muted">Review the latest faculty and training activity across your department.</p></div><Link className="primary" to="/training"><Plus size={17} /> Add training</Link></section>
    <div className="stats-grid">{[['Total faculty', data?.counts.faculty, Users], ['Training programmes', data?.counts.trainings, GraduationCap], ['Participants', data?.counts.participation, ClipboardList], ['Training days', data?.counts.trainingDays, FileText], ['Database records', data?.counts.database, Database], ['Active users', data?.counts.users, ShieldCheck]].map(([l, v, I], i) => <Stat key={l} label={l} value={v} icon={I} tone={['blue','teal','purple','orange','sky','green'][i]} />)}</div>
    <div className="two-col"><section className="panel"><div className="panel-heading"><div><p className="eyebrow">Recent activity</p><h3>Audit trail</h3></div><Link to="/admin">View all <ChevronRight size={14} /></Link></div>{data?.recent?.length ? data.recent.map((x, i) => <div className="activity" key={x.id} style={{ animationDelay: `${i * 45}ms` }}><div className="activity-dot" /><div><b>{x.action.replaceAll('_', ' ').toLowerCase()}</b><p>{x.entity} {x.user ? `by ${x.user.name}` : ''}</p></div><time>{new Date(x.createdAt).toLocaleDateString()}</time></div>) : <p className="empty">No activity recorded yet.</p>}</section><section className="panel"><p className="eyebrow">Quick actions</p><h3>Manage records</h3><div className="quick-links"><Link to="/faculty"><Users size={20} /><span><b>Faculty records</b><small>Maintain faculty information</small></span><ChevronRight size={16} /></Link><Link to="/training"><GraduationCap size={20} /><span><b>Training programmes</b><small>Create and search training</small></span><ChevronRight size={16} /></Link><Link to="/participation"><ClipboardList size={20} /><span><b>Participation statistics</b><small>Track category totals</small></span><ChevronRight size={16} /></Link></div></section></div>
  </div>;
}

const fields = {
  faculty: [['honorific','Honorific'],['name','Faculty name'],['topic','Topic'],['post','Post'],['service','Service'],['officeAddress','Office address'],['email','Email'],['mobile','Mobile number']],
  training: [['name','Training name'],['type','Training type'],['conductedMonth','Month'],['conductedYear','Year'],['startDate','Start date'],['endDate','End date'],['employeeId','Employee ID'],['participantName','Participant name'],['gender','Gender'],['designation','Designation'],['employeeType','Employee type'],['service','Service'],['officeName','RO/SRO/Ministry'],['email','Email'],['mobile','Mobile number']],
  participation: [['training','Training'],['duration','Duration (days)'],['mode','Mode'],['month','Month'],['year','Year'],['dateFrom','Date from'],['dateTo','Date to'],['batchSize','Batch size'],['male','Male'],['female','Female']],
  trainingDatabase: [['trainingName','Training name'],['duration','Duration'],['facultyName','Faculty name'],['officeName','Office name'],['email','Email'],['mobile','Mobile number'],['topic','Topic'],['lectures','No. of lectures'],['bankName','Bank name'],['ifscCode','IFSC code'],['accountNumber','Account number'],['panNumber','PAN number']]
};
function RecordPage({ type, title, description }) {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [notice, setNotice] = useState('');
  const [dropdowns, setDropdowns] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const endpoint = type === 'trainingDatabase' ? 'training-database' : type;
  const load = () => api.get(`/${endpoint}`, { params: { q: query } }).then(r => setRows(r.data));
  useEffect(load, []);
  useEffect(() => { api.get('/dropdowns').then(r => setDropdowns(r.data)).catch(() => {}); }, []);
  async function save(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    if (type === 'participation') {
      data.categories = Object.fromEntries(participationCategories.map(category => [category, Number(formData.get(`category_${category}`) || 0)]));
    }
    try {
      if (type === 'trainingDatabase' && editing?.id) await api.put(`/training-database/${editing.id}`, data);
      else if (type === 'trainingDatabase') await api.post('/training-database', data);
      else if (editing?.id) await api.put(`/${type}/${editing.id}`, data);
      else await api.post(`/${type}`, data);
      setEditing(null); setNotice('Record saved successfully'); load();
    } catch (err) { setNotice(err.response?.data?.message || 'Unable to save record'); }
  }
  async function remove(id) {
    if (!confirm('Archive or permanently delete this record?')) return;
    try {
      await api.delete(type === 'trainingDatabase' ? `/training-database/${id}` : `/${type}/${id}`);
      setNotice('Record removed successfully');
      load();
    } catch (err) { setNotice(err.response?.data?.message || 'Unable to remove record'); }
  }
  const dropdownCategory = {
    honorific: 'honorific', post: 'post', service: 'service', gender: 'gender', designation: 'designation',
    employeeType: 'employeeType', type: 'trainingType', mode: 'mode'
  };
  const numberFields = ['duration','year','batchSize','male','female','conductedYear','lectures','employeeId'];
  const participationCategories = ['ISS','SSO','JSO','SSS','SS','SE','Cont.','Field All','All Field','ASS','AO','Assistant','Stenographer','UDC','LDC','JTO','SCD','MTS','Admin All'];
  const tableColumns = type === 'faculty'
    ? [['serialNo','S. No.'],['name','Faculty name'],['topic','Topic'],['post','Post'],['service','Service'],['officeAddress','Office address'],['email','Email'],['mobile','Mobile']]
    : type === 'training'
      ? [['serialNo','S. No.'],['name','Training name'],['type','Training type'],['conductedMonth','Month'],['conductedYear','Year'],['startDate','Start date'],['endDate','End date'],['participantName','Participant'],['designation','Designation'],['service','Service']]
      : type === 'participation'
        ? [['serialNo','S. No.'],['training','Training'],['duration','Duration'],['mode','Mode'],['month','Month'],['year','Year'],['dateFrom','Date from'],['dateTo','Date to'],['batchSize','Batch size'],['male','Male'],['female','Female']]
        : [['serialNo','S. No.'],['trainingName','Training name'],['duration','Duration'],['facultyName','Faculty name'],['officeName','Office name'],['email','Email'],['mobile','Mobile']];
  const sortedRows = [...rows].sort((a, b) => Number(a.serialNo || 0) - Number(b.serialNo || 0));
  const filteredRows = sortedRows.filter(row => {
    const matchesSearch = !query || tableColumns.some(([key]) => String(row[key] ?? '').toLowerCase().includes(query.toLowerCase()));
    const matchesColumns = tableColumns.every(([key]) => {
      const filter = String(columnFilters[key] || '').trim().toLowerCase();
      return !filter || String(row[key] ?? '').toLowerCase().includes(filter);
    });
    return matchesSearch && matchesColumns;
  });
  const maxPage = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  if (page > maxPage) setPage(maxPage);
  const formatValue = (key, value) => {
    if (value === null || value === undefined || value === '') return '—';
    if (key === 'startDate' || key === 'endDate' || key === 'dateFrom' || key === 'dateTo') return new Date(value).toLocaleDateString();
    return value;
  };
  return <div className="stack-lg"><section className="page-title"><div><p className="eyebrow">Records</p><h1>{title}</h1><p className="muted">{description}</p></div><button className="primary" onClick={() => setEditing({})}><Plus size={17} /> Add record</button></section>{notice && <div className="alert success">{notice}</div>}<section className="panel"><div className="toolbar"><div className="search"><Search size={17} /><input placeholder="Search records…" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} onKeyDown={e => e.key === 'Enter' && load()} /></div><button className="secondary" onClick={() => { setPage(1); load(); }}>Search</button><button className="secondary" onClick={() => { setQuery(''); setColumnFilters({}); setPage(1); load(); }}>Clear</button></div>  <div className="column-filters"><button type="button" className="filter-toggle" aria-expanded={filtersOpen} aria-controls="column-filter-fields" onClick={() => setFiltersOpen(open => !open)}><SlidersHorizontal size={14} /> Filters</button><div className="filter-fields" id="column-filter-fields" hidden={!filtersOpen}>{tableColumns.map(([key, label]) => <label key={key}><span>{label}</span><input value={columnFilters[key] || ''} onChange={e => { setColumnFilters(filters => ({ ...filters, [key]: e.target.value })); setPage(1); }} placeholder={`Filter ${label.toLowerCase()}`} /></label>)}</div></div><div className="table-wrap"><table><thead><tr>{tableColumns.map(([, label]) => <th key={label}>{label}</th>)}<th>Actions</th></tr></thead><tbody>{visibleRows.map(row => <tr key={row.id}>{tableColumns.map(([key]) => <td key={key}>{formatValue(key, row[key])}</td>)}<td><button className="table-action" onClick={() => setViewing(row)} title="View details"><Eye size={15} /></button><button className="table-action" onClick={() => setEditing(row)}>Edit</button><button className="table-action danger" onClick={() => remove(row.id)} title="Remove record"><Trash2 size={15} /></button></td></tr>)}{!visibleRows.length && <tr><td colSpan={tableColumns.length + 1} className="empty">No records found.</td></tr>}</tbody></table></div><div className="pagination"><span>{filteredRows.length ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filteredRows.length)} of ${filteredRows.length}` : '0 records'}</span><div><button className="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button><button className="secondary" disabled={page === maxPage} onClick={() => setPage(p => p + 1)}>Next</button></div></div></section>{editing && <div className="modal-backdrop"><form className="modal stack" onSubmit={save}><div className="modal-head"><div><p className="eyebrow">{editing.id ? 'Edit record' : 'New record'}</p><h2>{title}</h2></div><button type="button" className="icon-btn" onClick={() => setEditing(null)}><X /></button></div><div className="form-grid">{fields[type].map(([key, label]) => {
    const category = dropdownCategory[key];
    return <label key={key}>{label}{category && dropdowns[category]?.length ? <select name={key} defaultValue={editing[key] || ''}><option value="">Select optional value</option>{dropdowns[category].map(value => <option key={value} value={value}>{value}</option>)}</select> : <input name={key} type={key.toLowerCase().includes('date') ? 'date' : key === 'email' ? 'email' : numberFields.includes(key) ? 'number' : 'text'} defaultValue={editing[key] || ''} />} </label>;
  })}{type === 'participation' && <div className="category-editor"><p className="eyebrow">Participation categories</p><div className="form-grid">{participationCategories.map(category => <label key={category}>{category}<input name={`category_${category}`} type="number" min="0" step="1" defaultValue={editing.categories?.[category] ?? 0} /></label>)}</div></div>}</div><p className="hint">All fields are optional. Numeric category values default to zero.</p><div className="modal-actions"><button type="button" className="secondary" onClick={() => setEditing(null)}>Cancel</button><button type="reset" className="secondary">Reset</button><button className="primary">Save record</button></div></form></div>}
  {viewing && <div className="modal-backdrop"><section className="modal detail-modal"><div className="modal-head"><div><p className="eyebrow">Record details</p><h2>{title}</h2></div><button type="button" className="icon-btn" onClick={() => setViewing(null)}><X /></button></div><div className="detail-grid">{Object.entries(viewing).filter(([key]) => !['id','status','sourceKey','createdAt','updatedAt','createdById','financial'].includes(key)).map(([key, value]) => <div key={key}><span>{key.replace(/([A-Z])/g,' $1').replace(/^./, c => c.toUpperCase())}</span>{typeof value === 'object' && value !== null ? <b>{Object.entries(value).map(([category, count]) => `${category}: ${count}`).join(', ')}</b> : <b>{value === null || value === '' || value === undefined ? '—' : key.includes('Date') ? new Date(value).toLocaleDateString() : String(value)}</b>}</div>)}</div>{type === 'participation' && <div className="category-summary"><b>Category total:</b> {Object.values(viewing.categories || {}).reduce((sum, value) => sum + Number(value || 0), 0)} &nbsp; <b>Batch size:</b> {viewing.batchSize ?? '—'} &nbsp; <b>Male/Female:</b> {viewing.male ?? 0}/{viewing.female ?? 0}</div>}<div className="modal-actions"><button className="secondary" onClick={() => setViewing(null)}>Close</button><button className="primary" onClick={() => { setEditing(viewing); setViewing(null); }}>Edit record</button></div></section></div>}
  </div>;
}
function Admin() {
  const [logs, setLogs] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [master, setMaster] = useState([]);
  const [notice, setNotice] = useState('');
  const loadMaster = () => api.get('/dropdown-master').then(r => setMaster(r.data)).catch(() => setMaster([]));
  useEffect(() => {
    api.get('/audit-logs').then(r => setLogs(r.data)).catch(() => {});
    api.get('/initialization/datasets').then(r => setDatasets(r.data.files)).catch(() => setDatasets([]));
    loadMaster();
  }, []);
  async function importDatasets() { setNotice('Importing dataset workbooks…'); try { const r = await api.post('/initialization/datasets/import'); setNotice(`Import completed: ${Object.entries(r.data.counts).map(([k,v]) => `${k} ${v}`).join(', ')}`); } catch (error) { setNotice(error.response?.data?.message || 'Dataset import failed'); } }
  async function addDropdown(e) { e.preventDefault(); const form = new FormData(e.currentTarget); try { await api.post('/dropdowns', { category: form.get('category'), value: form.get('value') }); e.currentTarget.reset(); loadMaster(); setNotice('Dropdown value added successfully'); } catch (error) { setNotice(error.response?.data?.message || 'Unable to add dropdown value'); } }
  async function removeDropdown(id) { if (confirm('Remove this dropdown value?')) { await api.delete(`/dropdowns/${id}`); loadMaster(); } }
  return <div className="stack-lg">
    <section className="page-title"><div><p className="eyebrow">Administration</p><h1>System administration</h1><p className="muted">Manage dataset imports, master dropdowns and security activity.</p></div></section>
    <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Master dropdowns</p><h3>Approved values</h3></div><SlidersHorizontal size={18} /></div><form className="dropdown-form" onSubmit={addDropdown}><label>Category<select name="category" required><option value="">Select category</option>{['honorific','post','service','gender','designation','trainingType','employeeType','mode'].map(value => <option key={value} value={value}>{value}</option>)}</select></label><label>Value<input name="value" placeholder="Enter new value" required /></label><button className="primary"><Plus size={16} /> Add value</button></form><div className="master-tags">{master.map(item => <span className="master-tag" key={item.id}><small>{item.category}</small>{item.value}<button type="button" onClick={() => removeDropdown(item.id)} aria-label={`Remove ${item.value}`}><X size={13} /></button></span>)}</div></section>
    <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Excel dataset import</p><h3>Dataset workbooks</h3></div><button className="primary" onClick={importDatasets}>Import dataset files</button></div>{notice && <div className="alert success">{notice}</div>}<div className="table-wrap"><table><thead><tr><th>File</th><th>Sheets</th></tr></thead><tbody>{datasets.map(file => <tr key={file.fileName}><td>{file.fileName}</td><td>{file.sheets.map(sheet => `${sheet.name} (${sheet.rows} rows)`).join(', ')}</td></tr>)}</tbody></table></div></section>
    <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Security and recovery</p><h3>Audit logs</h3></div></div><div className="table-wrap"><table><thead><tr><th>Action</th><th>Entity</th><th>User</th><th>Timestamp</th></tr></thead><tbody>{logs.map(x => <tr key={x.id}><td><span className="badge">{x.action}</span></td><td>{x.entity}</td><td>{x.user?.name || 'System'}</td><td>{new Date(x.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div></section>
  </div>;
}
function Reports() {
  const [dashboard, setDashboard] = useState(null);
  useEffect(() => { api.get('/dashboard').then(r => setDashboard(r.data)); }, []);
  return <div className="stack-lg report-page"><section className="page-title"><div><p className="eyebrow">Reports</p><h1>Training reports</h1><p className="muted">Generate printable summaries from the PostgreSQL database.</p></div><button className="primary" onClick={() => window.print()}><FileText size={16} /> Print report</button></section><div className="stats-grid">{[['Faculty',dashboard?.counts.faculty,Users],['Training programmes',dashboard?.counts.trainings,GraduationCap],['Participation records',dashboard?.counts.participation,ClipboardList],['Training database',dashboard?.counts.database,Database]].map(([label,value,Icon]) => <Stat key={label} label={label} value={value} icon={Icon} />)}</div><section className="panel"><h3>Report summary</h3><p className="muted">This report reflects the latest records stored in PostgreSQL. Sensitive financial information is excluded.</p><div className="report-links"><Link className="secondary" to="/faculty">Faculty-wise report</Link><Link className="secondary" to="/training">Training-wise report</Link><Link className="secondary" to="/participation">Participation report</Link><Link className="secondary" to="/training-database">Training database report</Link></div></section></div>;
}
function App() { return <AuthProvider><Routes><Route path="/login" element={<Login />} /><Route element={<Protected />}><Route path="/" element={<Dashboard />} /><Route path="/faculty" element={<RecordPage type="faculty" title="Faculty management" description="Maintain faculty master records and contact information." />} /><Route path="/training" element={<RecordPage type="training" title="Training management" description="Create and track training programmes and participants." />} /><Route path="/participation" element={<RecordPage type="participation" title="Training participation" description="Track batch size, gender and category participation totals." />} /><Route path="/training-database" element={<RecordPage type="trainingDatabase" title="Training database" description="Search the central training database." />} /><Route path="/reports" element={<Reports />} /><Route path="/admin" element={<Admin />} /></Route><Route path="*" element={<Navigate to="/" />} /></Routes></AuthProvider>; }
createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>);
