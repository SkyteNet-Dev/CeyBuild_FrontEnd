"use client";

import { useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { HiOutlineMail, HiOutlinePhone, HiOutlineQuestionMarkCircle, HiOutlineBriefcase, HiOutlineCreditCard, HiOutlineExclamationCircle } from "react-icons/hi";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

export default function ContactPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = `${t('contact.title')} | CeyBuild`;
  }, [t]);

  const quickHelp = [
    {
      icon: <HiOutlineQuestionMarkCircle className="w-6 h-6" />,
      title: t('contact.helpBooking'),
      desc: t('contact.helpBookingDesc'),
      cta: t('contact.emailUs'),
      href: "mailto:infoceybuild@gmail.com?subject=Booking%20Help",
    },
    {
      icon: <HiOutlineBriefcase className="w-6 h-6" />,
      title: t('contact.helpWorker'),
      desc: t('contact.helpWorkerDesc'),
      cta: t('contact.registerNow'),
      href: "/auth/register?role=worker",
    },
    {
      icon: <HiOutlineCreditCard className="w-6 h-6" />,
      title: t('contact.helpPayment'),
      desc: t('contact.helpPaymentDesc'),
      cta: t('contact.contactSupport'),
      href: "mailto:infoceybuild@gmail.com?subject=Payment%20Issue",
    },
    {
      icon: <HiOutlineExclamationCircle className="w-6 h-6" />,
      title: t('contact.helpReport'),
      desc: t('contact.helpReportDesc'),
      cta: t('contact.reportIssue'),
      href: "mailto:infoceybuild@gmail.com?subject=Report%20Issue",
    },
  ];

  return (
    <div className="pt-24 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <AnimatedSection className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t('contact.title')}</h1>
          <p className="text-lg text-gray-600">
            {t('contact.description')}
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <AnimatedSection delay={0.1}>
            <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.getInTouch')}</h2>

              <div className="space-y-6">
                <a href="mailto:infoceybuild@gmail.com" className="flex items-start group">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm mr-4 shrink-0 group-hover:shadow-md transition-shadow">
                    <HiOutlineMail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('contact.emailSupport')}</h3>
                    <p className="text-primary group-hover:underline mt-1">infoceybuild@gmail.com</p>
                  </div>
                </a>

                <a href="tel:0722233196" className="flex items-start group">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm mr-4 shrink-0 group-hover:shadow-md transition-shadow">
                    <HiOutlinePhone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('contact.phoneSupport')}</h3>
                    <p className="text-primary group-hover:underline mt-1">072 223 3196</p>
                    <p className="text-sm text-gray-500 mt-1">{t('contact.businessHours')}</p>
                  </div>
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="mailto:infoceybuild@gmail.com"
                  className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-hover shadow-md hover:shadow-lg transition-all"
                >
                  <HiOutlineMail className="w-5 h-5" />
                  {t('contact.emailUs')}
                </a>
                <a
                  href="tel:0722233196"
                  className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-xl border border-primary/20 hover:bg-primary/5 transition-all"
                >
                  <HiOutlinePhone className="w-5 h-5" />
                  {t('contact.callUs')}
                </a>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.quickHelp')}</h2>
              <div className="space-y-5">
                {quickHelp.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                      <p className="text-gray-500 text-sm mt-0.5">{item.desc}</p>
                      <Link
                        href={item.href}
                        className="inline-block text-primary text-sm font-medium mt-2 hover:underline"
                      >
                        {item.cta} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection className="text-center bg-gray-50 rounded-3xl p-10 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">CeyBuild.com</h2>
          <p className="text-gray-600 mb-2">
            {t('contact.platformDesc')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-500">
            <a href="mailto:infoceybuild@gmail.com" className="hover:text-primary transition-colors">
              infoceybuild@gmail.com
            </a>
            <span>|</span>
            <a href="tel:0722233196" className="hover:text-primary transition-colors">
              072 223 3196
            </a>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
