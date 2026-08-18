"use client";

import Link from "next/link";
import {
  HiCheckCircle,
  HiOutlineLightningBolt,
  HiOutlineCog,
  HiOutlineSparkles,
  HiOutlineBriefcase,
  HiOutlineFire,
  HiOutlineClock,
  HiOutlineStar,
  HiOutlineUserGroup,
  HiOutlineTrendingUp,
  HiOutlineSearch,
  HiOutlineClipboardCheck,
  HiOutlineCreditCard,
} from "react-icons/hi";
import HeroSearch from "@/components/home/HeroSearch";
import AnimatedSection from "@/components/AnimatedSection";
import WorkerCard from "@/components/home/WorkerCard";
import SkeletonLoader from "@/components/home/SkeletonLoader";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();

  useEffect(() => {
    api.get("/categories/popular?limit=8").then(res => { setCategories(res.data); setCatLoading(false); }).catch(() => setCatLoading(false));
    api.get("/workers").then(res => { setAllWorkers(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const topRated = useMemo(() => {
    return [...allWorkers]
      .filter((w: any) => w.reviewsReceived?.length > 0)
      .map((w: any) => ({
        ...w,
        avgRating: w.reviewsReceived.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / w.reviewsReceived.length,
      }))
      .sort((a: any, b: any) => b.avgRating - a.avgRating)
      .slice(0, 4);
  }, [allWorkers]);

  const availableNow = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });
    const currentTime = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
    return allWorkers.filter((w: any) => {
      if (!w.availability || w.availability === false) return false;
      if (w.workingHours) {
        const today = w.workingHours[dayOfWeek];
        if (today && !today.available) return false;
        if (today && today.start && today.end) {
          if (currentTime < today.start || currentTime > today.end) return false;
        }
      }
      return true;
    }).slice(0, 4);
  }, [allWorkers]);

  const popular = useMemo(() => {
    return [...allWorkers]
      .filter((w: any) => w.reviewsReceived?.length > 0)
      .map((w: any) => ({ ...w, reviewCount: w.reviewsReceived.length }))
      .sort((a: any, b: any) => b.reviewCount - a.reviewCount)
      .slice(0, 4);
  }, [allWorkers]);

  const recentlyJoined = useMemo(() => {
    return [...allWorkers]
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 4);
  }, [allWorkers]);

  const fallbackIcons = [
    <HiOutlineLightningBolt className="w-6 h-6" key="1" />,
    <HiOutlineCog className="w-6 h-6" key="2" />,
    <HiOutlineSparkles className="w-6 h-6" key="3" />,
    <HiOutlineBriefcase className="w-6 h-6" key="4" />,
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 pb-12 sm:pb-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {user && (
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-primary font-semibold text-sm">
                  {t('home.welcomeBack', { name: user.displayName?.split(" ")[0] || "" }) || `Welcome back, ${user.displayName?.split(" ")[0] || "there"}!`}
                </p>
              </div>
            </AnimatedSection>
          )}

          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                {t('hero.badge') || "Find Skilled Workers Near You"}
              </h1>
              <p className="max-w-lg mx-auto text-base sm:text-lg text-gray-500 leading-relaxed mb-8">
                {t('hero.titleHighlight') || "Connect with verified professionals for all your home service needs"}
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <HeroSearch />
          </AnimatedSection>

          <AnimatedSection delay={0.3} className="mt-8">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { icon: <HiCheckCircle className="text-emerald-500 w-4 h-4 shrink-0" />, text: t('hero.verifiedPros') },
                { icon: <HiCheckCircle className="text-emerald-500 w-4 h-4 shrink-0" />, text: t('hero.instantBooking') },
                { icon: <HiCheckCircle className="text-emerald-500 w-4 h-4 shrink-0" />, text: t('hero.securePayments') },
              ].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 bg-white border border-gray-100 text-gray-600 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
                  {item.icon}
                  {item.text}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">{t('home.popularServices')}</h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">{t('home.popularServicesDesc')}</p>
          </AnimatedSection>

          {catLoading ? (
            <SkeletonLoader count={6} type="category" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat, idx) => (
                <AnimatedSection key={cat.id} delay={idx * 0.05}>
                  <div
                    onClick={() => router.push(`/search?category=${cat.id}`)}
                    className="cursor-pointer group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 hover:border-primary/20 card-shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      {fallbackIcons[idx % fallbackIcons.length]}
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors mb-1">{cat.name}</h3>
                    {cat._count?.workers > 0 && (
                      <p className="text-xs text-gray-400 font-medium">
                        {cat._count.workers} {t('home.workers') || "workers"}
                      </p>
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/services" className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-bold transition-all group">
              {t('home.viewAll')}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Available Now */}
      {availableNow.length > 0 && (
        <section className="py-16 sm:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="mb-8 sm:mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">{t('home.availableNow') || "Available Right Now"}</h2>
                    <p className="text-gray-500 text-sm hidden sm:block">{t('home.availableNowDesc') || "Workers ready to start immediately"}</p>
                  </div>
                </div>
                <Link href="/search" className="hidden sm:inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/30 font-semibold px-4 py-2 rounded-xl transition-all text-sm shrink-0">
                  {t('home.viewAll')}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableNow.map((worker: any, idx: number) => (
                <AnimatedSection key={worker.id} delay={idx * 0.08}>
                  <WorkerCard worker={worker} index={idx} />
                </AnimatedSection>
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link href="/search" className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/30 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
                {t('home.viewAll')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">{t('home.howItWorks')}</h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">{t('home.howItWorksDesc')}</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
            {[
              { num: "1", icon: <HiOutlineSearch className="w-5 h-5" />, title: t('home.step1Title'), desc: t('home.step1Desc'), color: "bg-blue-500" },
              { num: "2", icon: <HiOutlineUserGroup className="w-5 h-5" />, title: t('home.step2Title'), desc: t('home.step2Desc'), color: "bg-emerald-500" },
              { num: "3", icon: <HiOutlineClipboardCheck className="w-5 h-5" />, title: t('home.step3Title'), desc: t('home.step3Desc'), color: "bg-amber-500" },
              { num: "4", icon: <HiOutlineCreditCard className="w-5 h-5" />, title: t('home.step4Title') || "Get it Done", desc: t('home.step4Desc') || "The expert arrives. Pay securely after completion.", color: "bg-violet-500" },
            ].map((step, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="text-center group">
                  <div className="relative inline-flex mb-5">
                    <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {step.icon}
                    </div>
                    <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 ${step.color} rounded-lg shadow flex items-center justify-center text-[10px] font-extrabold text-white ring-2 ring-white`}>
                      {step.num}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Workers */}
      {topRated.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="mb-8 sm:mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
                    <HiOutlineStar className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">{t('home.topRated') || "Top Rated Workers"}</h2>
                    <p className="text-gray-500 text-sm hidden sm:block">{t('home.topRatedDesc') || "Highest rated professionals in our community"}</p>
                  </div>
                </div>
                <Link href="/search" className="hidden sm:inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/30 font-semibold px-4 py-2 rounded-xl transition-all text-sm shrink-0">
                  {t('home.viewAll')}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topRated.map((worker: any, idx: number) => (
                <AnimatedSection key={worker.id} delay={idx * 0.08}>
                  <WorkerCard worker={worker} index={idx} />
                </AnimatedSection>
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link href="/search" className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/30 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
                {t('home.viewAll')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Get Free Quotes */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-white to-accent/5 border border-primary/10 p-6 sm:p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10">
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
                    {t('home.getFreeQuotesTitle') || 'Need Work Done? Get Free Quotes!'}
                  </h2>
                  <p className="text-gray-500 text-base sm:text-lg mb-6 leading-relaxed">
                    {t('home.getFreeQuotesDesc') || 'Post your job and receive quotes from verified skilled workers. Compare, choose, and get the best deal.'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm font-medium text-gray-600 mb-6">
                    {[
                      { icon: <HiCheckCircle className="text-emerald-500 w-4 h-4" />, text: t('home.flow.post') || "Post Your Job" },
                      { icon: <HiCheckCircle className="text-emerald-500 w-4 h-4" />, text: t('home.flow.receive') || "Receive Quotes" },
                      { icon: <HiCheckCircle className="text-emerald-500 w-4 h-4" />, text: t('home.flow.compare') || "Compare Workers" },
                      { icon: <HiCheckCircle className="text-emerald-500 w-4 h-4" />, text: t('home.flow.pay') || "Pay Securely" },
                    ].map((item, i) => (
                      <span key={i} className="flex items-center gap-2">
                        {item.icon}
                        {item.text}
                      </span>
                    ))}
                  </div>
                  <Link
                    href="/dashboard/job-requests/new"
                    className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all duration-300"
                  >
                    {t('home.getFreeQuotesButton') || 'Get Free Quotes'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="hidden md:flex items-center justify-center w-40 h-40 bg-primary/5 rounded-2xl shrink-0">
                  <div className="text-5xl">🏠</div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Why Choose CeyBuild */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">{t('home.whyChooseTitle') || "Why Choose CeyBuild?"}</h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">{t('home.whyChooseDesc') || "Everything you need for reliable home services"}</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <HiOutlineUserGroup className="w-5 h-5" />, color: "bg-blue-500", title: t('home.trust.skilled') || "Skilled Professionals", desc: t('home.trust.skilledDesc') || "Browse profiles, portfolios, and ratings of skilled workers." },
              { icon: <HiOutlineSparkles className="w-5 h-5" />, color: "bg-amber-500", title: t('home.trust.transparent') || "Transparent Process", desc: t('home.trust.transparentDesc') || "Clear pricing, booking details, and status updates at every step." },
              { icon: <HiOutlineCog className="w-5 h-5" />, color: "bg-emerald-500", title: t('home.trust.secure') || "Secure Payments", desc: t('home.trust.secureDesc') || "Payments processed securely through PayHere with server-side verification." },
              { icon: <HiOutlineStar className="w-5 h-5" />, color: "bg-rose-500", title: t('home.trust.reviews') || "Ratings & Reviews", desc: t('home.trust.reviewsDesc') || "Read honest reviews from other customers before booking." },
              { icon: <HiOutlineBriefcase className="w-5 h-5" />, color: "bg-violet-500", title: t('home.trust.management') || "Easy Management", desc: t('home.trust.managementDesc') || "Track, manage, and communicate all in one place." },
              { icon: <HiOutlineLightningBolt className="w-5 h-5" />, color: "bg-orange-500", title: t('home.trust.support') || "Fast Support", desc: t('home.trust.supportDesc') || "Get help when you need it via email or phone." },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.06}>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 card-shadow hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
                  <div className={`w-10 h-10 rounded-xl ${item.color} text-white flex items-center justify-center mb-4`}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Workers */}
      {popular.length > 0 && (
        <section className="py-16 sm:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="mb-8 sm:mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white shrink-0">
                    <HiOutlineFire className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">{t('home.popularWorkers') || "Most Popular Workers"}</h2>
                    <p className="text-gray-500 text-sm hidden sm:block">{t('home.popularWorkersDesc') || "Workers with the most bookings and reviews"}</p>
                  </div>
                </div>
                <Link href="/search" className="hidden sm:inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/30 font-semibold px-4 py-2 rounded-xl transition-all text-sm shrink-0">
                  {t('home.viewAll')}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popular.map((worker: any, idx: number) => (
                <AnimatedSection key={worker.id} delay={idx * 0.08}>
                  <WorkerCard worker={worker} index={idx} />
                </AnimatedSection>
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link href="/search" className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/30 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
                {t('home.viewAll')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recently Joined */}
      {recentlyJoined.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="mb-8 sm:mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shrink-0">
                    <HiOutlineTrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">{t('home.recentlyJoined') || "Recently Joined"}</h2>
                    <p className="text-gray-500 text-sm hidden sm:block">{t('home.recentlyJoinedDesc') || "Welcome our newest skilled professionals"}</p>
                  </div>
                </div>
                <Link href="/search" className="hidden sm:inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/30 font-semibold px-4 py-2 rounded-xl transition-all text-sm shrink-0">
                  {t('home.viewAll')}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentlyJoined.map((worker: any, idx: number) => (
                <AnimatedSection key={worker.id} delay={idx * 0.08}>
                  <WorkerCard worker={worker} index={idx} />
                </AnimatedSection>
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link href="/search" className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/30 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
                {t('home.viewAll')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Worker CTA */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-hover to-blue-700" />
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/15 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/3" />

              <div className="relative z-10 p-8 sm:p-10 md:p-14 text-center text-white">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 leading-tight">{t('home.ctaTitle')}</h2>
                <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8 max-w-xl mx-auto">
                  {t('home.ctaDesc')}
                </p>
                <Link
                  href="/auth/register?role=worker"
                  className="inline-flex items-center gap-2 bg-white text-primary font-bold text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {t('home.ctaButton')}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
