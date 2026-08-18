"use client";

import { useI18n } from "@/i18n/I18nProvider";

interface AvailabilityIndicatorProps {
  availability: boolean;
  workingHours?: any;
  showLabel?: boolean;
}

export default function AvailabilityIndicator({ 
  availability, 
  workingHours, 
  showLabel = true 
}: AvailabilityIndicatorProps) {
  const { t } = useI18n();
  
  const getStatus = () => {
    if (!availability) {
      return {
        dotColor: "bg-red-500",
        label: t('availability.unavailable') || "Unavailable",
        textColor: "text-red-600",
        bgColor: "bg-red-50"
      };
    }
    
    if (workingHours) {
      const now = new Date();
      const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      
      const todaySchedule = workingHours[dayOfWeek];
      
      if (todaySchedule && !todaySchedule.available) {
        return {
          dotColor: "bg-amber-500",
          label: t('availability.busy') || "Busy Today",
          textColor: "text-amber-600",
          bgColor: "bg-amber-50"
        };
      }
      
      if (todaySchedule && todaySchedule.available) {
        if (todaySchedule.start && todaySchedule.end) {
          if (currentTime >= todaySchedule.start && currentTime <= todaySchedule.end) {
            return {
              dotColor: "bg-emerald-500",
              label: t('availability.available') || "Available Now",
              textColor: "text-emerald-600",
              bgColor: "bg-emerald-50"
            };
          }
        }
      }
    }
    
    return {
      dotColor: "bg-emerald-500",
      label: t('availability.available') || "Available",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50"
    };
  };
  
  const status = getStatus();
  
  return (
    <div className="flex items-center gap-2">
      <span className={`relative flex h-2.5 w-2.5`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status.dotColor} opacity-50`} />
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status.dotColor}`} />
      </span>
      {showLabel && (
        <span className={`text-sm font-semibold ${status.textColor}`}>
          {status.label}
        </span>
      )}
    </div>
  );
}
