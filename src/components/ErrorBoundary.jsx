import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white p-12 rounded-[40px] shadow-2xl border border-rose-100">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-4 uppercase italic">Oops! 시스템 오류</h1>
            <p className="text-slate-500 font-bold mb-8 leading-relaxed">
              화면을 불러오는 중 예상치 못한 오류가 발생했습니다.<br/>
              잠시 후 다시 시도해 주세요.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              다시 시도하기
            </button>
            <p className="mt-6 text-[10px] text-slate-300 font-mono text-left bg-slate-50 p-4 rounded-xl overflow-auto max-h-32">
              {this.state.error?.toString()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
