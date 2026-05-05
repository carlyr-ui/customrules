/* global React, Icon, ORG_SCHEMA, ORG_POLICIES */
const { useState: useFCState, useEffect: useFCEffect } = React;

// ============================================================
// Page 2 — Define
// ============================================================

function DefineStage({ draft, setDraft, onBack, onNext }) {
  const update = (patch) => setDraft({ ...draft, ...patch });

  // ── Touched state for inline validation ──────────────────
  const [touched, setTouched] = useFCState({});
  const touch = (field) => setTouched(t => ({ ...t, [field]: true }));

  // ── Auto-save: debounced 1.2s ────────────────────────────
  const [savedAt, setSavedAt] = useFCState(null);
  const [saving, setSaving] = useFCState(false);
  useFCEffect(() => {
    setSaving(true);
    const t = setTimeout(() => { setSaving(false); setSavedAt(Date.now()); }, 1200);
    return () => clearTimeout(t);
  }, [draft.title, draft.description, draft.passCriteria, draft.failCriteria]);

  const [secsAgo, setSecsAgo] = useFCState(0);
  useFCEffect(() => {
    if (!savedAt) return;
    setSecsAgo(0);
    const tick = setInterval(() => setSecsAgo(Math.floor((Date.now() - savedAt) / 1000)), 1000);
    return () => clearInterval(tick);
  }, [savedAt]);

  const savedLabel = saving ? "Saving…"
    : savedAt == null ? ""
    : secsAgo < 5 ? "Draft auto-saved just now"
    : `Draft auto-saved ${secsAgo}s ago`;

  // ── Document entries ─────────────────────────────────────
  const initEntries = () => {
    if (draft.docEntries?.length > 0) return draft.docEntries;
    if (draft.docType) return [{ id: "de-1", evaluated: draft.docType, references: [] }];
    return [{ id: `de-${Date.now()}`, evaluated: "", references: [] }];
  };
  const [docEntries, setDocEntries] = useFCState(initEntries);

  const syncEntries = (entries) => {
    setDocEntries(entries);
    update({ docEntries: entries, docType: entries[0]?.evaluated || "" });
  };

  const addEntry = () => {
    syncEntries([...docEntries, { id: `de-${Date.now()}`, evaluated: "", references: [] }]);
  };

  const removeEntry = (id) => {
    syncEntries(docEntries.filter(e => e.id !== id));
  };

  const updateEntry = (id, patch) => {
    syncEntries(docEntries.map(e => e.id === id ? { ...e, ...patch } : e));
  };

  const toggleRef = (entryId, docName) => {
    const entry = docEntries.find(e => e.id === entryId);
    if (!entry) return;
    const refs = entry.references.includes(docName)
      ? entry.references.filter(r => r !== docName)
      : [...entry.references, docName];
    updateEntry(entryId, { references: refs });
  };

  // ── Priority ─────────────────────────────────────────────
  const [priority, setPriority] = useFCState(draft.priority || "Medium");
  const updatePriority = (p) => { setPriority(p); update({ priority: p }); };

  // ── Surfaces ─────────────────────────────────────────────
  const [surfaces, setSurfaces] = useFCState({
    dashboard: draft.surfaces?.includes("dashboard") || false,
    lqa: draft.surfaces?.includes("lqa") || false,
  });
  const toggleSurface = (key) => {
    const next = { ...surfaces, [key]: !surfaces[key] };
    setSurfaces(next);
    update({ surfaces: Object.keys(next).filter(k => next[k]) });
  };

  // ── Can continue ─────────────────────────────────────────
  const canContinue = !!(
    draft.title &&
    draft.description &&
    draft.passCriteria &&
    docEntries.some(e => e.evaluated)
  );

  const fieldError = (field, value) => touched[field] && !value
    ? <div style={{fontSize:12, color:"var(--err-700)", marginTop:4}}>This field is required.</div>
    : null;

  const PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"];
  const PRIORITY_COLORS = {
    Critical: { bg:"var(--err-50)", border:"var(--err-300)", text:"var(--err-700)" },
    High:     { bg:"var(--warn-50)", border:"var(--warn-100)", text:"var(--warn-700)" },
    Medium:   { bg:"var(--info-50)", border:"var(--info-100)", text:"var(--info-700)" },
    Low:      { bg:"var(--ink-100)", border:"var(--ink-150)", text:"var(--ink-700)" },
  };

  return (
    <div className="page" style={{paddingTop:24}}>
      <div className="page-header">
        <div>
          <h1>Define your rule</h1>
          <p className="sub">Describe the check Eleos should run. We'll sharpen the exact logic in the next step.</p>
        </div>
        <div className="actions">
          <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4}}>
            <button className="btn btn-brand" disabled={!canContinue} onClick={onNext}>
              Continue <Icon name="arrowRight" size={14} />
            </button>
            <div style={{fontSize:11, color:"var(--ink-400)"}}>Next: set pass / fail logic</div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:720}}>

        {/* ── Active rule warning ── */}
        {draft.status === "active" && (
          <div style={{
            display:"flex", gap:10, padding:"10px 14px", marginBottom:20,
            background:"var(--warn-50)", border:"1px solid var(--warn-100)",
            borderRadius:8, fontSize:13, color:"var(--warn-700)", lineHeight:1.5,
          }}>
            <Icon name="alert" size={15} style={{flexShrink:0, marginTop:1}} />
            <span>
              <strong>This rule is currently active.</strong> Changes you make here will apply to new notes only — notes already evaluated will not be re-evaluated.
            </span>
          </div>
        )}

        {/* ── Section 1: What the rule checks ── */}
        <div className="section-h first">
          <h3>What it checks</h3>
          <span className="sub">Describe the logic Eleos will use to evaluate each document.</span>
        </div>

        <div className="card">
          <div className="card-body" style={{display:"flex", flexDirection:"column", gap:18}}>
            <div className="field-group">
              <label className="field-label">Rule name <span className="req">*</span></label>
              <input className="input" placeholder="e.g., Progress note references treatment plan goals"
                     value={draft.title}
                     onChange={e => update({title: e.target.value})}
                     onBlur={() => touch("title")} />
              {fieldError("title", draft.title)}
            </div>

            <div className="field-group">
              <label className="field-label">What should this rule check, and why? <span className="req">*</span></label>
              <textarea className="textarea"
                        placeholder="Describe the check in plain language. Reference policy or accreditation if helpful — we'll turn this into precise logic in the next step."
                        value={draft.description}
                        onChange={e => update({description: e.target.value})}
                        onBlur={() => touch("description")}
                        style={{minHeight:100}} />
              {fieldError("description", draft.description)}
            </div>

            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
              <div className="field-group">
                <label className="field-label">What does PASS look like? <span className="req">*</span></label>
                <textarea className="textarea"
                          placeholder="What must the note contain or do to pass?"
                          value={draft.passCriteria}
                          onChange={e => update({passCriteria: e.target.value})}
                          onBlur={() => touch("passCriteria")}
                          style={{minHeight:80}} />
                {fieldError("passCriteria", draft.passCriteria)}
              </div>
              <div className="field-group">
                <label className="field-label">What does FAIL look like? <span className="opt">optional</span></label>
                <textarea className="textarea"
                          placeholder="Leave blank if anything that doesn't pass is sufficient."
                          value={draft.failCriteria}
                          onChange={e => update({failCriteria: e.target.value})}
                          style={{minHeight:80}} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Which notes does this apply to ── */}
        <div className="section-h">
          <h3>Which notes does this apply to?</h3>
          <span className="sub">Choose the note type this rule checks. Optionally, select other documents it should reference — for example, checking a progress note against a treatment plan.</span>
        </div>

        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {docEntries.map((entry, i) => {
            const otherDocTypes = ORG_SCHEMA.docTypes.filter(d => d.name !== entry.evaluated);
            const isComplex = entry.references.length > 0;
            return (
              <div key={entry.id} className="card">
                <div className="card-body" style={{display:"flex", flexDirection:"column", gap:14}}>
                  <div style={{display:"flex", alignItems:"center", gap:10}}>
                    <div style={{flex:1}}>
                      <label className="field-label" style={{marginBottom:6, display:"block"}}>
                        Note type being evaluated <span className="req">*</span>
                      </label>
                      <select className="select" value={entry.evaluated}
                              onChange={e => updateEntry(entry.id, { evaluated: e.target.value, references: [] })}
                              style={{maxWidth:280}}>
                        <option value="">Choose a note type…</option>
                        {ORG_SCHEMA.docTypes
                          .filter(d => !docEntries.some(e2 => e2.id !== entry.id && e2.evaluated === d.name))
                          .map(d => <option key={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    {isComplex && (
                      <span className="badge badge-info" style={{flexShrink:0}}>
                        <Icon name="link" size={11} /> Cross-document rule
                      </span>
                    )}
                    {docEntries.length > 1 && (
                      <button className="icon-btn" title="Remove" onClick={() => removeEntry(entry.id)}
                              style={{color:"var(--ink-400)", flexShrink:0}}>
                        <Icon name="x" size={16} />
                      </button>
                    )}
                  </div>

                  {/* Reference documents */}
                  {entry.evaluated && (
                    <div>
                      <div style={{fontSize:13, fontWeight:500, color:"var(--ink-800)", marginBottom:4}}>
                        Should this rule reference another document?
                      </div>
                      <div className="muted small" style={{marginBottom:10}}>
                        Optional. Select if this rule requires checking the {entry.evaluated.toLowerCase()} against another record — e.g., a treatment plan or prior assessment.
                      </div>
                      <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                        {otherDocTypes.map(d => {
                          const selected = entry.references.includes(d.name);
                          return (
                            <button key={d.name}
                                    onClick={() => toggleRef(entry.id, d.name)}
                                    className={`btn btn-sm ${selected ? "btn-secondary" : "btn-ghost"}`}
                                    style={{
                                      borderColor: selected ? "var(--brand-500)" : undefined,
                                      color: selected ? "var(--brand-700)" : undefined,
                                      background: selected ? "var(--brand-50)" : undefined,
                                    }}>
                              {selected && <Icon name="check" size={12} />}
                              {d.name}
                            </button>
                          );
                        })}
                      </div>
                      {entry.references.length > 0 && (
                        <div className="muted small" style={{marginTop:8, color:"var(--ink-500)"}}>
                          <Icon name="info" size={11} /> Eleos will evaluate each <strong>{entry.evaluated}</strong> alongside the selected reference document(s).
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <button className="btn btn-ghost btn-sm" style={{alignSelf:"flex-start"}} onClick={addEntry}>
            <Icon name="plus" size={13} /> Add another note type
          </button>
        </div>

        {/* ── Section 3: Policy reference ── */}
        <div className="section-h">
          <h3>Supporting policy <span style={{fontWeight:400, color:"var(--ink-400)", fontSize:13}}>(optional)</span></h3>
          <span className="sub">Link a policy or regulation from your org's document library. Managed in Settings.</span>
        </div>

        <div className="card">
          <div className="card-body">
            <select className="select" style={{maxWidth:400}}
                    value={draft.policyRef || ""}
                    onChange={e => update({ policyRef: e.target.value })}>
              <option value="">None — no policy reference</option>
              {(ORG_POLICIES || []).map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Section 4: Rule settings ── */}
        <div className="section-h">
          <h3>Rule settings</h3>
        </div>

        <div className="card">
          <div className="card-body" style={{display:"flex", flexDirection:"column", gap:20}}>

            {/* Priority */}
            <div>
              <div className="field-label" style={{marginBottom:8}}>Priority</div>
              <div style={{display:"flex", gap:6}}>
                {PRIORITY_OPTIONS.map(p => {
                  const isOn = priority === p;
                  const colors = PRIORITY_COLORS[p];
                  return (
                    <button key={p} onClick={() => updatePriority(p)}
                            className="btn btn-sm"
                            style={{
                              background: isOn ? colors.bg : "transparent",
                              border: `1px solid ${isOn ? colors.border : "var(--ink-200)"}`,
                              color: isOn ? colors.text : "var(--ink-500)",
                              fontWeight: isOn ? 600 : 400,
                            }}>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Surfaces */}
            <div>
              <div className="field-label" style={{marginBottom:4}}>Where should this rule run?</div>
              <div className="muted small" style={{marginBottom:10}}>You can adjust this before activating. Selecting now helps the team plan.</div>
              <div style={{display:"flex", flexDirection:"column", gap:8}}>
                <label style={{display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer"}}>
                  <div className={`ck`} style={{marginTop:2, flexShrink:0, cursor:"pointer"}}
                       onClick={() => toggleSurface("dashboard")}>
                    {surfaces.dashboard && <Icon name="check" size={12} />}
                  </div>
                  <div onClick={() => toggleSurface("dashboard")}>
                    <div style={{fontWeight:500, fontSize:13}}>Dashboard</div>
                    <div className="muted small">Eleos evaluates notes after submission. Results appear in reporting for supervisors and quality leads.</div>
                  </div>
                </label>
                <label style={{display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer"}}>
                  <div className={`ck`} style={{marginTop:2, flexShrink:0, cursor:"pointer"}}
                       onClick={() => toggleSurface("lqa")}>
                    {surfaces.lqa && <Icon name="check" size={12} />}
                  </div>
                  <div onClick={() => toggleSurface("lqa")}>
                    <div style={{fontWeight:500, fontSize:13}}>LQA — Live Quality Assist</div>
                    <div className="muted small">Eleos checks the rule in real time while clinicians write notes in the EHR.</div>
                  </div>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, marginTop:20}}>
          <div style={{display:"flex", gap:8}}>
            <button className="btn btn-ghost" onClick={onBack}>Save draft &amp; exit</button>
            <button className="btn btn-brand" disabled={!canContinue} onClick={onNext}>
              Continue <Icon name="arrowRight" size={14} />
            </button>
          </div>
          {!canContinue && (touched.title || touched.description || touched.passCriteria) && (
            <div className="muted small" style={{color:"var(--err-700)"}}>
              Fill in required fields above to continue.
            </div>
          )}
          {savedLabel && canContinue && (
            <div className="muted small" style={{display:"flex", alignItems:"center", gap:5}}>
              <Icon name="check" size={11} /> {savedLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Page 3 — Clarify
// ============================================================

const CLARIFY_QUESTIONS = [
  {
    id: "specificity",
    label: "What counts as a pass?",
    prompt: "This rule is satisfied when the note contains…",
    options: [
      { v: "any",        label: "Any mention counts",              detail: "Even a brief or vague reference passes." },
      { v: "measurable", label: "Something specific and measurable", detail: "Must include a named target, metric, or quantifiable indicator.", recommended: true },
      { v: "smart",      label: "A fully structured (SMART) entry",  detail: "Specific, measurable, achievable, relevant, and time-bound." },
    ],
  },
  {
    id: "missing",
    label: "If the field is missing from the note…",
    prompt: "When the relevant section isn't present at all…",
    options: [
      { v: "fail", label: "Count it as a fail",              detail: "Use this when the section itself must exist.", recommended: true },
      { v: "na",   label: "Mark it N/A and skip this note",  detail: "Use only when the rule doesn't apply if the section is missing." },
    ],
  },
  {
    id: "count",
    label: "How many instances are needed?",
    prompt: "To pass, the note must have…",
    options: [
      { v: "one",   label: "At least one",     detail: "Pass as soon as one qualifying instance is found.", recommended: true },
      { v: "multi", label: "Two or more",       detail: "At least 2 qualifying instances must be present." },
    ],
  },
];

function ClarifyStage({ draft, setDraft, onBack, onNext }) {
  const [answers, setAnswers] = useFCState(draft.clarify?.answers || {});
  const [feedback, setFeedback] = useFCState("");
  const [aiResponse, setAiResponse] = useFCState(null);
  const [sendingToAI, setSendingToAI] = useFCState(false);

  const total = CLARIFY_QUESTIONS.length;
  const answeredCount = Object.keys(answers).filter(k => CLARIFY_QUESTIONS.some(q => q.id === k)).length;
  const allAnswered = answeredCount === total;

  const answer = (qid, v) => {
    const next = { ...answers, [qid]: v };
    setAnswers(next);
    setDraft({ ...draft, clarify: { ...draft.clarify, answers: next } });
  };

  const handleSendToAI = () => {
    if (!feedback) return;
    setSendingToAI(true);
    setTimeout(() => {
      setSendingToAI(false);
      setAiResponse("Feedback noted. In the full product this would refine the rule logic directly. For now, adjust your selections above if the definition doesn't look right, or continue to Validate where you can refine further.");
      setFeedback("");
    }, 1200);
  };

  const definition = composeDefinition(draft, answers);
  const confidenceColor = allAnswered ? "var(--ok-700)" : answeredCount > 0 ? "var(--warn-700)" : "var(--ink-400)";
  const confidenceLabel = allAnswered ? "High" : answeredCount > 0 ? "Medium" : "—";
  const showDefinition = answeredCount > 0;

  return (
    <div className="page" style={{paddingTop:24}}>
      <div className="page-header">
        <div>
          <h1>Set the pass / fail logic</h1>
          <p className="sub">Three quick questions that tell Eleos exactly when to pass or fail a note. Your description from the previous step stays as written — these settings only control evaluation behavior.</p>
        </div>
        <div className="actions">
          <button className="btn btn-ghost" onClick={onBack}>
            <Icon name="arrowLeft" size={14} /> Back to Define
          </button>
          <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4}}>
            <button className="btn btn-brand" disabled={!allAnswered} onClick={() => onNext(definition)}>
              Continue to Validate <Icon name="arrowRight" size={14} />
            </button>
            {!allAnswered && (
              <div style={{fontSize:11, color:"var(--ink-400)"}}>
                {total - answeredCount} setting{total - answeredCount !== 1 ? "s" : ""} remaining
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"minmax(0,1.1fr) minmax(0,1fr)", gap:24, alignItems:"flex-start"}}>

        {/* LEFT — live definition */}
        <div>
          <div className="section-h first">
            <h3>Rule definition</h3>
            <span className="sub">Updates as you make selections.</span>
          </div>
          <div className="def-card">
            <div className="def-head">
              <Icon name="sparkle" size={12} />
              Live preview
              <span style={{marginLeft:"auto", fontSize:11, color:"var(--ink-500)", fontWeight:500, textTransform:"none", letterSpacing:0}}>
                Confidence:&nbsp;<span style={{color:confidenceColor, fontWeight:600}}>{confidenceLabel}</span>
              </span>
            </div>
            {showDefinition ? (
              <>
                <div className="def-body">{definition.statement}</div>
                <div className="def-rubric">
                  <div>
                    <div className="lbl pass-lbl">PASS WHEN</div>
                    <div>{definition.pass}</div>
                  </div>
                  <div>
                    <div className="lbl fail-lbl">FAIL WHEN</div>
                    <div>{definition.fail}</div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{padding:"20px 0", textAlign:"center", color:"var(--ink-400)", fontSize:13, lineHeight:1.6}}>
                <div style={{marginBottom:6, fontSize:20}}>⟵</div>
                Answer the questions on the right to generate your rule definition.
              </div>
            )}
          </div>

          {/* Rule summary from Define */}
          <div className="section-h" style={{marginTop:20}}>
            <h3>Rule details</h3>
          </div>
          <div className="card">
            <div className="card-body" style={{display:"flex", flexDirection:"column", gap:10, fontSize:13}}>
              {draft.docEntries?.map(e => (
                <div key={e.id} style={{display:"flex", flexDirection:"column", gap:4}}>
                  <div style={{display:"flex", alignItems:"center", gap:8}}>
                    <span className="muted small" style={{width:90, flexShrink:0}}>Evaluating</span>
                    <span className="badge badge-info">{e.evaluated || "—"}</span>
                    {e.references.length > 0 && (
                      <>
                        <span className="muted small">vs.</span>
                        {e.references.map(r => <span key={r} className="badge badge-info">{r}</span>)}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <span className="muted small" style={{width:90, flexShrink:0}}>Priority</span>
                <span style={{fontWeight:500, color:"var(--ink-800)"}}>{draft.priority || "Medium"}</span>
              </div>
              {draft.surfaces?.length > 0 && (
                <div style={{display:"flex", alignItems:"center", gap:8}}>
                  <span className="muted small" style={{width:90, flexShrink:0}}>Surfaces</span>
                  <span style={{color:"var(--ink-800)"}}>{draft.surfaces.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — flat logic form */}
        <div className="sticky-panel">
          <div className="card" style={{overflow:"hidden"}}>
            <div className="card-header">
              <span style={{
                width:22, height:22, borderRadius:6,
                background:"linear-gradient(135deg, var(--purple-500), var(--brand-500))",
                color:"white", display:"grid", placeItems:"center", flexShrink:0,
              }}><Icon name="sparkle" size={12} /></span>
              <div>
                <h3>Evaluation settings</h3>
                <div className="muted small">{answeredCount} of {total} answered</div>
              </div>
              <div className="agree-progress" style={{marginLeft:"auto", width:80}}>
                <div className="fill" style={{width:`${(answeredCount/total)*100}%`}}></div>
              </div>
            </div>

            <div>
              {CLARIFY_QUESTIONS.map((q, i) => {
                const selected = answers[q.id];
                return (
                  <div key={q.id} style={{
                    padding:"16px 20px",
                    borderTop: i > 0 ? "1px solid var(--ink-150)" : "none",
                  }}>
                    <div style={{fontSize:11, fontWeight:600, color:"var(--purple-500)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4}}>
                      {q.label}
                    </div>
                    <div style={{fontSize:13, color:"var(--ink-700)", marginBottom:10, lineHeight:1.5}}>
                      {q.prompt}
                    </div>
                    <div style={{display:"flex", flexDirection:"column", gap:6}}>
                      {q.options.map(opt => {
                        const isOn = selected === opt.v;
                        return (
                          <button key={opt.v} onClick={() => answer(q.id, opt.v)}
                                  className={`opt-pill ${isOn ? "on" : ""}`}
                                  style={{textAlign:"left", padding:"10px 12px", display:"block"}}>
                            <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:2}}>
                              <div style={{
                                width:14, height:14, borderRadius:"50%", flexShrink:0,
                                border:`2px solid ${isOn ? "var(--brand-500)" : "var(--ink-300)"}`,
                                background: isOn ? "var(--brand-500)" : "transparent",
                                display:"flex", alignItems:"center", justifyContent:"center",
                              }}>
                                {isOn && <div style={{width:5, height:5, borderRadius:"50%", background:"white"}}></div>}
                              </div>
                              <strong style={{fontSize:13}}>{opt.label}</strong>
                              {opt.recommended && (
                                <span className="source-chip" style={{background:"var(--ok-100)", color:"var(--ok-700)"}}>recommended</span>
                              )}
                            </div>
                            <div className="muted small" style={{fontWeight:400, paddingLeft:20}}>{opt.detail}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Optional feedback — always shown once anything is answered */}
              {answeredCount > 0 && (
                <div style={{padding:"16px 20px", borderTop:"1px solid var(--ink-150)", background:"var(--ink-50)"}}>
                  {aiResponse ? (
                    <div style={{fontSize:13, color:"var(--ink-700)", lineHeight:1.6, display:"flex", gap:8}}>
                      <span style={{
                        width:18, height:18, borderRadius:4, flexShrink:0, marginTop:1,
                        background:"linear-gradient(135deg, var(--purple-500), var(--brand-500))",
                        color:"white", display:"grid", placeItems:"center",
                      }}><Icon name="sparkle" size={10} /></span>
                      {aiResponse}
                    </div>
                  ) : (
                    <>
                      <div style={{fontSize:13, fontWeight:500, marginBottom:6, color:"var(--ink-800)"}}>
                        Anything else to add? <span style={{fontWeight:400, color:"var(--ink-400)"}}>(optional)</span>
                      </div>
                      <textarea className="textarea"
                                placeholder="e.g., 'The goal must be written by the client, not the clinician.'"
                                value={feedback} onChange={e => setFeedback(e.target.value)}
                                style={{minHeight:56, fontSize:13}} />
                      <div style={{display:"flex", justifyContent:"flex-end", marginTop:8}}>
                        <button className="btn btn-secondary btn-sm"
                                disabled={!feedback || sendingToAI}
                                onClick={handleSendToAI}>
                          {sendingToAI
                            ? <><Icon name="refresh" size={12} /> Sending…</>
                            : <><Icon name="send" size={12} /> Send to AI</>}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function composeDefinition(draft, answers) {
  // Use first docEntry's evaluated type for backward compat
  const docType   = draft.docEntries?.[0]?.evaluated || draft.docType || "the note";
  const passType  = answers.specificity || "any";
  const missing   = answers.missing    || "fail";
  const count     = answers.count      || "one";
  const ruleName  = draft.title        || "the rule condition";

  let specificityClause;
  if      (passType === "any")        specificityClause = "Any mention of the condition is sufficient.";
  else if (passType === "measurable") specificityClause = "The instance must be specific and measurable (includes a named target, metric, or quantifiable indicator).";
  else                                specificityClause = "The instance must be fully structured: specific, measurable, achievable, relevant, and time-bound (SMART).";

  const countClause   = count === "multi" ? "At least 2 qualifying instances are required." : "1 qualifying instance is sufficient.";
  const missingClause = missing === "na"  ? "If the relevant section is absent, the result is N/A." : "If the relevant section is absent, the rule fails.";

  const pass = `${specificityClause} ${countClause}`;
  const fail = missing === "fail"
    ? "No qualifying instance found, or the relevant section is absent from the note."
    : "An instance is present but does not meet the criteria above. (Absent sections are marked N/A, not Fail.)";

  // Check if there are reference documents
  const firstEntry = draft.docEntries?.[0];
  const refs = firstEntry?.references || [];
  const refPhrase = refs.length > 0 ? ` against ${refs.join(" and ")}` : "";

  const statement = `For each ${docType.toLowerCase()}${refPhrase}, the engine checks: "${ruleName}." ${specificityClause} ${countClause} ${missingClause}`;

  return { statement, pass, fail };
}

Object.assign(window, { DefineStage, ClarifyStage, composeDefinition });
