
import React from 'react';
import { Loader2, Copy, Check } from 'lucide-react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children,
  className = "" 
}) => {
  return (
    <div className={`group relative inline-block ${className}`}>
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-[9999] pointer-events-none w-max max-w-[260px] animate-in fade-in zoom-in-95 duration-200 origin-bottom">
        <div className="bg-zinc-900/98 backdrop-blur-xl border border-zinc-700/80 text-zinc-100 text-[11px] font-semibold rounded-xl px-4 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center leading-relaxed">
          {content}
        </div>
        <div className="w-3 h-3 bg-zinc-900/98 border-r border-b border-zinc-700/80 transform rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1.5 shadow-sm"></div>
      </div>
    </div>
  );
};

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  className = "", 
  disabled = false,
  variant = "primary"
}) => {
  const baseStyle = "px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-green-600 via-yellow-600 to-red-600 hover:from-green-500 hover:via-yellow-500 hover:to-red-500 text-white shadow-lg shadow-red-900/20 border border-transparent",
    secondary: "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700",
    outline: "border-2 border-zinc-800 hover:border-green-500 text-zinc-300 hover:text-green-400 bg-transparent"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-green-400 transition-colors border border-zinc-800"
      title="Copy to clipboard"
    >
      {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
    </button>
  );
};

export const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
    <p className="text-zinc-500 text-sm animate-pulse font-bold uppercase tracking-widest">Generating SIKY vibes...</p>
  </div>
);
