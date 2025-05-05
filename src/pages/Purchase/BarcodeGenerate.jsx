import React, { useCallback, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
import { purchaseService } from "../../services/purchaseService";
import { toast } from "react-toastify";
import { debounce } from "lodash";

function BarcodeGenerate() {
  const [items, setItems] = useState([]);
  const [productData, setProductData] = useState([]);

  const [loading, setLoading] = useState(false);

  const productOptions = productData?.docs?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.oldBarcode} ${vendor.sku}`,
    vendor,
  }));

  const handleAddMore = () => {
    setItems([...items, { product: null, quantity: "" }]);
  };

  const handleRemove = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductChange = (index, selectedOption) => {
    const newItems = [...items];
    newItems[index].product = selectedOption;
    setItems(newItems);
  };

  const handleQuantityChange = (index, value) => {
    const newItems = [...items];
    newItems[index].quantity = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalData = [];

    items.forEach((item) => {
      const selected = item.product.vendor;
      const quantity = parseInt(item.quantity) || 0;

      for (let i = 0; i < quantity; i++) {
        finalData.push({
          sku: selected.sku,
          barcode: selected.oldBarcode,
          price: selected.sellPrice,
        });
      }
    });

    const finalPayload = {
      data: finalData, // Wrap your array like this
    };

    setLoading(true);

    try {
      const response = await purchaseService.exportCsv(finalPayload);

      if (response.success) {
        const csvData = response.data; // string: e.g., "sku,barcode,price\n7STAR-9005-46,10027,1350"

        // Create a Blob from the CSV string
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        // Create a temporary download link
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "barcodes.csv"); // Set the desired filename
        document.body.appendChild(link);
        link.click(); // Trigger the download
        document.body.removeChild(link); // Clean up
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }

    // Call your API here with `finalData`
  };

  const getProduct = async (search) => {
    setLoading(true);

    try {
      const response = await purchaseService.generateBarcode(search);
      if (response.success) {
        setProductData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedGetProduct = useCallback(
    debounce((value) => {
      if (value?.trim()) {
        getProduct(value);
      }
    }, 1000),
    [] // empty dependency to persist across re-renders
  );

  return (
    <div className="max-width-100  mx-auto p-md-5 ">
      <h1 className="h2 text-dark fw-bold">Generate Barcodes</h1>
      <form onSubmit={handleSubmit} className="px-md-5  mt-5 px-1 ">
        <div className="card shadow-none border  pt-3 ">
          <div className="card-body">
            {items.map((item, index) => (
              <div
                key={index}
                className="card m-0 border py-3 mt-3 shadow-none"
              >
                <div className="card-body ">
                  <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                      <label
                        htmlFor={`product-${index}`}
                        className="form-label fw-medium"
                      >
                        Select Product
                      </label>
                      <Select
                        options={productOptions}
                        value={item.product}
                        onChange={(option) =>
                          handleProductChange(index, option)
                        }
                        placeholder="Select..."
                        className="basic-select"
                        classNamePrefix="select"
                        inputId={`product-${index}`}
                        onInputChange={(value) => {
                          debouncedGetProduct(value);
                        }}
                        isLoading={loading} // ✅ shows spinner while loading
                        loadingMessage={() => "Loading..."} // ✅ custom loading message
                        noOptionsMessage={({ inputValue }) =>
                          inputValue ? "No products found" : "Type to search"
                        }
                      />
                    </div>
                    <div className="col-md-4">
                      <label
                        htmlFor={`quantity-${index}`}
                        className="form-label fw-medium"
                      >
                        Quantity
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id={`quantity-${index}`}
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                      />
                    </div>
                    <div className="col-md-2">
                      <button
                        type="button"
                        className="btn btn-danger px-3 btn-sm w-auto p-2"
                        onClick={() => handleRemove(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className={`d-flex gap-3 ${items?.length !== 0 && "mt-3"} `}>
              <button
                type="button"
                className="btn btn-primary p-2"
                onClick={handleAddMore}
              >
                Add More
              </button>

              <button type="submit" className="btn btn-primary p-2">
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default BarcodeGenerate;
