"use client";

import { useEffect, useState, useRef } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import { updatePassword, sendEmailVerification, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { HiOutlineUpload, HiOutlineUser, HiOutlineTrash, HiOutlineCheckCircle, HiOutlineExclamationCircle } from "react-icons/hi";
import WorkerProfileSettings from "@/components/dashboard/WorkerProfileSettings";
import { useI18n } from "@/i18n/I18nProvider";
import { compressImage, formatFileSize } from "@/lib/image-compress";

type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
};

export default function ProfilePage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [password, setPassword] = useState("");
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [sendingVerification, setSendingVerification] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      setProfile(res.data);
    } catch (error) {
      toast.error(t('profile.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailVerificationStatus = async () => {
    try {
      const res = await api.get("/users/profile/email-verification-status");
      setEmailVerified(res.data.emailVerified);
    } catch {
      setEmailVerified(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchProfile();
    fetchEmailVerificationStatus();
  }, [user]);

  const handleUpdateInformation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setUpdating(true);
    try {
      const payload: Record<string, string> = {};
      if (profile.fullName !== undefined) payload.fullName = profile.fullName;
      if (profile.phoneNumber !== undefined && profile.phoneNumber !== null) payload.phoneNumber = profile.phoneNumber;
      if (profile.profileImage !== undefined && profile.profileImage !== null) payload.profileImage = profile.profileImage;
      await api.put("/users/profile", payload);
      toast.success(t('profile.profileUpdated'));
    } catch (error) {
      toast.error(t('profile.failedToUpdate'));
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading(t('profile.uploadingImage'));
    try {
      let uploadFile = file;
      try {
        const compressed = await compressImage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8,
          outputFormat: 'image/webp',
        });
        const savings = Math.round((1 - compressed.size / file.size) * 100);
        if (savings > 0) {
          toast.loading(`Compressed ${formatFileSize(file.size)} → ${formatFileSize(compressed.size)} (${savings}% smaller)`, { id: toastId });
        }
        uploadFile = compressed;
      } catch {
        uploadFile = file;
      }

      const formData = new FormData();
      formData.append("file", uploadFile);

      const res = await api.post("/users/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newImageUrl = res.data?.profileImage || res.data?.url;
      if (!newImageUrl) {
        throw new Error("No URL returned from upload");
      }
      setProfile((prev) => prev ? { ...prev, profileImage: newImageUrl } : null);
      toast.success(t('profile.imageUpdated'), { id: toastId });
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || t('profile.failedToUpload');
      toast.error(typeof msg === 'string' ? msg : t('profile.failedToUpload'), { id: toastId });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (password.length < 6) {
      return toast.error(t('profile.passwordMinLength'));
    }
    
    setUpdating(true);
    try {
      await updatePassword(user, password);
      toast.success(t('profile.passwordChanged'));
      setPassword("");
    } catch (error: any) {
      toast.error(error.message || t('profile.failedToChangePassword'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      t('profile.deleteConfirmTitle') + "\n\n" +
      t('profile.deleteConfirmMessage') + "\n\n" +
      "Type 'DELETE' in the next prompt to confirm."
    );
    if (!confirmed) return;

    const doubleConfirm = window.prompt(t('profile.deleteConfirmInput'));
    if (doubleConfirm !== 'DELETE') {
      toast.error(t('profile.deletionCancelled'));
      return;
    }

    if (!user) return;
    
    setUpdating(true);
    try {
      await api.delete("/users/profile");
      await signOut(auth);
      toast.success(t('profile.accountDeleted'));
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || t('profile.failedToDelete'));
      setUpdating(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!user) return;
    setSendingVerification(true);
    try {
      await sendEmailVerification(user);
      toast.success(t('profile.verificationSent'));
    } catch (error: any) {
      toast.error(error.message || t('profile.failedToSendVerification'));
    } finally {
      setSendingVerification(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('profile.title')}</h1>
      </div>

      <AnimatedSection className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('profile.personalInfo')}</h2>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-primary/10 overflow-hidden relative group border-4 border-white shadow-lg">
              {profile?.profileImage ? (
                <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <HiOutlineUser className="w-full h-full p-6 text-primary" />
              )}
              <div 
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <HiOutlineUpload className="text-white w-8 h-8" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium text-primary hover:text-primary-hover"
            >
              {t('profile.changePhoto')}
            </button>
          </div>

          <form onSubmit={handleUpdateInformation} className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.fullName')}</label>
                <input 
                  type="text" 
                  value={profile?.fullName || ""}
                  onChange={(e) => setProfile(prev => prev ? {...prev, fullName: e.target.value} : null)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.email')}</label>
                <input 
                  type="email" 
                  value={profile?.email || ""}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.phone')}</label>
                <input 
                  type="tel" 
                  value={profile?.phoneNumber || ""}
                  onChange={(e) => setProfile(prev => prev ? {...prev, phoneNumber: e.target.value} : null)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm placeholder-gray-400"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={updating}
                className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {updating ? t('profile.saving') : t('profile.saveChanges')}
              </button>
            </div>
          </form>
        </div>
      </AnimatedSection>
      
      {role === "worker" && (
         <AnimatedSection delay={0.05}>
           <WorkerProfileSettings />
         </AnimatedSection>
      )}

      <AnimatedSection delay={0.1} className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('profile.security')}</h2>
        
        <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.newPassword')}</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm placeholder-gray-400"
              placeholder={t('profile.passwordPlaceholder')}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={updating || password.length < 6}
            className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {t('profile.updatePassword')}
          </button>
        </form>
      </AnimatedSection>

      <AnimatedSection delay={0.15} className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('profile.emailVerification')}</h2>
        
        {emailVerified === null ? (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            <span className="text-sm">{t('profile.checkingStatus')}</span>
          </div>
        ) : emailVerified ? (
          <div className="flex items-center space-x-3">
            <HiOutlineCheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-700">{t('profile.emailVerified')}</p>
              <p className="text-xs text-gray-500">{profile?.email}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <HiOutlineExclamationCircle className="w-6 h-6 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-amber-700">{t('profile.emailNotVerified')}</p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSendVerificationEmail}
              disabled={sendingVerification}
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {sendingVerification ? t('profile.sending') : t('profile.sendVerification')}
            </button>
          </div>
        )}
      </AnimatedSection>
      
      <AnimatedSection delay={0.2} className="bg-white p-8 rounded-3xl border border-red-100 card-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-red-600 mb-1">{t('profile.deleteAccount')}</h2>
            <p className="text-gray-500 text-sm">{t('profile.deleteDesc') || 'Permanently delete your account and all associated data. This action cannot be undone.'}</p>
          </div>
          <button 
            onClick={handleDeleteAccount}
            disabled={updating}
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm shadow-red-200"
          >
            <HiOutlineTrash className="w-5 h-5" />
            <span>{updating ? t('profile.deleting') : t('profile.deleteAccount')}</span>
          </button>
        </div>
      </AnimatedSection>
    </div>
  );
}
