"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.print()}
      className="gap-1.5 text-xs"
    >
      <Printer className="h-4 w-4" />
      Print / Save PDF
    </Button>
  );
}
