import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
export type Toast = { id: string; message: string };

const ToastContext = createContext<{ addToast: (message: string) => void } | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = useCallback((message: string) => {
		const id = Math.random().toString(36).slice(2);
		setToasts((prev) => [...prev, { id, message }]);
		setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
	}, []);

	const value = useMemo(() => ({ addToast }), [addToast]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div style={{ position: 'fixed', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 2000 }}>
				{toasts.map((t) => (
					<div key={t.id} style={{ background: '#111827', color: 'white', padding: '10px 14px', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
						{t.message}
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error('useToast must be used within ToastProvider');
	return ctx;
};