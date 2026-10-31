"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText } from "lucide-react";
import { RecordPaymentModal } from "./record-payment-modal";

export function InvoiceRowActions({
  invoice,
}: {
  invoice: {
    id: string;
    invoiceNumber: string;
    customerName: string;
    currency: string;
    outstandingAmount: string | number;
    grandTotal: string | number;
    status: string;
  };
}) {
  const [showModal, setShowModal] = React.useState(false);

  const canPay = invoice.status !== "PAID" && invoice.status !== "CANCELLED" && Number(invoice.outstandingAmount) > 0;

  return (
    <div className="flex items-center gap-1.5 justify-end">
      <Link href={`/dashboard/invoices/${invoice.id}`}>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
          title="View & Print Invoice"
        >
          <FileText className="h-3.5 w-3.5 mr-1" />
          <span>View</span>
        </Button>
      </Link>

      {canPay && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowModal(true)}
          className="h-7 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
        >
          <CreditCard className="h-3 w-3 mr-1" />
          <span>Pay</span>
        </Button>
      )}

      {showModal && (
        <RecordPaymentModal
          invoice={invoice}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
