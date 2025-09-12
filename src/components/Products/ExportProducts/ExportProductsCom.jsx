import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ProductFilterForm from "../ViewProducts/ProductFilterForm";
import productViewService from "../../../services/Products/productViewService"; // Adjust path

function ExportProductsCom() {
  const [filters, setFilters] = useState({ model: "eyeGlasses" }); // Default model
  const [productsData, setProductsData] = useState({
    docs: [],
    totalDocs: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false); // For export loading

  // Fetch products based on filters
  const fetchProducts = async (
    newFilters = filters,
    page = 1,
    limit = null
  ) => {
    setLoading(true);
    try {
      const response = await productViewService.getProducts(
        newFilters.model || "eyeGlasses",
        newFilters,
        page,
        limit
      );

      if (response.success) {
        setProductsData({
          docs: response.data,
          totalDocs: response.other.totalDocs,
          totalPages: response.other.totalPages,
        });
      } else {
        toast.error(response.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("An error occurred while fetching products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on mount (without limit)
  useEffect(() => {
    fetchProducts(filters, 1, null); // Initial load: only page=1
  }, []);

  // Handle filter submission
  const handleFilterSubmit = (filterValues) => {
    setFilters(filterValues);
    fetchProducts(filterValues, 1, null); // Reset to page 1, no limit
  };

  // Format product data for export
  const formatProductForExport = (product) => ({
    _id: product._id,
    barcode: product.oldBarcode || product.newBarcode || 0,
    modelNumber: product.modelNumber || "",
    colorNumber: product.colorNumber || "",
    gender: product.gender || "",
    frameSize: product.frameSize || "",
    frameWidth: product.frameWidth || "",
    frameDimensions: product.frameDimensions || "",
    weight: product.weight || "",
    sku: product.sku || "",
    displayName: product.displayName || "",
    HSNCode: product.HSNCode || "",
    warranty: product.warranty || "",
    tax: product.tax || 0,
    description: product.description || "",
    costPrice: product.costPrice || 0,
    resellerPrice: product.resellerPrice || 0,
    MRP: product.MRP || 0,
    discount: product.discount || 0,
    sellPrice: product.sellPrice || 0,
    incentiveAmount: product.incentiveAmount || 0,
    features: product.features ? product.features.join(", ") : "",
    brand: product.brand?.name || "",
    unit: product.unit?.name || "",
    frameType: product.frameType?.name || "",
    frameShape: product.frameShape?.name || "",
    frameMaterial: product.frameMaterial?.name || "",
    frameColor: product.frameColor?.name || "",
    frameStyle: product.frameStyle?.name || "",
    templeMaterial: product.templeMaterial?.name || "",
    templeColor: product.templeColor?.name || "",
    frameCollection: product.frameCollection?.name || "",
    prescriptionType: product.prescriptionType?.name || "",
    activeInWebsite: product.activeInWebsite ? 1 : 0,
    activeInERP: product.activeInERP ? 1 : 0,
    manageStock: product.manageStock ? 1 : 0,
    inclusiveTax: product.inclusiveTax ? 1 : 0,
    __t: product.__t || "",
    storeFront: product.storeFront ? product.storeFront.join(", ") : "",
    seoDescription: product.seoDescription || "",
    seoImage: product.seoImage || "",
    seoTitle: product.seoTitle || "",
    inventory: {
      _id: product.inventory?._id || "",
      totalQuantity: product.inventory?.totalQuantity || 0,
    },
  });

  // Generate pagination buttons
  const generatePaginationButtons = () => {
    const { totalDocs } = productsData;
    const rangeSize = 2000; // Fixed range of 2000 products per button
    const buttons = [];
    const totalButtons = Math.ceil(totalDocs / rangeSize);

    for (let i = 0; i < totalButtons; i++) {
      const start = i * rangeSize + 1;
      const end = Math.min((i + 1) * rangeSize, totalDocs);
      const page = Math.ceil(start / rangeSize);
      const limit = end - start + 1; // Exact limit for this range
      buttons.push({
        label: `${start} - ${end}`,
        onClick: async () => {
          setDownloading(true);
          try {
            const response = await productViewService.getProducts(
              filters.model || "eyeGlasses",
              filters,
              page,
              limit
            );
            console.log(`getProducts response for ${start}-${end}:`, response);

            if (response.success) {
              const formattedData = response.data.map(formatProductForExport);
              const payload = { data: formattedData };
              console.log(`exportCsv payload for ${start}-${end}:`, payload);

              const exportResponse = await productViewService.exportCsv(
                payload
              );
              console.log(
                `exportCsv response for ${start}-${end}:`,
                exportResponse
              );

              if (exportResponse.success) {
                const blob = new Blob([exportResponse.data], {
                  type: "text/csv",
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${filters.model}_products_${start}-${end}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                toast.success(
                  `Products ${start}-${end} downloaded successfully`
                );
              } else {
                toast.error(
                  exportResponse.message ||
                    `Failed to download products ${start}-${end}`
                );
              }
            } else {
              toast.error(
                response.message ||
                  `Failed to fetch products for ${start}-${end}`
              );
            }
          } catch (error) {
            console.error(`Error downloading products ${start}-${end}:`, error);
            toast.error(
              `An error occurred while downloading products ${start}-${end}`
            );
          } finally {
            setDownloading(false);
          }
        },
      });
    }

    // Add "Download All" button
    buttons.push({
      label: "Download All",
      onClick: async () => {
        setDownloading(true);
        try {
          const response = await productViewService.getProducts(
            filters.model || "eyeGlasses",
            filters,
            1,
            totalDocs // Fetch all products
          );
          console.log("getProducts response (Download All):", response);

          if (response.success) {
            const formattedData = response.data.map(formatProductForExport);
            const payload = { data: formattedData };
            console.log("exportCsv payload (Download All):", payload);

            const exportResponse = await productViewService.exportCsv(payload);
            console.log("exportCsv response (Download All):", exportResponse);

            if (exportResponse.success) {
              const blob = new Blob([exportResponse.data], {
                type: "text/csv",
              });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${filters.model}_products_all.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
              toast.success("All products downloaded successfully");
            } else {
              toast.error(
                exportResponse.message || "Failed to download all products"
              );
            }
          } else {
            toast.error(
              response.message || "Failed to fetch products for download"
            );
          }
        } catch (error) {
          console.error("Error downloading all products:", error);
          toast.error("An error occurred while downloading all products");
        } finally {
          setDownloading(false);
        }
      },
    });

    return buttons;
  };

  return (
    <div className="container-fluid max-width-90 mx-auto mt-5">
      <ProductFilterForm onSubmit={handleFilterSubmit} />

      {/* Display total documents */}
      <h5 className="">
        Total Documents found:
        {loading ? (
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="sr-only"></span>
          </div>
        ) : (
          productsData.totalDocs
        )}
      </h5>

      {/* Pagination buttons or downloading loader */}
      <div className="flex gap-4 my-4 flex-wrap">
        {loading ? (
          <div className="spinner-border" role="status">
            <span className="sr-only"></span>
          </div>
        ) : downloading ? (
          <div className="mt-3">
            <div className="spinner-border" role="status">
              <span className="sr-only"></span>
            </div>
            <span className="ms-2">Downloading products...</span>
          </div>
        ) : (
          generatePaginationButtons().map((button, index) => (
            <button
              key={index}
              className="btn custom-button-bgcolor ms-3"
              onClick={button.onClick}
            >
              {button.label}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default ExportProductsCom;
