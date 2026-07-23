export default function EcgTrace({ state = "idle" }) {
  // state: "idle" (steady calm beat), "pending" (scanning), "low" (calm teal), "high" (irregular alert)
  const colorClass =
    state === "high" ? "stroke-alert" : state === "low" ? "stroke-teal" : "stroke-ink/40";

  const path =
    state === "high"
      ? "M0,20 L40,20 L52,20 L58,4 L66,36 L74,20 L86,20 L94,8 L100,32 L108,20 L140,20 L152,20 L158,4 L166,36 L174,20 L186,20 L200,20"
      : "M0,20 L60,20 L72,20 L80,6 L88,34 L96,20 L108,20 L400,20";

  return (
    <svg
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      className="w-full h-10"
      aria-hidden="true"
    >
      <line x1="0" y1="20" x2="400" y2="20" className="stroke-line" strokeWidth="1" />
      <path
        d={path}
        fill="none"
        className={`${colorClass} transition-colors duration-500`}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={
          state === "pending"
            ? {
                strokeDasharray: 400,
                strokeDashoffset: 400,
                animation: "dash 1.4s linear infinite",
              }
            : undefined
        }
      />
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
}
