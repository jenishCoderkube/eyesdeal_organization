import React, { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { packageService } from "../../services/packageService";
import productViewService from "../../services/Products/productViewService";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import Select from "react-select";

const PackageModal = ({ show, onHide, onSubmit, products, initialData }) => {
  const [packageName, setPackageName] = useState(
    initialData?.packageName || ""
  );
  const [selectedProducts, setSelectedProducts] = useState(
    initialData?.products?.map((p) => (typeof p === "string" ? p : p._id)) || []
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPackageName(initialData?.packageName || "");
    setSelectedProducts(
      initialData?.products?.map((p) => (typeof p === "string" ? p : p._id)) ||
        []
    );
  }, [initialData, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({
      packageName,
      products: selectedProducts,
      _id: initialData?._id,
    });
    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {initialData ? "Edit Package" : "Create Package"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Package Name</Form.Label>
            <Form.Control
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Products</Form.Label>
            <Select
              isMulti
              options={products.map((p) => ({
                value: p._id,
                label: `${p.displayName} (${p.modelNumber} ${p.colorNumber})`,
              }))}
              value={products
                .filter((p) => selectedProducts.includes(p._id))
                .map((p) => ({
                  value: p._id,
                  label: `${p.displayName} (${p.modelNumber} ${p.colorNumber})`,
                }))}
              onChange={(opts) => setSelectedProducts(opts.map((o) => o.value))}
              classNamePrefix="react-select"
            />
          </Form.Group>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Saving..." : initialData ? "Update" : "Create"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const PackagesOffers = () => {
  const [packages, setPackages] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch packages
  const fetchPackages = async () => {
    setLoading(true);
    const res = await packageService.getPackages();
    if (res.success) {
      setPackages(res.data || []);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  // Fetch products (eyeGlasses)
  const fetchProducts = async () => {
    const res = await productViewService.getProducts("eyeGlasses", {}, 1, 1000);
    if (res.success) {
      setProducts(res.data || []);
    } else {
      toast.error(res.message);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchProducts();
  }, []);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "srno",
        header: "SRNO",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "packageName",
        header: "Package Name",
        cell: ({ getValue }) => <span>{getValue()}</span>,
      },
      {
        accessorKey: "products",
        header: "Products",
        cell: ({ getValue }) => (
          <span>
            {getValue()
              .map(
                (p, idx) =>
                  `(${idx + 1}) ` +
                  (typeof p === "string"
                    ? p
                    : p.displayName || p.modelNumber || p._id)
              )
              .join(", ")}
          </span>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <span
            style={{ cursor: "pointer", color: "#007bff" }}
            title="Edit"
            onClick={() => {
              setEditData(row.original);
              setModalShow(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              stroke="blue"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: packages,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handle create/edit submit
  const handleModalSubmit = async (data) => {
    let res;
    if (data._id) {
      // Edit: products should be array of product objects (with _id and details if available)
      const updatedProducts = data.products.map((pid) => {
        const found = products.find((p) => p._id === pid || p._id === pid._id);
        if (found) {
          // Only include the fields required by the API (as in your example)
          const {
            _id,
            modelNumber,
            colorNumber,
            frameType,
            frameShape,
            frameStyle,
            templeMaterial,
            frameMaterial,
            templeColor,
            frameColor,
            gender,
            frameSize,
            frameWidth,
            frameDimensions,
            weight,
            prescriptionType,
            frameCollection,
            features,
            oldBarcode,
            sku,
            displayName,
            HSNCode,
            brand,
            unit,
            warranty,
            tax,
            description,
            costPrice,
            resellerPrice,
            MRP,
            discount,
            sellPrice,
            manageStock,
            inclusiveTax,
            incentiveAmount,
            photos,
            __t,
            createdAt,
            updatedAt,
            newBarcode,
            __v,
            activeInERP,
            activeInWebsite,
            storeFront,
            seoDescription,
            seoImage,
            seoTitle,
          } = found;
          return {
            _id,
            modelNumber,
            colorNumber,
            frameType,
            frameShape,
            frameStyle,
            templeMaterial,
            frameMaterial,
            templeColor,
            frameColor,
            gender,
            frameSize,
            frameWidth,
            frameDimensions,
            weight,
            prescriptionType,
            frameCollection,
            features,
            oldBarcode,
            sku,
            displayName,
            HSNCode,
            brand: brand?._id || brand,
            unit: unit?._id || unit,
            warranty,
            tax,
            description,
            costPrice,
            resellerPrice,
            MRP,
            discount,
            sellPrice,
            manageStock,
            inclusiveTax,
            incentiveAmount,
            photos,
            __t,
            createdAt,
            updatedAt,
            newBarcode,
            __v,
            activeInERP,
            activeInWebsite,
            storeFront,
            seoDescription,
            seoImage,
            seoTitle,
          };
        }
        // fallback: just _id
        return { _id: typeof pid === "object" ? pid._id : pid };
      });
      res = await packageService.updatePackage({
        _id: data._id,
        packageName: data.packageName,
        products: updatedProducts,
      });
    } else {
      // Create: products is array of IDs
      res = await packageService.createPackage({
        packageName: data.packageName,
        products: data.products,
      });
    }
    if (res.success) {
      toast.success(res.message || "Success");
      setModalShow(false);
      setEditData(null);
      fetchPackages();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="container-fluid max-width-90 mx-auto mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Packages</h2>
        <Button
          variant="primary"
          onClick={() => {
            setEditData(null);
            setModalShow(true);
          }}
        >
          Create Package
        </Button>
      </div>
      <div className="table-responsive">
        <table className="table table-sm">
          <thead className="text-xs text-uppercase text-muted bg-light border-top border-bottom">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3 text-left">
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
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  No packages found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PackageModal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
          setEditData(null);
        }}
        onSubmit={handleModalSubmit}
        products={products}
        initialData={editData}
      />
    </div>
  );
};

export default PackagesOffers;
