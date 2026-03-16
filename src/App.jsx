// ─────────────────────────────────────────────────────────────────────────────
//  Equishield Investment Group — Full-Stack Investor Transparency Portal
//  Admin Panel + Investor Portal with Firebase Firestore real-time sync
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection, doc, getDoc, getDocs, onSnapshot,
  setDoc, addDoc, updateDoc, deleteDoc, query, where,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ─── GLOBAL CSS INJECTION ────────────────────────────────────────────────────
const CSS = `
:root {
  --bg:        #0a0a0a;
  --bg2:       #111111;
  --bg3:       #161616;
  --bg4:       #1c1c1c;
  --gold:      #c9a84c;
  --gold2:     #e8c87a;
  --gold3:     #8a6820;
  --goldbg:    rgba(201,168,76,0.08);
  --goldbord:  rgba(201,168,76,0.25);
  --t1:        #f5f5f0;
  --t2:        #a0a090;
  --t3:        #555548;
  --bord:      rgba(255,255,255,0.07);
  --success:   #5db87c;
  --danger:    #e05555;
  --warn:      #e09a35;
  --radius:    12px;
  --radius-sm: 8px;
  --shadow:    0 8px 32px rgba(0,0,0,0.6);
  --fd:        'Calibri', Georgia, serif;
  --fb:        'Calibri', system-ui, sans-serif;
}
*, *::before, *::after { box-sizing: border-box; }
.eq-app { min-height: 100vh; background: var(--bg); color: var(--t1); font-family: var(--fb); }

/* ── LAYOUT ── */
.page-center { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
.shell { display: flex; flex-direction: column; min-height: 100vh; }
.topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,10,10,0.92); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--bord);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; height: 64px;
}
.topbar-brand { display: flex; align-items: center; gap: 12px; }
.topbar-brand-name { font-family: var(--fd); font-size: 22px; font-weight: 600; color: var(--t1); letter-spacing: 0.02em; }
.topbar-brand-tag { font-size: 11px; color: var(--t2); letter-spacing: 0.12em; text-transform: uppercase; }
.topbar-right { display: flex; align-items: center; gap: 16px; }
.topbar-user { font-size: 13px; color: var(--t2); }
.main-content { flex: 1; padding: 28px 24px 60px; max-width: 1200px; width: 100%; margin: 0 auto; }

/* ── TABS ── */
.tabs { display: flex; gap: 2px; background: var(--bg2); border-radius: var(--radius); padding: 4px; margin-bottom: 28px; overflow-x: auto; }
.tab-btn {
  flex: 1; min-width: max-content; padding: 9px 18px; border: none; border-radius: 9px; cursor: pointer;
  font-family: var(--fb); font-size: 13px; font-weight: 500; letter-spacing: 0.02em; white-space: nowrap;
  background: transparent; color: var(--t2); transition: all 0.2s ease;
}
.tab-btn:hover { color: var(--t1); background: rgba(255,255,255,0.05); }
.tab-btn.active { background: var(--goldbg); color: var(--gold); border: 1px solid var(--goldbord); }

/* ── CARDS ── */
.cards-row { display: grid; gap: 16px; margin-bottom: 28px; }
.cards-row.cols-4 { grid-template-columns: repeat(4, 1fr); }
.cards-row.cols-3 { grid-template-columns: repeat(3, 1fr); }
.cards-row.cols-2 { grid-template-columns: repeat(2, 1fr); }
.stat-card {
  background: var(--bg3); border: 1px solid var(--bord); border-radius: var(--radius);
  padding: 22px 20px; position: relative; overflow: hidden; transition: border-color 0.2s;
}
.stat-card:hover { border-color: var(--goldbord); }
.stat-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  opacity: 0; transition: opacity 0.3s;
}
.stat-card:hover::before { opacity: 0.5; }
.stat-label { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--t2); margin-bottom: 10px; }
.stat-value { font-family: var(--fd); font-size: 28px; font-weight: 600; color: var(--t1); line-height: 1; margin-bottom: 4px; }
.stat-sub { font-size: 12px; color: var(--t2); }
.stat-value.gold { color: var(--gold); }
.stat-value.green { color: var(--success); }

/* ── INVESTOR CARDS ── */
.investor-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.investor-card {
  background: var(--bg3); border: 1px solid var(--bord); border-radius: var(--radius);
  padding: 22px; transition: all 0.2s;
}
.investor-card:hover { border-color: var(--goldbord); transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.4); }
.inv-card-head { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.inv-avatar {
  width: 44px; height: 44px; border-radius: 50%; background: var(--goldbg);
  border: 1px solid var(--goldbord); display: flex; align-items: center; justify-content: center;
  font-family: var(--fd); font-size: 18px; font-weight: 600; color: var(--gold); flex-shrink: 0;
}
.inv-name { font-family: var(--fd); font-size: 18px; font-weight: 600; color: var(--t1); }
.inv-phone { font-size: 12px; color: var(--t2); margin-top: 2px; }
.inv-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.inv-stat { background: var(--bg4); border-radius: var(--radius-sm); padding: 10px 12px; }
.inv-stat-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--t3); margin-bottom: 4px; }
.inv-stat-value { font-size: 14px; font-weight: 600; color: var(--t1); }
.inv-stat-value.gold { color: var(--gold); }
.inv-stat-value.green { color: var(--success); }
.inv-stat-value.red { color: var(--danger); }

/* ── TABLE ── */
.table-wrap { overflow-x: auto; border-radius: var(--radius); border: 1px solid var(--bord); }
table { width: 100%; border-collapse: collapse; min-width: 600px; }
thead tr { background: var(--bg2); }
th {
  padding: 12px 16px; text-align: left; font-size: 11px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--t2); font-weight: 500; white-space: nowrap;
  border-bottom: 1px solid var(--bord);
}
td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid var(--bord); vertical-align: middle; }
tbody tr { transition: background 0.15s; }
tbody tr:hover { background: rgba(255,255,255,0.025); }
tbody tr:last-child td { border-bottom: none; }
.td-name { font-weight: 500; color: var(--t1); }
.td-gold { color: var(--gold); font-weight: 600; }
.td-green { color: var(--success); }
.td-red { color: var(--danger); }
.td-muted { color: var(--t2); font-size: 13px; }
.td-note { font-size: 12px; color: var(--t2); max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ── FORMS ── */
.form-card {
  background: var(--bg3); border: 1px solid var(--bord); border-radius: var(--radius);
  padding: 28px; max-width: 520px;
}
.form-title { font-family: var(--fd); font-size: 26px; font-weight: 600; margin-bottom: 6px; color: var(--t1); }
.form-sub { font-size: 13px; color: var(--t2); margin-bottom: 28px; }
.form-row { display: grid; gap: 16px; margin-bottom: 16px; }
.form-row.cols-2 { grid-template-columns: 1fr 1fr; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--t2); font-weight: 500; }
.field-input {
  background: var(--bg2); border: 1px solid var(--bord); border-radius: var(--radius-sm);
  padding: 11px 14px; font-size: 14px; color: var(--t1); font-family: var(--fb);
  transition: border-color 0.2s, box-shadow 0.2s; outline: none; width: 100%;
}
.field-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
.field-input::placeholder { color: var(--t3); }
.field-input-wrap { position: relative; }
.field-input-wrap .field-input { padding-right: 42px; }
.eye-btn {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: var(--t2); padding: 4px;
  display: flex; align-items: center; transition: color 0.2s;
}
.eye-btn:hover { color: var(--gold); }
select.field-input { cursor: pointer; }
select.field-input option { background: #1a1a1a; color: var(--t1); }

/* ── BUTTONS ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 11px 22px; border-radius: var(--radius-sm); font-family: var(--fb);
  font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;
  border: none; letter-spacing: 0.02em; white-space: nowrap;
}
.btn-primary {
  background: var(--gold); color: #0a0a0a; font-weight: 600;
}
.btn-primary:hover { background: var(--gold2); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,168,76,0.35); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-ghost {
  background: transparent; color: var(--t2); border: 1px solid var(--bord);
}
.btn-ghost:hover { color: var(--t1); border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.04); }
.btn-danger { background: rgba(224,85,85,0.12); color: var(--danger); border: 1px solid rgba(224,85,85,0.25); }
.btn-danger:hover { background: rgba(224,85,85,0.22); }
.btn-sm { padding: 7px 14px; font-size: 12px; }
.btn-icon { padding: 8px; border-radius: 8px; }
.btn-full { width: 100%; }

/* ── LOGIN PAGE ── */
.login-card {
  background: var(--bg3); border: 1px solid var(--goldbord); border-radius: 18px;
  padding: 48px 42px; width: 100%; max-width: 420px; box-shadow: var(--shadow);
  position: relative; overflow: hidden;
}
.login-card::before {
  content: ''; position: absolute; top: -80px; right: -80px;
  width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.login-logo { display: flex; flex-direction: column; align-items: center; margin-bottom: 36px; gap: 12px; }
.login-title { font-family: var(--fd); font-size: 32px; font-weight: 600; color: var(--t1); text-align: center; line-height: 1.1; }
.login-sub { font-size: 12px; color: var(--t2); letter-spacing: 0.14em; text-transform: uppercase; text-align: center; }
.login-divider { width: 40px; height: 1px; background: var(--goldbord); margin: 0 auto 28px; }
.login-error { background: rgba(224,85,85,0.1); border: 1px solid rgba(224,85,85,0.3); border-radius: 8px; padding: 10px 14px; font-size: 13px; color: var(--danger); margin-bottom: 16px; text-align: center; }

/* ── BADGES ── */
.badge {
  display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
}
.badge-green { background: rgba(93,184,124,0.12); color: var(--success); border: 1px solid rgba(93,184,124,0.25); }
.badge-red { background: rgba(224,85,85,0.12); color: var(--danger); border: 1px solid rgba(224,85,85,0.25); }
.badge-gold { background: var(--goldbg); color: var(--gold); border: 1px solid var(--goldbord); }

/* ── SECTION HEADER ── */
.sec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.sec-title { font-family: var(--fd); font-size: 26px; font-weight: 600; color: var(--t1); }
.sec-sub { font-size: 13px; color: var(--t2); margin-top: 2px; }

/* ── INLINE EDIT ── */
.inline-edit { display: flex; align-items: center; gap: 8px; }
.inline-input {
  background: var(--bg2); border: 1px solid var(--goldbord); border-radius: 6px;
  padding: 6px 10px; font-size: 14px; color: var(--t1); font-family: var(--fb);
  outline: none; width: 130px;
}
.inline-input:focus { box-shadow: 0 0 0 2px rgba(201,168,76,0.2); }

/* ── FILTER BAR ── */
.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; }
.filter-select {
  background: var(--bg2); border: 1px solid var(--bord); border-radius: var(--radius-sm);
  padding: 8px 14px; font-size: 13px; color: var(--t1); font-family: var(--fb);
  outline: none; cursor: pointer; transition: border-color 0.2s;
}
.filter-select:focus { border-color: var(--gold); }
.filter-label { font-size: 12px; color: var(--t2); letter-spacing: 0.06em; text-transform: uppercase; }

/* ── PORTFOLIO BAR ── */
.portfolio-bar-wrap { background: var(--bg3); border: 1px solid var(--bord); border-radius: var(--radius); padding: 22px; margin-bottom: 20px; }
.portfolio-bar-labels { display: flex; justify-content: space-between; margin-bottom: 10px; }
.portfolio-bar-label { font-size: 12px; color: var(--t2); }
.portfolio-bar-value { font-weight: 600; color: var(--t1); }
.portfolio-bar-track { background: var(--bg2); border-radius: 6px; height: 10px; overflow: hidden; margin-bottom: 12px; }
.portfolio-bar-fill { height: 100%; border-radius: 6px; background: linear-gradient(90deg, var(--gold3), var(--gold), var(--gold2)); transition: width 0.8s ease; }
.portfolio-bar-foot { display: flex; justify-content: space-between; }
.pbar-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--t2); }
.pbar-dot { width: 8px; height: 8px; border-radius: 50%; }

/* ── CHART AREA ── */
.chart-card { background: var(--bg3); border: 1px solid var(--bord); border-radius: var(--radius); padding: 24px; margin-bottom: 20px; }
.chart-title { font-family: var(--fd); font-size: 20px; font-weight: 600; color: var(--t1); margin-bottom: 18px; }
.custom-tooltip { background: var(--bg4); border: 1px solid var(--goldbord); border-radius: 8px; padding: 10px 14px; font-size: 13px; }
.custom-tooltip .ct-label { color: var(--t2); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px; }
.custom-tooltip .ct-value { color: var(--gold); font-weight: 600; }

/* ── SETTINGS ── */
.settings-section { background: var(--bg3); border: 1px solid var(--bord); border-radius: var(--radius); padding: 24px; margin-bottom: 20px; }
.settings-title { font-size: 14px; font-weight: 600; color: var(--t2); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
.settings-title::after { content: ''; flex: 1; height: 1px; background: var(--bord); }

/* ── LIVE INDICATOR ── */
.live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--success); box-shadow: 0 0 6px var(--success); animation: pulse 2s infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
.live-badge { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--t2); letter-spacing: 0.08em; text-transform: uppercase; }

/* ── EMPTY STATE ── */
.empty-state { padding: 60px 20px; text-align: center; color: var(--t2); }
.empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.4; }
.empty-text { font-size: 15px; color: var(--t2); }

/* ── TOAST ── */
.toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  background: var(--bg4); border: 1px solid var(--goldbord); border-radius: 10px;
  padding: 14px 20px; font-size: 14px; color: var(--t1); box-shadow: var(--shadow);
  animation: slideUp 0.3s ease; max-width: 320px;
}
.toast.success { border-color: rgba(93,184,124,0.4); }
.toast.error { border-color: rgba(224,85,85,0.4); color: var(--danger); }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

/* ── LOADING ── */
.loader-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 80px; color: var(--t2); font-size: 14px; }
.spinner { width: 32px; height: 32px; border: 2px solid var(--bord); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── DIVIDER ── */
.divider { height: 1px; background: var(--bord); margin: 24px 0; }

/* ── SCROLLABLE TABLE ── */
.table-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }

/* ── OVERVIEW BREAKDOWNS ── */
.breakdown-list { display: flex; flex-direction: column; gap: 12px; }
.breakdown-item { background: var(--bg3); border: 1px solid var(--bord); border-radius: var(--radius-sm); padding: 16px; }
.breakdown-item-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.breakdown-desc { font-size: 14px; font-weight: 500; color: var(--t1); }
.breakdown-date { font-size: 12px; color: var(--t2); }
.breakdown-bar-track { background: var(--bg2); border-radius: 4px; height: 6px; overflow: hidden; margin-bottom: 8px; }
.breakdown-bar-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--gold3), var(--gold)); }
.breakdown-nums { display: flex; justify-content: space-between; font-size: 13px; color: var(--t2); }

/* ── WITHDRAWAL ── */
.withdraw-card { background: var(--bg3); border: 1px solid var(--bord); border-radius: var(--radius); padding: 24px; max-width: 520px; }
.withdraw-history { margin-top: 28px; }
.withdraw-item { background: var(--bg3); border: 1px solid var(--bord); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.withdraw-item-left .wd-desc { font-size: 14px; font-weight: 500; color: var(--t1); }
.withdraw-item-left .wd-date { font-size: 12px; color: var(--t2); margin-top: 2px; }
.withdraw-item-right { display: flex; align-items: center; gap: 12px; }
.badge-warn { background: rgba(224,154,53,0.12); color: var(--warn); border: 1px solid rgba(224,154,53,0.3); }
.admin-wd-row { display: flex; align-items: center; gap: 8px; }

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .cards-row.cols-4 { grid-template-columns: repeat(2, 1fr); }
  .main-content { padding: 20px 16px 48px; }
  .topbar { padding: 0 16px; }
}
@media (max-width: 600px) {
  .cards-row.cols-4, .cards-row.cols-3 { grid-template-columns: 1fr 1fr; }
  .cards-row.cols-2 { grid-template-columns: 1fr 1fr; }
  .login-card { padding: 36px 24px; }
  .form-card { padding: 22px; }
  .form-row.cols-2 { grid-template-columns: 1fr; }
  .topbar-brand-name { font-size: 18px; }
  .stat-value { font-size: 22px; }
  .sec-title { font-size: 22px; }
  .tabs { gap: 1px; padding: 3px; }
  .tab-btn { padding: 8px 12px; font-size: 12px; }
  .toast { left: 16px; right: 16px; bottom: 16px; }
}
@media (max-width: 420px) {
  .cards-row.cols-4 { grid-template-columns: 1fr 1fr; }
  .inv-stats { grid-template-columns: 1fr 1fr; }
}
`;

