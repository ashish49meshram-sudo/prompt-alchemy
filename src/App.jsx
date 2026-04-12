import { useState, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const FREE_DAILY_LIMIT = 5;
const STORAGE_KEY_COUNT = "pa_usage_count";
const STORAGE_KEY_DATE  = "pa_usage_date";
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

// ─── Usage Counter Helpers ────────────────────────────────────────────────────
function getTodayStr() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function getUsageCount() {
  const savedDate = localStorage.getItem(STORAGE_KEY_DATE);
  const today = getTodayStr();
  if (savedDate !== today) {
    localStorage.setItem(STORAGE_KEY_DATE, today);
    localStorage.setItem(STORAGE_KEY_COUNT, "0");
    return 0;
  }
  return parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || "0", 10);
}

function incrementUsage() {
  const count = getUsageCount() + 1;
  localStorage.setItem(STORAGE_KEY_COUNT, String(count));
  localStorage.setItem(STORAGE_KEY_DATE, getTodayStr());
  return count;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
  },
  bg: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    background: `
      radial-gradient(ellipse 80% 50% at 20% 10%, rgba(255,180,50,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(180,100,255,0.06) 0%, transparent 60%),
      #0a0a0f
    `,
  },
  wrap: {
    position: "relative", zIndex: 1,
    maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px",
  },
  badge: {
    display: "inline-block",
    background: "linear-gradient(135deg, #f5c842, #e07b30)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase",
    marginBottom: 14,
  },
  h1: {
    fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 700,
    lineHeight: 1.15, margin: "0 0 16px", color: "#f0e8d8",
    letterSpacing: "-0.02em",
  },
  h1Grad: {
    background: "linear-gradient(90deg, #f5c842, #e07b30, #c94080)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: "#8a8070", fontSize: 16, maxWidth: 480,
    margin: "0 auto", lineHeight: 1.7, fontStyle: "italic",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16, padding: "28px 28px 24px", marginBottom: 16,
  },
  label: {
    display: "block", fontSize: 12, letterSpacing: "0.18em",
    textTransform: "uppercase", color: "#f5c842", marginBottom: 10,
  },
  labelMuted: {
    display: "block", fontSize: 12, letterSpacing: "0.18em",
    textTransform: "uppercase", color: "#8a8070", margin: "18px 0 10px",
  },
  textarea: {
    width: "100%",
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, color: "#f0e8d8", fontSize: 15,
    padding: "14px 16px", resize: "vertical", outline: "none",
    fontFamily: "inherit", lineHeight: 1.6,
    transition: "border-color 0.2s",
  },
  input: {
    width: "100%",
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, color: "#f0e8d8", fontSize: 14,
    padding: "12px 16px", outline: "none",
    fontFamily: "'Courier New', monospace", lineHeight: 1.6,
    transition: "border-color 0.2s",
    letterSpacing: "0.05em",
  },
  usageBar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 16, padding: "10px 14px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
  },
  errorBox: {
    background: "rgba(200,50,50,0.12)",
    border: "1px solid rgba(200,50,50,0.3)",
    borderRadius: 10, padding: "14px 18px",
    color: "#e07070", fontSize: 14, marginBottom: 24,
  },
  limitBox: {
    background: "rgba(245,180,0,0.08)",
    border: "1px solid rgba(245,180,0,0.3)",
    borderRadius: 12, padding: "20px 24px",
    color: "#f0c040", fontSize: 14, marginBottom: 24,
    lineHeight: 1.7, textAlign: "center",
  },
  resultCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(245,200,66,0.2)",
    borderRadius: 16, padding: "28px 28px 24px",
    animation: "fadeIn 0.4s ease",
  },
  resultPre: {
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10, padding: "18px 20px",
    fontSize: 14.5, lineHeight: 1.75,
    color: "#d8d0c0", whiteSpace: "pre-wrap", wordBreak: "break-word",
  },
};

