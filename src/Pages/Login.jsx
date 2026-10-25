import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

/* ------------------------------------------------------------------ */
/*  Editor preview content                                             */
/* ------------------------------------------------------------------ */
const SAMPLE = {
  file: "welcome.py",
  time: "0.02 s",
  out: "Welcome back, ada_codes!",
  code: [
    "# Pick up where you left off",
    "def greet(name):",
    '    return f"Welcome back, {name}!"',
    "",
    'print(greet("ada_codes"))',
  ],
};

/* ------------------------------------------------------------------ */
/*  Tiny syntax highlighter (returns React nodes, no innerHTML)        */
/* ------------------------------------------------------------------ */
const TOKEN =
  /(#include|\/\/.*|#.*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(def|return|for|in|const|let|int|public|class|static|void|package|import|func|if|else|while|new)\b|\b(\d+)\b|\b([A-Za-z_]\w*)(?=\()/g;

const TOKEN_COLORS = { k: "#FF9EC4", s: "#A5F0C6", c: "#7C8BC7", m: "#FFD48A", f: "#8FB4FF" };

function highlight(line) {
  const out = [];
  let last = 0;
  let key = 0;
  for (const m of line.matchAll(TOKEN)) {
    const [text, comment, str, keyword, num] = m;
    if (m.index > last) out.push(line.slice(last, m.index));
    const type = comment
      ? comment === "#include"
        ? "k"
        : "c"
      : str
      ? "s"
      : keyword
      ? "k"
      : num
      ? "m"
      : "f";
    out.push(
      <span
        key={key++}
        style={{ color: TOKEN_COLORS[type], fontStyle: type === "c" ? "italic" : "normal" }}
      >
        {text}
      </span>
    );
    last = m.index + text.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/* ------------------------------------------------------------------ */
/*  Editor preview: types the sample, then "runs" it                   */
/* ------------------------------------------------------------------ */
function EditorPreview() {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("typing"); // typing | running | done
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    const full = SAMPLE.code.join("\n");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(() => !cancelled && fn(), ms));

    if (reduce) {
      setTyped(full);
      setPhase("done");
      return undefined;
    }

    setTyped("");
    setPhase("typing");
    let i = 0;
    const tick = () => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i < full.length) {
        later(tick, full[i - 1] === "\n" ? 110 : 16);
      } else {
        later(() => {
          setPhase("running");
          later(() => setPhase("done"), 650);
        }, 350);
      }
    };
    later(tick, 200);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [runKey]);

  const lines = typed.split("\n");

  return (
    <div
      className="rounded-xl overflow-hidden font-mono shadow-2xl"
      style={{ background: "#0A1030", color: "#D7DEFF" }}
    >
      <div
        className="flex items-center justify-between pr-2 border-b"
        style={{ background: "#0F1742", borderColor: "#1E2A66" }}
      >
        <div
          className="px-4 py-2.5 text-sm text-white border-r"
          style={{ background: "#0A1030", borderColor: "#1E2A66" }}
        >
          {SAMPLE.file}
        </div>
        <button
          type="button"
          onClick={() => setRunKey((k) => k + 1)}
          aria-label="Run the example again"
          className="rp-run inline-flex items-center gap-2 h-8 px-3 rounded-md text-sm font-medium"
        >
          <span aria-hidden="true">&#9654;</span> Run
        </button>
      </div>

      <div className="h-48 overflow-hidden py-4 text-sm leading-6" aria-label="Example code">
        {lines.map((line, i) => (
          <div key={i} className="flex whitespace-pre">
            <span className="w-11 shrink-0 pr-4 text-right select-none" style={{ color: "#4A5A9E" }}>
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 overflow-hidden">
              {highlight(line)}
              {phase === "typing" && i === lines.length - 1 && <span className="rp-caret" />}
              {line === "" && "\u00A0"}
            </span>
          </div>
        ))}
      </div>

      <div
        className="border-t px-4 pt-3.5 pb-4 text-sm min-h-28"
        style={{ background: "#070B26", borderColor: "#1E2A66" }}
        aria-live="polite"
      >
        <div className="mb-2" style={{ color: "#7C8BC7" }}>
          Output
        </div>
        <div className="h-6 leading-6 text-white">{phase === "done" ? SAMPLE.out : ""}</div>
        <div className="mt-1.5 h-5" style={{ color: phase === "running" ? "#FFD48A" : "#9CF0C8" }}>
          {phase === "running" && "Running\u2026"}
          {phase === "done" && `\u2713 Finished in ${SAMPLE.time}`}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Form helpers                                                       */
/* ------------------------------------------------------------------ */
const VALIDATORS = {
  identifier: (v) => v.identifier.trim().length > 0,
  password: (v) => v.password.length > 0,
};

const MESSAGES = {
  identifier: "Enter your email or username.",
  password: "Enter your password.",
};

function Field({ id, error, children }) {
  return (
    <div className="mb-4">
      {children}
      {error && (
        <p
          id={`${id}-err`}
          role="alert"
          className="mt-1.5 text-sm font-medium"
          style={{ color: "var(--error)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ identifier: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const headingRef = useRef(null);

  useEffect(() => {
    if (status === "success" && headingRef.current) headingRef.current.focus();
  }, [status]);

  const update = (key, val) => {
    const next = { ...values, [key]: val };
    setValues(next);
    setFormError("");
    if (errors[key] && VALIDATORS[key]?.(next)) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    Object.keys(VALIDATORS).forEach((k) => {
      if (!VALIDATORS[k](values)) found[k] = MESSAGES[k];
    });
    setErrors(found);
    const first = Object.keys(VALIDATORS).find((k) => found[k]);
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }

    setStatus("submitting");
    setFormError("");
    try {
      await login(values.identifier.trim(), values.password);
      navigate("/dashboard");
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "We couldn't sign you in right now. Try again in a moment."
      );
      setStatus("idle");
    }
  };

  const reset = () => {
    setValues({ identifier: "", password: "", remember: true });
    setErrors({});
    setFormError("");
    setShowPw(false);
    setStatus("idle");
  };

  const inputCls = "rp-input w-full h-11 px-3.5 rounded-lg border text-base";
  const submitting = status === "submitting";

  return (
    <div
      className="rp-root min-h-screen grid grid-cols-1 lg:grid-cols-2"
      style={{ background: "var(--bg)", color: "var(--ink)", fontFamily: "var(--font-body)" }}
    >
      <style>{STYLES}</style>

      {/* ---------------- Form side ---------------- */}
      <main className="flex flex-col px-6 py-7 lg:px-14 lg:py-9">
        <a
          href="#"
          aria-label="Runpad home"
          className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight no-underline self-start"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
            <rect width="30" height="30" rx="8" fill="var(--accent)" />
            <path d="M11 8.5v13l10-6.5z" fill="var(--accent-ink)" />
          </svg>
          Runpad
        </a>

        <div className="w-full max-w-md mx-auto my-auto pt-8 pb-2">
          {status !== "success" ? (
            <>
              <h1
                className="mb-2.5 text-4xl font-bold leading-tight tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Sign in
              </h1>
              <p className="mb-7 max-w-sm" style={{ color: "var(--muted)" }}>
                Pick up where you left off. Your projects and last output are saved.
              </p>

              {formError && (
                <div
                  role="alert"
                  className="mb-5 px-4 py-3 rounded-lg border text-sm font-medium"
                  style={{
                    color: "var(--error)",
                    borderColor: "var(--error)",
                    background: "color-mix(in srgb, var(--error) 8%, var(--surface))",
                  }}
                >
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <Field id="identifier" error={errors.identifier}>
                  <label htmlFor="identifier" className="block mb-1.5 text-sm font-semibold">
                    Email or username
                  </label>
                  <input
                    id="identifier"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="you@example.com"
                    value={values.identifier}
                    onChange={(e) => update("identifier", e.target.value)}
                    aria-invalid={!!errors.identifier}
                    aria-describedby={errors.identifier ? "identifier-err" : undefined}
                    className={inputCls}
                  />
                </Field>

                <Field id="password" error={errors.password}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <label htmlFor="password" className="text-sm font-semibold">
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-sm font-semibold underline underline-offset-4"
                      style={{ color: "var(--accent)" }}
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Your password"
                      value={values.password}
                      onChange={(e) => update("password", e.target.value)}
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-err" : undefined}
                      className={`${inputCls} pr-16`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      aria-pressed={showPw}
                      aria-controls="password"
                      className="rp-ghost absolute right-1.5 top-1.5 h-8 px-2.5 rounded-md text-sm font-semibold"
                      style={{ color: "var(--accent)" }}
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>
                </Field>

                <div className="flex items-center gap-2.5 mb-2 text-sm" style={{ color: "var(--muted)" }}>
                  <input
                    id="remember"
                    type="checkbox"
                    checked={values.remember}
                    onChange={(e) => update("remember", e.target.checked)}
                    className="rp-check w-4 h-4 shrink-0 cursor-pointer"
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <label htmlFor="remember" className="cursor-pointer">
                    Keep me signed in on this device
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rp-primary w-full h-12 mt-4 rounded-lg text-base font-semibold"
                >
                  {submitting ? "Signing in\u2026" : "Sign in"}
                </button>
              </form>

              <p className="mt-5 text-sm text-center" style={{ color: "var(--muted)" }}>
                New to Runpad?{" "}
                <Link to="/register" className="font-semibold underline underline-offset-4" style={{ color: "var(--ink)" }}>
                  Create an account
                </Link>
              </p>
            </>
          ) : (
            <div aria-live="polite">
              <div
                className="grid place-items-center w-14 h-14 mb-5 rounded-full"
                style={{ background: "var(--ok)" }}
                aria-hidden="true"
              >
                <svg width="26" height="26" viewBox="0 0 26 26">
                  <path
                    d="M6 13.5l4.8 4.8L20 8.5"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="mb-2.5 text-4xl font-bold leading-tight tracking-tight outline-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                You're signed in
              </h1>
              <p className="mb-3" style={{ color: "var(--muted)" }}>
                Signed in as <strong style={{ color: "var(--ink)" }}>{values.identifier.trim()}</strong>.
              </p>
              <button
                type="button"
                className="rp-primary w-full h-12 mt-4 rounded-lg text-base font-semibold"
                onClick={() => {
                  /* Redirect to your editor here, e.g. navigate("/editor") */
                }}
              >
                Open editor
              </button>
              <button
                type="button"
                onClick={reset}
                className="rp-secondary h-11 px-5 mt-3 rounded-lg border font-semibold"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ---------------- Stage side ---------------- */}
      <aside
        aria-label="Live editor preview"
        className="px-6 py-10 lg:px-14 lg:py-0"
        style={{ background: "var(--stage)", color: "#fff" }}
      >
        <div className="w-full max-w-xl mx-auto lg:sticky lg:top-0 lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
          <EditorPreview />
          <p className="mt-5 px-0.5 max-w-md" style={{ color: "#C9D2FF" }}>
            Runs Python, JavaScript, C++, Java and Go with no setup. Sign in and your last session opens
            right where you stopped.
          </p>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Design tokens + the few rules Tailwind utilities can't express     */
/*  (same as RegisterPage: move into tailwind.config.js / global CSS   */
/*  and share between both pages in your project).                     */
/* ------------------------------------------------------------------ */
const STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap");

.rp-root {
  --bg: #F2F5FB;
  --surface: #FFFFFF;
  --ink: #101A34;
  --muted: #56607A;
  --line: #D3DAEA;
  --accent: #2F4BFF;
  --accent-ink: #FFFFFF;
  --accent-soft: #E3E8FF;
  --error: #C62839;
  --ok: #0E8A5F;
  --stage: #2338D9;
  --font-display: "Bricolage Grotesque", "Segoe UI", system-ui, sans-serif;
  --font-body: "Instrument Sans", "Segoe UI", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Consolas, monospace;
  -webkit-font-smoothing: antialiased;
}
@media (prefers-color-scheme: dark) {
  .rp-root {
    --bg: #0E1328;
    --surface: #161D3A;
    --ink: #E9EDFB;
    --muted: #9AA5C6;
    --line: #2A345E;
    --accent: #8298FF;
    --accent-ink: #0E1328;
    --accent-soft: #232E63;
    --error: #FF7F8C;
    --ok: #4CD3A0;
    --stage: #18215C;
  }
}
.rp-root .font-mono { font-family: var(--font-mono); }

.rp-input {
  font-family: inherit;
  color: var(--ink);
  background-color: var(--surface);
  border-color: var(--line);
  transition: border-color .15s, box-shadow .15s;
}
.rp-input::placeholder { color: var(--muted); opacity: .7; }
.rp-input:hover { border-color: color-mix(in srgb, var(--accent) 45%, var(--line)); }
.rp-input:focus-visible {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 28%, transparent);
}
.rp-input[aria-invalid="true"] { border-color: var(--error); }
.rp-input[aria-invalid="true"]:focus-visible {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--error) 25%, transparent);
}
.rp-check:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.rp-ghost { background: transparent; border: 0; cursor: pointer; }
.rp-ghost:hover { background: var(--accent-soft); }
.rp-ghost:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }

.rp-primary {
  color: var(--accent-ink);
  background: var(--accent);
  border: 0;
  cursor: pointer;
  transition: transform .1s, filter .15s;
}
.rp-primary:hover { filter: brightness(1.08); }
.rp-primary:active { transform: translateY(1px); }
.rp-primary:focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; }
.rp-primary:disabled { opacity: .7; cursor: progress; }

.rp-secondary { color: var(--ink); background: transparent; border-color: var(--line); cursor: pointer; }
.rp-secondary:hover { border-color: var(--accent); }
.rp-secondary:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.rp-run { color: #0A1030; background: #9CF0C8; border: 0; cursor: pointer; font-family: var(--font-mono); }
.rp-run:hover { background: #B4F5D6; }
.rp-run:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

.rp-caret {
  display: inline-block;
  width: 8px;
  height: 17px;
  margin-left: 1px;
  vertical-align: -3px;
  background: #9CF0C8;
  animation: rp-blink 1.05s steps(1) infinite;
}
@keyframes rp-blink { 50% { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .rp-caret { animation: none; }
  .rp-root * { transition: none !important; }
}
`;
