import { useCallback, useMemo, useState } from 'react';
import { ToastContext } from './toastContext';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    window.setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-20 z-[100] w-[min(360px,calc(100vw-2rem))] space-y-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`rounded-lg border px-4 py-3 text-sm shadow-xl backdrop-blur-xl ${
              toast.type === 'error'
                ? 'border-red-400/30 bg-red-500/15 text-red-100'
                : toast.type === 'success'
                  ? 'border-green-400/30 bg-green-500/15 text-green-100'
                  : 'border-white/10 bg-[#111318]/90 text-white'
            }`}
          >
            <div className="flex justify-between gap-3">
              <p>{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-white/60 hover:text-white">
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
