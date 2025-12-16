import { Button } from "@heroui/react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = [];
  const showPages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  let endPage = Math.min(totalPages, startPage + showPages - 1);

  if (endPage - startPage + 1 < showPages) {
    startPage = Math.max(1, endPage - showPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
      <Button
        isDisabled={currentPage === 1}
        onPress={() => onPageChange(currentPage - 1)}
        variant="flat"
      >
        Previous
      </Button>

      {startPage > 1 && (
        <>
          <Button variant="flat" onPress={() => onPageChange(1)}>
            1
          </Button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          color={page === currentPage ? "primary" : "default"}
          variant={page === currentPage ? "solid" : "flat"}
          onPress={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <Button variant="flat" onPress={() => onPageChange(totalPages)}>
            {totalPages}
          </Button>
        </>
      )}

      <Button
        isDisabled={currentPage === totalPages}
        onPress={() => onPageChange(currentPage + 1)}
        variant="flat"
      >
        Next
      </Button>
    </div>
  );
}
