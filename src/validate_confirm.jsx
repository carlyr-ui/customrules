/* global React, Icon, SAMPLE_NOTES, ORG_SCHEMA */
const { useState: useVCState } = React;

// ============================================================
// Page 4 — Validate
// ============================================================

function ValidateStage({ draft, definition, onBack, onPassed, counterStyle = "dots" }) {
  const [idx, setIdx] = useVCState(0);
  const [streak, setStreak] = useVCState(0);
  const [history, setHistory] = useVCState([]);
  const [feedback, setFeedback] = useVCState("");
  const [showFeedback, setShowFeedback] = useVCState(false);
  const [labeledExamples, setLabeledExamples] = useVCState([]);
  const [skipCount, setSkipCount] = useVCState(0);

  const notes = SAMPLE_NOTES;
  const exhausted = idx >= notes.length;
  const note = exhausted ? null : notes[idx];
  const passed = streak >= 3;

  // When passed, keep showing the last reviewed note in context
  const displayNote = passed ? notes[idx - 1] : note;

  const respond = (agreed) => {
    setHistory(h => [...h, { noteId: note.id, result: note.expectedResult, agreed }]);
    if (agreed) {
      setStreak(s => s + 1);
      setShowFeedback(false);
      setFeedback("");
    } else {
      setStreak(0);
      setShowFeedback(true);
    }
    setIdx(i => i + 1);
  };

  const skipNote = () => {
    setSkipCount(s => s + 1);
    setIdx(i => i + 1);
  };

  const labelNote = (targetNote, label) => {
    if (!targetNote) return;
    setLabeledExamples(ex => [...ex.filter(e => e.noteId !== targetNote.id), { label, noteId: targetNote.id }]);
  };

  const lastEntry = history[history.length - 1];
  const streakReset = history.length > 0 && !passed && streak === 0 && lastEntry?.agreed === false;

  const agreementCount = history.filter(h => h.agreed).length;

  return (
    <div className="page" style={{paddingTop:24}}>
      <div className="page-header">
        <div>
          <h1>Validate against real notes</h1>
          <p className="sub">Eleos evaluates a note using your rule. You confirm whether the result is correct. <strong>3 agreements in a row</strong> means the rule is consistent enough to activate.</p>
        </div>
        <div className="actions">
          <button className="btn btn-ghost" onClick={onBack}>
            <Icon name="arrowLeft" size={14} /> Back to Clarify
          </button>
          <button className="btn btn-brand" disabled={!passed} onClick={() => onPassed(labeledExamples)}>
            Continue to Activate <Icon name="arrowRight" size={14} />
          </button>
        </div>
      </div>

      {/* Agreement counter banner */}
      <div className="card" style={{padding:"14px 18px", marginBottom:16, display:"flex", alignItems:"center", gap:16}}>
        <AgreementCounter style={counterStyle} streak={streak} />
        {streak === 0 && history.length === 0 && (
          <div className="muted small">Review the AI's evaluation below and agree or disagree.</div>
        )}
        {streak > 0 && !passed && (
          <div className="muted small">{3 - streak} more agreement{3 - streak !== 1 ? "s" : ""} to activate.</div>
        )}
        {passed && (
          <div style={{color:"var(--ok-700)", fontSize:13, fontWeight:500, display:"flex", alignItems:"center", gap:6}}>
            <Icon name="check" size={14} /> Validation passed. The rule is ready to activate.
          </div>
        )}
        {streakReset && (
          <div style={{color:"var(--warn-700)", fontSize:13, fontWeight:500}}>
            Streak reset.{" "}
            <button className="btn btn-ghost btn-sm"
                    style={{padding:"2px 6px", color:"inherit", textDecoration:"underline"}}
                    onClick={onBack}>
              Refine in Clarify
            </button>
            {" "}if disagreements continue.
          </div>
        )}
      </div>

      {exhausted && !passed ? (
        /* ── No more notes state ── */
        <div className="card" style={{padding:"32px 24px", textAlign:"center", maxWidth:560, margin:"0 auto"}}>
          <div style={{marginBottom:12}}>
            <Icon name="alertCircle" size={28} style={{color:"var(--warn-500)"}} />
          </div>
          <h3 style={{marginBottom:8}}>No more sample notes available</h3>
          <p className="muted small" style={{lineHeight:1.6, marginBottom:20}}>
            You reviewed all {notes.length} notes without reaching 3 consecutive agreements ({agreementCount} agreement{agreementCount !== 1 ? "s" : ""} total).
            This often means the rule logic needs sharpening — consider refining the answers in Clarify.
          </p>
          <div style={{display:"flex", gap:8, justifyContent:"center"}}>
            <button className="btn btn-ghost" onClick={() => {
              setIdx(0); setStreak(0); setHistory([]); setSkipCount(0);
              setFeedback(""); setShowFeedback(false);
            }}>
              <Icon name="refresh" size={14} /> Start over
            </button>
            <button className="btn btn-brand" onClick={onBack}>
              <Icon name="arrowLeft" size={14} /> Refine in Clarify
            </button>
          </div>
        </div>
      ) : (
        /* ── Active validation (and passed state in same layout) ── */
        <div style={{display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,420px)", gap:20, alignItems:"flex-start"}}>
          {/* LEFT — sample note */}
          <div>
            <div className="section-h first">
              <h3>
                {passed
                  ? `Last reviewed note`
                  : `Sample note ${idx + 1} of ${notes.length}`}
              </h3>
              <span className="sub">From your data feed, matching this rule's scope.</span>
            </div>

            {displayNote && (
              <div className="card">
                <div className="card-header">
                  <div>
                    <div style={{display:"flex", alignItems:"center", gap:8}}>
                      <span className="badge badge-info">{displayNote.docType}</span>
                      <span className="muted small">Client {displayNote.clientId} · {displayNote.date} · {displayNote.duration}</span>
                    </div>
                    <div className="muted small" style={{marginTop:4}}>by {displayNote.clinician}</div>
                  </div>
                  {!passed && (
                    <div style={{marginLeft:"auto", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4}}>
                      <button className="btn btn-ghost btn-sm" onClick={skipNote}>
                        <Icon name="refresh" size={12} /> Skip note
                      </button>
                      {skipCount >= 2 && (
                        <div style={{fontSize:11, color:"var(--warn-700)", textAlign:"right", maxWidth:200}}>
                          <Icon name="info" size={10} /> Skips don't count toward validation.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="card-body" style={{padding:0}}>
                  <div className="note-preview" style={{borderRadius:0, border:"none", maxHeight:"none"}}>
                    <span className="note-label">Presenting concern</span>
                    <div>{displayNote.content.presenting}</div>
                    <span className="note-label">Treatment goal</span>
                    <div>{displayNote.content.goal
                      ? <mark className={displayNote.expectedResult === "pass" ? "hit" : "miss"}>{displayNote.content.goal}</mark>
                      : <span className="muted" style={{fontFamily:"var(--font-sans)", fontStyle:"italic"}}>(none documented)</span>}
                    </div>
                    <span className="note-label">Plan</span>
                    <div>{displayNote.content.plan}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — label + AI evaluation + agree/disagree (or passed state) */}
          <div className="sticky-panel">

            {!passed ? (
              <>
                {/* Label this note — above agree/disagree so user labels before advancing */}
                <div className="card" style={{marginBottom:16}}>
                  <div className="card-header">
                    <Icon name="tag" size={14} />
                    <h3>Label this note</h3>
                    <span style={{marginLeft:"auto"}} className="badge badge-info">optional</span>
                  </div>
                  <div className="card-body">
                    <div style={{fontSize:13, color:"var(--ink-700)", lineHeight:1.5, marginBottom:12}}>
                      Mark the ground truth for this note. Labeled examples improve rule precision and create an audit trail.
                    </div>
                    <div className="stat-row" style={{marginBottom:12}}>
                      <div className="stat-card">
                        <div className="lbl">Pass</div>
                        <div className="val" style={{color:"var(--ok-700)"}}>{labeledExamples.filter(e => e.label === "pass").length}</div>
                      </div>
                      <div className="stat-card">
                        <div className="lbl">Fail</div>
                        <div className="val" style={{color:"var(--err-700)"}}>{labeledExamples.filter(e => e.label === "fail").length}</div>
                      </div>
                      <div className="stat-card">
                        <div className="lbl">N/A</div>
                        <div className="val" style={{color:"var(--warn-700)"}}>{labeledExamples.filter(e => e.label === "na").length}</div>
                      </div>
                    </div>
                    {(() => {
                      const existing = note && labeledExamples.find(e => e.noteId === note.id);
                      return existing ? (
                        <div style={{fontSize:13, color:"var(--ok-700)", display:"flex", alignItems:"center", gap:6}}>
                          <Icon name="check" size={13} /> Labeled as <strong>{existing.label}</strong>.{" "}
                          <button className="btn btn-ghost btn-sm" style={{padding:"0 4px"}}
                                  onClick={() => setLabeledExamples(ex => ex.filter(e => e.noteId !== note.id))}>
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div style={{display:"flex", gap:6}}>
                          <button className="btn btn-secondary btn-sm" onClick={() => labelNote(note, "pass")}>
                            <Icon name="plus" size={12} /> Pass
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => labelNote(note, "fail")}>
                            <Icon name="plus" size={12} /> Fail
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => labelNote(note, "na")}>
                            <Icon name="plus" size={12} /> N/A
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* AI evaluation + agree/disagree */}
                <div className="card">
                  <div className="card-header">
                    <span style={{
                      width:22, height:22, borderRadius:6,
                      background:"linear-gradient(135deg, var(--purple-500), var(--brand-500))",
                      color:"white", display:"grid", placeItems:"center",
                    }}><Icon name="sparkle" size={12} /></span>
                    <h3>AI evaluation</h3>
                  </div>
                  <div className="card-body">
                    <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:10}}>
                      <span className="muted small" style={{fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em", fontSize:11}}>Result</span>
                      {note.expectedResult === "pass"
                        ? <span className="badge badge-ok"><Icon name="check" size={11}/> Pass</span>
                        : note.expectedResult === "fail"
                          ? <span className="badge badge-err"><Icon name="x" size={11}/> Fail</span>
                          : <span className="badge badge-warn">N/A</span>}
                    </div>
                    <div className="muted small" style={{fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em", fontSize:11, marginBottom:6}}>Reasoning</div>
                    <div style={{fontSize:13, lineHeight:1.6, color:"var(--ink-800)"}}>{note.reason}</div>
                  </div>
                  <div className="card-body" style={{borderTop:"1px solid var(--ink-150)", paddingTop:14}}>
                    <div style={{fontSize:13, fontWeight:500, marginBottom:8}}>Do you agree with this evaluation?</div>
                    <div style={{display:"flex", gap:8}}>
                      <button className="btn btn-secondary" onClick={() => respond(true)}
                              style={{flex:1, justifyContent:"center", borderColor:"var(--ok-300)", color:"var(--ok-700)"}}>
                        <Icon name="thumbsUp" size={14} /> Agree
                      </button>
                      <button className="btn btn-secondary" onClick={() => respond(false)}
                              style={{flex:1, justifyContent:"center", borderColor:"var(--err-300)", color:"var(--err-700)"}}>
                        <Icon name="thumbsDown" size={14} /> Disagree
                      </button>
                    </div>
                    {showFeedback && (
                      <div style={{marginTop:12, padding:12, background:"var(--warn-50)", borderRadius:8, border:"1px solid var(--warn-100)"}}>
                        <div style={{fontSize:12, fontWeight:600, color:"var(--warn-700)", marginBottom:6}}>
                          What was wrong with this evaluation?
                        </div>
                        <textarea className="textarea" style={{minHeight:60, fontSize:13}}
                                  placeholder="What should the result have been, and why?"
                                  value={feedback} onChange={e => setFeedback(e.target.value)} />
                        <div style={{display:"flex", gap:6, marginTop:6, justifyContent:"flex-end"}}>
                          <button className="btn btn-ghost btn-sm" onClick={onBack}>Refine rule in Clarify</button>
                          <button className="btn btn-secondary btn-sm" disabled={!feedback}
                                  onClick={() => { setShowFeedback(false); setFeedback(""); }}>
                            Save feedback
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* ── Passed state — right panel shows success, layout stays intact ── */
              <div className="card">
                <div className="card-body" style={{textAlign:"center", padding:"28px 24px"}}>
                  <div style={{width:48, height:48, borderRadius:"50%", background:"var(--ok-100)",
                               display:"flex", alignItems:"center", justifyContent:"center",
                               margin:"0 auto 14px", color:"var(--ok-600)"}}>
                    <Icon name="check" size={24} />
                  </div>
                  <h3 style={{marginBottom:8}}>Validation passed</h3>
                  <p className="muted small" style={{lineHeight:1.6, marginBottom:6}}>
                    3 consecutive agreements reached. The rule is consistent enough to activate.
                  </p>
                  {labeledExamples.length > 0 && (
                    <p className="muted small" style={{marginBottom:20}}>
                      {labeledExamples.length} note{labeledExamples.length !== 1 ? "s" : ""} labeled — saved with this rule.
                    </p>
                  )}
                  <button className="btn btn-brand" style={{width:"100%", justifyContent:"center"}}
                          onClick={() => onPassed(labeledExamples)}>
                    Continue to Activate <Icon name="arrowRight" size={14} />
                  </button>
                </div>
                <div className="card-body" style={{borderTop:"1px solid var(--ink-150)", paddingTop:12}}>
                  <div style={{fontSize:12, color:"var(--ink-500)", display:"flex", gap:16, justifyContent:"center"}}>
                    <span>{history.length} note{history.length !== 1 ? "s" : ""} reviewed</span>
                    <span>·</span>
                    <span>{agreementCount} agreement{agreementCount !== 1 ? "s" : ""}</span>
                    <span>·</span>
                    <span>{labeledExamples.length} labeled</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AgreementCounter({ style, streak }) {
  const clamped = Math.min(streak, 3);
  if (style === "progress") {
    return (
      <div style={{display:"flex", alignItems:"center", gap:14}}>
        <div className="agree-progress">
          <div className="fill" style={{width:`${(clamped/3)*100}%`}}></div>
        </div>
        <div className="streak-counter">
          <span className="num">{clamped}</span>
          <span className="of">/ 3</span>
        </div>
      </div>
    );
  }
  if (style === "streak") {
    return (
      <div className="streak-counter">
        <span className="num">{clamped}</span>
        <span className="of">/ 3 in a row</span>
      </div>
    );
  }
  // dots (default)
  return (
    <div style={{display:"flex", alignItems:"center", gap:10}}>
      <div className="agree-bar">
        {[0,1,2].map(i => (
          <div key={i} className={`agree-dot ${i < clamped ? "filled" : ""} ${i === clamped && clamped < 3 ? "current" : ""}`}></div>
        ))}
      </div>
      <span className="muted small">{streak > 0 ? `${streak} of 3 in a row` : "Agreements in a row"}</span>
    </div>
  );
}

// ============================================================
// Page 5 — Activate
// ============================================================

function ActivateStage({ draft, definition, onBack, onActivate, onSave }) {
  const [mode, setMode] = useVCState("now");
  // Pre-populate from surfaces chosen in Define step
  const [surfaces, setSurfaces] = useVCState({
    dashboard: draft.surfaces?.includes("dashboard") || false,
    lqa:       draft.surfaces?.includes("lqa")       || false,
  });
  const [confirmed, setConfirmed] = useVCState(false);

  // Null guard — definition may be missing if user jumped here without completing Clarify
  if (!definition) {
    return (
      <div className="page" style={{paddingTop:24, maxWidth:600}}>
        <div className="card" style={{padding:24}}>
          <h3 style={{marginBottom:8}}>Rule definition missing</h3>
          <p className="muted small" style={{lineHeight:1.6, marginBottom:16}}>
            The rule definition wasn't found — this usually means Clarify wasn't completed.
            Go back and answer the sharpening questions to generate a definition before activating.
          </p>
          <button className="btn btn-brand" onClick={onBack}>
            <Icon name="arrowLeft" size={14} /> Back to Clarify
          </button>
        </div>
      </div>
    );
  }

  const toggleSurface = (key) => setSurfaces(s => ({...s, [key]: !s[key]}));
  const anySurface = surfaces.dashboard || surfaces.lqa;
  const canActivate = mode === "later" ? anySurface : (confirmed && anySurface);

  const submit = () => {
    if (mode === "later") onSave({ surfaces });
    else onActivate({ surfaces });
  };

  // Calculate impact estimates from ORG_SCHEMA
  const docTypeData = ORG_SCHEMA && ORG_SCHEMA.docTypes.find(d => d.name === draft.docType);
  const weeklyNotes = docTypeData ? Math.round(docTypeData.count / 52) : null;
  const expectedFails = weeklyNotes ? Math.round(weeklyNotes * 0.08) : null;

  return (
    <div className="page" style={{paddingTop:24, maxWidth:920}}>
      <div className="page-header">
        <div>
          <h1>Ready to activate</h1>
          <p className="sub">Review what you've built and choose how to launch.</p>
        </div>
      </div>

      {/* Rule definition summary */}
      <div className="def-card" style={{marginBottom:20}}>
        <div className="def-head">
          <Icon name="check" size={12} />
          Validation passed · 3 of 3 agreements
          <span style={{marginLeft:"auto", fontSize:11, color:"var(--ink-500)", fontWeight:500, textTransform:"none", letterSpacing:0}}>
            v1 · {draft.title || "New rule"}
          </span>
        </div>
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
      </div>

      {/* Estimated impact */}
      <div className="section-h first">
        <h3>Estimated impact</h3>
        <span className="sub">
          {docTypeData
            ? `Based on ${draft.docType} volume in your data feed (~${docTypeData.count.toLocaleString()} notes/year).`
            : "Based on your data feed volume."}
        </span>
      </div>
      <div className="card" style={{marginBottom:20}}>
        <div className="card-body">
          <div className="stat-row">
            <div className="stat-card">
              <div className="lbl">Notes / week</div>
              <div className="val">{weeklyNotes != null ? `~${weeklyNotes}` : "—"}</div>
              <div className="sub">will be evaluated</div>
            </div>
            <div className="stat-card">
              <div className="lbl">Expected fails</div>
              <div className="val" style={{color: expectedFails != null ? "var(--err-700)" : undefined}}>
                {expectedFails != null ? `~${expectedFails}` : "—"}
              </div>
              <div className="sub">{expectedFails != null ? "~8% historical rate" : "run rule to estimate"}</div>
            </div>
            <div className="stat-card">
              <div className="lbl">Doc type match</div>
              <div className="val">{docTypeData ? draft.docType : "—"}</div>
              <div className="sub">{docTypeData ? "in your data feed" : "set in Define step"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Surfaces */}
      <div className="section-h">
        <h3>Where should it run?</h3>
        <span className="sub">Select at least one surface. You can change this later from the rule's side panel.</span>
      </div>
      <div className="card" style={{marginBottom:20}}>
        <div className="card-body" style={{display:"flex", flexDirection:"column", gap:10}}>
          <div className={`surface-toggle ${surfaces.dashboard ? "on" : ""}`} onClick={() => toggleSurface("dashboard")}>
            <div className="ck">{surfaces.dashboard && <Icon name="check" size={12} />}</div>
            <div style={{flex:1}}>
              <h5>Dashboard</h5>
              <div className="desc">Eleos evaluates new notes after submission. Results appear in your reporting dashboard for supervisors and quality leads.</div>
            </div>
            <span className="badge badge-ok"><Icon name="check" size={11} /> Compatible</span>
          </div>
          <div className={`surface-toggle ${surfaces.lqa ? "on" : ""}`} onClick={() => toggleSurface("lqa")}>
            <div className="ck">{surfaces.lqa && <Icon name="check" size={12} />}</div>
            <div style={{flex:1}}>
              <h5>LQA — Live Quality Assist</h5>
              <div className="desc">Eleos checks the rule in real time as clinicians write notes in the EHR. Surfaces a nudge if a note doesn't pass.</div>
            </div>
            <span className="badge badge-ok"><Icon name="check" size={11} /> High confidence</span>
          </div>
          {!anySurface && (
            <div className="muted small" style={{color:"var(--err-700)", display:"flex", alignItems:"center", gap:6}}>
              <Icon name="alert" size={11} /> Select at least one surface so the rule has somewhere to run.
            </div>
          )}
        </div>
      </div>

      {/* Timing choice */}
      <div className="section-h">
        <h3>When should it start?</h3>
      </div>
      <div className="activate-options" style={{marginBottom:10}}>
        <div className={`activate-option ${mode === "now" ? "on" : ""}`} onClick={() => setMode("now")}>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <Icon name="play" size={14} style={{color: mode === "now" ? "var(--ok-500)" : "var(--ink-400)"}} />
            <h4>Activate now</h4>
          </div>
          <div className="desc">Begins evaluating new notes immediately on the surfaces selected above.</div>
        </div>
        <div className={`activate-option ${mode === "later" ? "on" : ""}`} onClick={() => setMode("later")}>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <Icon name="pause" size={14} style={{color: mode === "later" ? "var(--info-500)" : "var(--ink-400)"}} />
            <h4>Save as Submitted</h4>
          </div>
          <div className="desc">Saves this rule as ready-to-activate. It won't run until you activate it from the rules list — no need to re-validate.</div>
        </div>
      </div>
      {/* Always show Submitted explanation so users understand the status before they select it */}
      <div className="muted small" style={{marginBottom:18, padding:"10px 12px", background:"var(--info-50)", borderRadius:8, border:"1px solid var(--info-100)", color:"var(--info-700)", display:"flex", gap:8}}>
        <Icon name="info" size={13} style={{flexShrink:0, marginTop:1}} />
        <span><strong>What is "Submitted"?</strong> A rule in the Submitted state has passed validation and is ready to go live, but hasn't been activated yet. You can activate it any time from the rules list without re-validating.</span>
      </div>

      {/* Acknowledgment — only for "activate now" */}
      {mode === "now" && (
        <div className={`check-row ${confirmed ? "checked" : ""}`} onClick={() => setConfirmed(c => !c)} style={{marginBottom:18}}>
          <div className="ck">{confirmed && <Icon name="check" size={12} />}</div>
          <div>
            <div style={{fontWeight:500, color:"var(--ink-900)", marginBottom:2}}>
              I understand <strong>{draft.title || "this rule"}</strong> will begin running against new notes immediately.
            </div>
            <div className="muted small">
              Pass / Fail / N/A results will be visible to clinicians and supervisors on the selected surfaces. Notes evaluated before activation are not affected. The rule can be disabled at any time.
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex", justifyContent:"flex-end", gap:8}}>
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className={`btn ${mode === "now" ? "btn-brand" : "btn-secondary"} btn-lg`}
                disabled={!canActivate} onClick={submit}>
          {mode === "now"
            ? <><Icon name="power" size={14} /> Activate rule</>
            : <><Icon name="check" size={14} /> Save as Submitted</>}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ValidateStage, ActivateStage, AgreementCounter });
