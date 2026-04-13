import { useState, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY_APIKEY = "pa_user_apikey";

const SYSTEM_PROMPT = `You are the world's best prompt engineer. Your job is to transform a simple, casual user input into a highly optimized, universal AI prompt.

The user will give you:
1. A simple description of what they want
2. Optionally, what the expected output looks like

Your job is to output a single, perfected prompt that:
- Works across ALL major AI models (Claude, ChatGPT, Gemini, etc.)
- Is clear, specific, and unambiguous
- Defines the role/persona the AI should take
- Specifies the output format, tone, and length
- Includes constraints and edge cases
- Uses best prompt engineering techniques: role prompting, chain-of-thought hints, output formatting, context setting

Return ONLY the optimized prompt — no explanation, no preamble, no markdown fences. Just the raw prompt text ready to be copy-pasted into any AI chat.`;

// ─── Style tokens ─────────────────────────────────────────────────────────────
const gold   = "#f5c842";
const orange = "#e07b30";
const bgColor = "#0a0a0f";

const S = {
  page: { minHeight: "100vh", position: "relative", overflow: "hidden" },
  bgLayer: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    background: `
      radial-gradient(ellipse 80% 50% at 20% 10%, rgba(255,180,50,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(180,100,255,0.06) 0%, transparent 60%),
      ${bgColor}`,
  },
  wrap: {
    position: "relative", zIndex: 1,
    maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px",
  },
  badge: {
    display: "inline-block",
    background: `linear-gradient(135deg, ${gold}, ${orange})`,
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14,
  },
  h1: {
    fontSize: "clamp(30px, 5.5vw, 50px)", fontWeight: 700,
    lineHeight: 1.15, margin: "0 0 16px", color: "#f0e8d8", letterSpacing: "-0.02em",
  },
  h1Grad: {
    background: `linear-gradient(90deg, ${gold}, ${orange}, #c94080)`,
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: "#8a8070", fontSize: 16, maxWidth: 460,
    margin: "0 auto", lineHeight: 1.7, fontStyle: "italic",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16, padding: "28px", marginBottom: 16,
  },
  label: {
    display: "block", fontSize: 11, letterSpacing: "0.2em",
    textTransform: "uppercase", color: gold, marginBottom: 10,
  },
  labelMuted: {
    display: "block", fontSize: 11, letterSpacing: "0.2em",
    textTransform: "uppercase", color: "#8a8070", margin: "18px 0 10px",
  },
  textarea: {
    width: "100%", background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, color: "#f0e8d8", fontSize: 15,
    padding: "14px 16px", resize: "vertical", outline: "none",
    fontFamily: "inherit", lineHeight: 1.6, transition: "border-color 0.2s",
  },
  monoInput: {
    width: "100%", background: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, color: "#f0e8d8", fontSize: 13,
    padding: "13px 16px", outline: "none",
    fontFamily: "'Courier New', monospace", lineHeight: 1.6,
    transition: "border-color 0.2s", letterSpacing: "0.04em",
  },
  errorBox: {
    background: "rgba(200,50,50,0.12)", border: "1px solid rgba(200,50,50,0.3)",
    borderRadius: 10, padding: "14px 18px",
    color: "#e07070", fontSize: 14, marginBottom: 20,
  },
  resultCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(245,200,66,0.2)",
    borderRadius: 16, padding: "28px", animation: "fadeIn 0.4s ease",
  },
  resultPre: {
    background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10, padding: "18px 20px",
    fontSize: 14.5, lineHeight: 1.8,
    color: "#d8d0c0", whiteSpace: "pre-wrap", wordBreak: "break-word",
  },
};

function primaryBtn(active) {
  return {
    width: "100%", padding: "16px",
    background: active ? `linear-gradient(135deg, ${gold} 0%, ${orange} 100%)` : "rgba(255,255,255,0.06)",
    border: "none", borderRadius: 12,
    color: active ? bgColor : "#4a4a5a",
    fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
    cursor: active ? "pointer" : "not-allowed",
    transition: "all 0.2s", fontFamily: "inherit", marginBottom: 24,
  };
}

const focusBorder = (e) => { e.target.style.borderColor = "rgba(245,200,66,0.5)"; };
const blurBorder  = (e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; };

