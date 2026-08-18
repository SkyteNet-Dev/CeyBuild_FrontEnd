"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { HiX, HiOutlineUser, HiOutlineLockClosed } from "react-icons/hi";
import { useI18n } from "@/i18n/I18nProvider";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnTo?: string;
}

export default function AuthPromptModal({ isOpen, onClose, returnTo }: AuthPromptModalProps) {
  const { t } = useI18n();
  const overlayRef = useRef<HTMLDivElement>(null);

  const loginHref = returnTo ? `/auth/login?returnTo=${encodeURIComponent(returnTo)}` : "/auth/login";
  const registerHref = returnTo ? `/auth/register?returnTo=${encodeURIComponent(returnTo)}` : "/auth/register";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <HiX className="h-6 w-6" />
        </button>

        <div className="text-center mb-6">
          <div className="h-14 w-14 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto mb-4">
            <HiOutlineLockClosed className="h-7 w-7" />
          </div>
           <h2 id="auth-modal-title" className="text-2xl font-bold text-gray-900">{t('authPrompt.title')}</h2>
           <p className="text-sm text-gray-500 mt-2">
             {t('authPrompt.description')}
           </p>
        </div>

        <div className="space-y-3">
          <Link
            href={loginHref}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
          >
            <HiOutlineUser className="h-5 w-5" />
             {t('authPrompt.signIn')}
          </Link>
          <Link
            href={registerHref}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-colors"
          >
             {t('authPrompt.createAccount')}
          </Link>
        </div>

        <p className="text-xs text-gray-400 text-center mt-5">
          {t('authPrompt.autoSubmit')}
        </p>
      </div>
    </div>
  );
}
