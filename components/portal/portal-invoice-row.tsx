"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";
import { InvoiceReceiptModal } from "./invoice-receipt-modal";

export function PortalInvoiceRow({ invoice }: { invoice: any }) {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowModal(true)}
        className="h-7 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 gap-1"
      >
        <FileText className="h-3 w-3" />
        <span>View & Print</span>
      </Button>

      {showModal && (
        <InvoiceReceiptModal
          invoice={invoice}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
