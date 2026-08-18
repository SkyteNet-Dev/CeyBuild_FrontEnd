"use client";

import { useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { HiCheckCircle, HiUsers, HiLightningBolt, HiShieldCheck, HiOutlineCurrencyDollar, HiOutlineCalendar, HiOutlineSearch, HiOutlineUserGroup, HiOutlineClipboardCheck, HiOutlineCreditCard } from "react-icons/hi";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

export default function AboutPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = `${t('about.title')} | CeyBuild`;
  }, [t]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-28 pb-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">About Us</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
              {t('about.title')}
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              {t('about.description')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatedSection delay={0.1}>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-8 sm:p-10 rounded-2xl border border-blue-100 h-full">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-5">
                  <HiOutlineSearch className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('about.mission')}</h2>
                <p className="text-gray-600 leading-relaxed">
                  {t('about.missionDesc')}
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-8 sm:p-10 rounded-2xl border border-orange-100 h-full">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white mb-5">
                  <HiLightningBolt className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('about.vision')}</h2>
                <p className="text-gray-600 leading-relaxed">
                  {t('about.visionDesc')}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How CeyBuild Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">{t('about.howItWorksTitle')}</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            {/* For Customers */}
            <AnimatedSection delay={0.1}>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 card-shadow h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <HiUsers className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{t('about.forCustomers')}</h3>
                </div>
                <ul className="space-y-3.5">
                  {[
                    t('about.customerSearch'),
                    t('about.customerProfile'),
                    t('about.customerCompare'),
                    t('about.customerBook'),
                    t('about.customerComm'),
                    t('about.customerReview'),
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <HiCheckCircle className="text-emerald-500 mt-0.5 shrink-0 w-5 h-5" />
                      <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            {/* For Workers */}
            <AnimatedSection delay={0.2}>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 card-shadow h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                    <HiLightningBolt className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{t('about.forWorkers')}</h3>
                </div>
                <ul className="space-y-3.5">
                  {[
                    t('about.workerProfile'),
                    t('about.workerPortfolio'),
                    t('about.workerBookings'),
                    t('about.workerManage'),
                    t('about.workerReputation'),
                    t('about.workerGrow'),
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <HiCheckCircle className="text-emerald-500 mt-0.5 shrink-0 w-5 h-5" />
                      <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Why Choose CeyBuild */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">{t('about.whyChooseUs')}</h2>
          </AnimatedSection>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: <HiShieldCheck className="w-6 h-6" />,
                gradient: "from-blue-500 to-blue-600",
                title: t('about.verifiedProfessionals'),
                desc: t('about.verifiedProfessionalsDesc'),
              },
              {
                icon: <HiOutlineCurrencyDollar className="w-6 h-6" />,
                gradient: "from-emerald-500 to-emerald-600",
                title: t('about.fastEfficient'),
                desc: t('about.fastEfficientDesc'),
              },
              {
                icon: <HiOutlineCalendar className="w-6 h-6" />,
                gradient: "from-violet-500 to-violet-600",
                title: t('about.communityDriven'),
                desc: t('about.communityDrivenDesc'),
              },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="bg-slate-50 rounded-2xl p-7 border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 h-full hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center mb-5 shadow-lg`}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-hover to-blue-700" />
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/15 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/3" />

              <div className="relative z-10 p-10 md:p-14 text-center text-white">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">{t('about.readyToStart')}</h2>
                <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                  {t('about.readyToStartDesc')}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-2 bg-white text-primary font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {t('about.findWorker')}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/auth/register?role=worker"
                    className="inline-flex items-center gap-2 bg-white/15 text-white font-bold text-lg px-8 py-4 rounded-2xl border border-white/25 hover:bg-white/25 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {t('about.becomeWorker')}
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
