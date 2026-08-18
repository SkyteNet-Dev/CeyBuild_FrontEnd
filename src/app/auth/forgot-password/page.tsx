"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import { HiOutlineMail } from "react-icons/hi";
import AnimatedSection from "@/components/AnimatedSection";
import { useI18n } from "@/i18n/I18nProvider";

type ForgotPasswordValues = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { t } = useI18n();

  const forgotPasswordSchema = z.object({
    email: z.string().email({ message: t('auth.forgotPassword.invalidEmail') }),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setEmailSent(true);
      toast.success(t('auth.forgotPassword.resetEmailSent'));
    } catch (error: any) {
      toast.error(error.message || t('auth.forgotPassword.sendFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <AnimatedSection className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">{t('auth.forgotPassword.title')}</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('auth.forgotPassword.description')}
        </p>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          {!emailSent ? (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('auth.forgotPassword.email')}</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiOutlineMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-3 border px-3 outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all"
                >
                  {loading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.sendResetLink')}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="rounded-full bg-green-100 p-3 mx-auto w-12 h-12 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">{t('auth.forgotPassword.checkEmail')}</h3>
              <p className="mt-2 text-sm text-gray-500 mb-6">
                {t('auth.forgotPassword.emailSentMessage')}
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="text-sm font-medium text-primary hover:text-primary-hover"
              >
                {t('auth.forgotPassword.tryAnother')}
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="font-medium text-gray-600 hover:text-primary text-sm">
              {t('auth.forgotPassword.backToLogin')}
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
