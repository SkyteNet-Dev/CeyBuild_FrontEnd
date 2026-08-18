"use client";

import { useRouter } from "next/navigation";
import { HiStar, HiOutlineLocationMarker, HiCheckCircle } from "react-icons/hi";
import AvailabilityIndicator from "./AvailabilityIndicator";
import { useI18n } from "@/i18n/I18nProvider";

interface WorkerCardProps {
  worker: {
    id: string;
    user?: {
      fullName?: string;
      profileImage?: string;
    };
    category?: {
      name?: string;
    };
    district?: string;
    city?: string;
    hourlyRate?: number;
    verificationStatus?: string;
    rating?: number;
    availability?: boolean;
    workingHours?: any;
    isFeatured?: boolean;
    reviewsReceived?: any[];
  };
  index?: number;
}

export default function WorkerCard({ worker, index = 0 }: WorkerCardProps) {
  const router = useRouter();
  const { t } = useI18n();

  const reviewCount = worker.reviewsReceived?.length || 0;

  return (
    <div
      className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 cursor-pointer group hover:-translate-y-1"
      onClick={() => router.push(`/workers/${worker.id}`)}
    >
      {/* Featured badge */}
      {worker.isFeatured && (
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-3 py-1 mb-4 text-xs font-bold uppercase tracking-wider w-fit">
          <HiStar className="w-3 h-3 fill-amber-400" />
          Featured
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-4">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 ring-2 ring-gray-100 group-hover:ring-primary/20 transition-all duration-300">
          {worker.user?.profileImage ? (
            <img src={worker.user.profileImage} alt="Worker" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary font-bold bg-primary/10 text-lg">
              {worker.user?.fullName?.charAt(0) || "W"}
            </div>
          )}
          {worker.availability && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 flex items-center gap-1.5 truncate group-hover:text-primary transition-colors">
            {worker.user?.fullName}
            {worker.verificationStatus === "VERIFIED" && (
              <HiCheckCircle className="text-blue-500 shrink-0 w-4 h-4" title={t('home.verified')} />
            )}
          </h4>
          <p className="text-sm text-primary font-semibold truncate">{worker.category?.name || t('home.professional')}</p>
        </div>
      </div>

      {/* Availability */}
      <div className="mb-4 bg-slate-50 rounded-lg px-3 py-2">
        <AvailabilityIndicator 
          availability={worker.availability ?? true} 
          workingHours={worker.workingHours}
        />
      </div>

      {/* Info row */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1.5 font-medium">
          <HiStar className="text-amber-400 fill-amber-400 w-4 h-4" />
          <span className="text-gray-900 font-bold">{worker.rating || t('home.new')}</span>
          {reviewCount > 0 && (
            <span className="text-gray-400 text-xs">({reviewCount})</span>
          )}
        </span>
        <span className="flex items-center gap-1 truncate text-gray-500">
          <HiOutlineLocationMarker className="w-4 h-4 shrink-0" />
          <span className="truncate">{worker.district || worker.city}</span>
        </span>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <span className="font-extrabold text-gray-900 text-base">
          {worker.hourlyRate ? (
            <>{t('home.lkrPerHour', { rate: worker.hourlyRate })}</>
          ) : (
            <span className="text-sm text-gray-400 font-medium">{t('home.discussPricing')}</span>
          )}
        </span>
        <span className="text-primary font-semibold text-sm group-hover:underline flex items-center gap-1">
          {t('workers.viewProfile')}
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}
