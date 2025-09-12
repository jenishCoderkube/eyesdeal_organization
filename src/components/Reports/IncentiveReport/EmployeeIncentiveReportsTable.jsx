import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import moment from "moment";
import { reportService } from "../../../services/reportService";

const EmployeeIncentiveReportsTable = ({ data, amountData, employeeids, fromDate, toDate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [formattedData, setFormattedData] = useState([]);
  const [newamountData, setNewAmountData] = useState(amountData);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    setNewAmountData(amountData)
  }, [amountData])

  useEffect(() => {
    if (Array.isArray(data)) {
      const formattedData = processData(data);
      setFormattedData(formattedData);
    }
  }, [data]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      fetchOrders({
        search: debouncedQuery,
        fromDate: fromDate,
        toDate: toDate,
        salesRep: employeeids.value,
      });
      fetchIncentiveAmount({
        search: debouncedQuery,
        fromDate: fromDate,
        toDate: toDate,
        salesRep: employeeids.value,
      });
    }
  }, [debouncedQuery]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const fetchOrders = ({ search, fromDate, toDate, salesRep }) => {
    reportService.getIncentiveData({ search, fromDate, toDate, salesRep })
      .then(res => {
        const formattedData = processData(res.data?.data?.docs);
        setFormattedData(formattedData);
      })
      .catch(e => console.log("Failed to get pruchaselog: ", e))
  }

  const fetchIncentiveAmount = ({ search, fromDate, toDate, salesRep }) => {
    reportService.getIncentiveAmount({ search, fromDate, toDate, salesRep })
      .then(res => {
        setNewAmountData(res.data?.data?.docs?.[0].totalIncentiveAmount);
      })
      .catch(e => console.log("Failed to get pruchaselog: ", e))
  }

  const processData = (rawData) => {
    const processed = [];
    rawData.forEach((item) => {

      if (item.lens && item.product) {
        const date = moment(item.createdAt).format("YYYY-MM-DD");
        const billNumber = item.billNumber;

        processed.push({
          type: "Product",
          date,
          billNumber,
          brand: [item.product?.item?.brand?.name, item.product?.item?.__t].filter(Boolean).join(" ") || "",
          sku: item.product?.sku || "",
          mrp: item.product?.mrp || "",
          discount: item.product?.perPieceDiscount || "",
          percentage: item.product?.mrp
            ? ((item.product?.perPieceDiscount || 0) / item.product.mrp * 100).toFixed(2) + "%"
            : "",
          incentiveAmount: item.product?.incentiveAmount || "",
        });

        processed.push({
          type: "Lens",
          date,
          billNumber,
          brand: [item.lens?.item?.brand?.name, item.lens?.item?.__t].filter(Boolean).join(" ") || "",
          sku: item.lens?.sku || "",
          mrp: item.lens?.mrp || "",
          discount: item.lens?.perPieceDiscount || "",
          percentage: item.lens?.mrp
            ? ((item.lens?.perPieceDiscount || 0) / item.lens.mrp * 100).toFixed(2) + "%"
            : "",
          incentiveAmount: item.lens?.incentiveAmount || "",
        });
      }
    });

    return processed;
  };

  const columns = useMemo(
    () => [
      {
        header: "SRNO",
        size: 10,
        cell: ({ row }) => (<div className="text-left">{row.index + 1}</div>),
      },
      {
        accessorKey: "date",
        header: "Date",
        size: 70,
        cell: ({ getValue }) => (
          <div className="text-left">
            {moment(getValue()).format("DD/MM/YYYY")}
          </div>
        ),
      },
      {
        accessorKey: "billNumber",
        header: "Order No",
        size: 100,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "brand",
        header: "Brand",
        size: 210,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "sku",
        header: "SKU",
        size: 500,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "mrp",
        header: "Mrp",
        size: 60,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "discount",
        header: "Discount",
        size: 70,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "percentage",
        header: "Percentage",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "incentiveAmount",
        header: "Incentive Amount",
        size: 160,
        cell: ({ getValue }) => {
          const value = getValue();
          return <div className="text-left">{value === "" ? 0 : value}</div>;
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: formattedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item, index) => ({
        SRNO: index + 1,
        Date: item.date,
        Order_No: item.billNumber,
        Brand: item.brand,
        SKU: item.sku,
        MRP: item.mrp,
        Discount: item.discount,
        Percentage: item.percentage,
        Incentive_Amount: item.incentiveAmount,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IncentiveReport");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportProduct = () => {
    exportToExcel(formattedData, "EmployeeIncentiveReport");
  };

  // Pagination info
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, formattedData?.length);
  const totalRows = formattedData?.length;

  return (
    <div className="card-body p-0">
      <div className="d-flex flex-column px-3 flex-md-row gap-3 mb-4">
        <p className="mb-0 fw-normal text-black">
          Total Incentive Amount: {newamountData}
        </p>
        <div className="ms-md-auto d-flex gap-2">
          <button className="btn btn-primary" onClick={exportProduct}>
            Download
          </button>
        </div>
      </div>
      <div className="mb-4 col-md-6 ">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <FaSearch
              className="text-muted custom-search-icon"
              style={{ color: "#94a3b8" }}
            />
          </span>
          <input
            type="search"
            className="form-control border-start-0 py-2q"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="table-responsive ">
        <table className="table table-sm">
          <thead className="text-xs text-uppercase text-muted bg-light border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 text-left custom-perchase-th"
                    style={{ minWidth: `${header.getSize()}px` }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="text-sm">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex px-3 pb-3 flex-column flex-sm-row justify-content-between align-items-center mt-3">
        <div className="text-sm text-muted mb-3 mb-sm-0">
          Showing <span className="fw-medium">{startRow}</span> to{" "}
          <span className="fw-medium">{endRow}</span> of{" "}
          <span className="fw-medium">{totalRows}</span> results
        </div>
        <div className="btn-group">
          <button
            className="btn btn-outline-primary"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeIncentiveReportsTable;
