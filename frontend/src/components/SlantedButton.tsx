import React from "react";
import clsx from "clsx";


const SlantedButton = ({
  onClick = () => {},
  children,
  kind = "primary",
  style,
  extraClasses,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  kind?: "primary" | "secondary" | "disabled";
  style?: React.CSSProperties;
  extraClasses?: string;
}) => {
  // Palette Night Hospital
  const kindToClass = {
    primary:
      "bg-blue-500/90 text-white shadow-blue-500/10 border-blue-500 after:bg-blue-500/20 after:border-blue-500 hover:bg-blue-500 hover:shadow-blue-500/20",
    secondary:
      "bg-slate-900/50 text-blue-400 border-blue-400 after:bg-slate-900/70 after:border-blue-400 hover:bg-slate-800/80 hover:text-blue-300",
    disabled:
      "bg-slate-800/50 text-slate-500 border-slate-700 after:bg-slate-800/50 after:border-slate-700 opacity-50 cursor-not-allowed",
  };

  return (
    <button
      onClick={onClick}
      disabled={kind === "disabled"}
      className={clsx(
        "px-6 py-3 mx-2 z-10 font-sans font-semibold text-base transition-all duration-200",
        "rounded-3xl relative overflow-hidden",
        "backdrop-blur-md border-2",
        kindToClass[kind],
        {
          "cursor-not-allowed": kind === "disabled",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40": kind !== "disabled",
        },
        extraClasses,
        // Slanted glass effect
        "after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:bottom-0 after:rounded-3xl after:-skew-x-12 after:-z-10 after:transition-all after:duration-200"
      )}
      style={style}
    >
      {children}
    </button>
  );
};

export default SlantedButton;
