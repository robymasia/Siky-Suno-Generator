import { Loader2, Copy, Check } from 'lucide-react';
import React from 'react';

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
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 hidden group-hover:block z-[9999] pointer-events-none w-max max-w-[280px] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 origin-bottom">
        {/* Shadow Glow Effect */}
        <div className="absolute inset-0 bg-green-500/10 blur-xl rounded-2xl -z-10"></div>
        
        {/* Main Content Container */}
        <div className="relative bg-zinc-950/90 backdrop-blur-2xl border border-zinc-700/50 text-zinc-100 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Subtle Accent Line */}
          <div className="h-0.5 w-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-80"></div>
          
          <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-center leading-relaxed">
            {content}
          </div>
        </div>

        {/* Improved Arrow */}
        <div className="w-3 h-3 bg-zinc-950/90 border-r border-b border-zinc-700/50 transform rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1.5 shadow-sm"></div>
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
  const baseStyle = "relative px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 group overflow-hidden";
  
  const variants = {
    primary: `
      bg-zinc-950 text-white 
      before:absolute before:inset-0 before:p-[2px] before:bg-gradient-to-r before:from-green-600 before:via-yellow-600 before:to-red-600 before:rounded-xl before:content-[''] before:z-0
      after:absolute after:inset-[2px] after:bg-zinc-950 after:rounded-[10px] after:content-[''] after:z-1
      hover:before:from-red-600 hover:before:via-green-600 hover:before:to-yellow-600
      shadow-lg shadow-red-900/20 
      [&>span]:z-10 [&>span]:transition-transform [&>span]:duration-300 group-hover:[&>span]:scale-110
    `,
    secondary: "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700",
    outline: "border-2 border-zinc-800 hover:border-green-500 text-zinc-300 hover:text-green-400 bg-transparent"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <span className="flex items-center gap-2">
        {children}
      </span>
    </button>
  );
};

export const CopyButton = ({ text, size = 18, className = "" }: { text: string; size?: number; className?: string }) => {
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
      className={`p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-green-400 transition-colors border border-zinc-800 flex items-center justify-center ${className}`}
      title="Copy to clipboard"
    >
      {copied ? <Check size={size} className="text-green-500" /> : <Copy size={size} />}
    </button>
  );
};

export const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <div className="relative">
      <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>
      <Loader2 className="w-12 h-12 text-yellow-500 animate-spin relative z-10" />
    </div>
    <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] animate-pulse">Generating SIKY vibes...</p>
  </div>
);