"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AnimatedSection from "@/components/AnimatedSection";
import { HiOutlineCheckCircle, HiOutlineArrowRight, HiOutlineArrowLeft, HiOutlineUpload } from "react-icons/hi";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";

type Category = {
  id: string;
  name: string;
  description: string;
};

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

export default function WorkerOnboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    categoryId: "",
    categoryName: "",
    experienceYears: 1,
    description: "",
    skills: [] as string[],
    province: "",
    district: "",
    city: "",
    serviceArea: [] as string[],
    pricingType: "HOURLY",
    hourlyRate: 0,
    nicNumber: "",
    nicImage: "",
    availability: true,
  });

  const [nicFile, setNicFile] = useState<File | null>(null);
  const [nicPreview, setNicPreview] = useState<string>("");

  useEffect(() => {
    api.get("/categories")
      .then(res => setCategories(res.data))
      .catch(() => toast.error(t('onboarding.failedToLoadCategories')))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const handleCategorySelect = (cat: Category) => {
    setForm(prev => ({ ...prev, categoryId: cat.id, categoryName: cat.name }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleNicFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setNicPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const canProceed = () => {
    if (step === 1) return form.categoryId !== "";
    if (step === 2) return form.province && form.district && form.city && form.experienceYears > 0;
    if (step === 3) return form.description.length >= 20;
    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error(t('onboarding.loginFirst'));
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      // Upload NIC image if provided
      let nicImageUrl = "";
      if (nicFile) {
        const formData = new FormData();
        formData.append("file", nicFile);
        const uploadRes = await api.post("/images/upload", formData);
        nicImageUrl = uploadRes.data?.url || "";
      }

      await api.post("/workers/register", {
        categoryId: form.categoryId,
        experienceYears: form.experienceYears,
        description: form.description,
        skills: form.skills.length > 0 ? form.skills : [form.categoryName],
        province: form.province,
        district: form.district,
        city: form.city,
        serviceArea: form.serviceArea.length > 0 ? form.serviceArea : [form.city],
        pricingType: form.pricingType,
        hourlyRate: form.hourlyRate || undefined,
        nicNumber: form.nicNumber || undefined,
        nicImage: nicImageUrl || undefined,
        availability: form.availability,
      });

      toast.success(t('onboarding.profileCreated'));
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('onboarding.failedToCreate'));
    } finally {
      setLoading(false);
    }
  };

  const TOTAL_STEPS = 4;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <AnimatedSection className="text-center mb-10">
           <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('onboarding.becomeWorker')}</h1>
          <p className="text-gray-500">{t('onboarding.setupSteps', { steps: TOTAL_STEPS })}</p>
        </AnimatedSection>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step >= s ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {step > s ? <HiOutlineCheckCircle className="w-6 h-6" /> : s}
              </div>
              {s < TOTAL_STEPS && (
                <div className={`w-16 h-1 mx-2 ${step > s ? "bg-primary" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Category Selection */}
        {step === 1 && (
          <AnimatedSection>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 card-shadow">
               <h2 className="text-xl font-bold text-gray-900 mb-2">{t('onboarding.step1Title')}</h2>
              <p className="text-gray-500 mb-6">{t('onboarding.step1Desc')}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categoriesLoading ? (
                  <div className="col-span-full flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                     <span className="ml-3 text-gray-500">{t('onboarding.loadingCategories')}</span>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    {t('onboarding.noCategories')}
                  </div>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        form.categoryId === cat.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                        {form.categoryId === cat.id && <HiOutlineCheckCircle className="w-5 h-5 text-primary" />}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{cat.description}</p>
                    </button>
                  ))
                )}
              </div>
              {form.categoryId && (
                <div className="mt-6 p-4 bg-primary/5 rounded-xl">
                  <p className="text-sm text-primary font-medium">
                     {t('onboarding.selected')} <strong>{form.categoryName}</strong>
                  </p>
                </div>
              )}
            </div>
          </AnimatedSection>
        )}

        {/* Step 2: Experience & Location */}
        {step === 2 && (
          <AnimatedSection>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 card-shadow">
               <h2 className="text-xl font-bold text-gray-900 mb-2">{t('onboarding.step2Title')}</h2>
              <p className="text-gray-500 mb-6">{t('onboarding.step2Desc')}</p>
              <div className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">{t('onboarding.yearsExperience')}</label>
                  <input
                    type="number" min="0" max="50"
                    value={form.experienceYears}
                    onChange={(e) => setForm(prev => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">{t('onboarding.province')}</label>
                  <select
                    value={form.province}
                    onChange={(e) => setForm(prev => ({ ...prev, province: e.target.value, district: "", city: "" }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                  >
                    <option value="">{t('onboarding.province')}</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">{t('onboarding.district')}</label>
                    <select
                      value={form.district}
                      onChange={(e) => setForm(prev => ({ ...prev, district: e.target.value, city: "" }))}
                      disabled={!form.province}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white disabled:opacity-50"
                    >
                      <option value="">{t('onboarding.district')}</option>
                      {(DISTRICTS[form.province] || []).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">{t('onboarding.city')}</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                      placeholder={t('onboarding.enterCity')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">{t('onboarding.pricingType')}</label>
                  <div className="grid grid-cols-2 gap-4">
                    {["HOURLY", "FIXED"].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, pricingType: type }))}
                        className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                          form.pricingType === type
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                         {type === "HOURLY" ? t('onboarding.hourlyRate') : t('onboarding.fixedPrice')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     {form.pricingType === "HOURLY" ? t('onboarding.hourlyRateLKR') : t('onboarding.fixedPriceLKR')} - {t('onboarding.priceOptional')}
                   </label>
                  <input
                    type="number" min="0"
                    value={form.hourlyRate}
                    onChange={(e) => setForm(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
                    placeholder="e.g., 1500"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Step 3: Skills & Description */}
        {step === 3 && (
          <AnimatedSection>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 card-shadow">
               <h2 className="text-xl font-bold text-gray-900 mb-2">{t('onboarding.step3Title')}</h2>
              <p className="text-gray-500 mb-6">{t('onboarding.step3Desc')}</p>
              <div className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">{t('onboarding.skills')}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                       placeholder={t('onboarding.skillPlaceholder')}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                     <button type="button" onClick={addSkill} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">{t('onboarding.add')}</button>
                  </div>
                  {form.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1">
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="text-primary/50 hover:text-primary">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">{t('onboarding.description')}</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('onboarding.descPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.description.length}/500 {t('onboarding.charCount', { count: form.description.length })}</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Step 4: Identity Verification */}
        {step === 4 && (
          <AnimatedSection>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 card-shadow">
               <h2 className="text-xl font-bold text-gray-900 mb-2">{t('onboarding.step4Title')}</h2>
              <p className="text-gray-500 mb-6">{t('onboarding.step4Desc')}</p>
              <div className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">{t('onboarding.nicNumber')}</label>
                  <input
                    type="text"
                    value={form.nicNumber}
                    onChange={(e) => setForm(prev => ({ ...prev, nicNumber: e.target.value }))}
                     placeholder={t('onboarding.nicPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">{t('onboarding.uploadNic')}</label>
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    {nicPreview ? (
                      <img src={nicPreview} alt="NIC Preview" className="h-full w-full object-contain rounded-xl" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <HiOutlineUpload className="w-8 h-8" />
                         <span className="text-sm">{t('onboarding.clickToUpload')}</span>
                         <span className="text-xs">{t('onboarding.fileFormat')}</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="sr-only" onChange={handleNicFileChange} />
                  </label>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl">
                   <p className="text-sm text-blue-700">
                     <strong>{t('onboarding.note')}:</strong> {t('onboarding.nicNote')}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
               <HiOutlineArrowLeft className="w-5 h-5" /> {t('common.back')}
            </button>
          ) : (
            <div />
          )}

          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {t('common.next')} <HiOutlineArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {loading ? t('onboarding.creatingProfile') : t('onboarding.completeRegistration')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
