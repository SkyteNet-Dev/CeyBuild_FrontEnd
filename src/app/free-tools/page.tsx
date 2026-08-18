"use client";

import { useEffect } from "react";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { useI18n } from "@/i18n/I18nProvider";
import {
  HiOutlineCalculator,
  HiOutlineColorSwatch,
  HiOutlineViewGridAdd,
  HiOutlineCube,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";

export default function FreeToolsPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = "Free Construction Calculators | CeyBuild";
  }, []);

  const tools = [
    {
      icon: <HiOutlineColorSwatch className="w-8 h-8" />,
      title: t("freeTools.paint.title") || "Paint Calculator",
      desc:
        t("freeTools.paint.desc") ||
        "Calculate how much paint you need for your walls. Enter dimensions, doors, windows, and coats.",
      href: "/free-tools/paint-calculator",
      color: "bg-blue-50 text-blue-600",
      cta: t("freeTools.paint.cta") || "Find a Painter",
      ctaHref: "/search?category=painting",
    },
    {
      icon: <HiOutlineViewGridAdd className="w-8 h-8" />,
      title: t("freeTools.tile.title") || "Tile Calculator",
      desc:
        t("freeTools.tile.desc") ||
        "Find out how many tiles you need for your floor. Supports any tile size with wastage.",
      href: "/free-tools/tile-calculator",
      color: "bg-emerald-50 text-emerald-600",
      cta: t("freeTools.tile.cta") || "Find a Tiler",
      ctaHref: "/search?category=tiling",
    },
    {
      icon: <HiOutlineCube className="w-8 h-8" />,
      title: t("freeTools.cement.title") || "Cement Calculator",
      desc:
        t("freeTools.cement.desc") ||
        "Calculate cement and sand quantities for your mix ratio. Supports standard Sri Lankan mixes.",
      href: "/free-tools/cement-calculator",
      color: "bg-amber-50 text-amber-600",
      cta: t("freeTools.cement.cta") || "Find a Mason",
      ctaHref: "/search?category=masonry",
    },
    {
      icon: <HiOutlineCalculator className="w-8 h-8" />,
      title: t("freeTools.concrete.title") || "Concrete Calculator",
      desc:
        t("freeTools.concrete.desc") ||
        "Estimate cement, sand, and aggregate for your concrete pour. Choose from standard mix ratios.",
      href: "/free-tools/concrete-calculator",
      color: "bg-violet-50 text-violet-600",
      cta: t("freeTools.concrete.cta") || "Find a Professional",
      ctaHref: "/search",
    },
    {
      icon: <HiOutlineCurrencyDollar className="w-8 h-8" />,
      title: t("freeTools.cost.title") || "Construction Cost Calculator",
      desc:
        t("freeTools.cost.desc") ||
        "Estimate total project cost including materials, labour, and additional expenses. Edit unit prices.",
      href: "/free-tools/construction-cost-calculator",
      color: "bg-rose-50 text-rose-600",
      cta: t("freeTools.cost.cta") || "Find a Professional",
      ctaHref: "/search",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-hover py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <span className="inline-block text-sm font-bold text-white/80 uppercase tracking-wider mb-3">
              {t("freeTools.badge") || "100% Free"}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t("freeTools.heroTitle") || "Free Construction Calculators"}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {t("freeTools.heroDesc") ||
                "Use our professional calculators to estimate materials, costs, and quantities for your home projects. Built for Sri Lankan construction standards."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Calculator Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, i) => (
              <AnimatedSection key={tool.href} delay={i * 0.08}>
                <div className="bg-white rounded-2xl border border-gray-100 card-shadow hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 h-full flex flex-col p-7">
                  <div
                    className={`w-14 h-14 ${tool.color} rounded-xl flex items-center justify-center mb-5`}
                  >
                    {tool.icon}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {tool.title}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                    {tool.desc}
                  </p>
                  <Link
                    href={tool.href}
                    className="inline-block bg-primary text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-primary-hover transition-colors text-center"
                  >
                    {t("freeTools.calculateNow") || "Calculate Now"} →
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-bold text-amber-800 mb-2">
                {t("freeTools.disclaimerTitle") || "Important Note"}
              </h3>
              <p className="text-amber-700 text-sm leading-relaxed">
                {t("freeTools.disclaimerDesc") ||
                  "These calculators provide estimates based on standard formulas and assumptions. Actual quantities may vary depending on paint brand, surface condition, tile layout, mix quality, and local market prices. Always consult a qualified professional for load-bearing or structural work."}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