// ─── HELPERS ────────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById('eq-styles')) return;
  const el = document.createElement('style');
  el.id = 'eq-styles';
  el.textContent = CSS;
  document.head.appendChild(el);
};

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtPct = (n) => (n >= 0 ? '+' : '') + Number(n || 0).toFixed(2) + '%';
const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};
const pct = (invested, current) => invested ? ((current - invested) / invested) * 100 : 0;
const initials = (name) => name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
const genId = () => Math.random().toString(36).substr(2, 9);

// ─── TOAST ──────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return <div className={`toast ${type}`}>{msg}</div>;
}
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => setToast({ msg, type, id: Date.now() }), []);
  const el = toast ? <Toast key={toast.id} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} /> : null;
  return [show, el];
}

// ─── SHIELD SVG LOGO ─────────────────────────────────────────────────────────
function ShieldLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 4L6 14V34C6 50.2 17.3 63.6 32 68C46.7 63.6 58 50.2 58 34V14L32 4Z"
        fill="url(#shieldGrad)" stroke="rgba(201,168,76,0.5)" strokeWidth="1" />
      <path d="M32 12L12 20V34C12 47 21.2 57.8 32 62C42.8 57.8 52 47 52 34V20L32 12Z"
        fill="rgba(10,10,10,0.6)" />
      <text x="32" y="42" textAnchor="middle" fontSize="22" fontWeight="bold"
        fill="url(#textGrad)" fontFamily="Cormorant Garamond, serif" letterSpacing="1">E</text>
      <defs>
        <linearGradient id="shieldGrad" x1="32" y1="4" x2="32" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e8c87a" />
          <stop offset="100%" stopColor="#8a6820" />
        </linearGradient>
        <linearGradient id="textGrad" x1="32" y1="22" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5f5f0" />
          <stop offset="100%" stopColor="#c9a84c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
