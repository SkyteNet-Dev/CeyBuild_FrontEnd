"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { HiOutlineArrowLeft, HiOutlinePrinter, HiOutlineArrowDownTray } from "react-icons/hi2";
import { useI18n } from "@/i18n/I18nProvider";
import api from "@/lib/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type InvoiceData = {
  invoice: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    advanceAmount: number;
    balanceAmount: number;
    commissionPercentage: number;
    commissionAmount: number;
    workerAmount: number;
    status: string;
    createdAt: string;
  };
  booking: {
    id: string;
    description: string;
    location: string;
    preferredDate: string;
    category: string;
    status: string;
  };
  customer: {
    fullName: string;
    email: string;
  };
  worker: {
    fullName: string;
    email: string;
  };
  payments: Array<{
    type: string;
    amount: number;
    status: string;
    transactionId?: string;
    createdAt: string;
  }>;
};

function InvoiceContent() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const bookingId = params.id as string;
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}/invoice`);
        setInvoice(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || t('invoice.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [bookingId, t]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!invoice) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor: [number, number, number] = [37, 99, 235];
    const lightGray: [number, number, number] = [245, 245, 245];
    let y = 0;

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("CeyBuild", 15, 18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(t('invoice.companyName'), 15, 26);

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(t('invoice.title'), pageWidth - 15, 18, { align: "right" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.invoice.invoiceNumber, pageWidth - 15, 26, { align: "right" });

    y = 52;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(t('invoice.billTo'), 15, y);
    doc.text(t('invoice.serviceProvider'), pageWidth / 2 + 5, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(invoice.customer.fullName, 15, y + 7);
    doc.text(invoice.customer.email, 15, y + 13);
    doc.text(invoice.worker.fullName, pageWidth / 2 + 5, y + 7);
    doc.text(invoice.worker.email, pageWidth / 2 + 5, y + 13);

    y = 80;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(t('invoice.bookingDetails'), 15, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const bookingInfo = [
      [t('invoice.service'), invoice.booking.category],
      [t('invoice.date'), new Date(invoice.booking.preferredDate).toLocaleDateString()],
      [t('invoice.location'), invoice.booking.location],
      [t('invoice.reference'), invoice.booking.id.slice(0, 8).toUpperCase()],
    ];

    autoTable(doc, {
      startY: y + 5,
      head: [],
      body: bookingInfo,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 35 },
        1: { cellWidth: 100 },
      },
      margin: { left: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(t('invoice.paymentInfo'), 15, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const paymentInfo = [
      [t('invoice.invoiceDate'), new Date(invoice.invoice.createdAt).toLocaleDateString()],
      [t('invoice.status'), invoice.invoice.status],
    ];

    autoTable(doc, {
      startY: y + 5,
      head: [],
      body: paymentInfo,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 35 },
        1: { cellWidth: 100 },
      },
      margin: { left: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 12;
    const tableBody = [
      [t('invoice.serviceTotal'), `LKR ${Number(invoice.invoice.totalAmount).toLocaleString()}`],
      [t('invoice.advancePayment'), `LKR ${Number(invoice.invoice.advanceAmount).toLocaleString()}`],
      [t('invoice.balancePayment'), `LKR ${Number(invoice.invoice.balanceAmount).toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: y,
      head: [[t('invoice.description'), t('invoice.amount')]],
      body: tableBody,
      theme: "striped",
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { halign: "right", cellWidth: 60 },
      },
      margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
    const summaryBody = [
      [t('invoice.ceybuildCommission', { percentage: invoice.invoice.commissionPercentage }), `LKR ${Number(invoice.invoice.commissionAmount).toLocaleString()}`],
      [t('invoice.workerEarnings'), `LKR ${Number(invoice.invoice.workerAmount).toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: y,
      head: [],
      body: summaryBody,
      theme: "striped",
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 100 },
        1: { halign: "right", cellWidth: 60 },
      },
      margin: { left: 15, right: 15 },
    });

    if (invoice.payments.length > 0) {
      y = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(t('invoice.paymentTransactions'), 15, y);

      const paymentRows = invoice.payments.map((p) => [
        `${p.type} ${t('invoice.payment')}`,
        new Date(p.createdAt).toLocaleDateString(),
        `LKR ${Number(p.amount).toLocaleString()}`,
        p.status,
      ]);

      autoTable(doc, {
        startY: y + 5,
        head: [[t('invoice.description'), t('invoice.date'), t('invoice.amount'), t('invoice.status')]],
        body: paymentRows,
        theme: "striped",
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 15, right: 15 },
      });
    }

    const finalY = (doc as any).lastAutoTable?.finalY || 260;
    const footerY = Math.max(finalY + 20, 270);

    doc.setDrawColor(200, 200, 200);
    doc.line(15, footerY, pageWidth - 15, footerY);

    doc.setTextColor(120, 120, 120);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(t('invoice.thankYou'), pageWidth / 2, footerY + 8, { align: "center" });
    doc.setFontSize(8);
    doc.text(t('invoice.computerGenerated'), pageWidth / 2, footerY + 14, { align: "center" });

    doc.save(`CeyBuild-Invoice-${invoice.invoice.invoiceNumber}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-500 mb-4">{error || t('invoice.invoiceNotAvailable')}</p>
          <button
            onClick={() => router.push("/dashboard/bookings")}
            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors"
          >
            {t('bookings.title')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6 no-print">
        <button
          onClick={() => router.push("/dashboard/bookings")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          {t('bookings.title')}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors"
          >
            <HiOutlinePrinter className="w-5 h-5" />
            {t('invoice.print')}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <HiOutlineArrowDownTray className="w-5 h-5" />
            {t('invoice.downloadPdf')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">CeyBuild</h1>
              <p className="text-white/80 text-sm mt-1">{t('invoice.companyName')}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold">{t('invoice.title')}</h2>
              <p className="text-white/80 text-sm mt-1">{invoice.invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-8">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('invoice.billTo')}</h3>
              <p className="font-semibold text-gray-900">{invoice.customer.fullName}</p>
              <p className="text-sm text-gray-500">{invoice.customer.email}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('invoice.serviceProvider')}</h3>
              <p className="font-semibold text-gray-900">{invoice.worker.fullName}</p>
              <p className="text-sm text-gray-500">{invoice.worker.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('invoice.bookingDetails')}</h3>
              <p className="text-sm text-gray-600"><span className="font-medium">{t('invoice.service')}</span> {invoice.booking.category}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">{t('invoice.date')}</span> {new Date(invoice.booking.preferredDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">{t('invoice.location')}</span> {invoice.booking.location}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">{t('invoice.reference')}</span> {invoice.booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('invoice.paymentInfo')}</h3>
              <p className="text-sm text-gray-600"><span className="font-medium">{t('invoice.invoiceDate')}</span> {new Date(invoice.invoice.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">{t('invoice.status')}</span> <span className="text-green-600 font-semibold">{invoice.invoice.status}</span></p>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('invoice.description')}</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">{t('invoice.amount')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{t('invoice.serviceTotal')}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">{Number(invoice.invoice.totalAmount).toLocaleString()}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-600">{t('invoice.advancePayment')}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">{Number(invoice.invoice.advanceAmount).toLocaleString()}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-600">{t('invoice.balancePayment')}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">{Number(invoice.invoice.balanceAmount).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Commission & Earnings */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">{t('invoice.ceybuildCommission', { percentage: invoice.invoice.commissionPercentage })}</h4>
              <p className="text-2xl font-bold text-amber-800">LKR {Number(invoice.invoice.commissionAmount).toLocaleString()}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">{t('invoice.workerEarnings')}</h4>
              <p className="text-2xl font-bold text-green-800">LKR {Number(invoice.invoice.workerAmount).toLocaleString()}</p>
            </div>
          </div>

          {/* Payment Transactions */}
          {invoice.payments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('invoice.paymentTransactions')}</h3>
              <div className="space-y-2">
                {invoice.payments.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{p.type} {t('invoice.payment')}</span>
                      <span className="text-xs text-gray-400 ml-2">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">LKR {Number(p.amount).toLocaleString()}</span>
                      <span className="text-xs text-green-600 ml-2">{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-400">{t('invoice.thankYou')}</p>
            <p className="text-xs text-gray-300 mt-1">{t('invoice.computerGenerated')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">{t('common.loading')}</div>}>
      <InvoiceContent />
    </Suspense>
  );
}
