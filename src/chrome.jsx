/* global React, Icon */
const { useState, useEffect, useRef } = React;

// ---------- Sidebar + Topbar ----------

function Sidebar({ active, ruleCount }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard" },
    { key: "notes", label: "Notes", icon: "fileText" },
    { key: "rules", label: "Custom Rules", icon: "rules", count: ruleCount != null ? ruleCount : undefined },
    { key: "team", label: "Team", icon: "users" },
    { key: "settings", label: "Settings", icon: "settings" },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo">e</div>
        <div>
          <div className="brand-name">Eleos</div>
          <div className="brand-sub">Northwest Behavioral</div>
        </div>
      </div>
      <div className="sidebar-section-label">Workspace</div>
      {items.map(it => (
        <button key={it.key} className={`nav-item ${active === it.key ? "active" : ""}`}>
          <Icon name={it.icon} size={16} />
          <span>{it.label}</span>
          {it.count != null && <span className="count">{it.count}</span>}
        </button>
      ))}
    </aside>
  );
}

function Topbar({ crumbs = [], children }) {
  return (
    <div className="topbar">
      <div className="breadcrumb">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            <span className={i === crumbs.length - 1 ? "current" : "crumb"}
                  onClick={c.onClick}>{c.label}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="topbar-right">
        {children}
        <button className="icon-btn" title="Notifications"><Icon name="bell" size={18} /></button>
        <button className="icon-btn" title="Help"><Icon name="help" size={18} /></button>
        <div className="user-chip">
          <div className="avatar">MP</div>
          <span>Maya P.</span>
        </div>
      </div>
    </div>
  );
}

// ---------- Status badge ----------

const STATUS_DEFS = {
  draft:    { label: "Draft", cls: "badge-draft", tip: "Work in progress. Only visible to you. Has no effect on any notes." },
  submitted:{ label: "Submitted", cls: "badge-submit", tip: "Frozen for validation. Pass 3 consecutive agreements to activate." },
  active:   { label: "Active", cls: "badge-active", tip: "Running in production against new notes." },
  disabled: { label: "Disabled", cls: "badge-disabled", tip: "Turned off. History is preserved. Can be re-enabled." },
};

function StatusBadge({ status }) {
  const d = STATUS_DEFS[status];
  if (!d) return null;
  return (
    <span className="tip-wrap">
      <span className={`badge ${d.cls}`}><span className="dot"></span>{d.label}</span>
      <span className="tip">{d.tip}</span>
    </span>
  );
}

function SurfacePill({ on, label }) {
  return <span className={`surface-chip ${on ? "on" : ""}`}>{label}</span>;
}

// ---------- Toast ----------

function Toast({ kind = "default", icon = "check", text, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`toast ${kind}`}>
      <Icon name={icon} size={16} />
      <span>{text}</span>
    </div>
  );
}

// ---------- Modal ----------

function Modal({ title, children, onClose, primary, secondary, danger }) {
  return (
    <>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal" role="dialog">
        <div className="modal-head"><h3>{title}</h3></div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">
          {secondary && <button className="btn btn-ghost btn-sm" onClick={secondary.onClick}>{secondary.label}</button>}
          {primary && (
            <button className={`btn btn-sm ${danger ? "btn-danger" : "btn-primary"}`} onClick={primary.onClick}>
              {primary.label}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ---------- Stepper ----------

const FLOW_STEPS = ["Define", "Clarify", "Validate", "Activate"];

function Stepper({ current, onStepClick }) {
  return (
    <div className="stepper">
      {FLOW_STEPS.map((label, i) => {
        const isDone = i < current;
        const isCurrent = i === current;
        return (
          <React.Fragment key={label}>
            <div
              className={`step ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}
              style={isDone && onStepClick ? {cursor:"pointer"} : {}}
              onClick={() => isDone && onStepClick && onStepClick(i)}
              title={isDone && onStepClick ? `Go back to ${label}` : undefined}
            >
              <span className="num">{isDone ? <Icon name="check" size={12} /> : i + 1}</span>
              <span>{label}</span>
            </div>
            {i < FLOW_STEPS.length - 1 && <div className="step-sep"></div>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, StatusBadge, SurfacePill, Toast, Modal, Stepper, STATUS_DEFS });
