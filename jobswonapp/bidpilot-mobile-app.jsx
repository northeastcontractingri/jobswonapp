import { useState, useRef, useEffect } from "react";

// ─── STRIPE PAYMENT LINKS ────────────────────────────────────────────────────
// Replace these with your real Stripe Payment Link URLs from dashboard.stripe.com
const STRIPE_LINKS = {
  solo: "https://buy.stripe.com/REPLACE_WITH_SOLO_LINK",      // $15/mo Solo
  pro:  "https://buy.stripe.com/REPLACE_WITH_PRO_LINK",       // $27/mo Pro
  team: "https://buy.stripe.com/REPLACE_WITH_TEAM_LINK",      // $47/mo Team
};

const FREE_PROPOSAL_LIMIT = 3;
const AMBER = "#f59e0b";
const BG = "#0a0b0e";
const CARD = "#111318";
const BORDER = "#1c1f27";
const TEXT = "#eef0f5";
const MUTED = "#5a6070";
const GREEN = "#22c55e";

const SYSTEM_PROMPT = `You are BidPilot, an expert contractor estimating AI. Generate a professional job proposal in JSON.

Return ONLY this JSON structure, nothing else:
{
  "clientName": "string",
  "clientAddress": "string", 
  "jobTitle": "string (e.g. 'Roof Replacement – GAF HDZ')",
  "scopeSummary": "string (2 sentences, professional tone)",
  "lineItems": [
    {"description":"string","qty":number,"unit":"string","unitPrice":number,"total":number}
  ],
  "subtotal": number,
  "total": number,
  "timeline": "string",
  "warranty": "string",
  "paymentTerms": "string",
  "validDays": 30
}

Rules: Use realistic Northeast US contractor pricing. 3–6 line items. Separate materials from labor. No tax. Return ONLY JSON.`;

