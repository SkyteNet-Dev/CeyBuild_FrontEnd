"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { useI18n } from "@/i18n/I18nProvider";

export default function ConcreteCalculatorPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = "Concrete Calculator | CeyBuild";
  }, []);

  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [mixType, setMixType] = useState("M20");
  const [wastage, setWastage] = useState("5");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const mixes: Record<string, { label: string; c: number; s: number; a: number; ratio: string }> = {
    M5: { label: "M5 (1:5:10)", c: 1, s: 5, a: 10, ratio: "1:5:10" },
    M7_5: { label: "M7.5 (1:4:8)", c: 1, s: 4, a: 8, ratio: "1:4:8" },
    M10: { label: "M10 (1:3:6)", c: 1, s: 3, a: 6, ratio: "1:3:6" },
    M15: { label: "M15 (1:2:4)", c: 1, s: 2, a: 4, ratio: "1:2:4" },
    M20: { label: "M20 (1:1.5:3)", c: 1, s: 1.5, a: 3, ratio: "1:1.5:3" },
    M25: { label: "M25 (1:1:2)", c: 1, s: 1, a: 2, ratio: "1:1:2" },
  };

  const calculate = () => {
    setError("");
    setResult(null);

    const l = parseFloat(length);
    const w = parseFloat(width);
    const d = parseFloat(depth);
    const wst = parseFloat(wastage) || 0;

    if (!l || l <= 0) {
      setError("Length must be greater than 0");
      return;
    }
    if (!w || w <= 0) {
      setError("Width must be greater than 0");
      return;
    }
    if (!d || d <= 0) {
      setError("Depth must be greater than 0");
      return;
    }

    const wetVolume = l * w * d;
    const mix = mixes[mixType];
    const totalParts = mix.c + mix.s + mix.a;
    const dryVolume = wetVolume * 1.54;
    const cementVol = (dryVolume * mix.c) / totalParts;
    const sandVol = (dryVolume * mix.s) / totalParts;
    const aggVol = (dryVolume * mix.a) / totalParts;
    const cementKg = cementVol * 1440;
    const cementBags = cementKg / 50;
    const cementBagsWastage = Math.ceil(cementBags * (1 + wst / 100));
    const sandTonnes = (sandVol * 1600) / 1000;
    const aggTonnes = (aggVol * 1500) / 1000;

    setResult({
      wetVolume: wetVolume.toFixed(3),
      dryVolume: dryVolume.toFixed(3),
      mix,
      totalParts,
      cementVol: cementVol.toFixed(3),
      sandVol: sandVol.toFixed(3),
      aggVol: aggVol.toFixed(3),
      cementKg: cementKg.toFixed(1),
      cementBags: cementBags.toFixed(1),
      cementBagsWastage,
      sandTonnes: sandTonnes.toFixed(2),
      aggTonnes: aggTonnes.toFixed(2),
      assumptions: {
        dryVolumeFactor: 1.54,
        cementDensity: 1440,
        sandDensity: 1600,
        aggDensity: 1500,
        wastage: wst,
        mixType,
      },
    });
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const hintClass = "text-xs text-gray-400 mt-1";

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-violet-600 to-violet-700 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <Link
              href="/free-tools"
              className="inline-block text-sm text-white/70 hover:text-white mb-4 transition-colors"
            >
              ← {t("freeTools.backToTools") || "Back to Free Tools"}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              🏗️ {t("freeTools.concrete.title") || "Concrete Calculator"}
            </h1>
            <p className="text-white/80 text-lg">
              {t("freeTools.concrete.heroDesc") ||
                "Estimate cement, sand, and aggregate for your concrete pour"}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <AnimatedSection>
              <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  {t("freeTools.concrete.inputs") || "Pour Dimensions"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.concrete.mixGrade") || "Concrete Mix / Grade"}
                    </label>
                    <select
                      value={mixType}
                      onChange={(e) => setMixType(e.target.value)}
                      className={inputClass}
                    >
                      {Object.entries(mixes).map(([key, m]) => (
                        <option key={key} value={key}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <p className={hintClass}>
                      {t("freeTools.concrete.mixHint") ||
                        "M20 (1:1.5:3) is most common for slabs and footings"}
                    </p>
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.concrete.length") || "Length (m)"}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="e.g. 5.0"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.concrete.width") || "Width (m)"}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder="e.g. 3.0"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.concrete.depth") || "Depth (m)"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={depth}
                      onChange={(e) => setDepth(e.target.value)}
                      placeholder="e.g. 0.15"
                      className={inputClass}
                    />
                    <p className={hintClass}>
                      {t("freeTools.concrete.depthHint") ||
                        "Typical slab: 0.10–0.15m. Footing: 0.20–0.30m"}
                    </p>
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.concrete.wastage") || "Wastage (%)"}
                    </label>
                    <select
                      value={wastage}
                      onChange={(e) => setWastage(e.target.value)}
                      className={inputClass}
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="10">10%</option>
                      <option value="15">15%</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  onClick={calculate}
                  className="mt-6 w-full bg-primary text-white font-semibold py-3 rounded-full hover:bg-primary-hover transition-colors"
                >
                  {t("freeTools.calculate") || "Calculate"} →
                </button>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              {!result ? (
                <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6 flex items-center justify-center min-h-[400px]">
                  <p className="text-gray-400 text-center">
                    {t("freeTools.concrete.noResult") ||
                      "Enter your pour dimensions and select a mix grade"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      {t("freeTools.concrete.results") || "Results"}
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          {t("freeTools.concrete.wetVolume") || "Wet Volume"}
                        </span>
                        <span className="font-bold text-gray-900">
                          {result.wetVolume} m³
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          {t("freeTools.concrete.dryVolume") || "Dry Volume (×1.54)"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {result.dryVolume} m³
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          {t("freeTools.concrete.mixRatio") || "Mix Ratio"}
                        </span>
                        <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-sm">
                          {result.mix.ratio}
                        </span>
                      </div>
                      <hr className="border-gray-100" />
                      <div className="flex justify-between items-center py-3 bg-violet-50 rounded-xl px-4">
                        <span className="text-violet-800 font-bold text-sm">
                          {t("freeTools.concrete.cementBags") || "Cement Bags (50kg)"}
                        </span>
                        <span className="font-bold text-violet-900 text-xl">
                          {result.cementBagsWastage} bags
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          {t("freeTools.concrete.cementKg") || "Cement Weight"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {result.cementKg} kg
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-blue-50 rounded-xl px-4">
                        <span className="text-blue-800 font-bold text-sm">
                          {t("freeTools.concrete.sand") || "Sand"}
                        </span>
                        <span className="font-bold text-blue-900 text-lg">
                          {result.sandTonnes} tonnes
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-amber-50 rounded-xl px-4">
                        <span className="text-amber-800 font-bold text-sm">
                          {t("freeTools.concrete.aggregate") || "Aggregate (20mm)"}
                        </span>
                        <span className="font-bold text-amber-900 text-lg">
                          {result.aggTonnes} tonnes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                    <h3 className="font-bold text-blue-800 text-sm mb-2">
                      📐{" "}
                      {t("freeTools.concrete.howCalculated") ||
                        "How is this calculated?"}
                    </h3>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      {t("freeTools.concrete.explanation") ||
                        `Wet Volume = ${length}m × ${width}m × ${depth}m = ${result.wetVolume} m³. Dry Volume = ${result.wetVolume} × 1.54 = ${result.dryVolume} m³ (factor accounts for voids and shrinkage). For ${result.mix.ratio}: Cement = ${result.dryVolume} × (1/${result.totalParts}) = ${result.cementVol} m³ × 1440 kg/m³ = ${result.cementKg} kg ÷ 50 = ${result.cementBags} bags. Sand = ${result.sandVol} m³ × 1.6 t/m³ = ${result.sandTonnes} t. Aggregate = ${result.aggVol} m³ × 1.5 t/m³ = ${result.aggTonnes} t.`}
                    </p>
                    <p className="text-blue-600 text-xs mt-2">
                      {t("freeTools.concrete.note") ||
                        "This is an estimate based on nominal mix ratios. For structural or load-bearing construction, an engineer-designed concrete mix should be used. Actual quantities depend on aggregate gradation, moisture content, and compaction method. Always use quality-tested materials."}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6 text-center">
                    <p className="text-gray-900 font-bold mb-3">
                      {t("freeTools.concrete.needPro") ||
                        "Planning a construction project?"}
                    </p>
                    <Link
                      href="/search"
                      className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-primary-hover transition-colors"
                    >
                      {t("freeTools.concrete.findPro") ||
                        "Find a Professional"}{" "}
                      →
                    </Link>
                  </div>
                </div>
              )}
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
}
