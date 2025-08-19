import Dashboard from "@/components/dashboard/Dashboard";
import { getAuthHeader } from "@/helper/auth";
import { cookies } from "next/headers";

async function getDashboardStats(
  searchParams: Record<string, string | string[] | undefined>
) {
  try {
    const urlParams = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
      if (Array.isArray(value)) {
        value.forEach((val) => urlParams.append(key, val));
      } else if (value) {
        urlParams.append(key, value);
      }
    }
    const queryStr = urlParams.toString();

    const cookieStore = await cookies();
    const authHeader = getAuthHeader(cookieStore);

    const response = await fetch(
      `${process.env.API_URL}/api/dashboard/stats${queryStr ? `?${queryStr}` : ""}`,
      {
        ...authHeader,
        cache: "no-store", // prevents caching
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error(error.message || "An error occurred while fetching the data");
  }
}

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>; // ✅ mark as Promise
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const resolvedSearchParams = await searchParams; 
  const data = await getDashboardStats(resolvedSearchParams);

  return <Dashboard data={data?.data} />;
};

export default DashboardPage;
