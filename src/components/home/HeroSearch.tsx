"use client";

import { useState, useEffect } from "react";
import { HiLocationMarker, HiOutlineViewGrid, HiOutlineSearch } from "react-icons/hi";
import { districts } from "@/constants/locations";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";

export default function HeroSearch() {
  const { t } = useI18n();
  const [district, setDistrict] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const router = useRouter();

  useEffect(() => {
    api.get("/categories").then(res => {
      setCategories(res.data);
    }).catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?district=${district}&category=${categoryId}`);
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-2 sm:px-0">
      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-200/60 p-2 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-3 sm:px-4 py-3 border border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all min-w-0">
          <HiLocationMarker className="text-gray-400 text-lg mr-2 sm:mr-3 shrink-0" />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-gray-700 cursor-pointer appearance-none text-sm font-medium min-w-0"
          >
            <option value="">{t('heroSearch.selectDistrict')}</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-3 sm:px-4 py-3 border border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all min-w-0">
          <HiOutlineViewGrid className="text-gray-400 text-lg mr-2 sm:mr-3 shrink-0" />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-gray-700 cursor-pointer appearance-none text-sm font-medium min-w-0"
          >
            <option value="">{t('heroSearch.whatService')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center whitespace-nowrap text-sm sm:w-auto w-full"
        >
          <HiOutlineSearch className="mr-2 text-lg" />
          {t('heroSearch.searchWorkers')}
        </button>
      </form>
    </div>
  );
}
