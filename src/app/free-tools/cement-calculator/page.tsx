"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { useI18n } from "@/i18n/I18nProvider";

export default function CementCalculatorPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = "Cement Calculator | CeyBuild";
  }, []);

  const [volume, setVolume] = useState("");
  const [cementRatio, setCementRatio] = useState("1");
  const [sandRatio, setSandRatio] = useState("4");
  const [wastage, setWastage] = useState("10");
  const [bagSize, setBagSize] = useState("50");
  const [purpose, setPurpose] = useState("plastering");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    setError("");
    setResult(null);

    const v = parseFloat(volume);
    const cR = parseInt(cementRatio) || 1;
    const sR = parseInt(sandRatio) || 4;
    const wst = parseFloat(wastage) || 0;
    const bs = parseInt(bagSize) || 50;

    if (!v || v <= 0) {
      setError("Required volume must be greater than 0");
      return;
    }
    if (cR <= 0) {
      setError("Cement ratio must be greater than 0");
      return;
    }
    if (sR <= 0) {
      setError("Sand ratio must be greater than 0");
      return;
    }
    if (bs <= 0) {
      setError("Bag size must be greater than 0");
      return;
    }

    const totalRatio = cR + sR;
    const dryVolume = v * 1.33;
    const cementVolume = (dryVolume * cR) / totalRatio;
    const sandVolume = (dryVolume * sR) / totalRatio;
    const cementWeight = cementVolume * 1440;
    const cementBags = cementWeight / bs;
    const cementBagsWithWastage = cementBags * (1 + wst / 100);
    const sandTonnes = (sandVolume * 1600) / 1000;

    setResult({
      dryVolume: dryVolume.toFixed(3),
      cementVolume: cementVolume.toFixed(3),
      sandVolume: sandVolume.toFixed(3),
      cementWeight: cementWeight.toFixed(1),
      cementBags: cementBags.toFixed(1),
      cementBagsWithWastage: Math.ceil(cementBagsWithWastage),
      sandTonnes: sandTonnes.toFixed(2),
      assumptions: {
        ratio: `1:${sR}`,
        dryVolumeFactor: 1.33,
        cementDensity: 1440,
        sandDensity: 1600,
        wastage: wst,
        bagSize: bs,
        purpose,
      },
    });
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const hintClass = "text-xs text-gray-400 mt-1";

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-amber-600 to-amber-700 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <Link
              href="/free-tools"
              className="inline-block text-sm text-white/70 hover:text-white mb-4 transition-colors"
            >
              ← {t("freeTools.backToTools") || "Back to Free Tools"}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              🧱 {t("freeTools.cement.title") || "Cement Calculator"}
            </h1>
            <p className="text-white/80 text-lg">
              {t("freeTools.cement.heroDesc") ||
                "Calculate cement and sand for your mortar mix"}
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
                  {t("freeTools.cement.inputs") || "Mix Details"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.cement.purpose") || "Purpose"}
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => {
                        setPurpose(e.target.value);
                        if (e.target.value === "plastering") {
                          setSandRatio("4");
                        } else if (e.target.value === "masonry") {
                          setSandRatio("6");
                        } else if (e.target.value === "flooring") {
                          setSandRatio("3");
                        }
                      }}
                      className={inputClass}
                    >
                      <option value="plastering">
                        {t("freeTools.cement.purposePlaster") ||
                          "Wall Plastering (1:4)"}
                      </option>
                      <option value="masonry">
                        {t("freeTools.cement.purposeMasonry") ||
                          "Brick Masonry (1:6)"}
                      </option>
                      <option value="flooring">
                        {t("freeTools.cement.purposeFloor") ||
                          "Floor Screed (1:3)"}
                      </option>
                      <option value="custom">
                        {t("freeTools.cement.purposeCustom") || "Custom Ratio"}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.cement.volume") || "Required Volume (m³)"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      placeholder="e.g. 0.5"
                      className={inputClass}
                    />
                    <p className={hintClass}>
                      {t("freeTools.cement.volumeHint") ||
                        "Wet volume of mortar needed in cubic metres"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        {t("freeTools.cement.cementRatio") || "Cement Ratio"}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={cementRatio}
                        onChange={(e) => setCementRatio(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        {t("freeTools.cement.sandRatio") || "Sand Ratio"}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={sandRatio}
                        onChange={(e) => setSandRatio(e.target.value)}
                        className={inputClass}
                        disabled={purpose !== "custom"}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        {t("freeTools.cement.bagSize") || "Bag Size (kg)"}
                      </label>
                      <select
                        value={bagSize}
                        onChange={(e) => setBagSize(e.target.value)}
                        className={inputClass}
                      >
                        <option value="25">25 kg</option>
                        <option value="50">50 kg</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>
                        {t("freeTools.cement.wastage") || "Wastage (%)"}
                      </label>
                      <select
                        value={wastage}
                        onChange={(e) => setWastage(e.target.value)}
                        className={inputClass}
                      >
                        <option value="5">5%</option>
                        <option value="10">10%</option>
                        <option value="15">15%</option>
                        <option value="20">20%</option>
                      </select>
                    </div>
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
                    {t("freeTools.cement.noResult") ||
                      "Enter your volume and mix ratio to calculate"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      {t("freeTools.cement.results") || "Results"}
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          {t("freeTools.cement.mixRatio") || "Mix Ratio"}
                        </span>
                        <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-sm">
                          1:{sandRatio}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          {t("freeTools.cement.dryVolume") || "Dry Volume"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {result.dryVolume} m³
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          {t("freeTools.cement.cementVolume") || "Cement Volume"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {result.cementVolume} m³
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          {t("freeTools.cement.sandVolume") || "Sand Volume"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {result.sandVolume} m³
                        </span>
                      </div>
                      <hr className="border-gray-100" />
                      <div className="flex justify-between items-center py-3 bg-amber-50 rounded-xl px-4">
                        <span className="text-amber-800 font-bold text-sm">
                          {t("freeTools.cement.cementBags") || "Cement Bags"}
                        </span>
                        <span className="font-bold text-amber-900 text-xl">
                          {result.cementBagsWithWastage} bags
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-blue-50 rounded-xl px-4">
                        <span className="text-blue-800 font-bold text-sm">
                          {t("freeTools.cement.sandRequired") || "Sand Required"}
                        </span>
                        <span className="font-bold text-blue-900 text-lg">
                          {result.sandTonnes} tonnes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                    <h3 className="font-bold text-blue-800 text-sm mb-2">
                      📐{" "}
                      {t("freeTools.cement.howCalculated") ||
                        "How is this calculated?"}
                    </h3>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      {t("freeTools.cement.explanation") ||
                        `Dry Volume = Wet Volume × 1.33 = ${volume} × 1.33 = ${result.dryVolume} m³. Cement = ${result.dryVolume} × (1/${1 + parseInt(sandRatio)}) = ${result.cementVolume} m³ × 1440 kg/m³ = ${result.cementWeight} kg ÷ ${bagSize} kg/bag = ${result.cementBags} bags. Sand = ${result.dryVolume} × (${sandRatio}/${1 + parseInt(sandRatio)}) = ${result.sandVolume} m³ × 1.6 t/m³ = ${result.sandTonnes} tonnes.`}
                    </p>
                    <p className="text-blue-600 text-xs mt-2">
                      {t("freeTools.cement.note") ||
                        "Note: 1:4 for plastering (richer, stronger), 1:6 for brick masonry (standard), 1:3 for floor screed. Dry volume factor 1.33 accounts for shrinkage and voids. Actual yield may vary with sand moisture content and compaction."}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6 text-center">
                    <p className="text-gray-900 font-bold mb-3">
                      {t("freeTools.cement.needPro") ||
                        "Need a professional mason?"}
                    </p>
                    <Link
                      href="/search?category=masonry"
                      className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-primary-hover transition-colors"
                    >
                      {t("freeTools.cement.findMason") || "Find a Mason"} →
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
