import React from "react";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";

/**
 * Common Pagination Component
 *
 * Props:
 * - pageCount (number): Total number of pages
 * - currentPage (number): Current active page (0-based)
 * - onPageChange (function): Callback when page changes
 * - className (string): Optional custom container class
 */

const Pagination = ({
  pageCount = 1,
  currentPage = 1,
  onPageChange,
  className = "",
}) => {
  return (
    <ReactPaginate
      previousLabel={"Previous"}
      nextLabel={"Next"}
      breakLabel={"..."}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={5}
      onPageChange={onPageChange}
      forcePage={currentPage ? currentPage - 1 : null} // Convert to 0-based index
      containerClassName={`pagination justify-content-center mt-3 gap-1 ${className}`}
      pageClassName="page-item"
      pageLinkClassName="btn btn-outline-primary"
      previousClassName="page-item"
      previousLinkClassName="btn btn-outline-primary"
      nextClassName="page-item"
      nextLinkClassName="btn btn-outline-primary"
      breakClassName="page-item"
      breakLinkClassName="btn btn-outline-secondary"
      activeLinkClassName="btn btn-primary text-white"
      disabledClassName="disabled opacity-50 cursor-not-allowed"
    />
  );
};

export default Pagination;
