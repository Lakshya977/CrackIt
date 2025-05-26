import Dashboard from "@/components/dashboard/Dashboard";
import { getAuthHeader } from "@/helper/auth";
import { cookies } from "next/headers";

async function getDashboardStats(searchParams: Record<string, string | string[] | undefined>) {
  try {
    const urlParams = new URLSearchParams();
    // Convert searchParams object to query string
    for (const [key, value] of Object.entries(searchParams)) {
      if (Array.isArray(value)) {
        value.forEach((val) => urlParams.append(key, val));
      } else if (value) {
        urlParams.append(key, value);
      }
    }
    const queryStr = urlParams.toString();

    const nextCookies = await cookies();
    const authHeader = getAuthHeader(nextCookies);

    const response = await fetch(
      `${process.env.API_URL}/api/dashboard/stats${queryStr ? `?${queryStr}` : ''}`,
      authHeader
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error(error.message || "An error occurred while fetching the data");
  }
}

interface DashboardPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const data = await getDashboardStats(searchParams);

  return <Dashboard data={data?.data} />;
};

export default DashboardPage;