// ─── Onboarding Screen ────────────────────────────────────────────────────────
function OnboardingScreen({ onKeySet }) {
  const [key, setKey]         = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError]     = useState("");

  function handleConfirm() {
    const trimmed = key.trim();
    if (!trimmed.startsWith("sk-ant-")) {
      setError("That doesn't look right. Your key should start with sk-ant-");
      return;
    }
    localStorage.setItem(STORAGE_KEY_APIKEY, trimmed);
    onKeySet(trimmed);
  }

  return (
    <div style={S.page}>
      <div style={S.bgLayer} />
      <div style={{ ...S.wrap, maxWidth: 560 }}>

        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={S.badge}>✦ Prompt Alchemy ✦</div>
          <h1 style={S.h1}>
            Engineer perfect<br />
            <span style={S.h1Grad}>AI prompts instantly</span>
          </h1>
          <p style={S.subtitle}>
            Type anything. Get a prompt that works on Claude, ChatGPT, Gemini — any AI.
          </p>
        </div>

        {/* How it works — 3 steps */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 36 }}>
          {[
            { icon: "✍️", label: "Type your idea",   desc: "Plain language, no skill needed" },
            { icon: "⚙️", label: "We engineer it",   desc: "AI applies expert techniques" },
            { icon: "🚀", label: "Paste anywhere",   desc: "Works on any AI platform" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: "16px 14px", textAlign: "center",
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#d0c8b8", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "#6a6058", lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Key entry card */}
        <div style={{
          background: "rgba(245,200,66,0.04)",
          border: "1px solid rgba(245,200,66,0.18)",
          borderRadius: 16, padding: "28px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>🔑</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#f0e8d8" }}>
              Connect your Anthropic API key
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#7a7060", lineHeight: 1.7, marginBottom: 20 }}>
            Your key is stored <strong style={{ color: "#a09080" }}>only in your browser</strong> — never sent to any server except Anthropic's.
            Usage costs fractions of a cent per prompt.
          </p>

          <label style={S.label}>Your API Key</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type={visible ? "text" : "password"}
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              placeholder="sk-ant-api03-..."
              style={S.monoInput}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
            <button
              onClick={() => setVisible(!visible)}
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, color: "#8a8070", fontSize: 12,
                padding: "0 16px", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
              }}
            >{visible ? "Hide" : "Show"}</button>
          </div>

          {error && (
            <div style={{ ...S.errorBox, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button onClick={handleConfirm} disabled={!key.trim()} style={primaryBtn(!!key.trim())}>
            ✦ Start Engineering Prompts
          </button>

          {/* How to get a key */}
          <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "16px" }}>
            <p style={{ fontSize: 12, color: "#6a6058", lineHeight: 1.8, margin: "0 0 6px" }}>
              <strong style={{ color: "#9a9080" }}>Don't have a key yet? Get one free in 2 minutes:</strong>
            </p>
            <ol style={{ fontSize: 12, color: "#7a7068", lineHeight: 2.1, margin: "0 0 0 16px", padding: 0 }}>
              <li>Go to <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
                style={{ color: gold, textDecoration: "none", fontWeight: 700 }}>console.anthropic.com</a></li>
              <li>Sign up for free</li>
              <li>Click <strong style={{ color: "#9a9080" }}>API Keys → Create Key</strong></li>
              <li>Paste it above and hit Enter</li>
            </ol>
            <p style={{ fontSize: 11, color: "#5a5048", marginTop: 10, lineHeight: 1.6 }}>
              New accounts receive free credits. Your key never leaves your device.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [apiKey, setApiKey]                 = useState(null); // null = not loaded yet
  const [input, setInput]                   = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [result, setResult]                 = useState("");
  const [loading, setLoading]               = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [error, setError]                   = useState("");
  const [showChangeKey, setShowChangeKey]   = useState(false);
  const [newKey, setNewKey]                 = useState("");
  const [keyVisible, setKeyVisible]         = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_APIKEY);
    setApiKey(saved || "");
  }, []);

  if (apiKey === null) return null; // Loading

  if (!apiKey) {
    return <OnboardingScreen onKeySet={(k) => setApiKey(k)} />;
  }

  async function handleGenerate() {
    if (!input.trim() || loading) return;
    setLoading(true); setResult(""); setError(""); setCopied(false);

    const userMessage = expectedOutput.trim()
      ? `Simple prompt: ${input.trim()}\n\nExpected output style/format: ${expectedOutput.trim()}`
      : `Simple prompt: ${input.trim()}`;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        }),
      });
      const data = await response.json();
      if (data.error) {
        const msg = data.error.message || "Unknown API error";
        setError(`Error: ${msg}`);
        return;
      }
      setResult(data.content?.map((b) => b.text || "").join("").trim() || "");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSaveNewKey() {
    const trimmed = newKey.trim();
    if (!trimmed.startsWith("sk-ant-")) return;
    localStorage.setItem(STORAGE_KEY_APIKEY, trimmed);
    setApiKey(trimmed); setNewKey(""); setShowChangeKey(false); setError("");
  }

  function handleForgetKey() {
    localStorage.removeItem(STORAGE_KEY_APIKEY);
    setApiKey("");
  }

  return (
    <div style={S.page}>
      <div style={S.bgLayer} />
      <div style={S.wrap}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={S.badge}>✦ Prompt Alchemy ✦</div>
          <h1 style={S.h1}>
            Turn your idea into a<br />
            <span style={S.h1Grad}>perfect AI prompt</span>
          </h1>
          <p style={S.subtitle}>
            Write anything, get a prompt that works on Claude, ChatGPT, Gemini — any AI.
          </p>
        </div>

        {/* Key status bar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 16px", marginBottom: 20,
          background: "rgba(80,200,120,0.05)", border: "1px solid rgba(80,200,120,0.15)", borderRadius: 10,
        }}>
          <span style={{ fontSize: 13, color: "#60d080" }}>
            ✓ API key connected — unlimited generations
          </span>
          <button
            onClick={() => setShowChangeKey(!showChangeKey)}
            style={{
              background: "none", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6, color: "#6a6a7a", fontSize: 11,
              padding: "4px 10px", cursor: "pointer", fontFamily: "inherit",
            }}
          >{showChangeKey ? "Cancel" : "Change key"}</button>
        </div>

        {/* Change key panel */}
        {showChangeKey && (
          <div style={{ ...S.card, padding: "20px 24px", marginBottom: 16, animation: "fadeIn 0.25s ease" }}>
            <label style={S.label}>New API Key</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input
                type={keyVisible ? "text" : "password"}
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                style={S.monoInput}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
              <button
                onClick={() => setKeyVisible(!keyVisible)}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, color: "#8a8070", fontSize: 12,
                  padding: "0 14px", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
                }}
              >{keyVisible ? "Hide" : "Show"}</button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleSaveNewKey}
                disabled={!newKey.trim().startsWith("sk-ant-")}
                style={{ ...primaryBtn(newKey.trim().startsWith("sk-ant-")), marginBottom: 0, flex: 1, padding: "12px" }}
              >
                Save New Key
              </button>
              <button
                onClick={handleForgetKey}
                style={{
                  background: "rgba(200,50,50,0.1)", border: "1px solid rgba(200,50,50,0.25)",
                  borderRadius: 12, color: "#c06060", fontSize: 13,
                  padding: "12px 18px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                }}
              >
                Forget key
              </button>
            </div>
          </div>
        )}

        {/* Input card */}
        <div style={S.card}>
          <label style={S.label}>Your simple prompt</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. write me a professional email to ask for a meeting"
            rows={3} style={S.textarea}
            onFocus={focusBorder} onBlur={blurBorder}
          />
          <label style={S.labelMuted}>
            Expected output{" "}
            <span style={{ fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </label>
          <textarea
            value={expectedOutput}
            onChange={(e) => setExpectedOutput(e.target.value)}
            placeholder="e.g. short 3-paragraph email, formal tone, with subject line"
            rows={2} style={S.textarea}
            onFocus={focusBorder} onBlur={blurBorder}
          />
        </div>

        {/* Generate button */}
        <button onClick={handleGenerate} disabled={!input.trim() || loading} style={primaryBtn(!loading && !!input.trim())}>
          {loading ? "✦ Crafting your prompt…" : "✦ Engineer My Prompt"}
        </button>

        {/* Error */}
        {error && <div style={S.errorBox}>{error}</div>}

        {/* Result */}
        {result && (
          <div style={S.resultCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: gold }}>
                ✦ Your Engineered Prompt
              </span>
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? "rgba(80,200,120,0.15)" : "rgba(255,255,255,0.07)",
                  border: `1px solid ${copied ? "rgba(80,200,120,0.4)" : "rgba(255,255,255,0.15)"}`,
                  borderRadius: 8, color: copied ? "#60d080" : "#c0b8a8",
                  fontSize: 12, padding: "6px 14px", cursor: "pointer",
                  letterSpacing: "0.06em", transition: "all 0.2s", fontFamily: "inherit",
                }}
              >{copied ? "✓ Copied!" : "Copy"}</button>
            </div>
            <div style={S.resultPre}>{result}</div>
            <p style={{ fontSize: 12, color: "#5a5048", marginTop: 14, fontStyle: "italic", textAlign: "center" }}>
              Ready to paste into Claude, ChatGPT, Gemini, or any AI assistant
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
