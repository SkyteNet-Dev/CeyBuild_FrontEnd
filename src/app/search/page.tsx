"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useMemo } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { HiOutlineFilter, HiStar, HiOutlineLocationMarker, HiCheckCircle } from "react-icons/hi";
import api from "@/lib/axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/I18nProvider";

const PROVINCES = [
  "Western", "Central", "Southern", "Northern", "Eastern",
  "North Western", "North Central", "Uva", "Sabaragamuwa"
];

const DISTRICTS: Record<string, string[]> = {
  "Western": ["Colombo", "Gampaha", "Kalutara"],
  "Central": ["Kandy", "Matale", "Nuwara Eliya"],
  "Southern": ["Galle", "Matara", "Hambantota"],
  "Northern": ["Jaffna", "Kilinochchi", "Mullaitivu", "Vavuniya", "Mannar"],
  "Eastern": ["Batticaloa", "Ampara", "Trincomalee"],
  "North Western": ["Kurunegala", "Puttalam"],
  "North Central": ["Anuradhapura", "Polonnaruwa"],
  "Uva": ["Badulla", "Monaragala"],
  "Sabaragamuwa": ["Ratnapura", "Kegalle"],
};

type Category = { id: string; name: string };
type Worker = {
  id: string;
  userId: string;
  category: { id: string, name: string };
  user: { fullName: string; profileImage?: string };
  district: string;
  city: string;
  experienceYears: number;
  hourlyRate: number;
  verificationStatus: string;
  rating?: number;
  reviewsCount?: number;
};

function SearchContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();

  useEffect(() => {
    document.title = t('seo.searchTitle') + " | CeyBuild";
  }, [t]);
  const initCategoryId = searchParams.get("category") || "";
  const initDistrict = searchParams.get("district") || "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(initCategoryId);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState(initDistrict);
  const [city, setCity] = useState("");
  
  const availableDistricts = DISTRICTS[province] || [];
  
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("highest_rated");
  
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Categories
  useEffect(() => {
    api.get("/categories").then(res => {
      setCategories(res.data);
    }).catch(() => {
       toast.error(t('search.failedToLoadCategories'));
    });
  }, []);

  // Fetch Workers
  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (categoryId) params.category = categoryId;
        if (province) params.province = province;
        if (district) params.district = district;
        if (city) params.city = city;

        const res = await api.get("/workers", { params });
        setWorkers(res.data);
      } catch (error) {
        toast.error(t('search.failedToLoadWorkers'));
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, [categoryId, province, district, city]);


  // Post-filtering & Sorting
  const filteredAndSortedWorkers = useMemo(() => {
    let result = [...workers];
    
    // Client-side filter: verified
    if (verifiedOnly) {
      result = result.filter(w => w.verificationStatus === "VERIFIED");
    }

    // Client-side sort
    result.sort((a, b) => {
      const aRating = a.rating || 0;
      const bRating = b.rating || 0;
      const aPrice = a.hourlyRate || 0;
      const bPrice = b.hourlyRate || 0;
      const aExp = a.experienceYears || 0;
      const bExp = b.experienceYears || 0;

      switch (sortBy) {
        case "lowest_price": return aPrice - bPrice;
        case "experienced": return bExp - aExp;
        case "highest_rated": 
        default:
          return bRating - aRating;
      }
    });

    return result;
  }, [workers, verifiedOnly, sortBy]);

  const handleReset = () => {
    setCategoryId("");
    setProvince("");
    setDistrict("");
    setCity("");
    setVerifiedOnly(false);
    setSortBy("highest_rated");
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className="lg:w-1/4 relative">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><HiOutlineFilter /> {t('search.filters')}</h2>
                <button onClick={handleReset} className="text-sm text-primary hover:underline">{t('search.reset')}</button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t('search.category')}</h3>
                  <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                  >
                    <option value="">{t('search.allCategories')}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t('search.province')}</h3>
                  <select 
                    value={province} 
                    onChange={(e) => { setProvince(e.target.value); setDistrict(""); setCity(""); }}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                  >
                    <option value="">{t('search.allProvinces')}</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t('search.district')}</h3>
                  <select 
                    value={district} 
                    onChange={(e) => { setDistrict(e.target.value); setCity(""); }}
                    disabled={!province}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm disabled:opacity-50"
                  >
                    <option value="">{t('search.allDistricts')}</option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {district && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t('search.city')}</h3>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={t('search.enterCity')}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                    />
                  </div>
                )}
                
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="rounded text-primary focus:ring-primary w-4 h-4" 
                    />
                    <span className="text-sm text-gray-700 font-medium">{t('search.verifiedOnly')}</span>
                  </label>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t('search.sortBy')}</h3>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                  >
                    <option value="highest_rated">{t('search.highestRated')}</option>
                    <option value="lowest_price">{t('search.lowestPrice')}</option>
                    <option value="experienced">{t('search.mostExperienced')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="lg:w-3/4">
            <AnimatedSection>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">{t('search.title')}</h1>
              <p className="text-gray-600 mb-8">
                {loading ? t('search.searching') : t('search.showingResults', { count: filteredAndSortedWorkers.length })}
              </p>
            </AnimatedSection>
            
            {loading ? (
              <div className="space-y-6">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse bg-white p-6 rounded-3xl border border-gray-100 flex gap-6">
                     <div className="w-24 h-24 bg-gray-200 rounded-2xl"></div>
                     <div className="flex-1 space-y-4 py-2">
                       <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                       <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                     </div>
                  </div>
                ))}
              </div>
            ) : filteredAndSortedWorkers.length === 0 ? (
               <div className="bg-white p-12 text-center rounded-3xl border border-gray-100">
                  <p className="text-xl text-gray-500 font-medium">{t('search.noResults')}</p>
                  <button onClick={handleReset} className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-hover">{t('search.clearFilters')}</button>
               </div>
            ) : (
              <div className="space-y-6">
                {filteredAndSortedWorkers.map((worker, idx) => (
                  <AnimatedSection key={worker.id} delay={idx * 0.1}>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow hover:border-primary/20 transition-all flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                      <div className="w-24 h-24 bg-gray-100 rounded-2xl shrink-0 overflow-hidden relative shadow-sm border border-gray-100/50">
                        {worker.user?.profileImage ? (
                          <img src={worker.user.profileImage} alt={worker.user.fullName} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-primary text-3xl font-bold bg-primary/5">
                             {worker.user?.fullName?.charAt(0) || "W"}
                           </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{worker.user?.fullName || t('workerProfilePage.namePending')}</h3>
                          {worker.verificationStatus === "VERIFIED" && <HiCheckCircle className="text-green-500 text-lg" title={t('home.verified')} />}
                        </div>
                        <p className="text-primary font-medium mb-3">{worker.category?.name || t('home.professional')}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 flex-wrap">
                          <span className="flex items-center gap-1"><HiOutlineLocationMarker /> {worker.city ? `${worker.city}, ` : ''}{worker.district}</span>
                          <span className="flex items-center gap-1 text-orange-500 font-medium"><HiStar /> {worker.rating || t('home.new')} ({worker.reviewsCount || 0})</span>
                          <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-700">{worker.experienceYears} {t('search.yearsExp')}</span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className="text-2xl font-bold text-gray-900 mb-4">{worker.hourlyRate ? `LKR ${worker.hourlyRate}/Hr` : t('search.discuss')}</p>
                        <Link href={`/workers/${worker.id}`} className="block text-center w-full sm:w-auto px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg hover:shadow-xl shadow-primary/30 transition-all">
                          {t('search.viewProfile')}
                        </Link>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-xl">{t('search.loading')}</div>}>
      <SearchContent />
    </Suspense>
  );
}
