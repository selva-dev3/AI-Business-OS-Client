import * as React from "react";
import Link from "next/link";
import { Brain, Server } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 overflow-hidden relative p-4 selection:bg-indigo-500/30 selection:text-slate-900">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
      
      {/* Glowing ambient light behind the card */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-indigo-500/3 blur-[90px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Header/Logo section */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 mx-auto group">
            <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Brain className="h-5 w-5 text-indigo-600 group-hover:text-cyan-600 transition-colors" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-950 via-slate-800 to-slate-600 bg-clip-text text-transparent">
              AI Business OS
            </span>
          </Link>
          
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-indigo-500/10 bg-indigo-50 text-[9px] font-mono text-indigo-700 uppercase tracking-widest">
            <Server className="h-3 w-3 text-indigo-600" />
            Core Secure Node
          </div>
        </div>

        {/* Children card container */}
        <div className="relative">
          {children}
        </div>

        {/* Footer info tag */}
        <div className="text-center font-mono text-[9px] text-slate-400 uppercase tracking-wider">
          Connection Status: TLS_AES_256_GCM_SHA384
        </div>

      </div>
    </div>
  );
}
