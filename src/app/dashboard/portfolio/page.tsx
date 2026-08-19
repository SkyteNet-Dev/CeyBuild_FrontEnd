"use client";

import { useState, useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import {
  HiOutlineUpload,
  HiOutlineTrash,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
  HiOutlineEye,
} from "react-icons/hi";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useI18n } from "@/i18n/I18nProvider";
import { compressImage, formatFileSize } from "@/lib/image-compress";

type ImageCard = {
  id: string;
  url: string;
  publicId?: string;
  type: "PORTFOLIO" | "CERTIFICATE" | "LICENSE";
};

export default function PortfolioPage() {
  const { t } = useI18n();
  const [images, setImages] = useState<ImageCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const profileRes = await api.get("/users/profile");
      const workerProfile = profileRes.data.workerProfile;

      if (!workerProfile) {
        setLoading(false);
        return;
      }

      const workerId = workerProfile.id;

      if (!workerId) {
        setLoading(false);
        return;
      }

      const workerRes = await api.get(`/workers/${workerId}`);
      const worker = workerRes.data;

      const allImages: ImageCard[] = [];

      if (worker.portfolioImages) {
        worker.portfolioImages.forEach((img: any) => {
          allImages.push({
            id: img.id,
            url: img.url,
            publicId: img.publicId,
            type: "PORTFOLIO",
          });
        });
      }

      if (worker.certificates) {
        worker.certificates.forEach((img: any) => {
          const isLicense = img.url?.toLowerCase().includes("license");
          allImages.push({
            id: img.id,
            url: img.url,
            publicId: img.publicId,
            type: isLicense ? "LICENSE" : "CERTIFICATE",
          });
        });
      }

      setImages(allImages);
    } catch (error) {
      console.error("Failed to load portfolio images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (type: "PORTFOLIO" | "CERTIFICATE" | "LICENSE") => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = false;
    fileInput.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const toastId = toast.loading(t('portfolio.optimizing', { type: type.toLowerCase() }));
      setUploading(true);

      try {
        const compressed = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85,
          outputFormat: "image/webp",
        });

        const savings = Math.round((1 - compressed.size / file.size) * 100);
        if (savings > 0) {
          toast.loading(
            t('portfolio.compressed', { from: formatFileSize(file.size), to: formatFileSize(compressed.size), percent: savings }),
            { id: toastId }
          );
        }

        const formData = new FormData();
        formData.append("file", compressed);

        const apiType = type === "PORTFOLIO" ? "portfolio" : "certificate";
        const res = await api.post(`/images/upload?workerId=current&type=${apiType}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const newDoc: ImageCard = {
          id: res.data.id,
          url: res.data.url,
          publicId: res.data.publicId,
          type,
        };
        setImages((prev) => [...prev, newDoc]);
        toast.success(t('portfolio.uploadedSuccessfully', { type: type.charAt(0) + type.slice(1).toLowerCase() }), { id: toastId });
      } catch (error: any) {
        const msg = error?.response?.data?.message || t('portfolio.uploadFailed');
        toast.error(typeof msg === "string" ? msg : t('portfolio.uploadFailed'), { id: toastId });
      } finally {
        setUploading(false);
      }
    };
    fileInput.click();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('portfolio.confirmDelete'))) return;

    const toastId = toast.loading(t('portfolio.deletingImage'));
    try {
      await api.delete(`/images/${id}`);
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast.success(t('portfolio.imageDeleted'), { id: toastId });
    } catch (error: any) {
      const msg = error?.response?.data?.message || t('portfolio.deleteFailed');
      toast.error(typeof msg === "string" ? msg : t('portfolio.deleteFailed'), { id: toastId });
    }
  };

  const portfolioImages = images.filter((img) => img.type === "PORTFOLIO");
  const documentImages = images.filter((img) => img.type === "CERTIFICATE" || img.type === "LICENSE");

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
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('portfolio.title')}</h1>
        <p className="text-gray-500 mt-2">
          {t('portfolio.subtitle')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatedSection delay={0.1}>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 card-shadow flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <HiOutlinePhotograph className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('portfolio.portfolioImages')}</p>
              <p className="text-2xl font-bold text-gray-900">{portfolioImages.length}</p>
            </div>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.15}>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 card-shadow flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-green-50">
              <HiOutlineDocumentText className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('portfolio.documents')}</p>
              <p className="text-2xl font-bold text-gray-900">{documentImages.length}</p>
            </div>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 card-shadow flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-50">
              <HiOutlineUpload className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('portfolio.totalUploads')}</p>
              <p className="text-2xl font-bold text-gray-900">{images.length}</p>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* Portfolio Section */}
      <AnimatedSection className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <HiOutlinePhotograph className="text-primary" /> {t('portfolio.workPortfolio')}
          </h2>
          <button
            onClick={() => handleUpload("PORTFOLIO")}
            disabled={uploading}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl transition-colors font-medium flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <HiOutlineUpload className="w-4 h-4" /> {t('portfolio.addWorkImage')}
          </button>
        </div>

        {portfolioImages.length === 0 ? (
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="text-center text-gray-500">
              <HiOutlinePhotograph className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">{t('portfolio.noPortfolioImages')}</p>
              <p className="text-sm mt-1">{t('portfolio.noPortfolioImagesDesc')}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {portfolioImages.map((img) => (
              <div
                key={img.id}
                className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 bg-gray-50"
              >
                <img src={img.url} alt="Portfolio" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPreviewImage(img.url)}
                    className="bg-white text-gray-700 p-2.5 rounded-full hover:bg-gray-100 shadow-lg"
                    title={t('portfolio.preview')}
                  >
                    <HiOutlineEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="bg-white text-red-600 p-2.5 rounded-full hover:bg-red-50 shadow-lg"
                    title={t('common.delete')}
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatedSection>

      {/* Documents Section */}
      <AnimatedSection delay={0.1} className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineDocumentText className="text-primary" /> {t('portfolio.certificatesLicenses')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleUpload("CERTIFICATE")}
              disabled={uploading}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors font-medium flex items-center gap-2 text-sm border border-gray-200 disabled:opacity-50"
            >
              <HiOutlineUpload className="w-4 h-4" /> {t('portfolio.certificate')}
            </button>
            <button
              onClick={() => handleUpload("LICENSE")}
              disabled={uploading}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors font-medium flex items-center gap-2 text-sm border border-gray-200 disabled:opacity-50"
            >
              <HiOutlineUpload className="w-4 h-4" /> {t('portfolio.license')}
            </button>
          </div>
        </div>

        {documentImages.length === 0 ? (
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="text-center text-gray-500">
              <HiOutlineDocumentText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">{t('portfolio.noDocuments')}</p>
              <p className="text-sm mt-1">{t('portfolio.noDocumentsDesc')}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {documentImages.map((img) => (
              <div
                key={img.id}
                className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 bg-gray-50 flex items-center justify-center"
              >
                <img src={img.url} alt="Document" className="max-w-full max-h-full object-contain p-2" />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-gray-700 uppercase">
                  {img.type}
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPreviewImage(img.url)}
                    className="bg-white text-gray-700 p-2.5 rounded-full hover:bg-gray-100 shadow-lg"
                    title={t('portfolio.preview')}
                  >
                    <HiOutlineEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="bg-white text-red-600 p-2.5 rounded-full hover:bg-red-50 shadow-lg"
                    title={t('common.delete')}
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatedSection>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Preview" className="w-full h-full object-contain rounded-xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