async function seedIfEmpty() {
  const adminRef = doc(db, 'admin', 'config');
  const adminSnap = await getDoc(adminRef);
  if (adminSnap.exists()) return;

  // Admin
  await setDoc(adminRef, { phone: '9999999999', password: 'admin123' });

  // Investors
  const inv1Id = 'investor_rajesh';
  const inv2Id = 'investor_priya';
  const inv3Id = 'investor_anil';

  await setDoc(doc(db, 'investors', inv1Id), {
    name: 'Rajesh Sharma', phone: '9876543210', password: 'rajesh123',
    email: 'rajesh.sharma@example.com', joinDate: '2023-01-15',
  });
  await setDoc(doc(db, 'investors', inv2Id), {
    name: 'Priya Mehta', phone: '9123456789', password: 'priya123',
    email: 'priya.mehta@example.com', joinDate: '2023-03-20',
  });
  await setDoc(doc(db, 'investors', inv3Id), {
    name: 'Anil Kumar', phone: '9988776655', password: 'anil123',
    email: 'anil.kumar@example.com', joinDate: '2023-06-10',
  });

  // Investments for Rajesh
  await setDoc(doc(db, 'investments', genId() + '_r1'), { investorId: inv1Id, date: '2023-01-20', amount: 2500000, currentValue: 3120000, note: 'Private Equity Fund A — Series B' });
  await setDoc(doc(db, 'investments', genId() + '_r2'), { investorId: inv1Id, date: '2023-07-10', amount: 1800000, currentValue: 2050000, note: 'Real Estate Debt Instrument' });
  await setDoc(doc(db, 'investments', genId() + '_r3'), { investorId: inv1Id, date: '2024-02-01', amount: 1200000, currentValue: 1380000, note: 'Structured Credit Portfolio' });

  // Investments for Priya
  await setDoc(doc(db, 'investments', genId() + '_p1'), { investorId: inv2Id, date: '2023-04-05', amount: 3000000, currentValue: 3850000, note: 'Growth Equity — FinTech Basket' });
  await setDoc(doc(db, 'investments', genId() + '_p2'), { investorId: inv2Id, date: '2023-10-15', amount: 1500000, currentValue: 1620000, note: 'Fixed Income — Corporate Bonds' });

  // Investments for Anil
  await setDoc(doc(db, 'investments', genId() + '_a1'), { investorId: inv3Id, date: '2023-07-01', amount: 5000000, currentValue: 6200000, note: 'Diversified Equity Portfolio' });
  await setDoc(doc(db, 'investments', genId() + '_a2'), { investorId: inv3Id, date: '2024-01-10', amount: 2000000, currentValue: 2280000, note: 'Infrastructure Fund — Tranche II' });
}

// ─── LOGIN PAGE ──────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) { setError('Please enter phone and password.'); return; }
    setLoading(true); setError('');
    try {
      // Check admin
      const adminSnap = await getDoc(doc(db, 'admin', 'config'));
      if (adminSnap.exists()) {
        const a = adminSnap.data();
        if (a.phone === phone && a.password === password) {
          onLogin({ type: 'admin' }); return;
        }
      }
      // Check investors
      const q = query(collection(db, 'investors'), where('phone', '==', phone));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const invDoc = snap.docs[0];
        const inv = invDoc.data();
        if (inv.password === password) {
          onLogin({ type: 'investor', id: invDoc.id, ...inv }); return;
        }
      }
      setError('Invalid phone number or password.');
    } catch (err) {
      setError('Connection error. Check your Firebase config.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center" style={{ background: 'var(--bg)' }}>
      <div className="login-card">
        <div className="login-logo">
          <ShieldLogo size={56} />
          <div>
            <div className="login-title">Equishield</div>
            <div className="login-sub">Investment Group</div>
          </div>
        </div>
        <div className="login-divider" />
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="field">
              <label className="field-label">Phone Number</label>
              <input className="field-input" type="tel" placeholder="10-digit phone number"
                value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} />
            </div>
            <div className="field">
              <label className="field-label">Password</label>
              <div className="field-input-wrap">
                <input className="field-input" type={showPw ? 'text' : 'password'} placeholder="Enter password"
                  value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="eye-btn" onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
            </div>
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}
            style={{ marginTop: 8, height: 48, fontSize: 15 }}>
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 11, color: 'var(--t3)', letterSpacing: '0.08em' }}>
          SECURED BY EQUISHIELD ENTERPRISE SECURITY
        </div>
      </div>
    </div>
  );
}

