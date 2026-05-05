/* global React, Icon, ALL_RULES, RULE_HISTORY, ORG_SCHEMA, ORG_PROGRAMS, ELEOS_CHECKPOINTS, StatusBadge, SurfacePill, Modal */
const { useState: useRMState, useMemo: useRMMemo } = React;

// ============================================================
// Rule Management
// ============================================================

function RuleManagement({ rules, setRules, onOpen, onCreate, onAdopt, onSelect, selectedId, onAction }) {
  const [tab, setTab] = useRMState("org");
  const [q, setQ] = useRMState("");
  const [statusFilter, setStatusFilter] = useRMState("all");
  const [docFilter, setDocFilter] = useRMState("all");
  const [programFilter, setProgramFilter] = useRMState("all");
  const [selectedCheckpointId, setSelectedCheckpointId] = useRMState(null);

  const orgRules = rules.filter(r => !r.library);
  const libRules = rules.filter(r => r.library);

  const counts = {
    org: orgRules.length,
    library: libRules.length,
    checkpoints: ELEOS_CHECKPOINTS.length,
    active: orgRules.filter(r => r.status === "active").length,
    draft: orgRules.filter(r => r.status === "draft").length,
    submitted: orgRules.filter(r => r.status === "submitted").length,
  };

  const visible = (tab === "org" ? orgRules : libRules).filter(r => {
    if (q && !r.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (tab === "org" && statusFilter !== "all" && r.status !== statusFilter) return false;
    if (docFilter !== "all" && r.docType !== docFilter) return false;
    if (programFilter !== "all" && !(r.programs || []).includes(programFilter)) return false;
    return true;
  });

  const docTypes = ["all", ...ORG_SCHEMA.docTypes.map(d => d.name)];
  const clearFilters = () => { setQ(""); setStatusFilter("all"); setDocFilter("all"); setProgramFilter("all"); };

  const selectedCheckpoint = ELEOS_CHECKPOINTS.find(c => c.id === selectedCheckpointId);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Custom Rules</h1>
          <p className="sub">Documentation and compliance checks Eleos runs on your clinical notes. Active rules show up in the Dashboard and LQA.</p>
        </div>
        <div className="actions">
          {tab !== "checkpoints" && (
            <button className="btn btn-brand" onClick={onCreate}>
              <Icon name="plus" size={14} /> New rule
            </button>
          )}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "org" ? "active" : ""}`} onClick={() => { setTab("org"); setSelectedCheckpointId(null); }}>
          My organization <span className="count">{counts.org}</span>
        </button>
        <button className={`tab ${tab === "library" ? "active" : ""}`} onClick={() => { setTab("library"); setSelectedCheckpointId(null); }}>
          Eleos Library <span className="count">{counts.library}</span>
        </button>
        <button className={`tab ${tab === "checkpoints" ? "active" : ""}`} onClick={() => { setTab("checkpoints"); onSelect(null); }}>
          Eleos Checkpoints <span className="count">{counts.checkpoints}</span>
        </button>
      </div>

      {tab === "checkpoints" ? (
        <CheckpointsTab
          checkpoints={ELEOS_CHECKPOINTS}
          selectedId={selectedCheckpointId}
          onSelect={setSelectedCheckpointId}
        />
      ) : (
        <>
          {/* Library tab context banner */}
          {tab === "library" && (
            <div style={{
              display:"flex", gap:12, padding:"10px 14px", marginBottom:12,
              background:"var(--brand-50)", border:"1px solid var(--brand-100)",
              borderRadius:8, fontSize:13, color:"var(--brand-700)", lineHeight:1.5,
            }}>
              <Icon name="book" size={15} style={{flexShrink:0, marginTop:1}} />
              <span>
                <strong>Eleos Library</strong> contains rules built by Eleos for common behavioral health standards.
                They aren't running in your org yet — adopt a rule to copy it in and customize it.
              </span>
            </div>
          )}

          {/* Org tab status legend */}
          {tab === "org" && (
            <div style={{display:"flex", gap:14, marginBottom:10, fontSize:11, color:"var(--ink-500)", flexWrap:"wrap", alignItems:"center"}}>
              <span style={{fontWeight:600, color:"var(--ink-400)"}}>Status:</span>
              {[
                { dot:"var(--info-500)", label:"Draft — still being built" },
                { dot:"var(--warn-500)", label:"Submitted — validated, not yet live" },
                { dot:"var(--ok-500)",   label:"Active — running on notes" },
                { dot:"var(--ink-300)",  label:"Disabled — paused" },
              ].map(({ dot, label }) => (
                <span key={label} style={{display:"flex", alignItems:"center", gap:4}}>
                  <span style={{width:7, height:7, borderRadius:"50%", background:dot, flexShrink:0}} />
                  {label}
                </span>
              ))}
            </div>
          )}

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
              {docTypes.map(d => <option key={d} value={d}>{d === "all" ? "All note types" : d}</option>)}
            </select>
            <select className="filter-chip" style={{padding:"5px 10px"}}
                    value={programFilter} onChange={e => setProgramFilter(e.target.value)}>
              <option value="all">All programs</option>
              {ORG_PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="card" style={{overflow:"hidden"}}>
            <table className="rules-table">
              <thead>
                <tr>
                  <th style={{width:"36%"}}>Rule</th>
                  <th>{tab === "org" ? "Status" : "Compatibility"}</th>
                  <th>Note type</th>
                  <th>Programs</th>
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
                      <div style={{display:"flex", flexWrap:"wrap", gap:4}}>
                        {(r.programs || []).length > 0
                          ? (r.programs || []).map(p => (
                              <span key={p} style={{
                                fontSize:11, padding:"1px 7px", borderRadius:99,
                                background:"var(--ink-100)", color:"var(--ink-700)",
                                border:"1px solid var(--ink-150)", fontWeight:500, whiteSpace:"nowrap",
                              }}>{p}</span>
                            ))
                          : <span className="muted small">—</span>}
                      </div>
                    </td>
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
        </>
      )}

      {/* Checkpoint side panel */}
      {selectedCheckpoint && (
        <CheckpointSidePanel
          checkpoint={selectedCheckpoint}
          onClose={() => setSelectedCheckpointId(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// Eleos Checkpoints tab
// ============================================================

function CheckpointsTab({ checkpoints, selectedId, onSelect }) {
  return (
    <>
      <div style={{
        display:"flex", gap:12, padding:"10px 14px", marginBottom:12,
        background:"var(--brand-50)", border:"1px solid var(--brand-100)",
        borderRadius:8, fontSize:13, color:"var(--brand-700)", lineHeight:1.5,
      }}>
        <Icon name="sparkle" size={15} style={{flexShrink:0, marginTop:1}} />
        <span>
          <strong>Eleos Checkpoints</strong> are always-on compliance checks built and maintained by Eleos.
          They run on every document and cannot be disabled. Completeness and Uniqueness have configurable thresholds.
        </span>
      </div>

      <div className="card" style={{overflow:"hidden"}}>
        <table className="rules-table">
          <thead>
            <tr>
              <th style={{width:"30%"}}>Checkpoint</th>
              <th>Type</th>
              <th>Applies to</th>
              <th>Last 7 days</th>
              <th>Pass rate</th>
              <th>Threshold</th>
              <th style={{width:40}}></th>
            </tr>
          </thead>
          <tbody>
            {checkpoints.map(c => {
              const passRate = c.weeklyRuns > 0
                ? (((c.weeklyRuns - c.weeklyFails) / c.weeklyRuns) * 100).toFixed(1)
                : null;
              return (
                <tr key={c.id} className={selectedId === c.id ? "selected" : ""}
                    onClick={() => onSelect(c.id)}>
                  <td>
                    <div className="rule-title">{c.name}</div>
                    <div className="rule-subtitle">{c.description}</div>
                  </td>
                  <td>
                    {c.critical
                      ? <span className="badge badge-err"><span className="dot"></span>Critical</span>
                      : <span className="badge badge-draft">Standard</span>}
                  </td>
                  <td><span className="muted small">{c.docTypes}</span></td>
                  <td>
                    <div className="metric-inline">
                      <span className="num">{c.weeklyRuns.toLocaleString()}</span>
                      <span className="lbl">runs · {c.weeklyFails} fails</span>
                    </div>
                  </td>
                  <td>
                    {passRate !== null && (
                      <span style={{
                        fontWeight:600, fontSize:13,
                        color: parseFloat(passRate) >= 90 ? "var(--ok-700)" : parseFloat(passRate) >= 75 ? "var(--warn-700)" : "var(--err-700)",
                      }}>{passRate}%</span>
                    )}
                  </td>
                  <td>
                    {c.threshold
                      ? <span className="muted small">{c.threshold.value} {c.threshold.unit}</span>
                      : <span className="muted small">—</span>}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="icon-btn" onClick={() => onSelect(c.id)}><Icon name="moreH" size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ============================================================
// Checkpoint side panel
// ============================================================

function CheckpointSidePanel({ checkpoint, onClose }) {
  const [thresholdVal, setThresholdVal] = useRMState(checkpoint.threshold?.value ?? null);
  const [editing, setEditing] = useRMState(false);
  const [saved, setSaved] = useRMState(false);

  const saveThreshold = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const passRate = checkpoint.weeklyRuns > 0
    ? (((checkpoint.weeklyRuns - checkpoint.weeklyFails) / checkpoint.weeklyRuns) * 100).toFixed(1)
    : null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <aside className="drawer">
        <div className="drawer-head">
          <div style={{flex:1}}>
            <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:8}}>
              {checkpoint.critical
                ? <span className="badge badge-err"><span className="dot"></span>Critical checkpoint</span>
                : <span className="badge badge-draft">Standard checkpoint</span>}
              <span className="badge badge-active"><span className="dot"></span>Always on</span>
            </div>
            <h2>{checkpoint.name}</h2>
            <div className="muted small" style={{marginTop:6, lineHeight:1.5}}>{checkpoint.description}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>

        <div className="drawer-body" style={{padding:0}}>
          <div className="panel-section">
            <h4>Last 7 days</h4>
            <div className="stat-row">
              <div className="stat-card">
                <div className="lbl">Evaluated</div>
                <div className="val">{checkpoint.weeklyRuns.toLocaleString()}</div>
                <div className="sub">notes</div>
              </div>
              <div className="stat-card">
                <div className="lbl">Failed</div>
                <div className="val" style={{color:"var(--err-700)"}}>{checkpoint.weeklyFails}</div>
                <div className="sub">{passRate}% pass rate</div>
              </div>
              <div className="stat-card">
                <div className="lbl">Applies to</div>
                <div className="val" style={{fontSize:14}}>All</div>
                <div className="sub">note types</div>
              </div>
            </div>
          </div>

          {checkpoint.threshold && (
            <div className="panel-section">
              <h4>Threshold</h4>
              <div style={{fontSize:13, color:"var(--ink-700)", lineHeight:1.5, marginBottom:12}}>
                {checkpoint.id === "ec-1"
                  ? "Documents with fewer than this many words automatically fail the Completeness check and receive a quality score of 0."
                  : "Documents with similarity above this percentage automatically fail the Uniqueness check and receive a quality score of 0."}
              </div>
              {editing ? (
                <div style={{display:"flex", alignItems:"center", gap:10}}>
                  <div style={{display:"flex", alignItems:"center", gap:8, flex:1}}>
                    <input
                      type="number"
                      className="input"
                      style={{maxWidth:80, textAlign:"center"}}
                      value={thresholdVal}
                      min={checkpoint.threshold.min}
                      max={checkpoint.threshold.max}
                      onChange={e => setThresholdVal(Number(e.target.value))}
                    />
                    <span style={{fontSize:13, color:"var(--ink-600)"}}>{checkpoint.threshold.unit}</span>
                    <span className="muted small">(range: {checkpoint.threshold.min}–{checkpoint.threshold.max})</span>
                  </div>
                  <div style={{display:"flex", gap:6}}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setThresholdVal(checkpoint.threshold.value); setEditing(false); }}>Cancel</button>
                    <button className="btn btn-brand btn-sm" onClick={saveThreshold}>Save</button>
                  </div>
                </div>
              ) : (
                <div style={{display:"flex", alignItems:"center", gap:10}}>
                  <div style={{fontSize:22, fontWeight:700, color:"var(--ink-900)", fontVariantNumeric:"tabular-nums"}}>
                    {thresholdVal}
                    <span style={{fontSize:14, fontWeight:500, color:"var(--ink-500)", marginLeft:4}}>{checkpoint.threshold.unit}</span>
                  </div>
                  <span className="muted small">{checkpoint.threshold.label}</span>
                  <button className="btn btn-secondary btn-sm" style={{marginLeft:"auto"}} onClick={() => setEditing(true)}>
                    <Icon name="edit" size={12} /> Edit
                  </button>
                </div>
              )}
              {saved && (
                <div style={{marginTop:10, fontSize:12, color:"var(--ok-700)", display:"flex", alignItems:"center", gap:5}}>
                  <Icon name="check" size={12} /> Threshold updated. Applies to new evaluations.
                </div>
              )}
            </div>
          )}

          <div className="panel-section">
            <h4>About this checkpoint</h4>
            <div style={{fontSize:13, color:"var(--ink-700)", lineHeight:1.6}}>
              {checkpoint.critical && (
                <div style={{marginBottom:8, padding:"8px 10px", background:"var(--err-50)", borderRadius:6, border:"1px solid var(--err-100)", color:"var(--err-700)"}}>
                  <Icon name="alert" size={11} /> <strong>Critical:</strong> Failing this checkpoint sets the quality score to 0, regardless of other checkpoints.
                </div>
              )}
              This checkpoint is defined and maintained by Eleos based on clinically tagged datasets. It cannot be disabled or customized beyond the threshold above.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ============================================================
// Compatibility badge
// ============================================================

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
// Side panel
// ============================================================

function RuleSidePanel({ rule, rules, setRules, onClose, onAction, onOpenFlow, pushToast }) {
  const [confirm, setConfirm] = useRMState(null);
  const [editingScope, setEditingScope] = useRMState(false);
  const [scopeDraft, setScopeDraft] = useRMState(null);

  if (!rule) return null;

  const isOrg = !rule.library;
  const status = rule.status;

  const startScopeEdit = () => {
    setScopeDraft({
      docType: rule.docType || "",
      programs: [...(rule.programs || [])],
    });
    setEditingScope(true);
  };

  const saveScope = () => {
    if (setRules) {
      setRules(rs => rs.map(r => r.id === rule.id
        ? { ...r, docType: scopeDraft.docType, programs: scopeDraft.programs, lastUpdated: "Just now" }
        : r
      ));
    }
    setEditingScope(false);
    if (pushToast) pushToast("Scope updated", "success", "check");
  };

  const toggleScopeProgram = (p) => {
    const next = scopeDraft.programs.includes(p)
      ? scopeDraft.programs.filter(x => x !== p)
      : [...scopeDraft.programs, p];
    setScopeDraft({ ...scopeDraft, programs: next });
  };

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
          <button className="btn btn-brand btn-sm" onClick={() => onOpenFlow(rule.id, "activate")}>
            <Icon name="power" size={12} /> Activate rule
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onOpenFlow(rule.id, "define")}>
            <Icon name="edit" size={12} /> Edit rule
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
                <span className="tip-wrap">
                  <span className="badge badge-draft">{rule.priority} priority</span>
                  <span className="tip">Priority influences the quality score weight. Critical and High rules carry more weight in the overall score calculation.</span>
                </span>
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

          {/* Submitted status callout */}
          {isOrg && status === "submitted" && (
            <div className="panel-section">
              <div style={{padding:"10px 12px", background:"var(--warn-50)", borderRadius:8,
                           border:"1px solid var(--warn-100)", fontSize:13, color:"var(--warn-700)", lineHeight:1.5}}>
                <div style={{fontWeight:600, marginBottom:4, display:"flex", alignItems:"center", gap:6}}>
                  <Icon name="check" size={13} /> Validation passed — ready to activate
                </div>
                <div>This rule has been validated but isn't running yet. Activate it to start evaluating notes. No re-validation needed.</div>
              </div>
            </div>
          )}

          {/* Active rule stats */}
          {isOrg && status === "active" && (
            <div className="panel-section">
              <h4>Last 7 days</h4>
              <div className="stat-row">
                <div className="stat-card" style={{cursor:"pointer"}} onClick={() => pushToast && pushToast(`Opening Dashboard filtered by "${rule.name}" — all results`, "default", "dashboard")}>
                  <div className="lbl">Evaluated</div>
                  <div className="val">{rule.weeklyRuns}</div>
                  <div className="sub" style={{color:"var(--brand-600)"}}>View in Dashboard ↗</div>
                </div>
                <div className="stat-card" style={{cursor:"pointer"}} onClick={() => pushToast && pushToast(`Opening Dashboard filtered by "${rule.name}" — failed notes only`, "default", "dashboard")}>
                  <div className="lbl">Failed</div>
                  <div className="val" style={{color:"var(--err-700)"}}>{rule.weeklyFails}</div>
                  <div className="sub" style={{color:"var(--brand-600)"}}>View failures ↗</div>
                </div>
                <div className="stat-card">
                  <div className="lbl">Health</div>
                  <div className="val" style={{color:"var(--ok-700)"}}>Good</div>
                  <div className="sub">no schema drift</div>
                </div>
              </div>
            </div>
          )}

          {/* Where this runs — org rules only */}
          {isOrg && (
            <div className="panel-section">
              <h4>Where this runs</h4>
              <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:8}}>
                {["dashboard", "lqa"].map(s => {
                  const active = rule.surfaces?.includes(s);
                  const label = s === "dashboard" ? "Dashboard" : "LQA (real-time)";
                  return (
                    <span key={s} style={{
                      display:"inline-flex", alignItems:"center", gap:5,
                      padding:"4px 10px", borderRadius:6, fontSize:12, fontWeight:500,
                      background: active ? "var(--ok-50)" : "var(--ink-100)",
                      color: active ? "var(--ok-700)" : "var(--ink-400)",
                      border: `1px solid ${active ? "var(--ok-100)" : "var(--ink-150)"}`,
                    }}>
                      <span style={{width:6, height:6, borderRadius:"50%", background: active ? "var(--ok-500)" : "var(--ink-300)", flexShrink:0}} />
                      {label}
                    </span>
                  );
                })}
              </div>
              <div className="muted small">
                {rule.surfaces?.length === 2
                  ? "Running in Dashboard and LQA."
                  : rule.surfaces?.includes("dashboard")
                    ? "Running in Dashboard only."
                    : rule.surfaces?.includes("lqa")
                      ? "Running in LQA only."
                      : rule.status === "active"
                        ? "No surfaces active — rule is not currently running."
                        : "No surfaces selected yet. You'll choose when activating."}
              </div>
            </div>
          )}

          {/* Library rule details */}
          {!isOrg && (
            <div className="panel-section">
              <h4>Library details</h4>
              <div style={{display:"grid", gridTemplateColumns:"120px 1fr", gap:8, fontSize:13, marginBottom:10}}>
                <div className="muted">Adoptions</div>
                <div style={{fontWeight:500}}>{rule.adoptions ?? "—"} orgs</div>
                <div className="muted">Compatibility</div>
                <div><CompatibilityBadge value={rule.compatibility} /></div>
              </div>
              {rule.compatibility === "none" && (
                <div style={{padding:"8px 10px", background:"var(--err-50)", borderRadius:6,
                             border:"1px solid var(--err-100)", color:"var(--err-700)", fontSize:12, lineHeight:1.5}}>
                  <Icon name="alert" size={11} /> Required fields aren't in your data feed. You can still adopt and edit, but the rule won't run until the fields are available.
                </div>
              )}
              {rule.compatibility === "partial" && (
                <div style={{padding:"8px 10px", background:"var(--warn-50)", borderRadius:6,
                             border:"1px solid var(--warn-100)", color:"var(--warn-700)", fontSize:12, lineHeight:1.5}}>
                  <Icon name="info" size={11} /> Some required fields are missing. We'll flag alternatives during editing.
                </div>
              )}
            </div>
          )}

          {/* Scope section with inline editor */}
          <div className="panel-section">
            <div style={{display:"flex", alignItems:"center", marginBottom:10}}>
              <h4 style={{margin:0}}>Scope</h4>
              {isOrg && !editingScope && (
                <button className="btn btn-ghost btn-sm" style={{marginLeft:"auto", padding:"2px 8px"}} onClick={startScopeEdit}>
                  <Icon name="edit" size={12} /> Edit
                </button>
              )}
            </div>

            {editingScope ? (
              <div style={{display:"flex", flexDirection:"column", gap:12}}>
                <div>
                  <div style={{fontSize:12, fontWeight:600, color:"var(--ink-500)", textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:6}}>Note type</div>
                  <select className="select" style={{maxWidth:280}}
                          value={scopeDraft.docType}
                          onChange={e => setScopeDraft({...scopeDraft, docType: e.target.value})}>
                    <option value="">All note types</option>
                    {ORG_SCHEMA.docTypes.map(d => <option key={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:12, fontWeight:600, color:"var(--ink-500)", textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:6}}>Programs / services</div>
                  <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                    {ORG_PROGRAMS.map(p => {
                      const on = scopeDraft.programs.includes(p);
                      return (
                        <button key={p} onClick={() => toggleScopeProgram(p)}
                                className={`btn btn-sm ${on ? "btn-brand" : "btn-secondary"}`}
                                style={{borderRadius:99}}>
                          {on && <Icon name="check" size={11} />} {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{display:"flex", gap:8}}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingScope(false)}>Cancel</button>
                  <button className="btn btn-brand btn-sm" onClick={saveScope}>Save changes</button>
                </div>
              </div>
            ) : (
              <div style={{display:"grid", gridTemplateColumns:"100px 1fr", gap:8, fontSize:13}}>
                <div className="muted">Note type</div>
                <div>{rule.docType || "—"}</div>
                <div className="muted">Programs</div>
                <div>
                  {(rule.programs || []).length > 0 ? (
                    <div style={{display:"flex", flexWrap:"wrap", gap:4}}>
                      {rule.programs.map(p => (
                        <span key={p} style={{
                          fontSize:11, padding:"1px 7px", borderRadius:99,
                          background:"var(--ink-100)", color:"var(--ink-700)",
                          border:"1px solid var(--ink-150)", fontWeight:500,
                        }}>{p}</span>
                      ))}
                    </div>
                  ) : <span style={{color:"var(--ink-400)"}}>All programs</span>}
                </div>
                {rule.priority && (
                  <>
                    <div className="muted">Priority</div>
                    <div style={{display:"flex", alignItems:"center", gap:6}}>
                      {rule.priority}
                      <span className="tip-wrap">
                        <Icon name="info" size={12} style={{color:"var(--ink-400)", cursor:"help"}} />
                        <span className="tip">Priority influences the quality score weight. Critical and High rules carry more weight in the overall score calculation.</span>
                      </span>
                    </div>
                  </>
                )}
                {rule.ruleType && (
                  <>
                    <div className="muted">Rule type</div>
                    <div style={{textTransform:"capitalize"}}>{rule.ruleType}</div>
                  </>
                )}
                {rule.docEntries?.some(e => e.references?.length > 0) && (
                  <>
                    <div className="muted">References</div>
                    <div>{rule.docEntries.flatMap(e => e.references).join(", ")}</div>
                  </>
                )}
              </div>
            )}
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
                    v: 1, when: rule.lastUpdated, who: rule.author,
                    what: "Adopted from Eleos Library as draft",
                  } : {
                    v: 1, when: rule.lastUpdated, who: rule.author,
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
                    <Icon name="sliders" size={12} /> Change where it runs
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
               danger onClose={() => setConfirm(null)}>
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
          </p>
          <p className="muted small" style={{margin:0}}>It will run in the same surfaces it was previously active in.</p>
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
