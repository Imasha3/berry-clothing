"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren
} from "react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

interface AlertOptions {
  title?: string;
  message: string;
  buttonText?: string;
  type?: "warning" | "success" | "error" | "info";
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning";
}

interface DialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
  };
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: PropsWithChildren) {
  // Confirm modal state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (val: boolean) => void;
  } | null>(null);

  // Alert modal state
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    options: AlertOptions;
    resolve: () => void;
  } | null>(null);

  // Toasts state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Confirm helper
  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve: (val) => {
          setConfirmState(null);
          resolve(val);
        }
      });
    });
  }, []);

  // Alert helper
  const alert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setAlertState({
        isOpen: true,
        options,
        resolve: () => {
          setAlertState(null);
          resolve();
        }
      });
    });
  }, []);

  // Toast dispatchers
  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: useCallback((msg: string) => addToast(msg, "success"), [addToast]),
    error: useCallback((msg: string) => addToast(msg, "error"), [addToast]),
    warning: useCallback((msg: string) => addToast(msg, "warning"), [addToast])
  };

  return (
    <DialogContext.Provider value={{ confirm, alert, toast }}>
      {children}

      {/* Global Confirmation Modal */}
      {confirmState?.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#171212]/40 p-4 backdrop-blur-[4px] transition-all duration-300">
          <div className="w-full max-w-md scale-100 rounded-[28px] bg-white p-6 shadow-[0_24px_48px_rgba(0,0,0,0.12)] ring-1 ring-black/5 transition-all duration-300">
            {confirmState.options.title && (
              <h3 className="font-display text-xl font-semibold text-ink">
                {confirmState.options.title}
              </h3>
            )}
            <p className="mt-4 text-sm leading-6 text-black/70">
              {confirmState.options.message}
            </p>
            {confirmState.options.type === "danger" && (
              <p className="mt-3 text-xs font-semibold text-rose-600">
                ⚠ This action cannot be undone.
              </p>
            )}
            {confirmState.options.type === "warning" && (
              <p className="mt-3 text-xs font-semibold text-amber-600">
                ⚠ Please review this step carefully.
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => confirmState.resolve(false)}
                className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-all hover:bg-black/5 hover:translate-y-[-1px]"
              >
                {confirmState.options.cancelText ?? "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => confirmState.resolve(true)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:translate-y-[-1px] ${
                  confirmState.options.type === "danger"
                    ? "bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-100"
                    : confirmState.options.type === "warning"
                      ? "bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-100"
                      : "bg-[#171212] hover:bg-black shadow-md shadow-black/10"
                }`}
              >
                {confirmState.options.confirmText ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Alert Modal */}
      {alertState?.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#171212]/40 p-4 backdrop-blur-[4px] transition-all duration-300">
          <div className="w-full max-w-md scale-100 rounded-[28px] bg-white p-6 shadow-[0_24px_48px_rgba(0,0,0,0.12)] ring-1 ring-black/5 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg">
                {alertState.options.type === "success" && "✅"}
                {alertState.options.type === "error" && "❌"}
                {alertState.options.type === "warning" && "⚠"}
                {alertState.options.type === "info" && "ℹ"}
              </div>
              <div className="flex-1">
                {alertState.options.title && (
                  <h3 className="font-display text-xl font-semibold text-ink">
                    {alertState.options.title}
                  </h3>
                )}
                <p className="mt-2 text-sm leading-6 text-black/70">
                  {alertState.options.message}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => alertState.resolve()}
                className="rounded-full bg-[#171212] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-black hover:translate-y-[-1px]"
              >
                {alertState.options.buttonText ?? "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed right-4 top-4 z-[99999] flex w-full max-w-sm flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </DialogContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styleClass =
    toast.type === "success"
      ? "bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-[0_8px_30px_rgb(209,250,229,0.3)]"
      : toast.type === "error"
        ? "bg-rose-50 text-rose-800 border border-rose-100 shadow-[0_8px_30px_rgb(254,226,226,0.3)]"
        : "bg-amber-50 text-amber-800 border border-amber-100 shadow-[0_8px_30px_rgb(254,243,199,0.3)]";

  const icon = toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "⚠";

  return (
    <div
      className={`flex w-full items-start gap-3 rounded-[20px] p-4 text-sm font-semibold pointer-events-auto transition-all duration-300 animate-in slide-in-from-right-10 ${styleClass}`}
    >
      <span className="shrink-0 text-base">{icon}</span>
      <p className="flex-1 leading-5">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 text-black/30 hover:text-black/60 text-xs font-bold leading-none p-1"
      >
        ✕
      </button>
    </div>
  );
}

export function useConfirm() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useConfirm must be used within DialogProvider");
  }
  return context.confirm;
}

export function useAlert() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useAlert must be used within DialogProvider");
  }
  return context.alert;
}

export function useToast() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useToast must be used within DialogProvider");
  }
  return context.toast;
}
