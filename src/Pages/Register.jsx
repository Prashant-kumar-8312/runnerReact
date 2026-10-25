import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

/* ------------------------------------------------------------------ */
/*  Sample programs shown in the editor preview                        */
/* ------------------------------------------------------------------ */
const SAMPLES = {
  python: {
    label: "Python",
    file: "main.py",
    time: "0.03 s",
    out: "55",
    code: [
      "# 10th Fibonacci number",
      "def fib(n):",
      "    a, b = 0, 1",
      "    for _ in range(n):",
      "        a, b = b, a + b",
      "    return a",
      "",
      "print(fib(10))",
    ],
  },
  javascript: {
    label: "JavaScript",
    file: "main.js",
    time: "0.02 s",
    out: "55",
    code: [
      "// 10th Fibonacci number",
      "const fib = (n) => {",
      "  let [a, b] = [0, 1];",
      "  for (let i = 0; i < n; i++) [a, b] = [b, a + b];",
      "  return a;",
      "};",
      "",
      "console.log(fib(10));",
    ],
  },
  cpp: {
    label: "C++",
    file: "main.cpp",
    time: "0.41 s",
    out: "55",
    code: [
      "#include <iostream>",
      "",
      "int main() {",
      "  int a = 0, b = 1;",
      "  for (int i = 0; i < 10; i++) {",
      "    int t = a + b; a = b; b = t;",
      "  }",
      '  std::cout << a << "\\n";',
      "}",
    ],
  },
  java: {
    label: "Java",
    file: "Main.java",
    time: "0.62 s",
    out: "55",
    code: [
      "public class Main {",
      "  public static void main(String[] args) {",
      "    int a = 0, b = 1;",
      "    for (int i = 0; i < 10; i++) {",
      "      int t = a + b; a = b; b = t;",
      "    }",
      "    System.out.println(a);",
      "  }",
      "}",
    ],
  },
  go: {
    label: "Go",
    file: "main.go",
    time: "0.18 s",
    out: "55",
    code: [
      "package main",
      "",
      'import "fmt"',
      "",
      "func main() {",
      "  a, b := 0, 1",
      "  for i := 0; i < 10; i++ { a, b = b, a+b }",
      "  fmt.Println(a)",
      "}",
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Tiny syntax highlighter (returns React nodes, no innerHTML)        */
/* ------------------------------------------------------------------ */
const TOKEN =
  /(#include|\/\/.*|#.*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(def|return|for|in|const|let|int|public|class|static|void|package|import|func|if|else|while|new)\b|\b(\d+)\b|\b([A-Za-z_]\w*)(?=\()/g;

const TOKEN_COLORS = {
  k: "#FF9EC4",
  s: "#A5F0C6",
  c: "#7C8BC7",
  m: "#FFD48A",
  f: "#8FB4FF",
};

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
function EditorPreview({ lang }) {
  const sample = SAMPLES[lang];
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("typing"); // typing | running | done
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    const full = sample.code.join("\n");
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
  }, [lang, runKey, sample]);

  const lines = typed.split("\n");

  return (
    <div
      className="rounded-xl overflow-hidden font-mono shadow-2xl"
      style={{ background: "#0A1030", color: "#D7DEFF" }}
    >
      {/* tab bar */}
      <div
        className="flex items-center justify-between pr-2 border-b"
        style={{ background: "#0F1742", borderColor: "#1E2A66" }}
      >
        <div
          className="px-4 py-2.5 text-sm text-white border-r"
          style={{ background: "#0A1030", borderColor: "#1E2A66" }}
        >
          {sample.file}
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

      {/* code */}
      <div className="h-64 overflow-hidden py-4 text-sm leading-6" aria-label="Example code">
        {lines.map((line, i) => (
          <div key={i} className="flex whitespace-pre">
            <span
              className="w-11 shrink-0 pr-4 text-right select-none"
              style={{ color: "#4A5A9E" }}
            >
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

      {/* output */}
      <div
        className="border-t px-4 pt-3.5 pb-4 text-sm min-h-28"
        style={{ background: "#070B26", borderColor: "#1E2A66" }}
        aria-live="polite"
      >
        <div className="mb-2" style={{ color: "#7C8BC7" }}>
          Output
        </div>
        <div className="h-6 leading-6 text-white">{phase === "done" ? sample.out : ""}</div>
        <div
          className="mt-1.5 h-5"
          style={{ color: phase === "running" ? "#FFD48A" : "#9CF0C8" }}
        >
          {phase === "running" && "Running\u2026"}
          {phase === "done" && `\u2713 Finished in ${sample.time}`}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Form helpers                                                       */
/* ------------------------------------------------------------------ */
const FIELD_ORDER = ["name", "email", "username", "password", "terms"];

const PASSWORD_RULES = [
  { id: "len", label: "8+ characters", test: (v) => v.length >= 8 },
  { id: "letter", label: "A letter", test: (v) => /[A-Za-z]/.test(v) },
  { id: "num", label: "A number", test: (v) => /\d/.test(v) },
];

const VALIDATORS = {
  name: (v) => v.name.trim().length > 0,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim()),
  username: (v) => /^[A-Za-z0-9_]{3,20}$/.test(v.username.trim()),
  password: (v) => PASSWORD_RULES.every((r) => r.test(v.password)),
  terms: (v) => v.terms,
};

const MESSAGES = {
  name: "Enter your name.",
  email: "Enter a valid email, like you@example.com.",
  username: "Use 3 to 20 letters, numbers or underscores.",
  password: "Meet all three password requirements.",
  terms: "Accept the terms to continue.",
};

function Field({ id, label, error, hint, children }) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block mb-1.5 text-sm font-semibold">
          {label}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-sm" style={{ color: "var(--muted)" }}>
          {hint}
        </p>
      )}
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
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    lang: "python",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const headingRef = useRef(null);

  useEffect(() => {
    if (status === "success" && headingRef.current) headingRef.current.focus();
  }, [status]);

  const update = (key, val) => {
    const next = { ...values, [key]: val };
    setValues(next);
    if (errors[key] && VALIDATORS[key]?.(next)) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const validateOnBlur = (key) => {
    if (values[key] !== "" && !VALIDATORS[key](values)) {
      setErrors((prev) => ({ ...prev, [key]: MESSAGES[key] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    FIELD_ORDER.forEach((k) => {
      if (!VALIDATORS[k](values)) found[k] = MESSAGES[k];
    });
    setErrors(found);
    const first = FIELD_ORDER.find((k) => found[k]);
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      await register(
        values.name.trim(),
        values.username.trim(),
        values.email.trim(),
        values.password
      );
      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Something went wrong. Try again in a moment.";
      const field = message.toLowerCase().includes("username")
        ? "username"
        : "email";

      setErrors({ [field]: message });
      setStatus("idle");
    }
  };

  const reset = () => {
    setValues({ name: "", email: "", username: "", password: "", lang: "python", terms: false });
    setErrors({});
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
                Create your account
              </h1>
              <p className="mb-7 max-w-sm" style={{ color: "var(--muted)" }}>
                Write code in your browser and run it in seconds. Free to start.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <Field id="name" label="Full name" error={errors.name}>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Ada Lovelace"
                    value={values.name}
                    onChange={(e) => update("name", e.target.value)}
                    onBlur={() => validateOnBlur("name")}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-err" : undefined}
                    className={inputCls}
                  />
                </Field>

                <Field id="email" label="Email" error={errors.email}>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={values.email}
                    onChange={(e) => update("email", e.target.value)}
                    onBlur={() => validateOnBlur("email")}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-err" : undefined}
                    className={inputCls}
                  />
                </Field>

                <Field id="username" label="Username" error={errors.username}>
                  <div className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono pointer-events-none"
                      style={{ color: "var(--muted)" }}
                    >
                      @
                    </span>
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="ada_codes"
                      value={values.username}
                      onChange={(e) => update("username", e.target.value)}
                      onBlur={() => validateOnBlur("username")}
                      aria-invalid={!!errors.username}
                      aria-describedby={errors.username ? "username-err" : undefined}
                      className={`${inputCls} pl-8 font-mono`}
                    />
                  </div>
                </Field>

                <Field id="password" label="Password" error={errors.password}>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPw ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      value={values.password}
                      onChange={(e) => update("password", e.target.value)}
                      onBlur={() => validateOnBlur("password")}
                      aria-invalid={!!errors.password}
                      aria-describedby={`password-rules${errors.password ? " password-err" : ""}`}
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
                  <ul
                    id="password-rules"
                    aria-label="Password requirements"
                    className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 p-0 list-none"
                  >
                    {PASSWORD_RULES.map((rule) => {
                      const ok = rule.test(values.password);
                      return (
                        <li
                          key={rule.id}
                          className="inline-flex items-center gap-1.5 text-sm"
                          style={{ color: ok ? "var(--ink)" : "var(--muted)" }}
                        >
                          <span
                            aria-hidden="true"
                            className="grid place-items-center w-3.5 h-3.5 rounded-full border"
                            style={{
                              background: ok ? "var(--ok)" : "transparent",
                              borderColor: ok ? "var(--ok)" : "var(--line)",
                            }}
                          >
                            {ok && (
                              <svg width="10" height="10" viewBox="0 0 14 14">
                                <path
                                  d="M3.5 7.4l2.2 2.2 4.8-4.9"
                                  fill="none"
                                  stroke="#fff"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                          {rule.label}
                          <span className="sr-only">{ok ? " (met)" : " (not met)"}</span>
                        </li>
                      );
                    })}
                  </ul>
                </Field>

                <Field
                  id="lang"
                  label="Language you'll start with"
                  hint="You can run any language later. This sets your first editor."
                >
                  <select
                    id="lang"
                    value={values.lang}
                    onChange={(e) => update("lang", e.target.value)}
                    className="rp-input rp-select w-full h-11 px-3.5 pr-10 rounded-lg border text-base cursor-pointer"
                  >
                    {Object.entries(SAMPLES).map(([key, s]) => (
                      <option key={key} value={key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field id="terms" error={errors.terms}>
                  <div className="flex items-start gap-2.5 text-sm" style={{ color: "var(--muted)" }}>
                    <input
                      id="terms"
                      type="checkbox"
                      checked={values.terms}
                      onChange={(e) => update("terms", e.target.checked)}
                      aria-invalid={!!errors.terms}
                      aria-describedby={errors.terms ? "terms-err" : undefined}
                      className="rp-check w-[18px] h-[18px] mt-0.5 shrink-0 cursor-pointer"
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <label htmlFor="terms" className="cursor-pointer">
                      I agree to the{" "}
                      <a href="#" className="underline underline-offset-4" style={{ color: "var(--ink)" }}>
                        Terms of Use
                      </a>{" "}
                      and{" "}
                      <a href="#" className="underline underline-offset-4" style={{ color: "var(--ink)" }}>
                        Privacy Policy
                      </a>
                      .
                    </label>
                  </div>
                </Field>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rp-primary w-full h-12 mt-2 rounded-lg text-base font-semibold"
                >
                  {submitting ? "Creating account\u2026" : "Create account"}
                </button>
              </form>

              <p className="mt-5 text-sm text-center" style={{ color: "var(--muted)" }}>
                Already have an account?{" "}
                <Link to="/login" className="font-semibold underline underline-offset-4" style={{ color: "var(--ink)" }}>
                  Sign in
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
                Welcome, {values.name.trim().split(/\s+/)[0]}.
              </h1>
              <p className="mb-3" style={{ color: "var(--muted)" }}>
                You're signed up as{" "}
                <strong style={{ color: "var(--ink)" }}>@{values.username.trim()}</strong>. Confirm your
                email at <strong style={{ color: "var(--ink)" }}>{values.email.trim()}</strong> to save
                your projects.
              </p>
              <p className="mb-3" style={{ color: "var(--muted)" }}>
                Your first editor is ready with{" "}
                <strong style={{ color: "var(--ink)" }}>{SAMPLES[values.lang].label}</strong>.
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
                Back to form
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
          <EditorPreview lang={values.lang} />
          <p className="mt-5 px-0.5 max-w-md" style={{ color: "#C9D2FF" }}>
            Runs Python, JavaScript, C++, Java and Go with no setup. Pick your language on the left
            and watch it run.
          </p>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Design tokens + the few rules Tailwind utilities can't express     */
/*  (custom palette, fonts, focus rings, caret blink).                 */
/*  In your own project, move the tokens into tailwind.config.js and   */
/*  the fonts into your <head> / global CSS.                           */
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
.rp-select {
  appearance: none;
  -webkit-appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, var(--muted) 50%),
    linear-gradient(135deg, var(--muted) 50%, transparent 50%);
  background-position: calc(100% - 20px) 20px, calc(100% - 15px) 20px;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
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
