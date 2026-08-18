"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { HiOutlineUser, HiOutlineLocationMarker } from "react-icons/hi";
import { useI18n } from "@/i18n/I18nProvider";

type Worker = {
  id: string;
  userId: string;
  description: string;
  skills: string[];
  district: string;
  city: string;
  hourlyRate?: number;
  verificationStatus: string;
  user: {
    id: string;
    fullName: string;
    profileImage?: string;
  };
  category?: {
    name: string;
  };
};

export default function SavedWorkersPage() {
  const [savedWorkers, setSavedWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    const fetchSavedWorkers = async () => {
      try {
        const res = await api.get("/saved-workers");
        // The API returns an array of SavedWorker records, which include the worker object
        setSavedWorkers(res.data.map((item: any) => item.worker));
      } catch (error) {
        toast.error(t('saved.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };

    fetchSavedWorkers();
  }, [t]);

  const removeWorker = async (id: string) => {
    try {
      await api.delete(`/saved-workers/${id}`);
      setSavedWorkers((prev) => prev.filter((w) => w.id !== id));
      toast.success(t('saved.workerRemoved'));
    } catch (error) {
      toast.error('Failed to remove worker');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('saved.title')}</h1>
        <p className="text-gray-500 mt-2">{t('saved.description')}</p>
      </div>

      {savedWorkers.length === 0 ? (
        <AnimatedSection>
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 card-shadow">
            <HiOutlineUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('saved.noSaved')}</h3>
            <p className="text-gray-500 mb-4">{t('saved.noSavedDesc')}</p>
            <Link
              href="/search"
              className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
            >
              {t('saved.browseWorkers')}
            </Link>
          </div>
        </AnimatedSection>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {savedWorkers.map((worker, idx) => (
            <AnimatedSection key={worker.id} delay={idx * 0.1}>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-xl">
                        {worker.user.fullName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{worker.user.fullName}</h4>
                      <p className="text-sm text-primary font-medium">{worker.category?.name || "General"}</p>
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <HiOutlineLocationMarker className="w-4 h-4 mr-1" />
                        {worker.city}, {worker.district}
                      </div>
                      {worker.hourlyRate && (
                        <p className="text-sm text-gray-600 mt-1">
                          LKR {worker.hourlyRate}/hr
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeWorker(worker.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                  >
                    {t('saved.remove')}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-4 line-clamp-2">{worker.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {worker.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={`/workers/${worker.id}`}
                    className="text-primary font-medium text-sm hover:text-primary/80 transition-colors"
                  >
                    {t('saved.viewProfile')} &rarr;
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      )}
    </div>
  );
}
