"use client";

import { useEffect, useState } from "react";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";
import api from "@/lib/axios";
import { useI18n } from "@/i18n/I18nProvider";

type ProfileSections = {
  profileImage: boolean;
  portfolio: boolean;
  experience: boolean;
  skills: boolean;
  certificates: boolean;
  description: boolean;
};

type ProfileStrengthData = {
  strength: number;
  sections: ProfileSections;
};

export default function ProfileStrength() {
  const { t } = useI18n();
  const SECTION_LABELS: Record<keyof ProfileSections, string> = {
    profileImage: t('profileStrength.profilePhoto'),
    portfolio: t('profileStrength.portfolioImages'),
    experience: t('profileStrength.experience'),
    skills: t('profileStrength.skills'),
    certificates: t('profileStrength.certificates'),
    description: t('profileStrength.description'),
  };
  const [data, setData] = useState<ProfileStrengthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStrength = async () => {
      try {
        const res = await api.get("/workers/profile/strength");
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch profile strength:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStrength();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!data) return null;

  const { strength, sections } = data;

  const getColor = () => {
    if (strength === 100) return { bar: "bg-green-500", text: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    if (strength >= 60) return { bar: "bg-primary", text: "text-primary", bg: "bg-primary/5", border: "border-primary/20" };
    if (strength >= 30) return { bar: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
    return { bar: "bg-red-500", text: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
  };

  const colors = getColor();

  return (
    <div className={`bg-white p-6 rounded-3xl border ${colors.border} card-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">{t('profileStrength.title')}</h3>
        <span className={`text-2xl font-bold ${colors.text}`}>{strength}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
          style={{ width: `${strength}%` }}
        />
      </div>

      {strength === 100 ? (
        <p className="text-sm text-green-600 font-medium mb-4">
          {t('profileStrength.complete')}
        </p>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          {t('profileStrength.incomplete')}
        </p>
      )}

      {/* Section Checklist */}
      <div className="space-y-2">
        {(Object.keys(sections) as (keyof ProfileSections)[]).map((key) => (
          <div key={key} className="flex items-center gap-2">
            {sections[key] ? (
              <HiOutlineCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            ) : (
              <HiOutlineXCircle className="w-4 h-4 text-gray-300 shrink-0" />
            )}
            <span className={`text-sm ${sections[key] ? "text-gray-700" : "text-gray-400"}`}>
              {SECTION_LABELS[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
