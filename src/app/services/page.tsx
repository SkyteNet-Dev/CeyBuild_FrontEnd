"use client";

import { useEffect, useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import Link from "next/link";
import api from "@/lib/axios";
import {
  HiOutlineLightningBolt,
  HiOutlineCog,
  HiOutlineSparkles,
  HiOutlineBriefcase,
  HiOutlineHome,
  HiOutlineVideoCamera,
} from "react-icons/hi";
import { MdFormatPaint } from "react-icons/md";
import { useI18n } from "@/i18n/I18nProvider";

const FALLBACK_ICONS: Record<string, React.ReactNode> = {
  electrician: <HiOutlineLightningBolt className="w-10 h-10" />,
  plumber: <HiOutlineCog className="w-10 h-10" />,
  painter: <MdFormatPaint className="w-10 h-10" />,
  carpenter: <HiOutlineBriefcase className="w-10 h-10" />,
  mason: <HiOutlineHome className="w-10 h-10" />,
  cleaning: <HiOutlineSparkles className="w-10 h-10" />,
  "ac-repair": <HiOutlineCog className="w-10 h-10" />,
  cctv: <HiOutlineVideoCamera className="w-10 h-10" />,
  default: <HiOutlineCog className="w-10 h-10" />,
};

type Category = {
  id: string;
  name: string;
  slug?: string;
  _count?: { workers: number };
};

export default function ServicesPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `${t('services.title')} | CeyBuild`;
    api.get("/categories/popular?limit=20")
      .then((res) => setCategories(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [t]);

  const getDesc = (slug: string): string => {
    const descMap: Record<string, string> = {
      electrician: t('services.electricianDesc'),
      plumber: t('services.plumberDesc'),
      painter: t('services.painterDesc'),
      carpenter: t('services.carpenterDesc'),
      mason: t('services.masonDesc'),
      cleaning: t('services.cleaningDesc'),
      "ac-repair": t('services.acTechnicianDesc'),
      cctv: t('services.cctvInstallerDesc'),
    };
    return descMap[slug] || "";
  };

  return (
    <div className="pt-20 pb-24 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <AnimatedSection className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t('services.title')}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('services.description')}
          </p>
        </AnimatedSection>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center card-shadow border border-gray-100 h-64 flex items-center justify-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {categories.map((cat, idx) => {
              const slug = cat.slug || cat.id;
              const icon = FALLBACK_ICONS[slug] || FALLBACK_ICONS.default;
              const desc = getDesc(slug);

              return (
                <AnimatedSection key={cat.id} delay={idx * 0.05}>
                  <Link href={`/search?category=${cat.id}`} className="block group">
                    <div className="bg-white rounded-2xl p-6 text-center card-shadow border border-gray-100 hover:border-primary/20 transition-all h-full">
                      <div className="w-20 h-20 mx-auto bg-primary/5 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors mb-6">
                        {icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3">
                        {desc}
                      </p>
                      {cat._count && cat._count.workers > 0 && (
                        <p className="text-xs text-gray-400">
                          {cat._count.workers} {cat._count.workers !== 1 ? t('services.workersAvailablePlural') : t('services.workersAvailable')}
                        </p>
                      )}
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        )}

        {!loading && categories.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">{t('services.noCategories')}</p>
            <Link href="/search" className="inline-block mt-4 text-primary font-semibold hover:underline">
              {t('services.browseAll')} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