function btn(active) {
  return {
    width: "100%", padding: "16px",
    background: active ? "linear-gradient(135deg, #f5c842 0%, #e07b30 100%)" : "rgba(255,255,255,0.06)",
    border: "none", borderRadius: 12,
    color: active ? "#0a0a0f" : "#4a4a5a",
    fontSize: 15, fontWeight: 700, letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: active ? "pointer" : "not-allowed",
    transition: "all 0.2s", fontFamily: "inherit", marginBottom: 28,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function App() {
  const [input, setInput]               = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [result, setResult]             = useState("");
  const [loading, setLoading]           = useState(false);
  const [copied, setCopied]             = useState(false);
  const [error, setError]               = useState("");
  const [usageCount, setUsageCount]     = useState(0);
  const [apiKey, setApiKey]             = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyVisible, setKeyVisible]     = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    setUsageCount(getUsageCount());
    const saved = localStorage.getItem(STORAGE_KEY_APIKEY);
    if (saved) setApiKey(saved);
  }, []);

  const hasOwnKey   = apiKey.trim().startsWith("sk-ant-");
  const remainingFree = Math.max(0, FREE_DAILY_LIMIT - usageCount);
  const canGenerate = hasOwnKey || remainingFree > 0;

  function saveApiKey(key) {
    setApiKey(key);
    if (key.trim()) localStorage.setItem(STORAGE_KEY_APIKEY, key.trim());
    else localStorage.removeItem(STORAGE_KEY_APIKEY);
  }

  async function handleGenerate() {
    if (!input.trim() || !canGenerate || loading) return;
    setLoading(true);
    setResult("");
    setError("");
    setCopied(false);

    const userMessage = expectedOutput.trim()
      ? `Simple prompt: ${input.trim()}\n\nExpected output style/format: ${expectedOutput.trim()}`
      : `Simple prompt: ${input.trim()}`;

    const headers = { "Content-Type": "application/json" };
    if (hasOwnKey) headers["x-api-key"] = apiKey.trim();

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        }),
      });
      const data = await response.json();

      if (data.error) {
        setError(`API error: ${data.error.message || "Unknown error"}`);
        return;
      }

      const text = data.content?.map((b) => b.text || "").join("") || "";
      setResult(text.trim());

      // Only count against free quota if NOT using own key
      if (!hasOwnKey) {
        const newCount = incrementUsage();
        setUsageCount(newCount);
      }
    } catch (e) {
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

  const focusBorder = (e) => { e.target.style.borderColor = "rgba(245,200,66,0.4)"; };
  const blurBorder  = (e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; };

  return (
    <div style={S.page}>
      <div style={S.bg} />
      <div style={S.wrap}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={S.badge}>✦ Prompt Alchemy ✦</div>
          <h1 style={S.h1}>
            Turn your idea into a<br />
            <span style={S.h1Grad}>perfect AI prompt</span>
          </h1>
          <p style={S.subtitle}>
            Write anything, get a prompt that works on Claude, ChatGPT, Gemini — any AI.
          </p>
        </div>

        {/* ── Usage Bar ── */}
        <div style={S.usageBar}>
          <span style={{ fontSize: 13, color: "#8a8070" }}>
            {hasOwnKey ? (
              <span style={{ color: "#60d080" }}>✓ Using your API key — unlimited generations</span>
            ) : (
              <>
                Free generations today:{" "}
                <strong style={{ color: remainingFree > 0 ? "#f5c842" : "#e05050" }}>
                  {remainingFree} / {FREE_DAILY_LIMIT}
                </strong>{" "}
                remaining
              </>
            )}
          </span>
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            style={{
              background: "none", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 6, color: "#8a8070", fontSize: 11,
              padding: "4px 10px", cursor: "pointer", fontFamily: "inherit",
              letterSpacing: "0.05em",
            }}
          >
            {hasOwnKey ? "Change key" : "Add API key"}
          </button>
        </div>

        {/* ── API Key Input ── */}
        {showKeyInput && (
          <div style={{ ...S.card, marginBottom: 16, padding: "20px 24px", animation: "fadeIn 0.3s ease" }}>
            <label style={{ ...S.label, color: "#8a8070" }}>
              Your Anthropic API Key
              <span style={{ textTransform: "none", letterSpacing: 0, marginLeft: 8, color: "#5a5048", fontStyle: "italic" }}>
                (stored locally in your browser only)
              </span>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type={keyVisible ? "text" : "password"}
                value={apiKey}
                onChange={(e) => saveApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                style={S.input}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
              <button
                onClick={() => setKeyVisible(!keyVisible)}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, color: "#8a8070", fontSize: 12,
                  padding: "0 14px", cursor: "pointer", whiteSpace: "nowrap",
                  fontFamily: "inherit",
                }}
              >
                {keyVisible ? "Hide" : "Show"}
              </button>
            </div>
            <p style={{ fontSize: 12, color: "#5a5048", marginTop: 10, lineHeight: 1.6 }}>
              Get your free API key at{" "}
              <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
                style={{ color: "#f5c842", textDecoration: "none" }}>
                console.anthropic.com
              </a>
              . Your key never leaves your device.
            </p>
          </div>
        )}

        {/* ── Input Card ── */}
        <div style={S.card}>
          <label style={S.label}>Your simple prompt</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. write me a professional email to ask for a meeting"
            rows={3}
            style={S.textarea}
            onFocus={focusBorder}
            onBlur={blurBorder}
          />

          <label style={S.labelMuted}>
            Expected output{" "}
            <span style={{ fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </label>
          <textarea
            value={expectedOutput}
            onChange={(e) => setExpectedOutput(e.target.value)}
            placeholder="e.g. a short 3-paragraph email, formal tone, with subject line"
            rows={2}
            style={S.textarea}
            onFocus={focusBorder}
            onBlur={blurBorder}
          />
        </div>

        {/* ── Limit Warning ── */}
        {!canGenerate && !hasOwnKey && (
          <div style={S.limitBox}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>⚡</div>
            <strong>You've used all {FREE_DAILY_LIMIT} free generations for today.</strong>
            <br />
            Add your own Anthropic API key above for unlimited use, or come back tomorrow.
            <br />
            <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
              style={{ color: "#f5c842", textDecoration: "none", fontWeight: 700 }}>
              Get a free API key →
            </a>
          </div>
        )}

        {/* ── Generate Button ── */}
        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim() || !canGenerate}
          style={btn(!loading && !!input.trim() && canGenerate)}
        >
          {loading ? "✦ Crafting your prompt…" : "✦ Engineer My Prompt"}
        </button>

        {/* ── Error ── */}
        {error && <div style={S.errorBox}>{error}</div>}

        {/* ── Result ── */}
        {result && (
          <div style={S.resultCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#f5c842" }}>
                ✦ Your Engineered Prompt
              </span>
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? "rgba(80,200,120,0.15)" : "rgba(255,255,255,0.07)",
                  border: `1px solid ${copied ? "rgba(80,200,120,0.4)" : "rgba(255,255,255,0.15)"}`,
                  borderRadius: 8, color: copied ? "#60d080" : "#c0b8a8",
                  fontSize: 12, padding: "6px 14px", cursor: "pointer",
                  letterSpacing: "0.08em", transition: "all 0.2s", fontFamily: "inherit",
                }}
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
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
