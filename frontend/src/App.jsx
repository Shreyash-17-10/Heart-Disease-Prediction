import { useEffect, useState } from "react";
import IntakeForm from "./components/IntakeForm.jsx";
import ResultPanel from "./components/ResultPanel.jsx";
import HistoryList from "./components/HistoryList.jsx";
import EcgTrace from "./components/EcgTrace.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const DEFAULT_VALUES = {
  age: 54,
  sex: 1,
  cp: 0,
  trestbps: 130,
  chol: 240,
  fbs: 0,
  restecg: 0,
  thalach: 150,
  exang: 0,
  oldpeak: 1.0,
  slope: 1,
  ca: 0,
  thal: 2,
};

export default function App() {
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleChange = (key, value) => setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = async () => {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      setResult(data);
      setStatus("done");
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/history`);
      if (res.ok) setHistory(await res.json());
    } catch {
      /* silent - history is optional */
    }
  };

  useEffect(() => {
    if (showHistory) loadHistory();
  }, [showHistory, status]);

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b rule">
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-6">
          <div className="text-xs uppercase tracking-widest text-inkfaint mb-2">
            Cardio Chart
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
            A quick read on heart disease risk
          </h1>
          <p className="text-inkfaint mt-3 max-w-xl">
            Enter a patient's vitals, symptoms, and test results below. A model trained
            offline on clinical intake data returns a risk reading and its confidence,
            the same fields used in a standard cardiac workup.
          </p>
        </div>
        <EcgTrace state="idle" />
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        <IntakeForm
          values={values}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitting={status === "loading"}
        />
        <ResultPanel status={status} result={result} error={error} />
      </main>

      <section className="max-w-5xl mx-auto px-6 pb-16">
        <button
          onClick={() => setShowHistory((s) => !s)}
          className="text-sm font-display tracking-wide text-teal-dark border-b border-teal-dark/40 hover:border-teal-dark mb-4"
        >
          {showHistory ? "Hide" : "Show"} prediction history
        </button>
        {showHistory && (
          <div className="bg-chart border rule rounded-card p-6">
            <HistoryList items={history} />
          </div>
        )}
      </section>

      <footer className="border-t rule">
        <div className="max-w-5xl mx-auto px-6 py-6 text-xs text-inkfaint">
          Built with FastAPI, XGBoost, and React · For educational use only, not a
          medical device, should be used by qualified healthcare professionals.
        </div>
      </footer>
    </div>
  );
}
