"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import AnimatedSection from "@/components/AnimatedSection";
import AuthPromptModal from "@/components/AuthPromptModal";
import { useAuth } from "@/contexts/AuthContext";
import { HiStar, HiCheckCircle, HiOutlineLocationMarker, HiOutlineCurrencyDollar, HiOutlinePhone, HiOutlineMail, HiOutlinePhotograph, HiOutlineDocumentText, HiOutlineLockClosed, HiOutlineCalendar, HiOutlineClock, HiOutlineCheckCircle } from "react-icons/hi";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/axios";
import { useI18n } from "@/i18n/I18nProvider";
import AvailabilityMiniCalendar from "@/components/availability/AvailabilityMiniCalendar";
import Image from "next/image";

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

const bookingSchema = z.object({
  description: z.string().min(10, "Please provide more details"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().optional(),
  budget: z.string().optional(),
  address: z.string().min(5, "Please provide your address"),
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  area: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

type WorkerData = {
  id: string;
  userId: string;
  categoryId: string;
  category: { name: string };
  user: { fullName: string; profileImage?: string; email?: string; phoneNumber?: string };
  district: string;
  city: string;
  experienceYears: number;
  hourlyRate: number;
  verificationStatus: string;
  description: string;
  skills: string[];
  serviceArea?: string[];
  workingHours?: Record<string, { start: string; end: string; available: boolean }>;
  portfolioImages?: { id: string; url: string; publicId?: string }[];
  certificates?: { id: string; url: string; publicId?: string }[];
  reviewsReceived?: { rating: number; comment: string; reply?: string; repliedAt?: string; customer: { fullName: string }; createdAt: string }[];
};

export default function WorkerProfile() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const { t } = useI18n();
  const [worker, setWorker] = useState<WorkerData | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [availabilitySummary, setAvailabilitySummary] = useState<{
    status: string;
    message: string;
    nextAvailableDate: string | null;
  } | null>(null);
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean; reason?: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingWorker, setSavingWorker] = useState(false);
  const pendingBookingRef = useRef<BookingFormValues | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedProvince = watch("province");
  const selectedDistrict = watch("district");
  const availableDistricts = (DISTRICTS as Record<string, string[]>)[selectedProvince] || [];


  useEffect(() => {
    if (!id) return;
    const fetchWorker = async () => {
      try {
        const res = await api.get(`/workers/${id}`);
        setWorker(res.data);
      } catch (error) {
        toast.error(t('workers.failedToLoad') || "Failed to load worker profile");
      } finally {
        setPageLoading(false);
      }
    };
    fetchWorker();
  }, [id]);

  // Fetch availability summary
  useEffect(() => {
    if (!id) return;
    const fetchAvailability = async () => {
      try {
        const res = await api.get(`/availability/worker/${id}/summary`);
        setAvailabilitySummary(res.data);
      } catch {
        // Silently fail - availability is optional display
      }
    };
    fetchAvailability();
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    const checkSaved = async () => {
      try {
        const res = await api.get(`/saved-workers/${id}/check`);
        setIsSaved(res.data.isSaved);
      } catch (error) {
        console.error("Failed to check saved status", error);
      }
    };
    checkSaved();
  }, [user, id]);

  useEffect(() => {
    if (!user || !id) return;
    const checkContactAccess = async () => {
      try {
        const res = await api.get("/bookings");
        const bookings = res.data;
        const hasAccess = bookings.some(
          (b: { workerId?: string; status: string; payment?: { paymentStatus: string } }) =>
            b.workerId === id &&
            b.status === "ACCEPTED" &&
            b.payment?.paymentStatus === "COMPLETED"
        );
        setContactUnlocked(hasAccess);
      } catch {
        setContactUnlocked(false);
      }
    };
    checkContactAccess();
  }, [user, id]);

  const submitBooking = useCallback(async (data: BookingFormValues) => {
    if (!worker) return;
    setLoading(true);
    try {
      const locationString = `${data.address}, ${data.city}, ${data.district}, ${data.province}`;
      await api.post("/bookings", {
        workerId: worker.id,
        categoryId: worker.categoryId,
        description: data.description,
        location: locationString,
        province: data.province,
        district: data.district,
        city: data.city,
        area: data.area || undefined,
        preferredDate: new Date(data.date + "T00:00:00").toISOString(),
        preferredTime: data.time || undefined,
        estimatedPrice: data.budget ? parseFloat(data.budget) : undefined,
      });
      toast.success(t('bookings.bookingSent'));
      setShowBooking(false);
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      const errMsg = Array.isArray(msg) ? msg.join(", ") : (msg || t('bookings.failedToSend') || "Failed to send booking request.");
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [worker]);

  const onBook = async (data: BookingFormValues) => {
    if (!user) {
      pendingBookingRef.current = data;
      setShowAuthModal(true);
      return;
    }
    await submitBooking(data);
  };

  useEffect(() => {
    if (user && pendingBookingRef.current) {
      const data = pendingBookingRef.current;
      pendingBookingRef.current = null;
      submitBooking(data);
    }
  }, [user, submitBooking]);

  const toggleSaveWorker = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSavingWorker(true);
    try {
      if (isSaved) {
        await api.delete(`/saved-workers/${id}`);
        setIsSaved(false);
        toast.success(t('saved.workerRemoved') || "Worker removed from saved");
      } else {
        await api.post(`/saved-workers/${id}`);
        setIsSaved(true);
        toast.success("Worker saved successfully");
      }
    } catch (error) {
      toast.error("Failed to update saved status");
    } finally {
      setSavingWorker(false);
    }
  };

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedBookingDate || !id) {
      setAvailableSlots([]);
      return;
    }
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await api.get(`/availability/worker/${id}/slots`, {
          params: { date: selectedBookingDate },
        });
        setAvailableSlots(res.data.slots || []);
      } catch {
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedBookingDate, id]);

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!worker) {
    return <div className="text-center pt-32 text-gray-500">{t('workers.notFound')}</div>;
  }

  const avgRating = worker.reviewsReceived?.length 
    ? (worker.reviewsReceived.reduce((acc, curr) => acc + curr.rating, 0) / worker.reviewsReceived.length).toFixed(1) 
    : "New";

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <AnimatedSection className="bg-white rounded-3xl p-8 md:p-12 mb-8 border border-gray-100 card-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded-full border-4 border-white shadow-xl shrink-0 overflow-hidden relative">
               {worker.user?.profileImage ? (
                  <Image src={worker.user.profileImage} alt={worker.user.fullName} fill sizes="(max-width: 768px) 128px, 160px" className="object-cover" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary text-4xl font-bold bg-primary/10">
                    {worker.user?.fullName?.charAt(0) || "W"}
                  </div>
               )}
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 justify-center md:justify-start">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{worker.user?.fullName}</h1>
                {worker.verificationStatus === "VERIFIED" && <HiCheckCircle className="text-green-500 text-2xl hidden md:block" title={t('home.verified')} />}
              </div>
              <p className="text-xl text-primary font-medium mb-4">{worker.category?.name || t('workerProfilePage.professional')}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600 mb-6">
                <span className="flex items-center gap-1"><HiOutlineLocationMarker className="text-lg" /> {worker.city}, {worker.district}</span>
                <span className="flex items-center gap-1 text-orange-500 font-bold"><HiStar className="text-lg" /> {avgRating} ({worker.reviewsReceived?.length || 0} {t('workerProfilePage.reviews')})</span>
                {worker.hourlyRate && <span className="flex items-center gap-1"><HiOutlineCurrencyDollar className="text-lg" /> LKR {worker.hourlyRate}/hr</span>}
                <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-800 font-medium">{worker.experienceYears} {t('workerProfilePage.yrsExp')}</span>
                {/* Availability Badge */}
                {availabilitySummary && (
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium ${
                    availabilitySummary.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                    availabilitySummary.status === 'BUSY' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {availabilitySummary.status === 'AVAILABLE' && <HiOutlineCheckCircle className="w-4 h-4" />}
                    {availabilitySummary.status === 'BUSY' && <HiOutlineClock className="w-4 h-4" />}
                    {availabilitySummary.status === 'UNAVAILABLE' && <HiOutlineLockClosed className="w-4 h-4" />}
                    {availabilitySummary.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button 
                  onClick={() => setShowBooking(!showBooking)}
                  className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all"
                >
                  {showBooking ? t('workers.cancelBooking') : t('workers.bookNow')}
                </button>
                <button 
                  onClick={toggleSaveWorker}
                  disabled={savingWorker}
                  className={`px-8 py-3 font-bold rounded-xl border transition-all ${isSaved ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200' : 'bg-white text-primary border-primary hover:bg-primary/5'} disabled:opacity-50`}
                >
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-8">
            {showBooking ? (
              <AnimatedSection className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
                 <h2 className="text-2xl font-bold mb-6">{t('bookings.requestService')}</h2>
                <form onSubmit={handleSubmit(onBook)} className="space-y-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookings.issueDescription')}</label>
                    <textarea {...register("description")} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" placeholder={t('bookings.issuePlaceholder')}></textarea>
                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookings.preferredDate')}</label>
                      <input
                        {...register("date")}
                        type="date"
                        onChange={(e) => {
                          register("date").onChange(e);
                          setSelectedBookingDate(e.target.value);
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                      {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>}
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookings.preferredTime')}</label>
                      {loadingSlots ? (
                        <div className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-500">
                          Loading slots...
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <select
                          {...register("time")}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                          <option value="">Select time</option>
                          {availableSlots.map((slot) => (
                            <option key={slot.time} value={slot.time} disabled={!slot.available}>
                              {slot.time} {!slot.available ? `(${slot.reason || 'Booked'})` : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input {...register("time")} type="time" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                      )}
                    </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookings.estimatedBudget')}</label>
                    <input {...register("budget")} type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" placeholder={t('bookings.budgetPlaceholder')} />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookings.selectProvince')}</label>
                    <select {...register("province")} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="">{t('bookings.selectProvince')}</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {errors.province && <p className="mt-1 text-sm text-red-500">{errors.province.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookings.selectDistrict')}</label>
                      <select {...register("district")} disabled={!selectedProvince} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50">
                        <option value="">{t('bookings.selectDistrict')}</option>
                        {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      {errors.district && <p className="mt-1 text-sm text-red-500">{errors.district.message}</p>}
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookings.enterCity')}</label>
                      <input {...register("city")} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" placeholder={t('bookings.enterCity')} />
                      {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookings.areaNeighborhood')}</label>
                      <input {...register("area")} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" placeholder={t('bookings.areaPlaceholder')} />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookings.streetAddress')}</label>
                      <input {...register("address")} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" placeholder={t('bookings.streetPlaceholder')} />
                      {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all disabled:opacity-50">
                    {loading ? t('bookings.sendingRequest') : t('bookings.submitBooking')}
                  </button>
                </form>
              </AnimatedSection>
            ) : (
              <AnimatedSection className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
                <h2 className="text-2xl font-bold mb-4">{t('workers.aboutMe')}</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {worker.description || t('workers.noDescription')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {worker.skills?.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </AnimatedSection>
            )}
            
            {worker.portfolioImages && worker.portfolioImages.length > 0 && (
              <AnimatedSection delay={0.05} className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <HiOutlinePhotograph className="text-primary" /> {t('workers.gallery')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {worker.portfolioImages.map((img) => (
                    <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative">
                      <Image src={img.url} alt="Portfolio" fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            )}
            
            <AnimatedSection delay={0.1} className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
              <h2 className="text-2xl font-bold mb-6">{t('workers.recentReviews')}</h2>
              <div className="space-y-6">
                {!worker.reviewsReceived || worker.reviewsReceived.length === 0 ? (
                  <p className="text-gray-500 italic">{t('workers.noReviews')}</p>
                ) : (
                  worker.reviewsReceived.map((review, i) => (
                    <div key={i} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{review.customer?.fullName || t('workers.customer')}</h4>
                          <div className="flex text-orange-500 text-sm mt-1">
                            {Array.from({length: 5}).map((_, idx) => (
                               <HiStar key={idx} className={idx < review.rating ? "text-orange-500" : "text-gray-200"} />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-600 mt-2 text-sm italic">&ldquo;{review.comment}&rdquo;</p>
                      
                      {review.reply && (
                        <div className="mt-3 ml-4 pl-4 border-l-2 border-primary/20">
                          <p className="text-xs font-bold text-primary mb-1">{t('workers.workersReply')}</p>
                          <p className="text-sm text-gray-700">{review.reply}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </AnimatedSection>
          </div>

          <div className="space-y-8">
            <AnimatedSection delay={0.2} className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow">
               <h3 className="font-bold text-gray-900 mb-4">{t('workers.pricing')}</h3>
               <div className="text-3xl font-extrabold text-primary mb-2">
                 {worker.hourlyRate ? `LKR ${worker.hourlyRate}` : t('workers.discussPricing')} 
                 {worker.hourlyRate && <span className="text-sm font-medium text-gray-500"> {t('workers.perHourUnit')}</span>}
               </div>
               <p className="text-sm text-gray-500">{t('workers.estimatesMayVary')}</p>
            </AnimatedSection>

            <AnimatedSection delay={0.3} className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow">
               <h3 className="font-bold text-gray-900 mb-4">{t('workers.certificationsVerification')}</h3>
              <div className="space-y-4">
                {worker.verificationStatus === "VERIFIED" ? (
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                       <HiCheckCircle size={20} />
                     </div>
                     <div>
                       <h4 className="font-semibold text-gray-900 text-sm">{t('workers.backgroundChecked')}</h4>
                        <p className="text-xs text-gray-500">{t('workers.identityVerified')}</p>
                     </div>
                   </div>
                ) : (
                   <p className="text-xs text-gray-500 italic">{t('workers.notVerified')}</p>
                )}
                {worker.certificates && worker.certificates.length > 0 && (
                  <div className="space-y-3 pt-2">
                     <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">{t('workers.certificates')}</p>
                    {worker.certificates.map((cert) => (
                      <div key={cert.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <HiOutlineDocumentText className="w-8 h-8 text-primary flex-shrink-0" />
                        <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate">
                          {t('workers.viewCertificate')}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.33} className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow">
               <h3 className="font-bold text-gray-900 mb-4">{t('workers.workingHours')}</h3>
              <div className="space-y-2">
                {Object.entries(worker.workingHours || {}).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium text-gray-700">{day}</span>
                    {hours.available ? (
                      <span className="text-gray-600">{hours.start} - {hours.end}</span>
                    ) : (
                       <span className="text-gray-400 italic">{t('workers.unavailable')}</span>
                    )}
                  </div>
                ))}
                {(!worker.workingHours || Object.keys(worker.workingHours).length === 0) && (
                   <p className="text-xs text-gray-500 italic">{t('workers.hoursNotSpecified')}</p>
                )}
              </div>
            </AnimatedSection>

            {/* Availability Calendar Mini */}
            <AnimatedSection delay={0.34} className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HiOutlineCalendar className="text-primary" />
                {t('availability.title')}
              </h3>
              <AvailabilityMiniCalendar workerId={id} t={t} />
            </AnimatedSection>

            <AnimatedSection delay={0.35} className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow">
               <h3 className="font-bold text-gray-900 mb-4">{t('workers.contactWorker')}</h3>
              {contactUnlocked ? (
                <div className="space-y-3">
                  {worker.user?.email && (
                    <a href={`mailto:${worker.user.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <HiOutlineMail className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                         <p className="text-xs text-gray-500">{t('workers.email')}</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{worker.user.email}</p>
                      </div>
                    </a>
                  )}
                  {worker.user?.phoneNumber && (
                    <a href={`tel:${worker.user.phoneNumber}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <HiOutlinePhone className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                         <p className="text-xs text-gray-500">{t('workers.phone')}</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{worker.user.phoneNumber}</p>
                      </div>
                    </a>
                  )}
                  {!worker.user?.email && !worker.user?.phoneNumber && (
                     <p className="text-xs text-gray-500 italic">{t('workers.noContactInfo')}</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HiOutlineLockClosed className="w-6 h-6 text-gray-400" />
                  </div>
                   <p className="text-sm text-gray-500 mb-1">{t('workers.contactLocked')}</p>
                   <p className="text-xs text-gray-400">
                     {t('workers.contactLockedDesc')}
                  </p>
                </div>
              )}
            </AnimatedSection>
          </div>
          
        </div>
      </div>

      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          pendingBookingRef.current = null;
        }}
        returnTo={`/workers/${id}`}
      />
    </div>
  );
}
