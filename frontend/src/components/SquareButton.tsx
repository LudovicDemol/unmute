import React from "react";
import clsx from "clsx";


const SquareButton = ({
  onClick = () => {},
  children,
  kind = "primary",
  extraClasses,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  kind?: "primary" | "primaryOff" | "secondary";
  extraClasses?: string;
}) => {
  // Palette Night Hospital
  const kindToClass = {
    primary: "bg-blue-500/90 text-white border-blue-500 shadow-blue-500/10 hover:bg-blue-500 hover:shadow-blue-500/20",
    primaryOff: "bg-slate-900/70 text-blue-400 border-blue-400 hover:bg-slate-800/80 hover:text-blue-300",
    secondary: "bg-slate-900/50 text-slate-300 border-slate-700 hover:bg-slate-800/80 hover:text-blue-400",
  };

  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-4 py-2 font-sans font-semibold text-sm rounded-2xl transition-all duration-200",
        "border-2 backdrop-blur-md",
        kindToClass[kind],
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
        extraClasses
      )}
      style={{
        filter: "drop-shadow(0 0.2rem 0.15rem rgba(59,130,246,0.10))",
      }}
    >
      <span className="mx-[-100%] text-center">{children}</span>
    </button>
  );
};

export default SquareButton;
