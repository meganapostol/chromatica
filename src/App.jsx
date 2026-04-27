import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Chromatica from '@/pages/Chromatica';

class ChromaticaErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, recoveryAttempts: 0, lastRecoveryAt: 0 };
    this.recoverTimer = null;
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('Chromatica caught a render error:', error, info);

    // The "Failed to execute 'insertBefore' on 'Node'" family of errors
    // is almost always a one-off DOM-reconciler hiccup caused by external
    // mutations (browser extensions, third-party scripts). Auto-recover
    // silently on the first 2 attempts within a 5s window, then surface
    // the manual error UI if it keeps looping.
    const now = Date.now();
    const recentLoop = now - this.state.lastRecoveryAt < 5000;
    const attempts = recentLoop ? this.state.recoveryAttempts + 1 : 1;
    if (attempts <= 2) {
      clearTimeout(this.recoverTimer);
      this.recoverTimer = setTimeout(() => {
        this.setState({ error: null, recoveryAttempts: attempts, lastRecoveryAt: Date.now() });
      }, 400);
    }
  }
  componentWillUnmount() { clearTimeout(this.recoverTimer); }
  reset = () => this.setState({ error: null, recoveryAttempts: 0, lastRecoveryAt: 0 });
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 32,
            color: '#F8F0E3',
            backgroundColor: '#0A0A0F',
            fontFamily: 'Cormorant Garamond, serif'
          }}
        >
          <div style={{ fontSize: 28, fontStyle: 'italic', textAlign: 'center', maxWidth: 520 }}>
            something has gone quiet here.
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(248,240,227,0.55)',
              maxWidth: 520,
              textAlign: 'center'
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </div>
          <button
            type="button"
            onClick={this.reset}
            style={{
              marginTop: 12,
              padding: '8px 20px',
              borderRadius: 9999,
              backgroundColor: 'rgba(15,12,18,0.55)',
              border: '1px solid rgba(248,240,227,0.18)',
              color: '#F8F0E3',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  // Show loading spinner while checking app public settings or auth.
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#0A0A0F' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
             style={{ borderColor: 'rgba(248,240,227,0.2)', borderTopColor: '#F8F0E3' }}></div>
      </div>
    );
  }

  // Chromatica is a public app (base44Client requiresAuth: false).
  // Only block on `user_not_registered`; treat all other auth errors as
  // non-fatal so a network blip / missing dev token never redirects users
  // away from the public site.
  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      <Route path="/" element={<Chromatica />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  // Opt out of common DOM-mutating extensions. Grammarly / Google Translate
  // / LanguageTool inserting <font>, <grammarly-extension>, etc. into the
  // tree is the most common source of React's "insertBefore: not a child"
  // errors. These attributes tell the major offenders to skip this subtree.
  return (
    <div
      translate="no"
      className="notranslate"
      data-gramm="false"
      data-gramm_editor="false"
      data-lt-installed="true"
      style={{ minHeight: '100vh', backgroundColor: '#0A0A0F' }}
    >
      <ChromaticaErrorBoundary>
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <AuthenticatedApp />
            </Router>
          </QueryClientProvider>
        </AuthProvider>
      </ChromaticaErrorBoundary>
    </div>
  )
}

export default App