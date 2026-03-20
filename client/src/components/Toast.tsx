import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
export type Toast = { id: string; message: string };

const ToastContext = createContext<{ addToast: (message: string) => void } | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = useCallback((message: string) => {
		const id = Math.random().toString(36).slice(2);
		setToasts((prev) => [...prev, { id, message }]);
		setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
	}, []);

	const value = useMemo(() => ({ addToast }), [addToast]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div className="pointer-events-none fixed inset-x-0 top-0 z-[9999] flex flex-col items-center gap-3 p-4">
				{toasts.map((t) => (
					<div
						key={t.id}
						className="pointer-events-auto animate-[slideDown_0.3s_ease-out] rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-2xl backdrop-blur-sm"
					>
						<div className="flex items-center gap-2">
							<span className="text-lg">✨</span>
							{t.message}
						</div>
					</div>
				))}
			</div>
			<style>{`
				@keyframes slideDown {
					from {
						opacity: 0;
						transform: translateY(-20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error('useToast must be used within ToastProvider');
	return ctx;
};