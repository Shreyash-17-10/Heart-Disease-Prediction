import EcgTrace from "./EcgTrace.jsx";

export default function ResultPanel({ status, result, error }) {
  const state = status === "loading" ? "pending" : result ? (result.prediction === 1 ? "high" : "low") : "idle";

  return (
    <div className="bg-chart border rule rounded-card p-6 sticky top-6">
      <div className="font-display text-sm tracking-wide text-inkfaint uppercase mb-3 pb-2 border-b rule">
        Readout
      </div>

      <EcgTrace state={state} />

      <div className="mt-6">
        {status === "idle" && (
          <p className="text-sm text-inkfaint leading-relaxed">
            Fill in the chart on the left and submit to generate a reading. Nothing is
            sent until you press "Read the chart."
          </p>
        )}

        {status === "loading" && (
          <p className="text-sm text-inkfaint">Running the intake through the model…</p>
        )}

        {status === "error" && (
          <p className="text-sm text-alert">
            Couldn't reach the prediction service. {error}
          </p>
        )}

        {status === "done" && result && (
          <div>
            <div
              className={`font-display text-2xl mb-1 ${
                result.prediction === 1 ? "text-alert" : "text-teal-dark"
              }`}
            >
              {result.label}
            </div>
            <div className="font-mono text-sm text-inkfaint mb-4">
              confidence {(result.confidence * 100).toFixed(1)}%
            </div>

            <div className="w-full h-2 bg-line rounded-card overflow-hidden mb-5">
              <div
                className={`h-full ${result.prediction === 1 ? "bg-alert" : "bg-teal"}`}
                style={{ width: `${(result.confidence * 100).toFixed(0)}%` }}
              />
            </div>

            {result.risk_factors?.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-inkfaint mb-2">
                  Contributing factors
                </div>
                <ul className="space-y-1">
                  {result.risk_factors.map((f) => (
                    <li key={f} className="text-sm text-ink flex gap-2">
                      <span className="text-alert font-mono">·</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-inkfaint mt-5 leading-relaxed border-t rule pt-4">
              This is a statistical estimate from a model trained on sample data, not a
              medical diagnosis. Speak with a clinician about any heart health concerns.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
