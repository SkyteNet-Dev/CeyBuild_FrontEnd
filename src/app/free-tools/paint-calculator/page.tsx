"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { useI18n } from "@/i18n/I18nProvider";

export default function PaintCalculatorPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = "Paint Calculator | CeyBuild";
  }, []);

  const [wallLength, setWallLength] = useState("");
  const [wallHeight, setWallHeight] = useState("");
  const [numWalls, setNumWalls] = useState("4");
  const [doors, setDoors] = useState("1");
  const [windows, setWindows] = useState("2");
  const [coats, setCoats] = useState("2");
  const [coverage, setCoverage] = useState("10");
  const [wastage, setWastage] = useState("10");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    setError("");
    setResult(null);

    const l = parseFloat(wallLength);
    const h = parseFloat(wallHeight);
    const n = parseInt(numWalls) || 0;
    const d = parseInt(doors) || 0;
    const w = parseInt(windows) || 0;
    const c = parseInt(coats) || 1;
    const cov = parseFloat(coverage) || 10;
    const wst = parseFloat(wastage) || 0;

    if (!l || l <= 0) {
      setError("Wall length must be greater than 0");
      return;
    }
    if (!h || h <= 0) {
      setError("Wall height must be greater than 0");
      return;
    }
    if (n <= 0) {
      setError("Number of walls must be at least 1");
      return;
    }
    if (d < 0) {
      setError("Number of doors cannot be negative");
      return;
    }
    if (w < 0) {
      setError("Number of windows cannot be negative");
      return;
    }
    if (c <= 0) {
      setError("Number of coats must be at least 1");
      return;
    }
    if (cov <= 0) {
      setError("Paint coverage must be greater than 0");
      return;
    }

    const totalWallArea = l * h * n;
    const doorArea = d * 2.1 * 0.9;
    const windowArea = w * 1.2 * 1.2;
    const paintableArea = Math.max(0, totalWallArea - doorArea - windowArea);
    const paintBeforeCoats = paintableArea / cov;
    const paintWithCoats = paintBeforeCoats * c;
    const paintWithWastage = paintWithCoats * (1 + wst / 100);

    setResult({
      totalWallArea: totalWallArea.toFixed(2),
      doorArea: doorArea.toFixed(2),
      windowArea: windowArea.toFixed(2),
      paintableArea: paintableArea.toFixed(2),
      paintBeforeCoats: paintBeforeCoats.toFixed(2),
      paintWithCoats: paintWithCoats.toFixed(2),
      paintWithWastage: paintWithWastage.toFixed(2),
      assumptions: {
        doorSize: "2.1m × 0.9m = 1.89 m²",
        windowSize: "1.2m × 1.2m = 1.44 m²",
        coats: c,
        coverage: cov,
        wastage: wst,
      },
    });
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const hintClass = "text-xs text-gray-400 mt-1";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <Link
              href="/free-tools"
              className="inline-block text-sm text-white/70 hover:text-white mb-4 transition-colors"
            >
              ← {t("freeTools.backToTools") || "Back to Free Tools"}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              🎨 {t("freeTools.paint.title") || "Paint Calculator"}
            </h1>
            <p className="text-white/80 text-lg">
              {t("freeTools.paint.heroDesc") ||
                "Estimate how much paint you need for your walls"}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <AnimatedSection>
              <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  {t("freeTools.paint.inputs") || "Wall Dimensions"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.paint.wallLength") || "Wall Length (m)"}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={wallLength}
                      onChange={(e) => setWallLength(e.target.value)}
                      placeholder="e.g. 4.5"
                      className={inputClass}
                    />
                    <p className={hintClass}>
                      {t("freeTools.paint.wallLengthHint") ||
                        "Length of one wall in metres"}
                    </p>
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.paint.wallHeight") || "Wall Height (m)"}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={wallHeight}
                      onChange={(e) => setWallHeight(e.target.value)}
                      placeholder="e.g. 3.0"
                      className={inputClass}
                    />
                    <p className={hintClass}>
                      {t("freeTools.paint.wallHeightHint") ||
                        "Floor to ceiling height in metres"}
                    </p>
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.paint.numWalls") || "Number of Walls"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={numWalls}
                      onChange={(e) => setNumWalls(e.target.value)}
                      className={inputClass}
                    />
                    <p className={hintClass}>
                      {t("freeTools.paint.numWallsHint") ||
                        "How many walls of this size to paint"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        {t("freeTools.paint.doors") || "Doors"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={doors}
                        onChange={(e) => setDoors(e.target.value)}
                        className={inputClass}
                      />
                      <p className={hintClass}>
                        {t("freeTools.paint.doorsHint") || "Standard: 2.1m × 0.9m"}
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>
                        {t("freeTools.paint.windows") || "Windows"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={windows}
                        onChange={(e) => setWindows(e.target.value)}
                        className={inputClass}
                      />
                      <p className={hintClass}>
                        {t("freeTools.paint.windowsHint") ||
                          "Standard: 1.2m × 1.2m"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.paint.coats") || "Number of Coats"}
                    </label>
                    <select
                      value={coats}
                      onChange={(e) => setCoats(e.target.value)}
                      className={inputClass}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                    <p className={hintClass}>
                      {t("freeTools.paint.coatsHint") ||
                        "Most surfaces need 2 coats for even coverage"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        {t("freeTools.paint.coverage") || "Coverage (m²/L)"}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        value={coverage}
                        onChange={(e) => setCoverage(e.target.value)}
                        className={inputClass}
                      />
                      <p className={hintClass}>
                        {t("freeTools.paint.coverageHint") ||
                          "Check paint can — typically 8–12 m²/L"}
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>
                        {t("freeTools.paint.wastage") || "Wastage (%)"}
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

            {/* Results */}
            <AnimatedSection delay={0.1}>
              {!result ? (
                <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6 flex items-center justify-center min-h-[400px]">
                  <p className="text-gray-400 text-center">
                    {t("freeTools.paint.noResult") ||
                      "Enter your wall dimensions and click Calculate"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      {t("freeTools.paint.results") || "Results"}
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          {t("freeTools.paint.totalWallArea") ||
                            "Total Wall Area"}
                        </span>
                        <span className="font-bold text-gray-900">
                          {result.totalWallArea} m²
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          − {t("freeTools.paint.doorArea") || "Door Deduction"}
                        </span>
                        <span className="text-red-600 font-semibold">
                          −{result.doorArea} m²
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          −{" "}
                          {t("freeTools.paint.windowArea") ||
                            "Window Deduction"}
                        </span>
                        <span className="text-red-600 font-semibold">
                          −{result.windowArea} m²
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-blue-50 rounded-xl px-4">
                        <span className="text-blue-800 font-semibold text-sm">
                          {t("freeTools.paint.paintableArea") ||
                            "Paintable Area"}
                        </span>
                        <span className="font-bold text-blue-900 text-lg">
                          {result.paintableArea} m²
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          {t("freeTools.paint.beforeCoats") || "Before Coats"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {result.paintBeforeCoats} L
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          × {result.assumptions.coats}{" "}
                          {t("freeTools.paint.coatsLabel") || "coats"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {result.paintWithCoats} L
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          + {result.assumptions.wastage}%{" "}
                          {t("freeTools.paint.wastageLabel") || "wastage"}
                        </span>
                        <span className="text-amber-600 font-semibold">
                          +{(result.paintWithWastage - result.paintWithCoats).toFixed(2)} L
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-green-50 rounded-xl px-4">
                        <span className="text-green-800 font-bold">
                          {t("freeTools.paint.totalRequired") ||
                            "Total Paint Required"}
                        </span>
                        <span className="font-bold text-green-900 text-xl">
                          {result.paintWithWastage} L
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* How is this calculated */}
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                    <h3 className="font-bold text-blue-800 text-sm mb-2">
                      📐{" "}
                      {t("freeTools.paint.howCalculated") ||
                        "How is this calculated?"}
                    </h3>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      {t("freeTools.paint.explanation") ||
                        `Paintable Area = (Wall Length × Height × ${result.assumptions.coats} walls) − (Doors × 1.89 m²) − (Windows × 1.44 m²) = ${result.paintableArea} m². Paint Needed = ${result.paintableArea} m² ÷ ${result.assumptions.coverage} m²/L × ${result.assumptions.coats} coats × (1 + ${result.assumptions.wastage}% wastage) = ${result.paintWithWastage} L.`}
                    </p>
                    <p className="text-blue-600 text-xs mt-2">
                      {t("freeTools.paint.note") ||
                        "Note: Actual coverage varies by paint brand, surface texture, colour, and condition. Consult the paint manufacturer's data sheet for exact coverage. Dark colours and rough surfaces may require more paint."}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6 text-center">
                    <p className="text-gray-900 font-bold mb-3">
                      {t("freeTools.paint.needPro") ||
                        "Need a professional painter?"}
                    </p>
                    <Link
                      href="/search?category=painting"
                      className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-primary-hover transition-colors"
                    >
                      {t("freeTools.paint.findPainter") || "Find a Painter"} →
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
