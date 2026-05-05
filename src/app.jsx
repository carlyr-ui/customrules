/* global React, ReactDOM, Icon, ALL_RULES, Sidebar, Topbar, Stepper,
   RuleManagement, RuleSidePanel, DefineStage, ClarifyStage, ValidateStage, ActivateStage,
   composeDefinition, Toast, Modal */

const { useState, useEffect, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "validateCounter": "dots",
  "clarifyLayout": "split"
}/*EDITMODE-END*/;

function App() {
  const [rules, setRules] = useState(ALL_RULES);
  const [view, setView] = useState({ name: "manage" }); // manage | flow
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [draft, setDraft] = useState(null); // active draft being edited
  const [definition, setDefinition] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const [editModeOn, setEditModeOn] = useState(false);
  const [adoptModal, setAdoptModal] = useState(null);

  // ---- Tweaks protocol ----
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "__activate_edit_mode") setEditModeOn(true);
      if (e.data?.type === "__deactivate_edit_mode") setEditModeOn(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({type: "__edit_mode_available"}, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  const setTweak = (k, v) => {
    const next = {...tweaks, [k]: v};
    setTweaks(next);
    window.parent.postMessage({type: "__edit_mode_set_keys", edits: {[k]: v}}, "*");
  };

  // ---- Helpers ----
  const pushToast = (text, kind = "success", icon = "check") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, text, kind, icon }]);
  };
  const dropToast = (id) => setToasts(t => t.filter(x => x.id !== id));

  const selectedRule = rules.find(r => r.id === selectedRuleId);

  // ---- Flow control ----
  const newDraft = () => ({
    id: `r-${Date.now()}`,
    name: "", title: "", description: "",
    passCriteria: "", failCriteria: "",
    docType: "",       // backward-compat: mirrors docEntries[0].evaluated
    docEntries: [],    // [{ id, evaluated, references: [] }]
    policyRef: "",     // ORG_POLICIES id or ""
    priority: "Medium",
    programs: [],
    fields: [], references: [],
    library: false, owner: "org", status: "draft", surfaces: [],
    validation: "not_started", validationCount: 0,
    lastUpdated: "Just now", author: "You", version: 1,
    weeklyRuns: 0, weeklyFails: 0,
  });

  const startNew = () => {
    setDraft(newDraft());
    setDefinition(null);
    setView({ name: "flow", step: "define" });
    setSelectedRuleId(null);
  };

  const openExistingForEdit = (id, atStep = "define") => {
    const r = rules.find(x => x.id === id);
    if (!r) return;
    // Build editable draft from rule
    setDraft({
      ...r,
      title: r.name,
      description: r.purpose,
      passCriteria: r.passCriteria || "",
      failCriteria: r.failCriteria || "",
      docEntries: r.docEntries || (r.docType ? [{ id: "de-1", evaluated: r.docType, references: [] }] : []),
      policyRef: r.policyRef || "",
      priority: r.priority || "Medium",
      fields: r.fields || [],
      references: r.references || [],
      clarify: { answers: {} }, // always start Clarify fresh — don't pre-fill
    });
    setDefinition(null);
    setView({ name: "flow", step: atStep });
    setSelectedRuleId(null);
  };

  const handleAction = (action, rule) => {
    if (action === "disable") {
      setRules(rs => rs.map(r => r.id === rule.id ? {...r, status: "disabled", surfaces: []} : r));
      pushToast(`${rule.name} disabled`, "warn", "power");
    } else if (action === "enable") {
      setRules(rs => rs.map(r => r.id === rule.id ? {...r, status: "active", surfaces: ["dashboard","lqa"]} : r));
      pushToast(`${rule.name} re-enabled`, "success", "power");
    } else if (action === "duplicate") {
      const copy = {...rule, id: `r-${Date.now()}`, name: `${rule.name} (copy)`,
                    status: "draft", version: 1, surfaces: [], lastUpdated: "Just now", author: "You",
                    validation: "not_started", validationCount: 0};
      setRules(rs => [copy, ...rs]);
      pushToast(`Draft copy created`, "success", "copy");
      setSelectedRuleId(copy.id);
    } else if (action === "adopt") {
      setAdoptModal({ rule, mode: "customize" });
    } else if (action === "duplicate-lib") {
      setAdoptModal({ rule, mode: "duplicate" });
    } else if (action === "dashboard") {
      pushToast(`Opening Dashboard filtered by "${rule.name}"…`, "default", "dashboard");
    } else if (action === "change-surfaces") {
      pushToast(`Open inline surface picker (not built in this prototype)`, "default", "sliders");
    }
  };

  const confirmAdopt = () => {
    if (!adoptModal) return;
    const { rule, mode } = adoptModal;
    const newId = `r-${Date.now()}`;
    const newRule = {
      ...rule, id: newId,
      name: rule.name,
      status: "draft", library: false, owner: "org",
      surfaces: [], version: 1, validation: "not_started",
      lastUpdated: "Just now", author: "You",
      adoptedFromLibrary: true,
      weeklyRuns: 0, weeklyFails: 0,
    };
    setRules(rs => [newRule, ...rs]);
    setAdoptModal(null);
    if (mode === "customize") {
      pushToast(`Adopted "${rule.name}" — opening for customization`, "success", "book");
      openExistingForEdit(newId, "define");
    } else {
      pushToast(`Duplicated "${rule.name}" as draft`, "success", "copy");
      setSelectedRuleId(newId);
    }
  };

  // ---- Renderers ----
  const renderManage = () => (
    <>
      <Topbar crumbs={[{label:"Compliance"}, {label:"Custom Rules"}]} />
      <RuleManagement
        rules={rules}
        setRules={setRules}
        onCreate={startNew}
        onSelect={setSelectedRuleId}
        selectedId={selectedRuleId}
      />
      {selectedRule && (
        <RuleSidePanel
          rule={selectedRule}
          rules={rules}
          setRules={setRules}
          onClose={() => setSelectedRuleId(null)}
          onAction={handleAction}
          onOpenFlow={openExistingForEdit}
          pushToast={pushToast}
        />
      )}
    </>
  );

  const stepIdx = { define: 0, clarify: 1, validate: 2, activate: 3 }[view.step] ?? 0;
  const STEP_NAMES = ["define", "clarify", "validate", "activate"];
  const handleStepClick = (i) => {
    if (i < stepIdx) setView({ name: "flow", step: STEP_NAMES[i] });
  };

  const orgRuleCount = rules.filter(r => !r.library).length;

  const renderFlow = () => (
    <>
      <Topbar crumbs={[
        {label:"Custom Rules", onClick: () => setView({name:"manage"})},
        {label: draft?.title || "New rule"}
      ]}>
        <button className="btn btn-ghost btn-sm" onClick={() => {
          setRules(rs => {
            const exists = rs.find(r => r.id === draft.id);
            const upd = {...draft, name: draft.title, purpose: draft.description, lastUpdated: "Just now"};
            return exists ? rs.map(r => r.id === draft.id ? upd : r) : [upd, ...rs];
          });
          if (view.step === "validate") {
            pushToast("Draft saved — validation progress wasn't saved", "warn", "alert");
          } else {
            pushToast("Draft saved", "success", "check");
          }
          setView({name:"manage"});
        }}>
          Save draft &amp; exit
        </button>
      </Topbar>
      <Stepper current={stepIdx} onStepClick={handleStepClick} />
      {view.step === "define" && (
        <DefineStage
          draft={draft}
          setDraft={setDraft}
          onBack={() => { setRules(rs => {
            const exists = rs.find(r => r.id === draft.id);
            const upd = {...draft, name: draft.title, purpose: draft.description, lastUpdated: "Just now"};
            return exists ? rs.map(r => r.id === draft.id ? upd : r) : [upd, ...rs];
          }); pushToast("Draft saved", "success"); setView({name:"manage"}); }}
          onNext={() => setView({name:"flow", step:"clarify"})}
        />
      )}
      {view.step === "clarify" && (
        <ClarifyStage
          draft={draft}
          setDraft={setDraft}
          onBack={() => setView({name:"flow", step:"define"})}
          onNext={(def) => { setDefinition(def); setView({name:"flow", step:"validate"}); }}
        />
      )}
      {view.step === "validate" && (
        <ValidateStage
          draft={draft}
          definition={definition}
          counterStyle={tweaks.validateCounter}
          onBack={() => setView({name:"flow", step:"clarify"})}
          onPassed={() => setView({name:"flow", step:"activate"})}
        />
      )}
      {view.step === "activate" && (
        <ActivateStage
          draft={draft}
          definition={definition}
          onBack={() => setView({name:"flow", step:"validate"})}
          onActivate={({surfaces}) => {
            const surfList = Object.keys(surfaces).filter(k => surfaces[k]);
            const upd = {...draft, name: draft.title, purpose: draft.description,
                         status: "active", surfaces: surfList,
                         validation: "passed", validationCount: 3,
                         lastUpdated: "Just now",
                         weeklyRuns: 142, weeklyFails: 11};
            setRules(rs => {
              const exists = rs.find(r => r.id === draft.id);
              return exists ? rs.map(r => r.id === draft.id ? upd : r) : [upd, ...rs];
            });
            pushToast(`"${draft.title}" is now active`, "success", "check");
            setView({name:"manage"});
            setSelectedRuleId(draft.id);
          }}
          onSave={({surfaces}) => {
            const surfList = Object.keys(surfaces).filter(k => surfaces[k]);
            const upd = {...draft, name: draft.title, purpose: draft.description,
                         status: "submitted", surfaces: surfList,
                         validation: "passed", validationCount: 3,
                         lastUpdated: "Just now"};
            setRules(rs => {
              const exists = rs.find(r => r.id === draft.id);
              return exists ? rs.map(r => r.id === draft.id ? upd : r) : [upd, ...rs];
            });
            pushToast(`"${draft.title}" saved as Submitted`, "success", "check");
            setView({name:"manage"});
            setSelectedRuleId(draft.id);
          }}
        />
      )}
    </>
  );

  return (
    <div className="app">
      <Sidebar active="rules" ruleCount={orgRuleCount} />
      <main className="main">
        {view.name === "manage" ? renderManage() : renderFlow()}
      </main>

      {adoptModal && (
        <Modal title={adoptModal.mode === "customize" ? "Adopt and customize this rule?" : "Duplicate as draft?"}
               primary={{ label: adoptModal.mode === "customize" ? "Adopt & customize" : "Create draft",
                          onClick: confirmAdopt }}
               secondary={{ label: "Cancel", onClick: () => setAdoptModal(null) }}
               onClose={() => setAdoptModal(null)}>
          <p style={{margin:"0 0 10px"}}>
            <strong>{adoptModal.rule.name}</strong>
            {adoptModal.mode === "customize"
              ? " will be copied into your organization as a draft. You'll be taken straight to the editor to customize before submitting."
              : " will be copied into your organization as a draft. You can edit and submit it later from the rules list."}
          </p>
          {adoptModal.rule.compatibility !== "full" && (
            <div style={{padding:10, background:"var(--warn-50)", borderRadius:8,
                         border:"1px solid var(--warn-100)", color:"var(--warn-700)", fontSize:13, marginTop:10}}>
              <Icon name="alert" size={12} /> Some required fields aren't in your data feed. We'll flag alternatives during editing.
            </div>
          )}
        </Modal>
      )}

      {/* Tweaks panel */}
      {editModeOn && (
        <div className="tweaks-panel">
          <div className="tweaks-head">
            <Icon name="sliders" size={14} />
            <span>Tweaks</span>
            <button className="icon-btn" style={{marginLeft:"auto"}}
                    onClick={() => { setEditModeOn(false); window.parent.postMessage({type:"__edit_mode_dismissed"}, "*"); }}>
              <Icon name="x" size={14} />
            </button>
          </div>
          <div className="tweaks-body">
            <div>
              <div className="tweaks-group-label" style={{marginBottom:6}}>Validate counter</div>
              <div className="tweaks-choice">
                {[["dots","Dots"],["progress","Progress"],["streak","Streak"]].map(([k,l]) => (
                  <button key={k} className={tweaks.validateCounter === k ? "on" : ""}
                          onClick={() => setTweak("validateCounter", k)}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="tweaks-group-label" style={{marginBottom:6}}>Clarify layout</div>
              <div className="tweaks-choice">
                {[["split","Split"],["stacked","Stacked"]].map(([k,l]) => (
                  <button key={k} className={tweaks.clarifyLayout === k ? "on" : ""}
                          onClick={() => setTweak("clarifyLayout", k)}>{l}</button>
                ))}
              </div>
            </div>
            <div className="muted small" style={{borderTop:"1px solid var(--ink-150)", paddingTop:10, lineHeight:1.5}}>
              Try the <kbd>Validate</kbd> step to see counter variants in action.
            </div>
          </div>
        </div>
      )}

      <div className="toast-stack">
        {toasts.map(t => <Toast key={t.id} {...t} onDone={() => dropToast(t.id)} />)}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
