"use client";

import { useEffect, useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { HiStar, HiOutlineChatAlt2 } from "react-icons/hi";
import { useI18n } from "@/i18n/I18nProvider";

type Review = {
  id: string;
  rating: number;
  comment?: string;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    profileImage?: string;
  };
  booking?: {
    id: string;
    description: string;
    category?: { name: string };
  };
};

export default function WorkerReviewsPage() {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "REPLIED" | "PENDING">("ALL");

  const fetchReviews = async () => {
    try {
      const res = await api.get("/bookings");
      const bookings = res.data;
      const reviewsData: Review[] = [];

      for (const booking of bookings) {
        if (booking.review) {
          reviewsData.push({
            id: booking.review.id,
            rating: booking.review.rating,
            comment: booking.review.comment,
            reply: booking.review.reply,
            repliedAt: booking.review.repliedAt,
            createdAt: booking.review.createdAt,
            customer: booking.customer,
            booking: {
              id: booking.id,
              description: booking.description,
              category: booking.category,
            },
          });
        }
      }

      setReviews(reviewsData);
    } catch (error) {
      toast.error(t("reviews.failedToLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error(t('reviews.enterReply') || "Please enter a reply");
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/reviews/${reviewId}/reply`, { reply: replyText });
      toast.success(t("reviews.replySubmitted"));
      setReplyingTo(null);
      setReplyText("");
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("reviews.failedToSubmit"));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === "REPLIED") return review.reply;
    if (filter === "PENDING") return !review.reply;
    return true;
  });

  const stats = {
    total: reviews.length,
    averageRating: reviews.length
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0",
    replied: reviews.filter((r) => r.reply).length,
    pending: reviews.filter((r) => !r.reply).length,
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t("reviews.title")}</h1>
        <p className="text-gray-500 mt-2">{t("reviews.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedSection delay={0.1}>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow">
            <p className="text-sm text-gray-500">{t("dashboard.stats.totalReviews")}</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.15}>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow">
            <p className="text-sm text-gray-500">{t("dashboard.stats.averageRating")}</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-orange-500">{stats.averageRating}</p>
              <HiStar className="text-orange-500 text-xl" />
            </div>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow">
            <p className="text-sm text-gray-500">{t("dashboard.stats.replied")}</p>
            <p className="text-3xl font-bold text-green-600">{stats.replied}</p>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.25}>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow">
            <p className="text-sm text-gray-500">{t("dashboard.stats.pendingReply")}</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
          </div>
        </AnimatedSection>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {(["ALL", "PENDING", "REPLIED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? "bg-primary text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f === "ALL" ? t("reviews.allReviews") : f}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 card-shadow">
            <HiStar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">{t("reviews.noReviews")}</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <AnimatedSection key={review.id}>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {review.customer.profileImage ? (
                          <img
                            src={review.customer.profileImage}
                            alt={review.customer.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          review.customer.fullName.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{review.customer.fullName}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {review.booking && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                          {review.booking.category?.name || t('reviews.service')}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={i < review.rating ? "text-orange-500" : "text-gray-300"}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    {review.comment && (
                      <p className="text-gray-600 text-sm italic">&ldquo;{review.comment}&rdquo;</p>
                    )}
                  </div>

                  {!review.reply && (
                    <button
                      onClick={() =>
                        setReplyingTo(replyingTo === review.id ? null : review.id)
                      }
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors"
                    >
                      <HiOutlineChatAlt2 className="w-4 h-4" />
                      {t("reviews.reply")}
                    </button>
                  )}
                </div>

                {review.reply && (
                  <div className="mt-4 ml-12 pl-4 border-l-2 border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary">{t("reviews.yourReply")}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(review.repliedAt!).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{review.reply}</p>
                  </div>
                )}

                {replyingTo === review.id && (
                  <div className="mt-4 ml-12 pl-4 border-l-2 border-primary/20">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={t("reviews.writeReply")}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleReply(review.id)}
                        disabled={submitting || !replyText.trim()}
                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover disabled:opacity-50"
                      >
                        {submitting ? t("reviews.submitting") : t("reviews.submitReply")}
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                      >
                        {t('reviews.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </AnimatedSection>
          ))
        )}
      </div>
    </div>
  );
}
