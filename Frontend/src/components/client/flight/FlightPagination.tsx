import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface FlightPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const FlightPagination: React.FC<FlightPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (currentPage <= 5) {
      for (let i = 1; i <= 8; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages - 1);
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 4) {
      pages.push(1);
      pages.push(2);
      pages.push('...');
      for (let i = totalPages - 6; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages - 1);
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-12 mb-8 animate-fade-in w-full">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-transparent text-primary transition-colors duration-200 hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Trang trước"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <div className="flex items-center gap-0.5 sm:gap-1">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <div 
                key={`ellipsis-${index}`} 
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-on-surface-variant"
              >
                <MoreHorizontal className="w-4 h-4" />
              </div>
            );
          }

          const isActive = page === currentPage;
          
          // Responsive layout: on mobile, show only first, last, current, and adjacent pages
          const isFirstOrLast = page === 1 || page === totalPages;
          const isCurrentOrAdjacent = page === currentPage || page === currentPage - 1 || page === currentPage + 1;
          const mobileVisibility = (!isFirstOrLast && !isCurrentOrAdjacent) ? 'hidden sm:flex' : 'flex';

          return (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page as number)}
              className={`w-8 h-8 sm:w-9 sm:h-9 items-center justify-center rounded-[4px] font-medium text-sm transition-all duration-200 ${mobileVisibility} ${
                isActive
                  ? 'bg-white text-black border border-black/20 shadow-sm'
                  : 'bg-transparent text-on-surface hover:bg-black/5 hover:text-black border border-transparent'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-transparent text-primary transition-colors duration-200 hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Trang sau"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};
