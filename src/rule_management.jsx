/* global React, Icon, ALL_RULES, RULE_HISTORY, ORG_SCHEMA, StatusBadge, SurfacePill, Modal */
const { useState: useRMState, useMemo: useRMMemo } = React;

// ============================================================
// Rule Management — unified table for both org and library rules.
// ============================================================

function RuleManagement({ rules, onOpen, onCreate, onAdopt, onSelect, selectedId, onAction }) {
  const [tab, setTab] = useRMState("org");
  const [q, setQ] = useRMState("");
  const [statusFilter, setStatusFilter] = useRMState("all");
  const [docFilter, setDocFilter] = useRMState("all");

  const orgRules = rules.filter(r => !r.library);
  const libRules = rules.filter(r => r.library);

  const counts = {
    org: orgRules.length,
    library: libRules.length,
    active: orgRules.filter(r => r.status === "active").length,
    draft: orgRules.filter(r => r.status === "draft").length,
    submitted: orgRules.filter(r => r.status === "submitted").length,
  };

  const visible = (tab === "org" ? orgRules : libRules).filter(r => {
    if (q && !r.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (tab === "org" && statusFilter !== "all" && r.status !== statusFilter) return false;
    if (docFilter !== "all" && r.docType !== docFilter) return false;
    return true;
  });

  const docTypes = ["all", ...ORG_SCHEMA.docTypes.map(d => d.name)];
  const clearFilters = () => { setQ(""); setStatusFilter("all"); setDocFilter("all"); };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Custom Rules</h1>
          <p className="sub">Documentation and compliance checks Eleos runs on your clinical notes. Active rules show up in the Dashboard and LQA.</p>
        </div>
        <div className="actions">
          <button className="btn btn-brand" onClick={onCreate}>
            <Icon name="plus" size={14} />
            New rule
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "org" ? "active" : ""}`} onClick={() => setTab("org")}>
          My organization <span className="count">{counts.org}</span>
        </button>
        <button className={`tab ${tab === "library" ? "active" : ""}`} onClick={() => setTab("library")}>
          Eleos Library <span className="count">{counts.library}</span>
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <Icon name="search" size={14} />
          <input placeholder={tab === "org" ? "Search rules…" : "Search library rules…"}
                 value={q} onChange={e => setQ(e.target.value)} />
        </div>
        {tab === "org" && (
          <div className="segmented">
            {[["all","All"],["active","Active"],["draft","Draft"],["submitted","Submitted"],["disabled","Disabled"]].map(([k, l]) => (
              <button key={k} className={statusFilter === k ? "on" : ""} onClick={() => setStatusFilter(k)}>{l}</button>
            ))}
          </div>
        )}
        <select className="filter-chip" style={{padding:"5px 10px"}}
                value={docFilter} onChange={e => setDocFilter(e.target.value)}>
          {docTypes.map(d => <option key={d} value={d}>{d === "all" ? "All doc types" : d}</option>)}
        </select>
      </div>

      <div className="card" style={{overflow:"hidden"}}>
        <table className="rules-table">
          <thead>
            <tr>
              <th style={{width:"36%"}}>Rule</th>
              <th>{tab === "org" ? "Status" : "Compatibility"}</th>
              <th>Doc type</th>
              <th>{tab === "org" ? "Surfaces" : "Adoptions"}</th>
              <th>{tab === "org" ? "Last 7 days" : "Programs"}</th>
              <th style={{width:"160px"}}>{tab === "org" ? "Updated" : ""}</th>
              <th style={{width:"40px"}}></th>
            </tr>
          </thead>
          <tbody>
            {visible.map(r => (
              <tr key={r.id} className={selectedId === r.id ? "selected" : ""}
                  onClick={() => onSelect(r.id)}>
                <td>
                  <div className="rule-title">
                    {r.name}
                    {r.adoptedFromLibrary && (
                      <span className="source-chip"><Icon name="book" size={10} /> from Library</span>
                    )}
                  </div>
                  <div className="rule-subtitle">{r.purpose}</div>
                </td>
                <td>
                  {tab === "org"
                    ? <StatusBadge status={r.status} />
                    : <CompatibilityBadge value={r.compatibility} />}
                </td>
                <td><span className="muted small">{r.docType}</span></td>
                <td>
                  {tab === "org" ? (
                    <div className="surfaces">
                      <SurfacePill on={r.surfaces?.includes("dashboard")} label="Dashboard" />
                      <SurfacePill on={r.surfaces?.includes("lqa")} label="LQA" />
                    </div>
                  ) : (
                    <span className="metric-inline"><span className="num">{r.adoptions}</span><span className="lbl">orgs</span></span>
                  )}
                </td>
                <td>
                  {tab === "org" ? (
                    r.status === "active" ? (
                      <div className="metric-inline">
                        <span className="num">{r.weeklyRuns}</span>
                        <span className="lbl">runs · {r.weeklyFails} fails</span>
                      </div>
                    ) : <span className="muted small">—</span>
                  ) : (
                    <span className="muted small">{r.programs.join(", ")}</span>
                  )}
                </td>
                <td className="muted small">
                  {tab === "org" ? <>{r.lastUpdated}<br/><span style={{fontSize:11}}>{r.author}</span></> : ""}
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <button className="icon-btn" onClick={() => onSelect(r.id)} title="Open rule details"><Icon name="moreH" size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (() => {
          const hasAny = (tab === "org" ? orgRules : libRules).length > 0;
          return (
            <div className="empty-state" style={{margin:24}}>
              {hasAny ? (
                <>
                  <h4>No rules match these filters</h4>
                  <div className="desc">Try adjusting your search or filter criteria.</div>
                  <button className="btn btn-secondary btn-sm" style={{marginTop:10}} onClick={clearFilters}>
                    Clear filters
                  </button>
                </>
              ) : tab === "org" ? (
                <>
                  <h4>No rules yet</h4>
                  <div className="desc">Create your first custom rule to start checking clinical notes.</div>
                  <button className="btn btn-brand btn-sm" style={{marginTop:10}} onClick={onCreate}>
                    <Icon name="plus" size={12} /> New rule
                  </button>
                </>
              ) : (
                <>
                  <h4>No library rules available</h4>
                  <div className="desc">Check back later or contact Eleos support.</div>
                </>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function CompatibilityBadge({ value }) {
  const map = {
    full:    { cls: "badge-ok", label: "Compatible", tip: "All required fields are in your data feed." },
    partial: { cls: "badge-warn", label: "Partial", tip: "Some required fields are missing — adoption will prompt you to revise." },
    none:    { cls: "badge-err", label: "Not compatible", tip: "Required fields are not in your data feed." },
  };
  const d = map[value] || map.partial;
  return (
    <span className="tip-wrap">
      <span className={`badge ${d.cls}`}><span className="dot"></span>{d.label}</span>
      <span className="tip">{d.tip}</span>
    </span>
  );
}

// ============================================================
// Side panel — full management surface
// ============================================================

function RuleSidePanel({ rule, onClose, onAction, onOpenFlow }) {
  const [confirm, setConfirm] = useRMState(null); // 'disable' | 'enable' | 'delete' | 'duplicate'

  if (!rule) return null;

  const isOrg = !rule.library;
  const status = rule.status;

  const primaryActions = (() => {
    if (rule.library) {
      return (
        <>
          <button className="btn btn-brand btn-sm" onClick={() => onAction("adopt", rule)}>
            <Icon name="plus" size={12} /> Adopt &amp; customize
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onAction("duplicate-lib", rule)}>
            <Icon name="copy" size={12} /> Duplicate as draft
          </button>
        </>
      );
    }
    if (status === "draft") {
      return (
        <>
          <button className="btn btn-brand btn-sm" onClick={() => onOpenFlow(rule.id, "define")}>
            <Icon name="edit" size={12} /> Continue editing
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setConfirm("duplicate")}>
            <Icon name="copy" size={12} /> Duplicate
          </button>
        </>
      );
    }
    if (status === "submitted") {
      return (
        <>
          <button className="btn btn-brand btn-sm" onClick={() => onOpenFlow(rule.id, "validate")}>
            <Icon name="play" size={12} /> Continue validation
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onOpenFlow(rule.id, "clarify")}>
            <Icon name="arrowLeft" size={12} /> Back to Clarify
          </button>
        </>
      );
    }
    if (status === "active") {
      return (
        <>
          <button className="btn btn-brand btn-sm" onClick={() => onOpenFlow(rule.id, "define")}>
            <Icon name="edit" size={12} /> Edit rule
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onAction("dashboard", rule)}>
            <Icon name="dashboard" size={12} /> View in Dashboard
          </button>
        </>
      );
    }
    if (status === "disabled") {
      return (
        <>
          <button className="btn btn-brand btn-sm" onClick={() => setConfirm("enable")}>
            <Icon name="power" size={12} /> Re-enable rule
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onOpenFlow(rule.id, "define")}>
            <Icon name="edit" size={12} /> Edit rule
          </button>
        </>
      );
    }
    return null;
  })();

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <aside className="drawer">
        <div className="drawer-head">
          <div style={{flex:1}}>
            <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:8}}>
              {isOrg ? <StatusBadge status={status} /> : <CompatibilityBadge value={rule.compatibility} />}
              {isOrg && rule.priority && rule.priority !== "undefined" && (
                <span className="badge badge-draft">{rule.priority} priority</span>
              )}
              <span className="muted small">v{rule.version || 1}</span>
            </div>
            <h2>{rule.name}</h2>
            <div className="muted small" style={{marginTop:6}}>{rule.purpose}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>

        <div className="panel-actions">{primaryActions}</div>

        <div className="drawer-body" style={{padding:0}}>
          {isOrg && status === "active" && (
            <div className="panel-section">
              <h4>Last 7 days</h4>
              <div className="stat-row">
                <div className="stat-card">
                  <div className="lbl">Evaluated</div>
                  <div className="val">{rule.weeklyRuns}</div>
                  <div className="sub">notes</div>
                </div>
                <div className="stat-card">
                  <div className="lbl">Failed</div>
                  <div className="val" style={{color:"var(--err-700)"}}>{rule.weeklyFails}</div>
                  <div className="sub">{((rule.weeklyFails/rule.weeklyRuns)*100).toFixed(1)}% of runs</div>
                </div>
                <div className="stat-card">
                  <div className="lbl">Health</div>
                  <div className="val" style={{color:"var(--ok-700)"}}>Good</div>
                  <div className="sub">no schema drift</div>
                </div>
              </div>
              <div className="connector-card" style={{marginTop:12}}>
                <div className="ic"><Icon name="dashboard" size={18} /></div>
                <div style={{flex:1}}>
                  <h5>Filter Dashboard by this rule</h5>
                  <div className="desc">See every note where this rule has fired in the past 30 days.</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => onAction("dashboard", rule)}>
                  Open <Icon name="arrowUpRight" size={12} />
                </button>
              </div>
            </div>
          )}

          <div className="panel-section">
            <h4>Where this runs</h4>
            <div className="surfaces" style={{display:"flex", gap:8, flexWrap:"wrap"}}>
              <SurfacePill on={rule.surfaces?.includes("dashboard")} label="Dashboard" />
              <SurfacePill on={rule.surfaces?.includes("lqa")} label="LQA (real-time)" />
            </div>
            <div className="muted small" style={{marginTop:8}}>
              {rule.surfaces?.length === 2
                ? "Runs on every new note in the Dashboard and surfaces in real time during LQA."
                : rule.surfaces?.includes("dashboard")
                  ? "Runs in the Dashboard only."
                  : rule.surfaces?.includes("lqa")
                    ? "Runs in LQA only."
                    : rule.status === "active"
                      ? "No surfaces active — rule is not currently running."
                      : "No surfaces selected. Choose surfaces when activating."}
            </div>
          </div>

          <div className="panel-section">
            <h4>Scope</h4>
            <div className="kv-row" style={{padding:0, border:"none", display:"grid", gridTemplateColumns:"120px 1fr", gap:8, fontSize:13}}>
              <div className="muted">Doc type</div><div>{rule.docType || "—"}</div>
              <div className="muted">Rule type</div><div style={{textTransform:"capitalize"}}>{rule.ruleType || "Simple"}</div>
            </div>
          </div>

          {isOrg && (
            <div className="panel-section">
              <h4>Version history</h4>
              <div className="timeline">
                {[
                  rule.version > 1 ? {
                    v: rule.version,
                    when: rule.lastUpdated,
                    who: rule.author,
                    what: rule.status === "active" ? "Rule updated and active" : "Last edited",
                    active: true,
                  } : null,
                  rule.adoptedFromLibrary ? {
                    v: 1,
                    when: rule.lastUpdated,
                    who: rule.author,
                    what: "Adopted from Eleos Library as draft",
                  } : {
                    v: 1,
                    when: rule.lastUpdated,
                    who: rule.author,
                    what: "Rule created",
                  },
                ].filter(Boolean).map((h, i) => (
                  <div key={i} className={`timeline-item ${h.active ? "active" : ""}`}>
                    <div className="when">{h.when} · v{h.v}</div>
                    <div className="what">{h.what}</div>
                    <div className="who">by {h.who}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isOrg && (
            <div className="panel-section">
              <h4>Manage</h4>
              <div style={{display:"flex", flexDirection:"column", gap:6}}>
                <button className="btn btn-secondary btn-sm" style={{justifyContent:"flex-start"}}
                        onClick={() => setConfirm("duplicate")}>
                  <Icon name="copy" size={12} /> Duplicate as new draft
                </button>
                {status === "active" && (
                  <button className="btn btn-secondary btn-sm" style={{justifyContent:"flex-start"}}
                          onClick={() => onAction("change-surfaces", rule)}>
                    <Icon name="sliders" size={12} /> Change where it runs (Dashboard / LQA)
                  </button>
                )}
                {status === "active" && (
                  <button className="btn btn-danger btn-sm" style={{justifyContent:"flex-start"}}
                          onClick={() => setConfirm("disable")}>
                    <Icon name="power" size={12} /> Disable rule
                  </button>
                )}
                {status === "disabled" && (
                  <button className="btn btn-secondary btn-sm" style={{justifyContent:"flex-start"}}
                          onClick={() => setConfirm("enable")}>
                    <Icon name="power" size={12} /> Re-enable rule
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {confirm === "disable" && (
        <Modal title="Disable this rule?"
               primary={{ label: "Disable rule", onClick: () => { onAction("disable", rule); setConfirm(null); }}}
               secondary={{ label: "Cancel", onClick: () => setConfirm(null) }}
               danger
               onClose={() => setConfirm(null)}>
          <p style={{margin:"0 0 10px"}}>
            <strong>{rule.name}</strong> will stop running on new notes immediately.
          </p>
          <ul style={{margin:"0 0 10px 18px", color:"var(--ink-700)", paddingLeft:0}}>
            <li>Existing pass / fail / N/A results will remain visible</li>
            <li>Version history is preserved</li>
            <li>You can re-enable this rule at any time</li>
          </ul>
        </Modal>
      )}

      {confirm === "enable" && (
        <Modal title="Re-enable this rule?"
               primary={{ label: "Re-enable", onClick: () => { onAction("enable", rule); setConfirm(null); }}}
               secondary={{ label: "Cancel", onClick: () => setConfirm(null) }}
               onClose={() => setConfirm(null)}>
          <p style={{margin:"0 0 10px"}}>
            <strong>{rule.name}</strong> will resume evaluating new notes immediately.
            It will run in the same surfaces it was previously active in.
          </p>
          <p className="muted small" style={{margin:0}}>
            If you've changed your mind, you can also edit it first and then activate.
          </p>
        </Modal>
      )}

      {confirm === "duplicate" && (
        <Modal title="Duplicate this rule?"
               primary={{ label: "Create draft", onClick: () => { onAction("duplicate", rule); setConfirm(null); }}}
               secondary={{ label: "Cancel", onClick: () => setConfirm(null) }}
               onClose={() => setConfirm(null)}>
          <p style={{margin:"0 0 10px"}}>
            A new draft will be created from <strong>{rule.name}</strong>. The original rule is not affected.
          </p>
        </Modal>
      )}
    </>
  );
}

Object.assign(window, { RuleManagement, RuleSidePanel, CompatibilityBadge });