// ─── TABS ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "home",      icon: "⚡", label: "New Bid"   },
  { id: "history",   icon: "📋", label: "History"   },
  { id: "account",   icon: "👤", label: "Account"   },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function BidPilotApp() {
  const [tab, setTab]             = useState("home");
  const [screen, setScreen]       = useState("home"); // home | generate | result | paywall | settings
  const [jobDesc, setJobDesc]     = useState("");
  const [generating, setGenerating] = useState(false);
  const [proposal, setProposal]   = useState(null);
  const [history, setHistory]     = useState([]);
  const [usedFree, setUsedFree]   = useState(0);
  const [plan, setPlan]           = useState("free"); // free | solo | pro | team
  const [bizInfo, setBizInfo]     = useState({ name: "", city: "", phone: "" });
  const [setupDone, setSetupDone] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [genStep, setGenStep]     = useState(0);
  const [error, setError]         = useState("");
  const [viewProposal, setViewProposal] = useState(null);
  const textRef = useRef(null);

  const isUnlimited = plan !== "free";
  const canGenerate = isUnlimited || usedFree < FREE_PROPOSAL_LIMIT;
  const remainingFree = FREE_PROPOSAL_LIMIT - usedFree;

  const GEN_STEPS = ["Analyzing job scope…", "Pricing materials…", "Estimating labor…", "Formatting proposal…", "Final review…"];
  useEffect(() => {
    if (!generating) return;
    const t = setInterval(() => setGenStep(s => Math.min(s + 1, GEN_STEPS.length - 1)), 800);
    return () => clearInterval(t);
  }, [generating]);

  const generate = async () => {
    if (!jobDesc.trim()) return;
    if (!canGenerate) { setScreen("paywall"); return; }
    setError("");
    setGenerating(true);
    setGenStep(0);
    setScreen("generate");
    try {
      const context = setupDone ? `Business: ${bizInfo.name}, ${bizInfo.city}` : "Business: Independent Contractor, Northeast US";
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `${context}\n\nJob: ${jobDesc}` }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      const entry = { ...parsed, id: Date.now(), createdAt: new Date().toLocaleDateString(), rawDesc: jobDesc };
      setProposal(entry);
      setHistory(h => [entry, ...h]);
      setUsedFree(n => n + 1);
      setScreen("result");
    } catch (e) {
      setError("Generation failed. Please try again.");
      setScreen("home");
    } finally {
      setGenerating(false);
    }
  };

  const openStripe = (tier) => window.open(STRIPE_LINKS[tier], "_blank");

  // ─── COMPONENTS ────────────────────────────────────────────────────────────

  const HomeScreen = () => (
    <div style={{ padding: "24px 20px 100px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 900, letterSpacing: 0.5 }}>
            BID<span style={{ color: AMBER }}>PILOT</span>
          </div>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 1 }}>
            {setupDone ? bizInfo.name : "AI Proposal Generator"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isUnlimited && (
            <div style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 20, padding: "5px 12px", fontSize: 12, color: AMBER, fontWeight: 600 }}>
              {remainingFree} free left
            </div>
          )}
          {isUnlimited && (
            <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 20, padding: "5px 12px", fontSize: 12, color: GREEN, fontWeight: 600 }}>
              ✓ {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: AMBER, letterSpacing: 1.5, marginBottom: 12 }}>DESCRIBE YOUR JOB</div>
        <textarea
          ref={textRef}
          value={jobDesc}
          onChange={e => setJobDesc(e.target.value)}
          placeholder="e.g. 28 square roof replacement, GAF Timberline HDZ shingles, colonial in Cranston RI, client is Mike Johnson at 24 Elm St"
          style={{ background: "transparent", border: "none", color: TEXT, fontFamily: "inherit", fontSize: 15, width: "100%", minHeight: 110, resize: "none", outline: "none", lineHeight: 1.65 }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={generate} disabled={!jobDesc.trim()} style={{ flex: 1, background: jobDesc.trim() ? AMBER : "#1c1f27", color: jobDesc.trim() ? "#000" : MUTED, border: "none", borderRadius: 12, padding: "15px 0", fontSize: 16, fontWeight: 800, fontFamily: "inherit", cursor: jobDesc.trim() ? "pointer" : "default", transition: "all 0.2s" }}>
            {canGenerate ? "⚡ Generate Proposal" : "🔒 Upgrade to Continue"}
          </button>
        </div>
      </div>

      {/* Quick examples */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: 1.5, marginBottom: 12 }}>QUICK START</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "28 sq roof replacement, GAF HDZ, 2-story colonial, North Providence RI",
            "Full vinyl siding 2400 sq ft, 12 squares replace all trim, East Greenwich RI",
            "Gutters & downspouts, 160 linear feet, K-style aluminum, Warwick RI"
          ].map((ex, i) => (
            <div key={i} onClick={() => setJobDesc(ex)} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "13px 16px", fontSize: 13, color: "#8090a0", cursor: "pointer", lineHeight: 1.5, transition: "border-color 0.15s" }}
              onTouchStart={e => e.currentTarget.style.borderColor = AMBER}
              onTouchEnd={e => e.currentTarget.style.borderColor = BORDER}>
              <span style={{ color: AMBER }}>→ </span>{ex}
            </div>
          ))}
        </div>
      </div>

      {/* Free limit warning */}
      {!isUnlimited && remainingFree <= 1 && (
        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: AMBER, marginBottom: 4 }}>
            {remainingFree === 0 ? "Free limit reached" : "Last free proposal!"}
          </div>
          <div style={{ fontSize: 13, color: "#8090a0", marginBottom: 12 }}>Upgrade to Solo for $15/mo and get unlimited proposals, custom branding & e-sign.</div>
          <button onClick={() => setScreen("paywall")} style={{ background: AMBER, color: "#000", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
            Upgrade Now →
          </button>
        </div>
      )}
    </div>
  );

  const GeneratingScreen = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "40px 20px", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, border: `3px solid ${BORDER}`, borderTopColor: AMBER, borderRadius: "50%", animation: "spin 0.75s linear infinite", marginBottom: 32 }} />
      <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 10 }}>Building Your Proposal</h2>
      <p style={{ color: MUTED, fontSize: 15, marginBottom: 36 }}>{GEN_STEPS[genStep]}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 280 }}>
        {GEN_STEPS.slice(0, -1).map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: i <= genStep ? 1 : 0.25, transition: "opacity 0.4s" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: i < genStep ? GREEN : i === genStep ? AMBER : BORDER, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#000", fontWeight: 700, flexShrink: 0 }}>
              {i < genStep ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 13, color: i <= genStep ? TEXT : MUTED }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const ResultScreen = ({ p }) => (
    <div style={{ padding: "16px 16px 100px" }}>
      {/* Success bar */}
      <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>✅</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: GREEN }}>Proposal Ready!</div>
          <div style={{ fontSize: 12, color: MUTED }}>Generated in seconds · Ready to send</div>
        </div>
      </div>

      {/* Proposal card */}
      <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", marginBottom: 20, boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}>
        {/* Header */}
        <div style={{ background: "#0a0b0e", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 800, color: "#fff" }}>{bizInfo.name || "Your Business"}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{bizInfo.city || ""}  {bizInfo.phone || ""}</div>
          </div>
          <div style={{ background: AMBER, color: "#000", fontSize: 11, fontWeight: 800, padding: "5px 12px", borderRadius: 20, letterSpacing: 1 }}>PROPOSAL</div>
        </div>

        <div style={{ padding: "20px 24px", color: "#111" }}>
          {/* Client */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20, padding: 14, background: "#f9fafb", borderRadius: 10 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 1.5, marginBottom: 4 }}>CLIENT</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{p.clientName}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{p.clientAddress}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 1.5, marginBottom: 4 }}>PROJECT</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{p.jobTitle}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{p.timeline}</div>
            </div>
          </div>

          <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 18 }}>{p.scopeSummary}</div>

          {/* Line items */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "8px 0", borderBottom: "1px solid #e5e7eb", marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 1 }}>DESCRIPTION</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 1 }}>TOTAL</span>
            </div>
            {(p.lineItems || []).map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "10px 0", borderBottom: "1px solid #f3f4f6", alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{item.description}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{item.qty} {item.unit} × {fmt(item.unitPrice)}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, textAlign: "right" }}>{fmt(item.total)}</div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, marginTop: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>TOTAL</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#f59e0b" }}>{fmt(p.total)}</span>
            </div>
          </div>

          {/* Terms */}
          <div style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#6b7280", marginBottom: 20 }}>
            <div><strong style={{ color: "#374151" }}>Warranty:</strong> {p.warranty}</div>
            <div style={{ marginTop: 4 }}><strong style={{ color: "#374151" }}>Payment:</strong> {p.paymentTerms}</div>
            <div style={{ marginTop: 4 }}><strong style={{ color: "#374151" }}>Valid for:</strong> {p.validDays} days from date issued</div>
          </div>

          {/* Signature */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {["Client Signature", "Contractor Signature"].map(s => (
              <div key={s}>
                <div style={{ borderBottom: "1.5px solid #111", height: 36, marginBottom: 4 }} />
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{s} & Date</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <button onClick={() => window.print()} style={{ flex: 1, background: AMBER, color: "#000", border: "none", borderRadius: 14, padding: "16px 0", fontSize: 15, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>
          ⬇ Save PDF
        </button>
        <button onClick={() => { setJobDesc(""); setProposal(null); setScreen("home"); }} style={{ flex: 1, background: CARD, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px 0", fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
          + New Bid
        </button>
      </div>
      <button onClick={() => { const msg = `Hi, please review your proposal from ${bizInfo.name || "your contractor"}: Total ${fmt(p.total)} for ${p.jobTitle}`; window.open(`sms:?body=${encodeURIComponent(msg)}`); }} style={{ width: "100%", background: "transparent", color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 0", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
        📱 Text Client Link
      </button>
    </div>
  );

  const PaywallScreen = () => (
    <div style={{ padding: "32px 20px 100px" }}>
      <button onClick={() => setScreen("home")} style={{ background: "transparent", border: "none", color: MUTED, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 24, padding: 0 }}>← Back</button>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 38, fontWeight: 900, marginBottom: 8 }}>Upgrade to Keep<br /><span style={{ color: AMBER }}>Winning Jobs</span></h2>
        <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6 }}>You've used your {FREE_PROPOSAL_LIMIT} free proposals. Pick a plan to keep going.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { id: "solo", name: "Solo", price: 15, desc: "Perfect for independent contractors", features: ["Unlimited proposals", "AI-powered pricing", "PDF export", "Custom branding", "Client e-sign"], highlight: true },
          { id: "pro",  name: "Pro",  price: 27, desc: "For growing contractors", features: ["Everything in Solo", "Client portal", "Proposal tracking", "Follow-up reminders", "Priority AI"] },
          { id: "team", name: "Team", price: 47, desc: "Up to 5 crew members", features: ["Everything in Pro", "5 team seats", "Shared price book", "Analytics", "Phone support"] },
        ].map(tier => (
          <div key={tier.id} style={{ background: tier.highlight ? "rgba(245,158,11,0.08)" : CARD, border: `1px solid ${tier.highlight ? AMBER : BORDER}`, borderRadius: 18, padding: "24px 22px", position: "relative" }}>
            {tier.highlight && <div style={{ position: "absolute", top: -12, left: 24, background: AMBER, color: "#000", fontSize: 11, fontWeight: 800, padding: "3px 12px", borderRadius: 20, letterSpacing: 1 }}>MOST POPULAR</div>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 800 }}>{tier.name}</div>
                <div style={{ fontSize: 13, color: MUTED }}>{tier.desc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 900, color: tier.highlight ? AMBER : TEXT }}>${tier.price}</span>
                <span style={{ fontSize: 13, color: MUTED }}>/mo</span>
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              {tier.features.map((f, i) => <div key={i} style={{ fontSize: 14, color: TEXT, padding: "4px 0", display: "flex", gap: 8 }}><span style={{ color: GREEN }}>✓</span>{f}</div>)}
            </div>
            <button onClick={() => openStripe(tier.id)} style={{ width: "100%", background: tier.highlight ? AMBER : "transparent", color: tier.highlight ? "#000" : TEXT, border: tier.highlight ? "none" : `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>
              Start {tier.name} — ${tier.price}/mo →
            </button>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: MUTED }}>
        Cancel anytime · Secure checkout via Stripe
      </div>
    </div>
  );

  const HistoryScreen = () => (
    <div style={{ padding: "24px 20px 100px" }}>
      <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Proposal History</h2>
      {history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: MUTED }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15 }}>No proposals yet.<br />Generate your first one!</div>
          <button onClick={() => setTab("home")} style={{ background: AMBER, color: "#000", border: "none", borderRadius: 12, padding: "13px 28px", fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", marginTop: 20 }}>Create First Proposal</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {history.map(item => (
            <div key={item.id} onClick={() => { setViewProposal(item); setScreen("result"); setTab("home"); }} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "18px 20px", cursor: "pointer", transition: "border-color 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 16, flex: 1, paddingRight: 12 }}>{item.jobTitle}</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: AMBER, flexShrink: 0 }}>{fmt(item.total)}</div>
              </div>
              <div style={{ fontSize: 13, color: MUTED }}>{item.clientName} · {item.createdAt}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const AccountScreen = () => (
    <div style={{ padding: "24px 20px 100px" }}>
      <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 28 }}>Account</h2>

      {/* Plan badge */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 22px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: 1.5, marginBottom: 6 }}>CURRENT PLAN</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, color: isUnlimited ? GREEN : TEXT }}>{plan === "free" ? "Free" : plan.charAt(0).toUpperCase() + plan.slice(1)}</div>
          {plan === "free" && <button onClick={() => setScreen("paywall")} style={{ background: AMBER, color: "#000", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Upgrade</button>}
        </div>
        {plan === "free" && <div style={{ fontSize: 13, color: MUTED, marginTop: 6 }}>{remainingFree} of {FREE_PROPOSAL_LIMIT} free proposals remaining</div>}
      </div>

      {/* Business info */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 22px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: 1.5, marginBottom: 16 }}>BUSINESS INFO</div>
        {[["Business Name", "name", "Iron Ridge Roofing LLC"], ["City, State", "city", "Providence, RI"], ["Phone Number", "phone", "(401) 555-0100"]].map(([label, key, ph]) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 5 }}>{label}</div>
            <input value={bizInfo[key]} onChange={e => setBizInfo(b => ({ ...b, [key]: e.target.value }))}
              placeholder={ph} style={{ background: "#0a0b0e", border: `1px solid ${BORDER}`, borderRadius: 10, color: TEXT, fontFamily: "inherit", fontSize: 15, padding: "12px 14px", width: "100%", outline: "none" }} />
          </div>
        ))}
        <button onClick={() => setSetupDone(true)} style={{ background: AMBER, color: "#000", border: "none", borderRadius: 10, padding: "13px 0", width: "100%", fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
          Save Business Info
        </button>
      </div>

      {/* Demo: set plan */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 22px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: 1.5, marginBottom: 12 }}>DEMO: SIMULATE PLAN</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["free", "solo", "pro", "team"].map(p => (
            <button key={p} onClick={() => setPlan(p)} style={{ flex: 1, background: plan === p ? AMBER : "#0a0b0e", color: plan === p ? "#000" : MUTED, border: `1px solid ${plan === p ? AMBER : BORDER}`, borderRadius: 8, padding: "9px 0", fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", textTransform: "capitalize" }}>{p}</button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 8 }}>In production, plan is set by Stripe webhook after payment.</div>
      </div>
    </div>
  );

  const activeProposal = viewProposal || proposal;

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "'Barlow','Segoe UI',sans-serif", maxWidth: 430, margin: "0 auto", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        textarea, input { -webkit-appearance: none; }
        textarea:focus, input:focus { outline: none; border-color: ${AMBER} !important; }
        @media print { .no-print { display: none !important; } }
      `}</style>

      {/* Screen content */}
      <div style={{ animation: "fadeUp 0.25s ease" }}>
        {screen === "paywall"   ? <PaywallScreen /> :
         screen === "generate"  ? <GeneratingScreen /> :
         screen === "result"    ? <ResultScreen p={activeProposal} /> :
         tab === "history"      ? <HistoryScreen /> :
         tab === "account"      ? <AccountScreen /> :
                                  <HomeScreen />}
      </div>

      {/* Bottom Nav */}
      {screen === "home" && (
        <div className="no-print" style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(10,11,14,0.95)", borderTop: `1px solid ${BORDER}`, backdropFilter: "blur(16px)", display: "flex", paddingBottom: "env(safe-area-inset-bottom, 12px)" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setScreen("home"); setViewProposal(null); }} style={{ flex: 1, background: "transparent", border: "none", padding: "14px 0 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 22, filter: tab === t.id ? "none" : "grayscale(1) opacity(0.4)" }}>{t.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: tab === t.id ? AMBER : MUTED, letterSpacing: 0.5 }}>{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
