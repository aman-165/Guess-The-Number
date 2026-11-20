// import { createContext, useCallback, useContext, useMemo, useState } from "react";

// const ToastContext = createContext(null);
// let toastSequence = 0;

// export function ToastProvider({ children }) {
//   const [toasts, setToasts] = useState([]);

//   const dismissToast = useCallback((id) => {
//     setToasts((current) => current.filter((toast) => toast.id !== id));
//   }, []);

//   const toast = useCallback((message, type = "info", duration = 3200) => {
//     if (!message) return;
//     const id = ++toastSequence;
//     setToasts((current) => [...current, { id, message, type }].slice(-4));
//     if (duration > 0) window.setTimeout(() => dismissToast(id), duration);
//     return id;
//   }, [dismissToast]);

//   const value = useMemo(() => ({ toast, dismissToast }), [toast, dismissToast]);

//   return (
//     <ToastContext.Provider value={value}>
//       {children}
//       <div className="toast-viewport" aria-live="polite" aria-relevant="additions">
//         {toasts.map((item) => (
//           <div className={`game-toast game-toast--${item.type}`} role="status" key={item.id}>
//             <span className="game-toast__message">{item.message}</span>
//             <button type="button" className="game-toast__close" onClick={() => dismissToast(item.id)} aria-label="Dismiss notification">×</button>
//           </div>
//         ))}
//       </div>
//     </ToastContext.Provider>
//   );
// }

// export function useToast() {
//   const context = useContext(ToastContext);
//   if (!context) throw new Error("useToast must be used inside ToastProvider");
//   return context;
// }


import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);
let toastSequence = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((message, type = "info", duration = 3200) => {
    if (!message) return undefined;
    const id = ++toastSequence;
    setToasts((current) => [...current, { id, message, type }].slice(-4));

    if (duration > 0) {
      const timer = window.setTimeout(() => {
        timersRef.current.delete(id);
        setToasts((current) => current.filter((item) => item.id !== id));
      }, duration);
      timersRef.current.set(id, timer);
    }
    return id;
  }, []);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  const value = useMemo(() => ({ toast, dismissToast }), [toast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-relevant="additions">
        {toasts.map((item) => (
          <div className={`game-toast game-toast--${item.type}`} role="status" key={item.id}>
            <span className="game-toast__message">{item.message}</span>
            <button type="button" className="game-toast__close" onClick={() => dismissToast(item.id)} aria-label="Dismiss notification">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
