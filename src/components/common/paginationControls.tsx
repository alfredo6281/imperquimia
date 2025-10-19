// PaginationControls.tsx
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

export interface PaginationControlsProps {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  maxButtons?: number; // cuántos botones numéricos mostrar (por defecto 5)
  className?: string;
  labelPrefix?: string; // texto que aparece antes del "Mostrando..."
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  maxButtons = 5,
  className = "",
  labelPrefix = "Mostrando",
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  if (totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(totalItems, startIndex + itemsPerPage - 1);

  // Genera array de números de página a mostrar (centrado en currentPage)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const buttons = Math.min(maxButtons, totalPages);
    if (totalPages <= buttons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // Si hay más páginas que botones: centrar y ajustar bordes
    let start = 1;
    let end = buttons;
    if (currentPage <= Math.ceil(buttons / 2)) {
      start = 1;
      end = buttons;
    } else if (currentPage >= totalPages - Math.floor(buttons / 2)) {
      start = totalPages - buttons + 1;
      end = totalPages;
    } else {
      const offset = Math.floor(buttons / 2);
      start = currentPage - offset;
      end = currentPage + (buttons - offset - 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-between space-x-2 py-4 ${className}`}>
      <div className="text-sm text-slate-600">
        {labelPrefix} {startIndex} a {endIndex} de {totalItems} items
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {pageNumbers.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {totalPages > pageNumbers[pageNumbers.length - 1] && currentPage < totalPages - Math.floor(maxButtons / 2) && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationControls;
