"use client";

import { useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { useAuth } from "@/contexts/AuthContext";
import { HiOutlineUser, HiOutlineCog, HiOutlineInformationCircle } from "react-icons/hi";
import { useI18n } from "@/i18n/I18nProvider";

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [platformInfo] = useState({ name: "CeyBuild", version: "1.0.0" });
  const [emailNotifications, setEmailNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('emailNotifications');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [pushNotifications, setPushNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pushNotifications');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('settings.title')}</h1>
      </div>

      <AnimatedSection className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <HiOutlineUser className="text-primary" /> {t('settings.accountInfo')}
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">{t('settings.email')}</span>
            <span className="text-sm font-medium text-gray-900">{user?.email || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">{t('settings.userId')}</span>
            <span className="text-sm font-mono text-gray-600">{user?.uid?.slice(0, 16)}...</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">{t('settings.status')}</span>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">{t('settings.active')}</span>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <HiOutlineInformationCircle className="text-primary" /> {t('settings.platformInfo')}
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">{t('settings.platformName')}</span>
            <span className="text-sm font-medium text-gray-900">{platformInfo.name}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">{t('settings.version')}</span>
            <span className="text-sm font-medium text-gray-900">{platformInfo.version}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">{t('settings.apiStatus')}</span>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">{t('settings.connected')}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">{t('settings.support')}</span>
            <span className="text-sm text-primary">support@ceybuild.com</span>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.2} className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <HiOutlineCog className="text-primary" /> {t('settings.preferences')}
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">{t('settings.emailNotifications')}</p>
              <p className="text-xs text-gray-500">{t('settings.emailNotificationsDesc')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => {
                  setEmailNotifications(e.target.checked);
                  localStorage.setItem('emailNotifications', JSON.stringify(e.target.checked));
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{t('settings.pushNotifications')}</p>
              <p className="text-xs text-gray-500">{t('settings.pushNotificationsDesc')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => {
                  setPushNotifications(e.target.checked);
                  localStorage.setItem('pushNotifications', JSON.stringify(e.target.checked));
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
