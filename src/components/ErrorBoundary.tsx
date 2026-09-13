import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';



interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('🔴 ErrorBoundary caught error:', error);
    console.error('Stack:', error.stack);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("❌ Uncaught error:", error);
    console.error("📍 Component stack:", errorInfo.componentStack);
  }

  private resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      // Leer el tema directamente del localStorage ya que estamos fuera del ThemeProvider
      const isDark = localStorage.getItem('sabora_theme') === 'dark';
      if (isDark) {
        document.documentElement.classList.add('dark');
      }

      console.log('⚠️ Rendering error boundary with error:', this.state.error?.message);

      return (
        <div className="min-h-screen bg-[#FCF6EC] dark:bg-[#130F0A] flex flex-col items-center justify-center p-4 text-center transition-colors duration-300">
          <div className="bg-white dark:bg-[#18130D] p-8 rounded-3xl shadow-xl max-w-md w-full border border-red-100 dark:border-red-900/30 transition-colors duration-300">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-2">
              ¡Ups! Algo se quemó en la cocina
            </h1>
            
            <p className="text-[#8C7C63] dark:text-[#7C715E] mb-6">
              Ha ocurrido un error inesperado. No te preocupes, nuestros chefs digitales ya están limpiando el desastre.
            </p>

            <div className="p-4 bg-primary/10 rounded-xl mb-6 text-left overflow-hidden">
               <code className="text-xs text-red-500 font-mono break-all">
                 {this.state.error?.message || 'Error desconocido'}
               </code>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-200 dark:shadow-none"
            >
              <RefreshCw className="w-5 h-5" />
              Recargar Página
            </button>
            
            <button
              onClick={() => {
                this.resetError();
                window.location.href = '/';
              }}
              className="w-full mt-3 py-3 text-[#8C7C63] dark:text-[#7C715E] font-medium hover:text-[#241B10] dark:hover:text-white transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;