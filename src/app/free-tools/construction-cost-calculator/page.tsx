"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { useI18n } from "@/i18n/I18nProvider";

interface CostItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

const defaultItems: CostItem[] = [
  { id: "cement", name: "Cement (50kg bag)", quantity: 10, unitPrice: 1600, unit: "bags" },
  { id: "sand", name: "Sand (tonne)", quantity: 3, unitPrice: 15000, unit: "tonnes" },
  { id: "aggregate", name: "Aggregate (tonne)", quantity: 5, unitPrice: 12000, unit: "tonnes" },
  { id: "bricks", name: "Bricks (per 1000)", quantity: 2, unitPrice: 25000, unit: "×1000" },
  { id: "steel", name: "Steel Rod 12mm (bundle)", quantity: 0, unitPrice: 45000, unit: "bundles" },
  { id: "tiles", name: "Floor Tiles (per box)", quantity: 0, unitPrice: 3500, unit: "boxes" },
  { id: "paint", name: "Paint (20L bucket)", quantity: 0, unitPrice: 12000, unit: "buckets" },
];

export default function ConstructionCostCalculatorPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = "Construction Cost Calculator | CeyBuild";
  }, []);

  const [items, setItems] = useState<CostItem[]>(defaultItems);
  const [labourCost, setLabourCost] = useState("");
  const [additionalCost, setAdditionalCost] = useState("");
  const [additionalLabel, setAdditionalLabel] = useState("");
  const [wastage, setWastage] = useState("5");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const updateItem = (id: string, field: keyof CostItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: field === "name" ? value : parseFloat(value as string) || 0 } : item
      )
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: `custom_${Date.now()}`, name: "Custom Material", quantity: 0, unitPrice: 0, unit: "units" },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const calculate = () => {
    setError("");
    setResult(null);

    const wst = parseFloat(wastage) || 0;
    const labour = parseFloat(labourCost) || 0;
    const additional = parseFloat(additionalCost) || 0;

    const materialCosts = items.map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));

    const totalMaterial = materialCosts.reduce((sum, item) => sum + item.total, 0);
    const wastageAmount = totalMaterial * (wst / 100);
    const totalWithWastage = totalMaterial + wastageAmount;
    const grandTotal = totalWithWastage + labour + additional;

    setResult({
      materialCosts,
      totalMaterial,
      wastageAmount,
      totalWithWastage,
      labour,
      additional,
      additionalLabel: additionalLabel || "Additional Costs",
      grandTotal,
      assumptions: { wastage: wst },
    });
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900 bg-white text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const hintClass = "text-xs text-gray-400 mt-1";

  const formatLKR = (n: number) =>
    "Rs. " + n.toLocaleString("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-rose-600 to-rose-700 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <Link
              href="/free-tools"
              className="inline-block text-sm text-white/70 hover:text-white mb-4 transition-colors"
            >
              ← {t("freeTools.backToTools") || "Back to Free Tools"}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              💰{" "}
              {t("freeTools.cost.title") || "Construction Cost Calculator"}
            </h1>
            <p className="text-white/80 text-lg">
              {t("freeTools.cost.heroDesc") ||
                "Estimate total project cost including materials, labour, and extras"}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Disclaimer */}
          <AnimatedSection>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
              <p className="text-amber-800 text-sm font-semibold">
                ⚠️{" "}
                {t("freeTools.cost.disclaimer") ||
                  "Estimated Cost — Not a Fixed Quotation. Prices vary by location, market conditions, and material quality in Sri Lanka. Edit unit prices to reflect your local rates."}
              </p>
            </div>
          </AnimatedSection>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Material Items */}
            <AnimatedSection className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  {t("freeTools.cost.materials") || "Material Costs"}
                </h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2 items-end bg-gray-50 rounded-xl p-3"
                    >
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, "name", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">Qty</label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={item.quantity || ""}
                          onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-xs text-gray-500 mb-1 block">
                          Unit Price (Rs.)
                        </label>
                        <input
                          type="number"
                          step="100"
                          min="0"
                          value={item.unitPrice || ""}
                          onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 text-lg font-bold p-2"
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addItem}
                    className="text-primary hover:text-primary-hover text-sm font-semibold py-2"
                  >
                    + {t("freeTools.cost.addItem") || "Add Material"}
                  </button>
                </div>
              </div>
            </AnimatedSection>

            {/* Labour & Extras */}
            <AnimatedSection delay={0.1}>
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    {t("freeTools.cost.labour") || "Labour Cost"}
                  </h2>
                  <div>
                    <label className={labelClass}>
                      {t("freeTools.cost.labourTotal") || "Total Labour Cost (Rs.)"}
                    </label>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      value={labourCost}
                      onChange={(e) => setLabourCost(e.target.value)}
                      placeholder="e.g. 50000"
                      className={inputClass}
                    />
                    <p className={hintClass}>
                      {t("freeTools.cost.labourHint") ||
                        "Estimated labour for the project"}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    {t("freeTools.cost.additional") || "Additional Costs"}
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>
                        {t("freeTools.cost.additionalLabel") || "Description"}
                      </label>
                      <input
                        type="text"
                        value={additionalLabel}
                        onChange={(e) => setAdditionalLabel(e.target.value)}
                        placeholder="e.g. Transport, Permits, Equipment hire"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        {t("freeTools.cost.additionalAmount") || "Amount (Rs.)"}
                      </label>
                      <input
                        type="number"
                        step="100"
                        min="0"
                        value={additionalCost}
                        onChange={(e) => setAdditionalCost(e.target.value)}
                        placeholder="e.g. 25000"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-6">
                  <label className={labelClass}>
                    {t("freeTools.cost.wastage") || "Material Wastage (%)"}
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
            </AnimatedSection>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-200">
              {error}
            </div>
          )}

          <button
            onClick={calculate}
            className="mt-6 w-full bg-primary text-white font-semibold py-4 rounded-full hover:bg-primary-hover transition-colors text-lg"
          >
            {t("freeTools.calculate") || "Calculate"} →
          </button>

          {/* Results */}
          {result && (
            <AnimatedSection delay={0.1}>
              <div className="mt-8 bg-white rounded-2xl border border-gray-100 card-shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {t("freeTools.cost.results") || "Cost Breakdown"}
                </h2>
                <div className="space-y-3">
                  {result.materialCosts
                    .filter((item: any) => item.total > 0)
                    .map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2 border-b border-gray-100"
                      >
                        <span className="text-gray-600 text-sm">
                          {item.name}{" "}
                          <span className="text-gray-400">
                            ({item.quantity} × {formatLKR(item.unitPrice)})
                          </span>
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatLKR(item.total)}
                        </span>
                      </div>
                    ))}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">
                      {t("freeTools.cost.materialSubtotal") || "Material Subtotal"}
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatLKR(result.totalMaterial)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">
                      + {result.assumptions.wastage}%{" "}
                      {t("freeTools.cost.wastage") || "Wastage"}
                    </span>
                    <span className="text-amber-600 font-semibold">
                      {formatLKR(result.wastageAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">
                      {t("freeTools.cost.labour") || "Labour Cost"}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatLKR(result.labour)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">
                      {result.additionalLabel}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatLKR(result.additional)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4 bg-rose-50 rounded-xl px-4 mt-2">
                    <span className="text-rose-800 font-bold">
                      {t("freeTools.cost.estimatedTotal") || "Estimated Total"}
                    </span>
                    <span className="font-bold text-rose-900 text-2xl">
                      {formatLKR(result.grandTotal)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-amber-700 text-xs font-semibold">
                    ⚠️{" "}
                    {t("freeTools.cost.notQuote") ||
                      "Estimated Cost — Not a Fixed Quotation. Actual costs may vary based on location, market fluctuations, material quality, and project complexity. Always get multiple quotes from professionals."}
                  </p>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-2xl border border-gray-100 card-shadow p-6 text-center">
                <p className="text-gray-900 font-bold mb-3">
                  {t("freeTools.cost.needPro") ||
                    "Planning a construction project?"}
                </p>
                <Link
                  href="/search"
                  className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-primary-hover transition-colors"
                >
                  {t("freeTools.cost.findPro") || "Find a Professional"} →
                </Link>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </div>
  );
}
