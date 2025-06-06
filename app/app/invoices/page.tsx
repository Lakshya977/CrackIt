
import ListInvoices from "@/components/invoice/invoiceList";
import { getAuthHeader } from "@/helper/auth";
import { cookies } from "next/headers";
import React from "react";

async function getInvoices() {
  try {
    const nextCookies = await cookies();
    const authHeader = getAuthHeader(nextCookies);

    const response = await fetch(
      `${process.env?.API_URL}/api/invoices`,
      authHeader
    );

    if (!response.ok) {
      throw new Error("An error occurred while fetching the data");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

const InvoicesPage = async () => {
  const data = await getInvoices();
  return <ListInvoices invoices={data?.invoices} />;
};

export default InvoicesPage;