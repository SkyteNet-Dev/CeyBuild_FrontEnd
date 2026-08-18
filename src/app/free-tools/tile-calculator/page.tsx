"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { useI18n } from "@/i18n/I18nProvider";

export default function TileCalculatorPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = "Tile Calculator | CeyBuild";
  }, []);

  const [floorLength, setFloorLength] = useState("");
  const [floorWidth, setFloorWidth] = useState("");
  const [tileLength, setTileLength] = useState("30");
  const [tileWidth, setTileWidth] = useState("30");
  const [piecesPerBox, setPiecesPerBox] = useState("");
  const [wastage, setWastage] = useState("10");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    setError("");
    setResult(null);

    const fl = parseFloat(floorLength);
    const fw = parseFloat(floorWidth);
    const tl = parseFloat(tileLength);
    const tw = parseFloat(tileWidth);
    const ppb = parseInt(piecesPerBox) || 0;
    const wst = parseFloat(wastage) || 0;

    if (!fl || fl <= 0) {
      setError("Floor length must be greater than 0");
      return;
    }
    if (!fw || fw <= 0) {
      setError("Floor width must be greater than 0");
      return;
    }
    if (!tl || tl <= 0) {
      setError("Tile length must be greater than 0");
      return;
    }
    if (!tw || tw <= 0) {
      setError("Tile width must be greater than 0");
      return;
    }

    const floorArea = fl * fw;
    const tileAreaM2 = (tl / 100) * (tw / 100);
    const tilesExact = floorArea / tileAreaM2;
    const tilesWithWastage = Math.ceil(tilesExact * (1 + wst / 100));
    const boxesRequired =
      ppb > 0 ? Math.ceil(tilesWithWastage / ppb) : null;

    setResult({
      floorArea: floorArea.toFixed(2),
      tileAreaM2: tileAreaM2.toFixed(4),
      tilesExact: tilesExact.toFixed(1),
      tilesWithWastage,
      boxesRequired,
      assumptions: {
        tileSize: `${tl}mm × ${tw}mm = ${tileAreaM2.toFixed(4)} m²`,
        wastage: wst,
        ppb,
      },
    });
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const hintClass = "text-xs text-gray-400 mt-1";

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-700 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <Link
              href="/free-tools"
              className="inline-block text-sm text-white/70 hover:text-white mb-4 transition-colors"
            >
              ← {t("freeTools.backToTools") || "Back to Free Tools"}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              🧱 {t("freeTools.tile.title") || "Tile Calculator"}
            </h1>
            <p className="text-white/80 text-lg">
              {t("freeTools.tile.heroDesc") ||
                "Find out how many tiles you need for your floor"}
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
                  {t("freeTools.tile.inputs") || "Room & Tile Dimensions"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.tile.floorLength") ||
                        "Floor Length (cm)"}
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={floorLength}
                      onChange={(e) => setFloorLength(e.target.value)}
                      placeholder="e.g. 400"
                      className={inputClass}
                    />
                    <p className={hintClass}>
                      {t("freeTools.tile.floorLengthHint") ||
                        "Room length in centimetres (e.g. 400 cm = 4 m)"}
                    </p>
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.tile.floorWidth") || "Floor Width (cm)"}
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={floorWidth}
                      onChange={(e) => setFloorWidth(e.target.value)}
                      placeholder="e.g. 350"
                      className={inputClass}
                    />
                  </div>
                  <hr className="border-gray-100" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        {t("freeTools.tile.tileLength") || "Tile Length (mm)"}
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={tileLength}
                        onChange={(e) => setTileLength(e.target.value)}
                        className={inputClass}
                      />
                      <p className={hintClass}>
                        {t("freeTools.tile.commonSizes") ||
                          "Common: 300, 600, 800 mm"}
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>
                        {t("freeTools.tile.tileWidth") || "Tile Width (mm)"}
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={tileWidth}
                        onChange={(e) => setTileWidth(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.tile.piecesPerBox") ||
                        "Pieces per Box (optional)"}
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={piecesPerBox}
                      onChange={(e) => setPiecesPerBox(e.target.value)}
                      placeholder="e.g. 4"
                      className={inputClass}
                    />
                    <p className={hintClass}>
                      {t("freeTools.tile.piecesPerBoxHint") ||
                        "Check your tile box label for this number"}
                    </p>
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.tile.wastage") || "Wastage (%)"}
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
                    <p className={hintClass}>
                      {t("freeTools.tile.wastageHint") ||
                        "10% recommended for simple layouts, 15–20% for diagonal cuts"}
                    </p>
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
                    {t("freeTools.tile.noResult") ||
                      "Enter your floor and tile dimensions to calculate"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      {t("freeTools.tile.results") || "Results"}
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          {t("freeTools.tile.floorArea") || "Floor Area"}
                        </span>
                        <span className="font-bold text-gray-900">
                          {result.floorArea} m²
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          {t("freeTools.tile.tileArea") || "Single Tile Area"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {result.tileAreaM2} m²
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">
                          {t("freeTools.tile.tilesExact") || "Tiles (exact)"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {result.tilesExact}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-emerald-50 rounded-xl px-4">
                        <span className="text-emerald-800 font-bold text-sm">
                          {t("freeTools.tile.tilesRequired") ||
                            "Tiles Required (+ wastage)"}
                        </span>
                        <span className="font-bold text-emerald-900 text-xl">
                          {result.tilesWithWastage} tiles
                        </span>
                      </div>
                      {result.boxesRequired !== null && (
                        <div className="flex justify-between items-center py-3 bg-amber-50 rounded-xl px-4">
                          <span className="text-amber-800 font-bold text-sm">
                            {t("freeTools.tile.boxesRequired") ||
                              "Boxes to Buy"}
                          </span>
                          <span className="font-bold text-amber-900 text-lg">
                            {result.boxesRequired} boxes
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                    <h3 className="font-bold text-blue-800 text-sm mb-2">
                      📐{" "}
                      {t("freeTools.tile.howCalculated") ||
                        "How is this calculated?"}
                    </h3>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      {t("freeTools.tile.explanation") ||
                        `Floor Area = ${floorLength} cm × ${floorWidth} cm = ${result.floorArea} m². Tile Area = ${tileLength}mm × ${tileWidth}mm = ${result.tileAreaM2} m². Tiles Needed = ${result.floorArea} m² ÷ ${result.tileAreaM2} m² = ${result.tilesExact} tiles. With ${result.assumptions.wastage}% wastage = ${result.tilesWithWastage} tiles.`}
                    </p>
                    <p className="text-blue-600 text-xs mt-2">
                      {t("freeTools.tile.note") ||
                        "Note: This assumes a simple grid layout. Diagonal, herringbone, or border patterns may require 15–20% wastage. Buy extra tiles for future repairs."}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6 text-center">
                    <p className="text-gray-900 font-bold mb-3">
                      {t("freeTools.tile.needPro") ||
                        "Need a professional tiler?"}
                    </p>
                    <Link
                      href="/search?category=tiling"
                      className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-primary-hover transition-colors"
                    >
                      {t("freeTools.tile.findTiler") || "Find a Tiler"} →
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
