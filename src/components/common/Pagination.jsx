import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible);
  start = Math.max(0, end - maxVisible);

  return (
    <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        <ChevronRight className="w-4 h-4" />
        הקודם
      </Button>
      {start > 0 && (
        <>
          <Button variant="outline" size="sm" onClick={() => onPageChange(0)}>1</Button>
          {start > 1 && <span className="px-1 text-slate-400">…</span>}
        </>
      )}
      {Array.from({ length: end - start }, (_, i) => start + i).map((p) => (
        <Button
          key={p}
          variant={p === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(p)}
        >
          {p + 1}
        </Button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
          <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages - 1)}>
            {totalPages}
          </Button>
        </>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      >
        הבא
        <ChevronLeft className="w-4 h-4" />
      </Button>
    </div>
  );
}