import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const workerRes = await fetch(`${apiUrl}/workers/${id}`, { next: { revalidate: 60 } });
    
    if (!workerRes.ok) {
      return { title: "Worker Profile | CeyBuild" };
    }
    
    const worker = await workerRes.json();
    const name = worker.user?.fullName || "Worker";
    const category = worker.category?.name || "Professional";
    const district = worker.district || "Sri Lanka";
    
    return {
      title: `${name} - ${category} in ${district} | CeyBuild`,
      description: worker.description?.substring(0, 160) || `Hire ${name}, a professional ${category} in ${district}, Sri Lanka on CeyBuild. View profile, reviews, and book services online.`,
      openGraph: {
        title: `${name} - ${category}`,
        description: `Hire ${name} on CeyBuild.`,
        images: worker.user?.profileImage ? [{ url: worker.user.profileImage }] : [],
      }
    };
  } catch (error) {
    return { title: "Worker Profile | CeyBuild" };
  }
}

export default function WorkerProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