// ─── EYE ICONS ───────────────────────────────────────────────────────────────
const EyeOn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ─── CUSTOM CHART TOOLTIP ────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="ct-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--gold)', fontWeight: 600, fontSize: 14 }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN PANEL ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AdminPanel({ adminUser, onLogout }) {
  const [tab, setTab] = useState('investors');
  const [investors, setInvestors] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [showToast, toastEl] = useToast();

  // Real-time listeners
  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'investors'), snap => {
      setInvestors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsub2 = onSnapshot(collection(db, 'investments'), snap => {
      setInvestments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsub3 = onSnapshot(collection(db, 'withdrawals'), snap => {
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsub4 = onSnapshot(collection(db, 'snapshots'), snap => {
      setSnapshots(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, []);

  // Summary stats
  const totalAUM = investments.reduce((s, i) => s + Number(i.currentValue || 0), 0);
  const totalInvested = investments.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalReturns = totalAUM - totalInvested;

  const pendingWd = withdrawals.filter(w => w.status === 'pending').length;
  const tabs = [
    { id: 'investors',       label: 'Investors' },
    { id: 'investments',     label: 'Investments' },
    { id: 'returns',         label: '% Returns' },
    { id: 'eod',             label: 'EOD Values' },
    { id: 'withdrawals',     label: `Withdrawals${pendingWd > 0 ? ` (${pendingWd})` : ''}` },
    { id: 'add-investor',    label: 'Add Investor' },
    { id: 'add-investment',  label: 'Add Investment' },
    { id: 'settings',        label: 'Settings' },
  ];

  return (
    <div className="shell">
      {toastEl}
      <div className="topbar">
        <div className="topbar-brand">
          <ShieldLogo size={32} />
          <div>
            <div className="topbar-brand-name">Equishield</div>
            <div className="topbar-brand-tag">Admin Panel</div>
          </div>
        </div>
        <div className="topbar-right">
          <div className="live-badge"><div className="live-dot" /> Live</div>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign Out</button>
        </div>
      </div>
      <div className="main-content">
        {/* Summary Cards */}
        <div className="cards-row cols-4">
          <div className="stat-card">
            <div className="stat-label">Total AUM</div>
            <div className="stat-value gold">{fmt(totalAUM)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Invested</div>
            <div className="stat-value">{fmt(totalInvested)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Returns</div>
            <div className={`stat-value ${totalReturns >= 0 ? 'green' : ''}`}>{fmt(totalReturns)}</div>
            <div className="stat-sub">{fmtPct(pct(totalInvested, totalAUM))}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Investors</div>
            <div className="stat-value gold">{investors.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {tab === 'investors' && <AdminInvestorsTab investors={investors} investments={investments} showToast={showToast} />}
        {tab === 'investments' && <AdminInvestmentsTab investors={investors} investments={investments} showToast={showToast} />}
        {tab === 'returns' && <AdminReturnsTab investors={investors} investments={investments} showToast={showToast} />}
        {tab === 'eod' && <AdminEODTab investors={investors} investments={investments} snapshots={snapshots} showToast={showToast} />}
        {tab === 'withdrawals' && <AdminWithdrawalsTab withdrawals={withdrawals} investors={investors} investments={investments} showToast={showToast} />}
        {tab === 'add-investor' && <AddInvestorTab onDone={() => setTab('investors')} showToast={showToast} />}
        {tab === 'add-investment' && <AddInvestmentTab investors={investors} onDone={() => setTab('investments')} showToast={showToast} />}
        {tab === 'settings' && <SettingsTab investors={investors} showToast={showToast} />}
      </div>
    </div>
  );
}

// ─── ADMIN: INVESTORS TAB ─────────────────────────────────────────────────────
function AdminInvestorsTab({ investors, investments, showToast }) {
  const invMap = {};
  investors.forEach(i => {
    const invs = investments.filter(x => x.investorId === i.id);
    invMap[i.id] = {
      invested: invs.reduce((s, x) => s + Number(x.amount || 0), 0),
      current: invs.reduce((s, x) => s + Number(x.currentValue || 0), 0),
      count: invs.length,
    };
  });

  const deleteInvestor = async (inv) => {
    if (!window.confirm(`Delete ${inv.name}? This will also delete all their investments and withdrawal requests. This cannot be undone.`)) return;
    try {
      // Delete all investments
      const invDocs = investments.filter(x => x.investorId === inv.id);
      for (const d of invDocs) await deleteDoc(doc(db, 'investments', d.id));
      // Delete all withdrawals
      const wdSnap = await getDocs(query(collection(db, 'withdrawals'), where('investorId', '==', inv.id)));
      for (const d of wdSnap.docs) await deleteDoc(doc(db, 'withdrawals', d.id));
      // Delete investor
      await deleteDoc(doc(db, 'investors', inv.id));
      showToast(`${inv.name} removed ✓`);
    } catch (e) { showToast('Delete failed', 'error'); console.error(e); }
  };

  return (
    <div>
      <div className="sec-head">
        <div>
          <div className="sec-title">Investors</div>
          <div className="sec-sub">{investors.length} active accounts</div>
        </div>
      </div>
      {investors.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">👤</div><div className="empty-text">No investors yet</div></div>
      ) : (
        <div className="investor-grid">
          {investors.map(inv => {
            const stats = invMap[inv.id] || { invested: 0, current: 0, count: 0 };
            const ret = stats.current - stats.invested;
            const retPct = pct(stats.invested, stats.current);
            return (
              <div key={inv.id} className="investor-card">
                <div className="inv-card-head">
                  <div className="inv-avatar">{initials(inv.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div className="inv-name">{inv.name}</div>
                    <div className="inv-phone">{inv.phone} · {stats.count} investment{stats.count !== 1 ? 's' : ''}</div>
                  </div>
                  <button className="btn btn-danger btn-sm btn-icon" title="Remove investor" onClick={() => deleteInvestor(inv)}><TrashIcon /></button>
                </div>
                <div className="inv-stats">
                  <div className="inv-stat">
                    <div className="inv-stat-label">Invested</div>
                    <div className="inv-stat-value">{fmt(stats.invested)}</div>
                  </div>
                  <div className="inv-stat">
                    <div className="inv-stat-label">Current</div>
                    <div className="inv-stat-value gold">{fmt(stats.current)}</div>
                  </div>
                  <div className="inv-stat">
                    <div className="inv-stat-label">Returns</div>
                    <div className={`inv-stat-value ${ret >= 0 ? 'green' : 'red'}`}>{fmt(ret)}</div>
                  </div>
                  <div className="inv-stat">
                    <div className="inv-stat-label">Return %</div>
                    <div className={`inv-stat-value ${retPct >= 0 ? 'green' : 'red'}`}>{fmtPct(retPct)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ADMIN: INVESTMENTS TAB ───────────────────────────────────────────────────
function AdminInvestmentsTab({ investors, investments, showToast }) {
  const [filter, setFilter] = useState('all');
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = filter === 'all' ? investments : investments.filter(x => x.investorId === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  const investorMap = Object.fromEntries(investors.map(i => [i.id, i.name]));

  const startEdit = (inv) => { setEditId(inv.id); setEditVal(String(inv.currentValue)); };
  const cancelEdit = () => { setEditId(null); setEditVal(''); };

  const saveEdit = async (id) => {
    const val = parseFloat(editVal.replace(/,/g, ''));
    if (isNaN(val) || val < 0) { showToast('Enter a valid amount', 'error'); return; }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'investments', id), { currentValue: val });
      showToast('Current value updated ✓');
      cancelEdit();
    } catch { showToast('Failed to update', 'error'); }
    finally { setSaving(false); }
  };

  const deleteInv = async (id) => {
    if (!window.confirm('Delete this investment?')) return;
    try {
      await deleteDoc(doc(db, 'investments', id));
      showToast('Investment deleted');
    } catch { showToast('Delete failed', 'error'); }
  };

  return (
    <div>
      <div className="table-toolbar">
        <div>
          <div className="sec-title">Investments</div>
          <div className="sec-sub">{filtered.length} records</div>
        </div>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <span className="filter-label">Filter:</span>
          <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Investors</option>
            {investors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
      </div>
      {sorted.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-text">No investments found</div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Investor</th><th>Date</th><th>Note / Description</th>
                <th>Amount Invested</th><th>Current Value</th><th>Return</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(inv => {
                const ret = Number(inv.currentValue || 0) - Number(inv.amount || 0);
                const retPct = pct(inv.amount, inv.currentValue);
                const isEditing = editId === inv.id;
                return (
                  <tr key={inv.id}>
                    <td className="td-name">{investorMap[inv.investorId] || '—'}</td>
                    <td className="td-muted">{fmtDate(inv.date)}</td>
                    <td><span className="td-note">{inv.note || '—'}</span></td>
                    <td>{fmt(inv.amount)}</td>
                    <td>
                      {isEditing ? (
                        <div className="inline-edit">
                          <input className="inline-input" value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEdit(inv.id); if (e.key === 'Escape') cancelEdit(); }}
                            autoFocus />
                          <button className="btn btn-sm" style={{ background: 'var(--goldbg)', color: 'var(--gold)', border: '1px solid var(--goldbord)', padding: '6px 8px' }}
                            onClick={() => saveEdit(inv.id)} disabled={saving}><CheckIcon /></button>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={cancelEdit}><XIcon /></button>
                        </div>
                      ) : (
                        <span className="td-gold">{fmt(inv.currentValue)}</span>
                      )}
                    </td>
                    <td>
                      <span className={ret >= 0 ? 'td-green' : 'td-red'}>
                        {fmt(ret)} <span style={{ fontSize: 12, marginLeft: 4 }}>({fmtPct(retPct)})</span>
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {!isEditing && (
                          <button className="btn btn-ghost btn-sm btn-icon" title="Edit current value" onClick={() => startEdit(inv)}>
                            <EditIcon />
                          </button>
                        )}
                        <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => deleteInv(inv.id)}>
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN: ADD INVESTOR ──────────────────────────────────────────────────────
function AddInvestorTab({ onDone, showToast }) {
  const [form, setForm] = useState({ name: '', phone: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password) { showToast('Fill all required fields', 'error'); return; }
    if (form.phone.length !== 10) { showToast('Phone must be 10 digits', 'error'); return; }
    setLoading(true);
    try {
      // Check duplicate phone
      const q = query(collection(db, 'investors'), where('phone', '==', form.phone));
      const snap = await getDocs(q);
      if (!snap.empty) { showToast('Phone number already exists', 'error'); setLoading(false); return; }
      await addDoc(collection(db, 'investors'), { ...form, joinDate: new Date().toISOString().split('T')[0] });
      showToast(`${form.name} added successfully ✓`);
      setForm({ name: '', phone: '', password: '', email: '' });
      setTimeout(onDone, 800);
    } catch { showToast('Failed to add investor', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="sec-head">
        <div><div className="sec-title">Add Investor</div><div className="sec-sub">Create a new investor account</div></div>
      </div>
      <form className="form-card" onSubmit={submit}>
        <div className="form-row">
          <div className="field">
            <label className="field-label">Full Name *</label>
            <input className="field-input" placeholder="e.g. Vikram Nair" value={form.name} onChange={set('name')} />
          </div>
        </div>
        <div className="form-row cols-2">
          <div className="field">
            <label className="field-label">Phone Number *</label>
            <input className="field-input" type="tel" placeholder="10-digit number"
              value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g,'').slice(0,10) }))} />
          </div>
          <div className="field">
            <label className="field-label">Password *</label>
            <div className="field-input-wrap">
              <input className="field-input" type={showPw ? 'text' : 'password'} placeholder="Set password"
                value={form.password} onChange={set('password')} />
              <button type="button" className="eye-btn" onClick={() => setShowPw(v => !v)}>{showPw ? <EyeOff /> : <EyeOn />}</button>
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label className="field-label">Email Address</label>
            <input className="field-input" type="email" placeholder="investor@example.com" value={form.email} onChange={set('email')} />
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Adding…' : 'Add Investor'}
        </button>
      </form>
    </div>
  );
}

// ─── ADMIN: ADD INVESTMENT ────────────────────────────────────────────────────
function AddInvestmentTab({ investors, onDone, showToast }) {
  const [form, setForm] = useState({ investorId: '', date: new Date().toISOString().split('T')[0], amount: '', currentValue: '', note: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.investorId || !form.date || !form.amount) { showToast('Fill all required fields', 'error'); return; }
    const amt = parseFloat(form.amount.replace(/,/g,''));
    const cur = parseFloat((form.currentValue || form.amount).replace(/,/g,''));
    if (isNaN(amt) || amt <= 0) { showToast('Enter a valid amount', 'error'); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, 'investments'), { investorId: form.investorId, date: form.date, amount: amt, currentValue: isNaN(cur) ? amt : cur, note: form.note });
      showToast('Investment added ✓');
      setForm({ investorId: '', date: new Date().toISOString().split('T')[0], amount: '', currentValue: '', note: '' });
      setTimeout(onDone, 800);
    } catch { showToast('Failed to add investment', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="sec-head">
        <div><div className="sec-title">Add Investment</div><div className="sec-sub">Record a new investment entry</div></div>
      </div>
      <form className="form-card" onSubmit={submit}>
        <div className="form-row">
          <div className="field">
            <label className="field-label">Investor *</label>
            <select className="field-input" value={form.investorId} onChange={set('investorId')}>
              <option value="">Select investor…</option>
              {investors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row cols-2">
          <div className="field">
            <label className="field-label">Date *</label>
            <input className="field-input" type="date" value={form.date} onChange={set('date')} />
          </div>
          <div className="field">
            <label className="field-label">Amount Invested (₹) *</label>
            <input className="field-input" type="number" placeholder="e.g. 2500000" value={form.amount} onChange={set('amount')} min="0" />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label className="field-label">Current Value (₹)</label>
            <input className="field-input" type="number" placeholder="Defaults to amount invested" value={form.currentValue} onChange={set('currentValue')} min="0" />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label className="field-label">Description / Note</label>
            <input className="field-input" placeholder="e.g. Private Equity Fund A" value={form.note} onChange={set('note')} />
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Adding…' : 'Add Investment'}
        </button>
      </form>
    </div>
  );
}

// ─── ADMIN: SETTINGS TAB ─────────────────────────────────────────────────────
function SettingsTab({ investors, showToast }) {
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPw, setAdminPw] = useState('');
  const [showAdminPw, setShowAdminPw] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);

  const [selInv, setSelInv] = useState('');
  const [invPhone, setInvPhone] = useState('');
  const [invPw, setInvPw] = useState('');
  const [showInvPw, setShowInvPw] = useState(false);
  const [savingInv, setSavingInv] = useState(false);

  const saveAdmin = async (e) => {
    e.preventDefault();
    if (!adminPhone && !adminPw) { showToast('Enter at least one field', 'error'); return; }
    setSavingAdmin(true);
    try {
      const updates = {};
      if (adminPhone) updates.phone = adminPhone;
      if (adminPw) updates.password = adminPw;
      await updateDoc(doc(db, 'admin', 'config'), updates);
      showToast('Admin credentials updated ✓');
      setAdminPhone(''); setAdminPw('');
    } catch { showToast('Update failed', 'error'); }
    finally { setSavingAdmin(false); }
  };

  const saveInvestor = async (e) => {
    e.preventDefault();
    if (!selInv) { showToast('Select an investor', 'error'); return; }
    if (!invPhone && !invPw) { showToast('Enter at least one field', 'error'); return; }
    setSavingInv(true);
    try {
      const updates = {};
      if (invPhone) {
        if (invPhone.length !== 10) { showToast('Phone must be 10 digits', 'error'); setSavingInv(false); return; }
        updates.phone = invPhone;
      }
      if (invPw) updates.password = invPw;
      await updateDoc(doc(db, 'investors', selInv), updates);
      showToast('Investor credentials updated ✓');
      setInvPhone(''); setInvPw(''); setSelInv('');
    } catch { showToast('Update failed', 'error'); }
    finally { setSavingInv(false); }
  };

  return (
    <div>
      <div className="sec-head">
        <div><div className="sec-title">Settings</div><div className="sec-sub">Manage credentials</div></div>
      </div>
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
        {/* Admin credentials */}
        <form className="form-card" onSubmit={saveAdmin}>
          <div className="settings-title">Admin Credentials</div>
          <div className="form-row">
            <div className="field">
              <label className="field-label">New Phone Number</label>
              <input className="field-input" type="tel" placeholder="10-digit number"
                value={adminPhone} onChange={e => setAdminPhone(e.target.value.replace(/\D/g,'').slice(0,10))} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label className="field-label">New Password</label>
              <div className="field-input-wrap">
                <input className="field-input" type={showAdminPw ? 'text' : 'password'} placeholder="New password"
                  value={adminPw} onChange={e => setAdminPw(e.target.value)} />
                <button type="button" className="eye-btn" onClick={() => setShowAdminPw(v => !v)}>{showAdminPw ? <EyeOff /> : <EyeOn />}</button>
              </div>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={savingAdmin}>{savingAdmin ? 'Saving…' : 'Update Admin'}</button>
        </form>

        {/* Investor credentials */}
        <form className="form-card" onSubmit={saveInvestor}>
          <div className="settings-title">Investor Credentials</div>
          <div className="form-row">
            <div className="field">
              <label className="field-label">Select Investor</label>
              <select className="field-input" value={selInv} onChange={e => setSelInv(e.target.value)}>
                <option value="">Choose investor…</option>
                {investors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label className="field-label">New Phone Number</label>
              <input className="field-input" type="tel" placeholder="10-digit number"
                value={invPhone} onChange={e => setInvPhone(e.target.value.replace(/\D/g,'').slice(0,10))} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label className="field-label">New Password</label>
              <div className="field-input-wrap">
                <input className="field-input" type={showInvPw ? 'text' : 'password'} placeholder="New password"
                  value={invPw} onChange={e => setInvPw(e.target.value)} />
                <button type="button" className="eye-btn" onClick={() => setShowInvPw(v => !v)}>{showInvPw ? <EyeOff /> : <EyeOn />}</button>
              </div>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={savingInv}>{savingInv ? 'Saving…' : 'Update Investor'}</button>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN: % RETURNS TAB ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AdminReturnsTab({ investors, investments, showToast }) {
  const [mode, setMode]           = useState('global');   // 'global' | 'individual'
  const [globalPct, setGlobalPct] = useState('');
  const [applyType, setApplyType] = useState('add');      // 'add' = add % on top of current | 'set' = set exact %
  const [perInvPct, setPerInvPct] = useState({});         // { investorId: pct string }
  const [applying, setApplying]   = useState(false);
  const [preview, setPreview]     = useState(null);       // preview data before confirming

  // Per-investor current totals
  const investorStats = investors.map(inv => {
    const invs = investments.filter(x => x.investorId === inv.id);
    const totalInvested = invs.reduce((s, x) => s + Number(x.amount || 0), 0);
    const totalCurrent  = invs.reduce((s, x) => s + Number(x.currentValue || 0), 0);
    return { ...inv, invs, totalInvested, totalCurrent };
  });

  // ── PREVIEW CALCULATOR ────────────────────────────────────────────────────
  const buildPreview = () => {
    if (mode === 'global') {
      const pct = parseFloat(globalPct);
      if (isNaN(pct)) { showToast('Enter a valid %', 'error'); return; }
      const rows = investorStats.map(inv => {
        const newCurrent = applyType === 'add'
          ? inv.totalInvested * (1 + pct / 100)
          : inv.totalInvested * (1 + pct / 100);
        // 'set' mode: new current = invested * (1 + pct/100)
        // 'add' mode: new current = current * (1 + pct/100)
        const newVal = applyType === 'add'
          ? inv.totalCurrent * (1 + pct / 100)
          : inv.totalInvested * (1 + pct / 100);
        return { ...inv, newVal: Math.round(newVal) };
      });
      setPreview({ mode: 'global', pct, applyType, rows });
    } else {
      const rows = investorStats.map(inv => {
        const pctStr = perInvPct[inv.id] || '';
        const pct = parseFloat(pctStr);
        if (pctStr === '' || isNaN(pct)) return { ...inv, newVal: null, pct: null };
        const newVal = applyType === 'add'
          ? inv.totalCurrent * (1 + pct / 100)
          : inv.totalInvested * (1 + pct / 100);
        return { ...inv, newVal: Math.round(newVal), pct };
      }).filter(r => r.newVal !== null);
      if (rows.length === 0) { showToast('Enter % for at least one investor', 'error'); return; }
      setPreview({ mode: 'individual', applyType, rows });
    }
  };

  // ── APPLY TO FIRESTORE ────────────────────────────────────────────────────
  const applyChanges = async () => {
    if (!preview) return;
    setApplying(true);
    try {
      for (const row of preview.rows) {
        if (!row.newVal || row.invs.length === 0) continue;
        // Distribute new total value proportionally across investments
        const totalOldCurrent = row.invs.reduce((s, x) => s + Number(x.currentValue || 0), 0);
        for (const inv of row.invs) {
          let newInvVal;
          if (totalOldCurrent > 0) {
            // Proportional distribution
            const share = Number(inv.currentValue) / totalOldCurrent;
            newInvVal = Math.round(row.newVal * share);
          } else {
            // Equal distribution if all zeros
            newInvVal = Math.round(row.newVal / row.invs.length);
          }
          await updateDoc(doc(db, 'investments', inv.id), { currentValue: newInvVal });
        }
      }
      showToast(`Returns applied to ${preview.rows.length} investor${preview.rows.length > 1 ? 's' : ''} ✓`);
      setPreview(null);
      setGlobalPct('');
      setPerInvPct({});
    } catch (err) {
      showToast('Failed to apply', 'error');
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div>
      <div className="sec-head">
        <div>
          <div className="sec-title">Update % Returns</div>
          <div className="sec-sub">Apply a return % to all investors at once, or set individual rates</div>
        </div>
      </div>

      {/* Mode switcher */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          className={`btn ${mode === 'global' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setMode('global'); setPreview(null); }}>
          🌐 Apply to All Investors
        </button>
        <button
          className={`btn ${mode === 'individual' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setMode('individual'); setPreview(null); }}>
          👤 Per Investor
        </button>
      </div>

      {/* Apply type switcher */}
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--bord)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--t2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>
          How to apply the %
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${applyType === 'add' ? '' : 'btn-ghost'}`}
            style={applyType === 'add' ? { background: 'var(--goldbg)', color: 'var(--gold)', border: '1px solid var(--goldbord)' } : {}}
            onClick={() => setApplyType('add')}>
            Add % on current value
          </button>
          <button
            className={`btn btn-sm ${applyType === 'set' ? '' : 'btn-ghost'}`}
            style={applyType === 'set' ? { background: 'var(--goldbg)', color: 'var(--gold)', border: '1px solid var(--goldbord)' } : {}}
            onClick={() => setApplyType('set')}>
            Set % from invested amount
          </button>
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--t3)' }}>
          {applyType === 'add'
            ? '📈 "Add" — e.g. if current value is ₹1,00,000 and you enter 2%, new value = ₹1,02,000 (grow by 2% each day)'
            : '📌 "Set" — e.g. if invested is ₹1,00,000 and you enter 15%, current value becomes ₹1,15,000 (total return from cost)'}
        </div>
      </div>

      {/* ── GLOBAL MODE ── */}
      {mode === 'global' && !preview && (
        <div className="form-card" style={{ maxWidth: 420 }}>
          <div className="settings-title">Apply to All Investors</div>
          <div className="form-row">
            <div className="field">
              <label className="field-label">Return % <span style={{ color: 'var(--t3)', fontWeight: 400 }}>({applyType === 'add' ? 'added on current value' : 'total % from invested'})</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input className="field-input" type="number" step="0.01"
                  placeholder={applyType === 'add' ? 'e.g. 1.5 (daily gain %)' : 'e.g. 18 (total return %)'}
                  value={globalPct} onChange={e => setGlobalPct(e.target.value)}
                  style={{ flex: 1 }} />
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 18 }}>%</span>
              </div>
            </div>
          </div>
          <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--t2)' }}>
            This will update the <strong style={{ color: 'var(--t1)' }}>current value</strong> of every investment for all {investors.length} investors.
          </div>
          <button className="btn btn-primary" onClick={buildPreview} disabled={!globalPct}>
            Preview Changes →
          </button>
        </div>
      )}

      {/* ── INDIVIDUAL MODE ── */}
      {mode === 'individual' && !preview && (
        <div>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--bord)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg2)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--t2)', fontWeight: 500 }}>Investor</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--t2)', fontWeight: 500 }}>Invested</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--t2)', fontWeight: 500 }}>Current</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--t2)', fontWeight: 500 }}>Enter %</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--t2)', fontWeight: 500 }}>Preview Value</th>
                </tr>
              </thead>
              <tbody>
                {investorStats.map(inv => {
                  const pctStr = perInvPct[inv.id] || '';
                  const pct = parseFloat(pctStr);
                  const previewVal = !isNaN(pct) && pctStr !== ''
                    ? (applyType === 'add'
                        ? inv.totalCurrent * (1 + pct / 100)
                        : inv.totalInvested * (1 + pct / 100))
                    : null;
                  const diff = previewVal !== null ? previewVal - inv.totalCurrent : null;
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--bord)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--t1)', fontSize: 14 }}>{inv.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--t2)' }}>{inv.invs.length} investment{inv.invs.length !== 1 ? 's' : ''}</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, color: 'var(--t2)' }}>{fmt(inv.totalInvested)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>{fmt(inv.totalCurrent)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <input
                            style={{ width: 80, background: 'var(--bg2)', border: '1px solid var(--bord)', borderRadius: 6, padding: '6px 8px', fontSize: 14, color: 'var(--t1)', fontFamily: 'var(--fb)', outline: 'none', textAlign: 'center' }}
                            type="number" step="0.01" placeholder="0.00"
                            value={pctStr}
                            onChange={e => setPerInvPct(prev => ({ ...prev, [inv.id]: e.target.value }))}
                            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                            onBlur={e => e.target.style.borderColor = 'var(--bord)'}
                          />
                          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {previewVal !== null ? (
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 14 }}>{fmt(Math.round(previewVal))}</div>
                            <div style={{ fontSize: 11, color: diff >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                              {diff >= 0 ? '+' : ''}{fmt(Math.round(diff))}
                            </div>
                          </div>
                        ) : <span style={{ color: 'var(--t3)', fontSize: 13 }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button className="btn btn-primary" onClick={buildPreview}>
            Preview Changes →
          </button>
        </div>
      )}

      {/* ── PREVIEW CONFIRMATION ── */}
      {preview && (
        <div>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--goldbord)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>
              ⚠️ Review before applying
            </div>
            <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 16 }}>
              {preview.mode === 'global'
                ? `This will apply ${preview.pct > 0 ? '+' : ''}${preview.pct}% (${preview.applyType === 'add' ? 'added on current' : 'set from invested'}) to all ${preview.rows.length} investors`
                : `This will update ${preview.rows.length} investor${preview.rows.length > 1 ? 's' : ''} with individual rates`}
            </div>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg2)' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--t2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Investor</th>
                    {preview.mode === 'individual' && <th style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--t2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>%</th>}
                    <th style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--t2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Old Value</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--t2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>New Value</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--t2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map(row => {
                    const diff = row.newVal - row.totalCurrent;
                    return (
                      <tr key={row.id} style={{ borderBottom: '1px solid var(--bord)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--t1)' }}>{row.name}</td>
                        {preview.mode === 'individual' && <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--gold)', fontWeight: 700 }}>{row.pct > 0 ? '+' : ''}{row.pct}%</td>}
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--t2)' }}>{fmt(row.totalCurrent)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--gold)', fontWeight: 700 }}>{fmt(row.newVal)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: diff >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                          {diff >= 0 ? '+' : ''}{fmt(diff)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={applyChanges} disabled={applying}>
              {applying ? 'Applying…' : `✓ Apply to ${preview.rows.length} Investor${preview.rows.length > 1 ? 's' : ''}`}
            </button>
            <button className="btn btn-ghost" onClick={() => setPreview(null)}>← Edit</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN: EOD VALUES TAB ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AdminEODTab({ investors, investments, snapshots, showToast }) {
  const today = new Date().toISOString().split('T')[0];
  const [selInv,   setSelInv]   = useState('');
  const [date,     setDate]     = useState(today);
  const [value,    setValue]    = useState('');
  const [filterInv, setFilterInv] = useState('all');
  const [editId,   setEditId]   = useState(null);
  const [editVal,  setEditVal]  = useState('');
  const [saving,   setSaving]   = useState(false);

  const investorMap = Object.fromEntries(investors.map(i => [i.id, i.name]));

  // Auto-fill current portfolio value when investor is selected
  const autoFill = (invId) => {
    setSelInv(invId);
    const invs = investments.filter(x => x.investorId === invId);
    const total = invs.reduce((s, x) => s + Number(x.currentValue || 0), 0);
    if (total > 0) setValue(String(total));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!selInv)  { showToast('Select an investor', 'error'); return; }
    if (!date)    { showToast('Select a date', 'error'); return; }
    const val = parseFloat(value.replace(/,/g, ''));
    if (isNaN(val) || val <= 0) { showToast('Enter a valid value', 'error'); return; }
    setSaving(true);
    try {
      // Use investorId+date as document ID so each date = one snapshot per investor
      const snapId = `${selInv}_${date}`;
      const totalInvested = investments
        .filter(x => x.investorId === selInv)
        .reduce((s, x) => s + Number(x.amount || 0), 0);
      await setDoc(doc(db, 'snapshots', snapId), {
        investorId: selInv, date, totalValue: val, totalInvested,
      });
      showToast(`EOD value saved for ${fmtDate(date)} ✓`);
      setValue('');
    } catch (err) { showToast('Failed to save', 'error'); console.error(err); }
    finally { setSaving(false); }
  };

  const startEdit = (s) => { setEditId(s.id); setEditVal(String(s.totalValue)); };
  const cancelEdit = () => { setEditId(null); setEditVal(''); };
  const saveEdit = async (s) => {
    const val = parseFloat(editVal.replace(/,/g, ''));
    if (isNaN(val) || val <= 0) { showToast('Invalid value', 'error'); return; }
    try {
      await updateDoc(doc(db, 'snapshots', s.id), { totalValue: val });
      showToast('Updated ✓'); cancelEdit();
    } catch { showToast('Update failed', 'error'); }
  };
  const deleteSnap = async (id) => {
    if (!window.confirm('Delete this snapshot?')) return;
    try { await deleteDoc(doc(db, 'snapshots', id)); showToast('Deleted'); }
    catch { showToast('Delete failed', 'error'); }
  };

  const filtered = (filterInv === 'all' ? snapshots : snapshots.filter(s => s.investorId === filterInv))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="sec-head">
        <div><div className="sec-title">EOD Portfolio Values</div>
          <div className="sec-sub">Record end-of-day values — these power the investor chart</div>
        </div>
      </div>

      {/* Record form */}
      <form className="form-card" onSubmit={submit} style={{ marginBottom: 28 }}>
        <div className="settings-title">Record EOD Value</div>
        <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: 16 }}>
          <div className="field">
            <label className="field-label">Investor *</label>
            <select className="field-input" value={selInv} onChange={e => autoFill(e.target.value)}>
              <option value="">Select investor…</option>
              {investors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Date *</label>
            <input className="field-input" type="date" value={date} onChange={e => setDate(e.target.value)} max={today} />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label className="field-label">Total Portfolio Value (₹) *</label>
            <input className="field-input" type="number" placeholder="Total current value of all investments"
              value={value} onChange={e => setValue(e.target.value)} min="0" />
            <span style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>
              Auto-filled from current values. Edit if the actual EOD value differs.
            </span>
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : '+ Save EOD Snapshot'}
        </button>
      </form>

      {/* History table */}
      <div className="table-toolbar">
        <div><div className="sec-title" style={{ fontSize: 18 }}>Snapshot History</div>
          <div className="sec-sub">{filtered.length} records</div>
        </div>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <select className="filter-select" value={filterInv} onChange={e => setFilterInv(e.target.value)}>
            <option value="all">All Investors</option>
            {investors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📅</div><div className="empty-text">No snapshots recorded yet</div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Investor</th><th>Date</th><th>Total Invested</th><th>Portfolio Value</th><th>Return ₹</th><th>Return %</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s => {
                const ret = Number(s.totalValue) - Number(s.totalInvested);
                const retPct = s.totalInvested > 0 ? (ret / s.totalInvested) * 100 : 0;
                const isEditing = editId === s.id;
                return (
                  <tr key={s.id}>
                    <td className="td-name">{investorMap[s.investorId] || '—'}</td>
                    <td className="td-muted">{fmtDate(s.date)}</td>
                    <td>{fmt(s.totalInvested)}</td>
                    <td>
                      {isEditing ? (
                        <div className="inline-edit">
                          <input className="inline-input" value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEdit(s); if (e.key === 'Escape') cancelEdit(); }}
                            autoFocus />
                          <button className="btn btn-sm" style={{ background: 'var(--goldbg)', color: 'var(--gold)', border: '1px solid var(--goldbord)', padding: '6px 8px' }}
                            onClick={() => saveEdit(s)}><CheckIcon /></button>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={cancelEdit}><XIcon /></button>
                        </div>
                      ) : (
                        <span className="td-gold">{fmt(s.totalValue)}</span>
                      )}
                    </td>
                    <td className={ret >= 0 ? 'td-green' : 'td-red'}>{fmt(ret)}</td>
                    <td><span className={`badge ${ret >= 0 ? 'badge-green' : 'badge-red'}`}>{fmtPct(retPct)}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {!isEditing && <button className="btn btn-ghost btn-sm btn-icon" onClick={() => startEdit(s)}><EditIcon /></button>}
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteSnap(s.id)}><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN: WITHDRAWALS TAB ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AdminWithdrawalsTab({ withdrawals, investors, investments, showToast }) {
  const investorMap = Object.fromEntries(investors.map(i => [i.id, i.name]));
  const sorted = [...withdrawals].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

  const approve = async (wd) => {
    if (!window.confirm(`Approve withdrawal of ${fmt(wd.amount)} for ${investorMap[wd.investorId]}?`)) return;
    try {
      // Reduce currentValue from investor's investments proportionally (from largest first)
      const invList = investments
        .filter(x => x.investorId === wd.investorId && Number(x.currentValue) > 0)
        .sort((a, b) => Number(b.currentValue) - Number(a.currentValue));
      let remaining = Number(wd.amount);
      for (const inv of invList) {
        if (remaining <= 0) break;
        const cur = Number(inv.currentValue);
        const deduct = Math.min(cur, remaining);
        await updateDoc(doc(db, 'investments', inv.id), { currentValue: cur - deduct });
        remaining -= deduct;
      }
      await updateDoc(doc(db, 'withdrawals', wd.id), { status: 'approved', processedDate: new Date().toISOString().split('T')[0] });
      showToast(`Withdrawal approved ✓`);
    } catch (e) { showToast('Failed to approve', 'error'); console.error(e); }
  };

  const reject = async (wd) => {
    if (!window.confirm(`Reject this withdrawal request?`)) return;
    try {
      await updateDoc(doc(db, 'withdrawals', wd.id), { status: 'rejected', processedDate: new Date().toISOString().split('T')[0] });
      showToast('Withdrawal rejected');
    } catch { showToast('Failed', 'error'); }
  };

  const pending = sorted.filter(w => w.status === 'pending');
  const processed = sorted.filter(w => w.status !== 'pending');

  return (
    <div>
      <div className="sec-head">
        <div>
          <div className="sec-title">Withdrawal Requests</div>
          <div className="sec-sub">{pending.length} pending · {processed.length} processed</div>
        </div>
      </div>

      {pending.length === 0 && processed.length === 0 && (
        <div className="empty-state"><div className="empty-icon">💸</div><div className="empty-text">No withdrawal requests yet</div></div>
      )}

      {pending.length > 0 && (
        <>
          <div style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warn)', marginBottom: 12, fontWeight: 600 }}>
            ● Pending Requests
          </div>
          <div className="table-wrap" style={{ marginBottom: 24 }}>
            <table>
              <thead><tr><th>Investor</th><th>Date</th><th>Amount</th><th>Note</th><th>Actions</th></tr></thead>
              <tbody>
                {pending.map(wd => (
                  <tr key={wd.id}>
                    <td className="td-name">{investorMap[wd.investorId] || '—'}</td>
                    <td className="td-muted">{fmtDate(wd.requestDate)}</td>
                    <td className="td-gold">{fmt(wd.amount)}</td>
                    <td><span className="td-note">{wd.note || '—'}</span></td>
                    <td>
                      <div className="admin-wd-row">
                        <button className="btn btn-sm" style={{ background: 'rgba(93,184,124,0.12)', color: 'var(--success)', border: '1px solid rgba(93,184,124,0.3)' }} onClick={() => approve(wd)}>✓ Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => reject(wd)}>✗ Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {processed.length > 0 && (
        <>
          <div style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--t2)', marginBottom: 12, fontWeight: 600 }}>
            Processed
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Investor</th><th>Requested</th><th>Processed</th><th>Amount</th><th>Note</th><th>Status</th></tr></thead>
              <tbody>
                {processed.map(wd => (
                  <tr key={wd.id}>
                    <td className="td-name">{investorMap[wd.investorId] || '—'}</td>
                    <td className="td-muted">{fmtDate(wd.requestDate)}</td>
                    <td className="td-muted">{fmtDate(wd.processedDate)}</td>
                    <td>{fmt(wd.amount)}</td>
                    <td><span className="td-note">{wd.note || '—'}</span></td>
                    <td><span className={`badge ${wd.status === 'approved' ? 'badge-green' : 'badge-red'}`}>{wd.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── INVESTOR PORTAL ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function InvestorPortal({ investor, onLogout }) {
  const [tab, setTab] = useState('overview');
  const [investments, setInvestments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [profile, setProfile] = useState(investor);
  const [loading, setLoading] = useState(true);

  // Real-time listener — investor's own investments only
  useEffect(() => {
    const q  = query(collection(db, 'investments'), where('investorId', '==', investor.id));
    const qw = query(collection(db, 'withdrawals'), where('investorId', '==', investor.id));
    const qs = query(collection(db, 'snapshots'),   where('investorId', '==', investor.id));

    const unsub1 = onSnapshot(q,  snap => { setInvestments(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); });
    const unsub2 = onSnapshot(doc(db, 'investors', investor.id), snap => { if (snap.exists()) setProfile(p => ({ ...p, ...snap.data() })); });
    const unsub3 = onSnapshot(qw, snap => { setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() }))); });
    const unsub4 = onSnapshot(qs, snap => { setSnapshots(snap.docs.map(d => ({ id: d.id, ...d.data() }))); });
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [investor.id]);

  const sorted = [...investments].sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalInvested = investments.reduce((s, i) => s + Number(i.amount || 0), 0);
  const currentValue = investments.reduce((s, i) => s + Number(i.currentValue || 0), 0);
  const totalReturns = currentValue - totalInvested;
  const returnPct = pct(totalInvested, currentValue);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'chart', label: 'Charts' },
    { id: 'withdraw', label: 'Withdraw' },
  ];

  return (
    <div className="shell">
      <div className="topbar">
        <div className="topbar-brand">
          <ShieldLogo size={32} />
          <div>
            <div className="topbar-brand-name">Equishield</div>
            <div className="topbar-brand-tag">Investor Portal</div>
          </div>
        </div>
        <div className="topbar-right">
          <div className="live-badge"><div className="live-dot" /> Live</div>
          <div className="topbar-user" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--goldbg)', border: '1px solid var(--goldbord)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--fd)' }}>
              {initials(profile.name)}
            </div>
            <span style={{ display: 'none' }}>{profile.name}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      <div className="main-content">
        {/* Welcome */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 30, fontWeight: 600, color: 'var(--t1)' }}>
            Welcome back, <span style={{ color: 'var(--gold)' }}>{profile.name.split(' ')[0]}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>
            Your portfolio snapshot · Updates in real-time
          </div>
        </div>

        {/* Summary Cards */}
        <div className="cards-row cols-4">
          <div className="stat-card">
            <div className="stat-label">Total Invested</div>
            <div className="stat-value">{fmt(totalInvested)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Current Value</div>
            <div className="stat-value gold">{fmt(currentValue)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Returns</div>
            <div className={`stat-value ${totalReturns >= 0 ? 'green' : 'td-red'}`}>{fmt(totalReturns)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Return %</div>
            <div className={`stat-value ${returnPct >= 0 ? 'green' : 'td-red'}`}>{fmtPct(returnPct)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="loader-wrap"><div className="spinner" /><span>Loading your portfolio…</span></div>
        ) : (
          <>
            {tab === 'overview' && <InvestorOverview investments={sorted} totalInvested={totalInvested} currentValue={currentValue} />}
            {tab === 'transactions' && <InvestorTransactions investments={sorted} />}
            {tab === 'chart' && <InvestorCharts investments={sorted} snapshots={snapshots} />}
            {tab === 'withdraw' && <InvestorWithdraw investor={investor} investments={investments} withdrawals={withdrawals} currentValue={currentValue} />}
          </>
        )}
      </div>
    </div>
  );
}

// ─── INVESTOR: OVERVIEW TAB ───────────────────────────────────────────────────
function InvestorOverview({ investments, totalInvested, currentValue }) {
  if (investments.length === 0) {
    return <div className="empty-state"><div className="empty-icon">📈</div><div className="empty-text">No investments recorded yet</div></div>;
  }
  const barWidth = totalInvested > 0 ? Math.min(100, (currentValue / totalInvested) * 80) : 0;
  return (
    <div>
      {/* Portfolio performance bar */}
      <div className="portfolio-bar-wrap">
        <div className="portfolio-bar-labels">
          <div><div className="portfolio-bar-label">Invested</div><div className="portfolio-bar-value">{fmt(totalInvested)}</div></div>
          <div style={{ textAlign: 'right' }}><div className="portfolio-bar-label">Current Value</div><div className="portfolio-bar-value" style={{ color: 'var(--gold)' }}>{fmt(currentValue)}</div></div>
        </div>
        <div className="portfolio-bar-track">
          <div className="portfolio-bar-fill" style={{ width: `${barWidth}%` }} />
        </div>
        <div className="portfolio-bar-foot">
          <div className="pbar-item"><div className="pbar-dot" style={{ background: 'var(--gold3)' }} />Invested</div>
          <div className="pbar-item"><div className="pbar-dot" style={{ background: 'var(--gold)' }} />Current Value</div>
          <div className="pbar-item"><div className="pbar-dot" style={{ background: 'var(--success)' }} />
            Gain: {fmt(currentValue - totalInvested)} ({fmtPct(pct(totalInvested, currentValue))})
          </div>
        </div>
      </div>

      {/* Per-investment breakdown */}
      <div className="sec-head" style={{ marginBottom: 14 }}>
        <div><div className="sec-title" style={{ fontSize: 20 }}>Investment Breakdown</div></div>
      </div>
      <div className="breakdown-list">
        {investments.map(inv => {
          const ret = Number(inv.currentValue || 0) - Number(inv.amount || 0);
          const retPct = pct(inv.amount, inv.currentValue);
          const barW = inv.amount > 0 ? Math.min(100, (Number(inv.currentValue) / Number(inv.amount)) * 70) : 0;
          return (
            <div key={inv.id} className="breakdown-item">
              <div className="breakdown-item-head">
                <div>
                  <div className="breakdown-desc">{inv.note || 'Investment'}</div>
                  <div className="breakdown-date">{fmtDate(inv.date)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>{fmt(inv.currentValue)}</div>
                  <span className={`badge ${ret >= 0 ? 'badge-green' : 'badge-red'}`} style={{ marginTop: 4 }}>{fmtPct(retPct)}</span>
                </div>
              </div>
              <div className="breakdown-bar-track">
                <div className="breakdown-bar-fill" style={{ width: `${barW}%` }} />
              </div>
              <div className="breakdown-nums">
                <span>Invested: {fmt(inv.amount)}</span>
                <span style={{ color: ret >= 0 ? 'var(--success)' : 'var(--danger)' }}>Return: {fmt(ret)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── INVESTOR: TRANSACTIONS TAB ───────────────────────────────────────────────
function InvestorTransactions({ investments }) {
  if (investments.length === 0) {
    return <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">No transactions yet</div></div>;
  }
  return (
    <div>
      <div className="sec-head">
        <div><div className="sec-title">Transactions</div><div className="sec-sub">{investments.length} entries</div></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Date</th><th>Description</th><th>Amount Invested</th><th>Current Value</th><th>Return (₹)</th><th>Return %</th></tr>
          </thead>
          <tbody>
            {investments.map(inv => {
              const ret = Number(inv.currentValue || 0) - Number(inv.amount || 0);
              const retPct = pct(inv.amount, inv.currentValue);
              return (
                <tr key={inv.id}>
                  <td className="td-muted">{fmtDate(inv.date)}</td>
                  <td className="td-name">{inv.note || '—'}</td>
                  <td>{fmt(inv.amount)}</td>
                  <td className="td-gold">{fmt(inv.currentValue)}</td>
                  <td className={ret >= 0 ? 'td-green' : 'td-red'}>{fmt(ret)}</td>
                  <td>
                    <span className={`badge ${ret >= 0 ? 'badge-green' : 'badge-red'}`}>{fmtPct(retPct)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── INVESTOR: CHARTS TAB ─────────────────────────────────────────────────────
function InvestorCharts({ investments, snapshots }) {
  if (investments.length === 0) {
    return <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-text">No data to chart yet</div></div>;
  }

  const hasSnapshots = snapshots && snapshots.length > 0;

  // Use real EOD snapshots if available, else fall back to investment dates
  const timeData = (() => {
    if (hasSnapshots) {
      return [...snapshots]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(s => ({
          date:     s.date,
          Invested: Number(s.totalInvested || 0),
          Value:    Number(s.totalValue    || 0),
        }));
    }
    const sorted = [...investments].sort((a, b) => new Date(a.date) - new Date(b.date));
    let ci = 0, cv = 0;
    return sorted.map(inv => {
      ci += Number(inv.amount || 0);
      cv += Number(inv.currentValue || 0);
      return { date: inv.date, Invested: ci, Value: cv };
    });
  })();

  // Pick exactly 3-4 evenly spaced X-axis ticks
  const smartTicks = (() => {
    if (timeData.length <= 4) return timeData.map(d => d.date);
    const count = 4;
    const step  = (timeData.length - 1) / (count - 1);
    return Array.from({ length: count }, (_, i) => timeData[Math.round(i * step)].date);
  })();

  // Auto-format tick label based on total time span
  const totalDays = timeData.length > 1
    ? (new Date(timeData[timeData.length - 1].date) - new Date(timeData[0].date)) / 86400000
    : 0;
  const fmtTick = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    if (totalDays <= 60)  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    if (totalDays <= 400) return dt.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    return dt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  // Bar chart
  const barData = [...investments]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(inv => ({
      name:     (inv.note || 'Inv').length > 16 ? (inv.note||'Inv').substr(0,14)+'…' : (inv.note||'Inv'),
      Invested: Number(inv.amount       || 0),
      Value:    Number(inv.currentValue || 0),
    }));

  const axisStyle = { fill: '#9a9a8a', fontSize: 11, fontFamily: 'Calibri' };
  const fmtY = v => '₹' + (v >= 1e7 ? (v/1e7).toFixed(1)+'Cr' : v >= 1e5 ? (v/1e5).toFixed(1)+'L' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v);

  const firstDate = timeData.length ? timeData[0].date : null;
  const lastDate  = timeData.length ? timeData[timeData.length - 1].date : null;
  const todayStr  = new Date().toISOString().split('T')[0];
  const rangeLabel = firstDate
    ? `${fmtDate(firstDate)} → ${lastDate === todayStr ? 'Today' : fmtDate(lastDate)}  ·  ${timeData.length} data point${timeData.length !== 1 ? 's' : ''}`
    : '';

  return (
    <div>
      <div className="chart-card">
        <div className="chart-title">Portfolio Value Over Time</div>
        {rangeLabel && <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 14, marginTop: -6 }}>{rangeLabel}</div>}
        {!hasSnapshots && (
          <div style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid var(--goldbord)', borderRadius: 8, padding: '9px 14px', marginBottom: 14, fontSize: 12, color: 'var(--t2)' }}>
            Showing investment dates only. For daily history, admin records EOD values in the <strong style={{ color: 'var(--gold)' }}>EOD Values</strong> tab.
          </div>
        )}
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradInv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8a6820" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#8a6820" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gradVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#c9a84c" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#c9a84c" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              ticks={smartTicks}
              tickFormatter={fmtTick}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis tickFormatter={fmtY} tick={axisStyle} axisLine={false} tickLine={false} width={58} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const inv = payload.find(p => p.dataKey === 'Invested')?.value || 0;
                const val = payload.find(p => p.dataKey === 'Value')?.value    || 0;
                const ret = val - inv;
                return (
                  <div className="custom-tooltip">
                    <div className="ct-label">{fmtDate(label)}</div>
                    <div style={{ color: '#8a6820', fontWeight: 600, fontSize: 13 }}>Invested: {fmt(inv)}</div>
                    <div style={{ color: '#c9a84c', fontWeight: 600, fontSize: 13 }}>Value: {fmt(val)}</div>
                    <div style={{ color: ret >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: 12, marginTop: 4 }}>
                      Return: {fmt(ret)} ({fmtPct(inv > 0 ? (ret/inv)*100 : 0)})
                    </div>
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#a0a090' }} />
            <Area type="monotone" dataKey="Invested" stroke="#8a6820" strokeWidth={2}   fill="url(#gradInv)" dot={false}
              activeDot={{ r: 4, fill: '#8a6820', stroke: '#0a0a0a', strokeWidth: 2 }} />
            <Area type="monotone" dataKey="Value"    stroke="#c9a84c" strokeWidth={2.5} fill="url(#gradVal)" dot={false}
              activeDot={{ r: 5, fill: '#c9a84c', stroke: '#0a0a0a', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <div className="chart-title">Invested vs Current Value — Per Investment</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 11 }} axisLine={false} tickLine={false} angle={-18} textAnchor="end" interval={0} />
            <YAxis tickFormatter={fmtY} tick={axisStyle} axisLine={false} tickLine={false} width={58} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#a0a090' }} />
            <Bar dataKey="Invested" fill="#8a6820" radius={[4,4,0,0]} />
            <Bar dataKey="Value"    fill="#c9a84c" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


// ─── INVESTOR: WITHDRAW TAB ───────────────────────────────────────────────────
function InvestorWithdraw({ investor, investments, withdrawals, currentValue }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, toastEl] = useToast();

  const submit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(amt) || amt <= 0) { showToast('Enter a valid amount', 'error'); return; }
    if (amt > currentValue) { showToast('Amount exceeds current portfolio value', 'error'); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, 'withdrawals'), {
        investorId: investor.id,
        amount: amt,
        note: note,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending',
      });
      showToast('Withdrawal request submitted ✓');
      setAmount(''); setNote('');
    } catch { showToast('Failed to submit request', 'error'); }
    finally { setLoading(false); }
  };

  const sorted = [...withdrawals].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

  return (
    <div>
      {toastEl}
      <div className="sec-head">
        <div><div className="sec-title">Withdraw Funds</div><div className="sec-sub">Submit a withdrawal request to your portfolio manager</div></div>
      </div>

      <form className="withdraw-card" onSubmit={submit}>
        <div style={{ background: 'var(--goldbg)', border: '1px solid var(--goldbord)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--t2)' }}>
          Available portfolio value: <strong style={{ color: 'var(--gold)' }}>{fmt(currentValue)}</strong>
        </div>
        <div className="form-row">
          <div className="field">
            <label className="field-label">Withdrawal Amount (₹) *</label>
            <input className="field-input" type="number" placeholder="Enter amount to withdraw"
              value={amount} onChange={e => setAmount(e.target.value)} min="1" />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label className="field-label">Reason / Note</label>
            <input className="field-input" placeholder="e.g. Partial withdrawal for personal use"
              value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Submitting…' : 'Submit Withdrawal Request'}
        </button>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--t3)' }}>
          Your request will be reviewed by the portfolio manager. Funds will be processed upon approval.
        </div>
      </form>

      {sorted.length > 0 && (
        <div className="withdraw-history">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Your Requests</div>
          {sorted.map(wd => (
            <div key={wd.id} className="withdraw-item">
              <div className="withdraw-item-left">
                <div className="wd-desc">{wd.note || 'Withdrawal request'}</div>
                <div className="wd-date">Requested: {fmtDate(wd.requestDate)}{wd.processedDate ? ` · Processed: ${fmtDate(wd.processedDate)}` : ''}</div>
              </div>
              <div className="withdraw-item-right">
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>{fmt(wd.amount)}</div>
                <span className={`badge ${wd.status === 'approved' ? 'badge-green' : wd.status === 'rejected' ? 'badge-red' : 'badge-warn'}`}>
                  {wd.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ROOT APP ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);         // null | { type:'admin' } | { type:'investor', id, ...}
  const [seeded, setSeeded] = useState(false);
  const [seeding, setSeeding] = useState(true);

  // Inject global CSS
  useEffect(() => { injectStyles(); }, []);

  // Seed data on first load
  useEffect(() => {
    seedIfEmpty()
      .then(() => setSeeded(true))
      .catch(err => { console.error('Seed error:', err); setSeeded(true); })
      .finally(() => setSeeding(false));
  }, []);

  const handleLogin = useCallback((u) => setUser(u), []);
  const handleLogout = useCallback(() => setUser(null), []);

  if (seeding) {
    return (
      <div className="eq-app">
        <div className="page-center">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <ShieldLogo size={64} />
            <div className="loader-wrap" style={{ padding: 0 }}>
              <div className="spinner" />
              <span style={{ color: 'var(--t2)', fontSize: 14 }}>Connecting to Equishield…</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="eq-app">
      {!user && <LoginPage onLogin={handleLogin} />}
      {user?.type === 'admin' && <AdminPanel adminUser={user} onLogout={handleLogout} />}
      {user?.type === 'investor' && <InvestorPortal investor={user} onLogout={handleLogout} />}
    </div>
  );
}
