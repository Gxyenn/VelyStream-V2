import {
  Pagination as PaginationContainer,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import React from "react";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const Pagination = ({ currentPage, lastPage, onPageChange, hasNextPage, hasPreviousPage }: PaginationProps) => {
  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasPreviousPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    // Show up to 5 page numbers, centered around the current page
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(lastPage, currentPage + 2);

    if (endPage - startPage < 4) {
      if(currentPage < 3) {
        endPage = Math.min(lastPage, 5);
      } else {
        startPage = Math.max(1, lastPage - 4);
      }
    }
    
    if (startPage > 1) {
      pageNumbers.push(<PaginationItem key={1}><PaginationLink href="#" onClick={(e) => {e.preventDefault(); onPageChange(1);}}>1</PaginationLink></PaginationItem>);
      if (startPage > 2) {
        pageNumbers.push(<PaginationItem key="start-ellipsis"><PaginationEllipsis /></PaginationItem>);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <PaginationItem key={i}>
          <PaginationLink href="#" isActive={i === currentPage} onClick={(e) => {e.preventDefault(); onPageChange(i);}}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    if (endPage < lastPage) {
       if (endPage < lastPage - 1) {
         pageNumbers.push(<PaginationItem key="end-ellipsis"><PaginationEllipsis /></PaginationItem>);
       }
       pageNumbers.push(<PaginationItem key={lastPage}><PaginationLink href="#" onClick={(e) => {e.preventDefault(); onPageChange(lastPage);}}>{lastPage}</PaginationLink></PaginationItem>);
    }

    return pageNumbers;
  };

  return (
    <PaginationContainer>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={handlePrevious} className={!hasPreviousPage ? "pointer-events-none opacity-50" : ""} />
        </PaginationItem>
        {renderPageNumbers()}
        <PaginationItem>
          <PaginationNext href="#" onClick={handleNext} className={!hasNextPage ? "pointer-events-none opacity-50" : ""} />
        </PaginationItem>
      </PaginationContent>
    </PaginationContainer>
  );
};