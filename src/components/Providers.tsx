"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "@/contexts/SocketContext";
import NotificationListener from "@/components/dashboard/NotificationListener";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SocketProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <NotificationListener />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </SocketProvider>
  );
}
