const SECTIONS = [
  {
    label: "01 — Vitals",
    fields: [
      { key: "age", label: "Age", type: "number", min: 1, max: 120, unit: "yrs" },
      {
        key: "sex",
        label: "Sex",
        type: "select",
        options: [
          { value: 1, label: "Male" },
          { value: 0, label: "Female" },
        ],
      },
      { key: "trestbps", label: "Resting blood pressure", type: "number", min: 60, max: 250, unit: "mm Hg" },
      { key: "chol", label: "Serum cholesterol", type: "number", min: 80, max: 700, unit: "mg/dl" },
      { key: "thalach", label: "Max heart rate achieved", type: "number", min: 50, max: 250, unit: "bpm" },
    ],
  },
  {
    label: "02 — Symptoms",
    fields: [
      {
        key: "cp",
        label: "Chest pain type",
        type: "select",
        options: [
          { value: 0, label: "Typical angina" },
          { value: 1, label: "Atypical angina" },
          { value: 2, label: "Non-anginal pain" },
          { value: 3, label: "Asymptomatic" },
        ],
      },
      {
        key: "exang",
        label: "Exercise-induced angina",
        type: "select",
        options: [
          { value: 0, label: "No" },
          { value: 1, label: "Yes" },
        ],
      },
      { key: "oldpeak", label: "ST depression (exercise vs. rest)", type: "number", min: 0, max: 10, step: 0.1, unit: "mm" },
    ],
  },
  {
    label: "03 — Test results",
    fields: [
      {
        key: "fbs",
        label: "Fasting blood sugar > 120 mg/dl",
        type: "select",
        options: [
          { value: 0, label: "No" },
          { value: 1, label: "Yes" },
        ],
      },
      {
        key: "restecg",
        label: "Resting ECG result",
        type: "select",
        options: [
          { value: 0, label: "Normal" },
          { value: 1, label: "ST-T wave abnormality" },
          { value: 2, label: "Left ventricular hypertrophy" },
        ],
      },
      {
        key: "slope",
        label: "Slope of peak exercise ST segment",
        type: "select",
        options: [
          { value: 0, label: "Upsloping" },
          { value: 1, label: "Flat" },
          { value: 2, label: "Downsloping" },
        ],
      },
      { key: "ca", label: "Major vessels colored by fluoroscopy", type: "select", options: [0, 1, 2, 3].map((v) => ({ value: v, label: String(v) })) },
      {
        key: "thal",
        label: "Thalassemia",
        type: "select",
        options: [
          { value: 1, label: "Fixed defect" },
          { value: 2, label: "Normal" },
          { value: 3, label: "Reversible defect" },
        ],
      },
    ],
  },
];

export default function IntakeForm({ values, onChange, onSubmit, submitting }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-8"
    >
      {SECTIONS.map((section) => (
        <fieldset key={section.label}>
          <legend className="font-display text-sm tracking-wide text-inkfaint uppercase mb-3 pb-2 border-b rule w-full">
            {section.label}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {section.fields.map((field) => (
              <label key={field.key} className="block">
                <span className="block text-sm text-ink mb-1">{field.label}</span>
                {field.type === "select" ? (
                  <select
                    value={values[field.key]}
                    onChange={(e) => onChange(field.key, Number(e.target.value))}
                    className="w-full bg-chart border rule rounded-card px-3 py-2 font-mono text-sm text-ink focus:border-teal"
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-stretch">
                    <input
                      type="number"
                      required
                      min={field.min}
                      max={field.max}
                      step={field.step || 1}
                      value={values[field.key]}
                      onChange={(e) => onChange(field.key, Number(e.target.value))}
                      className="w-full bg-chart border rule rounded-card px-3 py-2 font-mono text-sm text-ink focus:border-teal"
                    />
                    {field.unit && (
                      <span className="flex items-center px-2 text-xs text-inkfaint font-mono border-y border-r rule rounded-r-card bg-paper">
                        {field.unit}
                      </span>
                    )}
                  </div>
                )}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto px-6 py-3 bg-teal hover:bg-teal-dark disabled:opacity-60 text-paper font-display text-base tracking-wide rounded-card transition-colors"
      >
        {submitting ? "Reading chart…" : "Read the chart"}
      </button>
    </form>
  );
}
