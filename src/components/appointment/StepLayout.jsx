import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function StepLayout({ children, onBack }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div className="w-10"></div>
        </div>
      </header>
      <main className="p-6 max-w-md mx-auto">
        {children}
      </main>
    </div>
  );
}