"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { districts } from "@/constants/locations";
import { HiOutlineUpload, HiX } from "react-icons/hi";
import { useI18n } from "@/i18n/I18nProvider";

type WorkerProfile = {
  id: string;
  categoryId: string;
  description: string;
  experienceYears: number;
  hourlyRate?: number;
  skills: string[];
  district: string;
  city: string;
  serviceArea: string[];
  availability: boolean;
  workingHours?: Record<string, { start: string; end: string; available: boolean }>;
};

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const DEFAULT_WORKING_HOURS: Record<string, { start: string; end: string; available: boolean }> = {
  monday: { start: "09:00", end: "17:00", available: true },
  tuesday: { start: "09:00", end: "17:00", available: true },
  wednesday: { start: "09:00", end: "17:00", available: true },
  thursday: { start: "09:00", end: "17:00", available: true },
  friday: { start: "09:00", end: "17:00", available: true },
  saturday: { start: "09:00", end: "13:00", available: true },
  sunday: { start: "09:00", end: "13:00", available: false },
};

export default function WorkerProfileSettings() {
  const { t } = useI18n();
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [serviceAreaInput, setServiceAreaInput] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const [workerRes, catRes] = await Promise.all([
          api.get("/users/profile").then(async res => {
             return res.data.workerProfile || null;
          }),
          api.get("/categories")
        ]);
        setCategories(catRes.data);
        if (workerRes) {
           setWorker({
             ...workerRes,
             workingHours: workerRes.workingHours || DEFAULT_WORKING_HOURS
           });
        } else {
           const allWorkersRes = await api.get("/workers");
           const currentUser = await api.get("/users/profile");
           const myWorker = allWorkersRes.data.find((w: any) => w.userId === currentUser.data.id);
           setWorker({
             ...myWorker,
             workingHours: myWorker?.workingHours || DEFAULT_WORKING_HOURS
           });
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker) return;
    setSaving(true);
    try {
      await api.put("/workers/profile", {
        categoryId: worker.categoryId,
        description: worker.description,
        experienceYears: Number(worker.experienceYears),
        hourlyRate: Number(worker.hourlyRate),
        skills: worker.skills,
        district: worker.district,
        city: worker.city,
        serviceArea: worker.serviceArea,
        availability: worker.availability,
        workingHours: worker.workingHours,
      });
      toast.success(t('workerProfile.updateSuccess'));
    } catch (error) {
      toast.error(t('workerProfile.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && worker && !worker.skills.includes(skillInput.trim())) {
      setWorker({ ...worker, skills: [...worker.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    if (worker) {
      setWorker({ ...worker, skills: worker.skills.filter(s => s !== skill) });
    }
  };

  const addServiceArea = () => {
    if (serviceAreaInput.trim() && worker && !worker.serviceArea.includes(serviceAreaInput.trim())) {
      setWorker({ ...worker, serviceArea: [...worker.serviceArea, serviceAreaInput.trim()] });
      setServiceAreaInput("");
    }
  };

  const removeServiceArea = (area: string) => {
    if (worker) {
      setWorker({ ...worker, serviceArea: worker.serviceArea.filter(a => a !== area) });
    }
  };

  const updateWorkingHours = (day: string, field: "start" | "end" | "available", value: string | boolean) => {
    if (!worker) return;
    setWorker({
      ...worker,
      workingHours: {
        ...worker.workingHours,
        [day]: {
          ...worker.workingHours![day],
          [field]: value,
        },
      },
    });
  };

  if (loading) {
     return <div className="animate-pulse h-64 bg-gray-100 rounded-3xl mt-8"></div>;
  }

  if (!worker) {
     return <p className="text-gray-500 mt-8 italic p-8 bg-gray-50 rounded-3xl">{t('workerProfile.notFound')}</p>
  }

  const availableCities = districts.find(d => d.id === worker?.district)?.cities || [];

  return (
    <form onSubmit={handleUpdate} className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{t('workerProfile.professionalDetails')}</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerProfile.aboutMe')}</label>
          <textarea 
            value={worker.description}
            onChange={e => setWorker({...worker, description: e.target.value})}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white text-gray-900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerProfile.category')}</label>
              <select 
                value={worker.categoryId}
                onChange={e => setWorker({...worker, categoryId: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white text-gray-900"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
           </div>
           <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerProfile.experienceYears')}</label>
              <input 
                type="number" 
                value={worker.experienceYears}
                onChange={e => setWorker({...worker, experienceYears: Number(e.target.value)})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white text-gray-900"
              />
           </div>
           <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerProfile.hourlyRate')}</label>
              <input 
                type="number" 
                value={worker.hourlyRate || ''}
                onChange={e => setWorker({...worker, hourlyRate: Number(e.target.value)})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white text-gray-900"
              />
           </div>
           <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerProfile.baseDistrict')}</label>
              <select 
                value={worker.district}
                onChange={e => setWorker({...worker, district: e.target.value, city: ""})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white text-gray-900"
              >
                 <option value="">{t('workerProfile.selectDistrict')}</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
           </div>
           <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerProfile.baseCity')}</label>
              <select 
                value={worker.city}
                onChange={e => setWorker({...worker, city: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white text-gray-900"
                disabled={!worker.district}
              >
                 <option value="">{t('workerProfile.selectCity')}</option>
                {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 gap-2 flex items-center h-full pt-4">
                 <input 
                   type="checkbox"
                   checked={worker.availability}
                   onChange={e => setWorker({...worker, availability: e.target.checked})}
                   className="w-5 h-5 text-primary rounded"
                 />
                  {t('workerProfile.availableForBookings')}
              </label>
           </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">{t('workerProfile.skills')}</label>
          <div className="flex gap-2 mb-3">
             <input 
               type="text" 
               value={skillInput}
               onChange={e => setSkillInput(e.target.value)}
               onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addSkill(); }}}
               placeholder={t('workerProfile.addSkillPlaceholder')}
               className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 placeholder-gray-400"
             />
              <button type="button" onClick={addSkill} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl text-sm transition">{t('workerProfile.add')}</button>
          </div>
          <div className="flex flex-wrap gap-2">
             {worker.skills.map((skill, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 ml-1"><HiX size={14}/></button>
                </span>
             ))}
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">{t('workerProfile.serviceAreas')}</label>
          <div className="flex gap-2 mb-3">
             <input 
               type="text" 
               value={serviceAreaInput}
               onChange={e => setServiceAreaInput(e.target.value)}
               onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addServiceArea(); }}}
               placeholder={t('workerProfile.addServiceAreaPlaceholder')}
               className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 placeholder-gray-400"
             />
              <button type="button" onClick={addServiceArea} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl text-sm transition">{t('workerProfile.add')}</button>
          </div>
          <div className="flex flex-wrap gap-2">
             {worker.serviceArea.map((area, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                  {area}
                  <button type="button" onClick={() => removeServiceArea(area)} className="hover:text-red-500 ml-1"><HiX size={14}/></button>
                </span>
             ))}
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-3">{t('workerProfile.workingHours')}</label>
          <div className="space-y-3">
            {DAYS.map(day => {
              const hours = worker.workingHours?.[day] || { start: "09:00", end: "17:00", available: true };
              return (
                <div key={day} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    checked={hours.available}
                    onChange={e => updateWorkingHours(day, "available", e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="w-28 text-sm font-medium text-gray-700 capitalize">{day}</span>
                  {hours.available ? (
                    <>
                      <input
                        type="time"
                        value={hours.start}
                        onChange={e => updateWorkingHours(day, "start", e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-gray-900"
                      />
                       <span className="text-gray-400">{t('workerProfile.to')}</span>
                      <input
                        type="time"
                        value={hours.end}
                        onChange={e => updateWorkingHours(day, "end", e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-gray-900"
                      />
                    </>
                  ) : (
                     <span className="text-sm text-gray-400 italic">{t('workerProfile.unavailable')}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
      
      <div className="pt-8 flex justify-end">
        <button 
          type="submit" 
          disabled={saving}
          className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
           {saving ? t('workerProfile.saving') : t('workerProfile.saveDetails')}
        </button>
      </div>
    </form>
  );
}
