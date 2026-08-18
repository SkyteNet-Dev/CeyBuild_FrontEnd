"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from "react-icons/hi";
import AnimatedSection from "@/components/AnimatedSection";
import api from "@/lib/axios";
import { useI18n } from "@/i18n/I18nProvider";
import { Suspense } from "react";

type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  role: "customer" | "worker";
};

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "worker" ? "worker" : "customer";
  const returnTo = searchParams.get("returnTo");
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const registerSchema = z.object({
    fullName: z.string().min(2, { message: t('auth.register.nameTooShort') }),
    email: z.string().email({ message: t('auth.register.invalidEmail') }),
    password: z.string().min(6, { message: t('auth.register.passwordMinLength') }),
    role: z.enum(["customer", "worker"]),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: defaultRole as "customer" | "worker",
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: data.fullName
        });
        const token = await auth.currentUser.getIdToken(true);
        const role = data.role === "worker" ? "WORKER" : "CUSTOMER";
        await api.post('/auth/login', { token, role, fullName: data.fullName });
      }
      toast.success(t('auth.register.accountCreated'));
      // Workers go to onboarding, customers go to returnTo or dashboard
      if (data.role === "worker") {
        router.push("/onboarding/worker");
      } else {
        router.push(returnTo || "/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || t('auth.register.accountFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      if (auth.currentUser) {
         const token = await auth.currentUser.getIdToken(true);
         await api.post('/auth/login', { token, role: "CUSTOMER" });
      }
      toast.success(t('auth.register.googleSuccess'));
      router.push(returnTo || "/dashboard");
    } catch (error: any) {
      toast.error(error.message || t('auth.register.googleFailed'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <AnimatedSection className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">{t('auth.register.title')}</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('auth.register.subtitle')}{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:text-primary-hover">
            {t('auth.register.signIn')}
          </Link>
        </p>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            <div className="flex justify-center space-x-4 mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" value="customer" {...register("role")} className="text-primary focus:ring-primary h-4 w-4" />
                <span className="text-gray-700 font-medium">{t('auth.register.imCustomer')}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" value="worker" {...register("role")} className="text-primary focus:ring-primary h-4 w-4" />
                <span className="text-gray-700 font-medium">{t('auth.register.imWorker')}</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('auth.register.fullName')}</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("fullName")}
                  className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-3 border px-3 outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                  placeholder={t('contact.namePlaceholder')}
                />
              </div>
              {errors.fullName && <p className="mt-2 text-sm text-red-600">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('auth.register.email')}</label>
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
              <label className="block text-sm font-medium text-gray-700">{t('auth.register.password')}</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("password")}
                  type="password"
                  className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-3 border px-3 outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all"
              >
                {loading ? t('auth.register.creatingAccount') : t('auth.register.createAccount')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('auth.login.orContinueWith')}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                <FcGoogle className="h-5 w-5 mr-3" />
                {t('auth.login.signInGoogle')}
              </button>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}

export default function RegisterPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">{t('common.loading')}</div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
