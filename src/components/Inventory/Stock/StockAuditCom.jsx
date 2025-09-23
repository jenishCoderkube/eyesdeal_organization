import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";
import { inventoryService } from "../../../services/inventoryService";
import moment from "moment";

const StockAudit = () => {
  const [storeData, setStoreData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [auditData, setAuditData] = useState([]);
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  const [scanValue, setScanValue] = useState("");
  const [totalCountQty, setTotalCountQty] = useState(0);
  const [loading, setLoading] = useState(false);
  const scanInputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const productOptions = [
    { value: "eyeGlasses", label: "Eye Glasses" },
    { value: "accessories", label: "Accessories" },
    { value: "sunGlasses", label: "Sunglasses" },
    { value: "spectacleLens", label: "Spectacle Lens" },
    { value: "contactLens", label: "Contact Lens" },
    { value: "readingGlasses", label: "Reading Glasses" },
    { value: "contactSolutions", label: "Contact Solutions" },
  ];

  const formik = useFormik({
    initialValues: {
      store: null,
      productCategory: productOptions[0],
      brand: null,
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      fetchAuditData(values);
    },
  });

  useEffect(() => {
    fetchStores();
    fetchBrands();
  }, []);

  useEffect(() => {
    const storedStoreId = user?.stores?.[0];
    console.log(storedStoreId, "storeid");

    if (storedStoreId && storeData.length > 0) {
      const defaultStore = storeData.find(
        (store) => store._id === storedStoreId
      );
      if (defaultStore) {
        formik.setFieldValue("store", {
          value: defaultStore._id,
          label: defaultStore.name,
        });
        formik.handleSubmit(); // Auto-fetch data after setting default store
      }
    }
  }, [storeData]);

  useEffect(() => {
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [auditData]);

  const fetchStores = async () => {
    try {
      const response = await inventoryService.getStores();
      if (response.success) {
        setStoreData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await inventoryService.getBrand();
      if (response.success) {
        setBrandData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };
  // ✅ auto fetch when store/category/brand changes
  useEffect(() => {
    if (formik.values.store && formik.values.productCategory) {
      fetchAuditData(formik.values);
    }
  }, [formik.values.store, formik.values.productCategory, formik.values.brand]);

  const fetchAuditData = async (values) => {
    // const storeId = values.store?.value || user?.stores?.[0];
    setLoading(true);
    try {
      const response = await inventoryService.getInventoryStore(
        values.productCategory?.value || productOptions[0].value,
        values.brand?.value,

        // [storeId],
        1,
        "",
        9999 // Fetch all to avoid pagination
      );
      if (response.success) {
        const newAuditData = response.data.data.docs.map((item) => ({
          sku: item.product.sku,
          storeQty: item?.quantity || 0,
          countQty: 0,
          status: "Mismatch",
          barcode:
            item.product.oldBarcode ||
            item.product.newBarcode ||
            item.product.sku,
        }));
        setAuditData(newAuditData);
        setTotalCountQty(0);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanChange = (e) => {
    setScanValue(e.target.value);
  };

  const handleScanKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const scanned = scanValue.trim();
      if (!scanned) return;

      let found = false;
      const updatedAuditData = auditData.map((item) => {
        if (
          item.sku?.toString() === scanned.toString() ||
          item.barcode?.toString() === scanned.toString()
        ) {
          found = true;
          const newCount = item.countQty + 1;
          return {
            ...item,
            countQty: newCount,
            status: newCount === item.storeQty ? "Match" : "Mismatch",
          };
        }

        return item;
      });

      if (found) {
        setAuditData(updatedAuditData);
        setTotalCountQty((prev) => prev + 1);
      } else {
        toast.error("Scanned item not found in current inventory");
      }

      setScanValue("");
    }
  };

  const handleSave = async () => {
    const payload = auditData
      .filter((item) => item.countQty > 0) // ✅ only include scanned
      .map(({ sku, storeQty, countQty, status, barcode }) => {
        const entry = {
          sku,
          storeQty,
          countQty,
          status,
          store: formik.values.store?.value,
          barcode,
          productCategory: formik.values.productCategory?.value,
          auditDate:
            new Date(date).toISOString().split("T")[0] + "T00:00:00.000Z", // normalized date
        };
        if (formik.values.brand?.value) {
          entry.brand = formik.values.brand.value;
        }

        return entry;
      });
    try {
      const response = await inventoryService.stockAudit(payload);
      if (response.success) {
        toast.success("Stock audit saved successfully!");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error while saving stock audit");
    }
  };

  const storeOptions = storeData.map((store) => ({
    value: store._id,
    label: store.name,
  }));
  const brandOptions = brandData.map((brand) => ({
    value: brand._id,
    label: brand.name,
  }));

  return (
    <div className="card-body px-3 py-3">
      <form onSubmit={formik.handleSubmit}>
        <div className="row row-cols-1 row-cols-md-3 g-3">
          <div className="col">
            <label className="form-label font-weight-500">Store</label>
            <Select
              options={storeOptions}
              value={formik.values.store}
              onChange={(option) => formik.setFieldValue("store", option)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label className="form-label font-weight-500">
              Product Category
            </label>
            <Select
              options={productOptions}
              value={formik.values.productCategory}
              onChange={(option) =>
                formik.setFieldValue("productCategory", option)
              }
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label className="form-label font-weight-500">Brand</label>
            <Select
              options={brandOptions}
              isClearable={true}
              value={formik.values.brand}
              onChange={(option) => formik.setFieldValue("brand", option)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
        </div>
        {/* <div className="mt-4">
          <button
            type="submit"
            className="btn custom-button-bgcolor"
            disabled={loading}
          >
            {loading ? "Loading..." : "Submit"}
          </button>
        </div> */}
      </form>

      <div className="mt-4 d-flex align-items-end gap-3 flex-wrap">
        <div className="form-group">
          <label className="form-label font-weight-500">Date</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label font-weight-500">Scan Barcode/Sku</label>
          <input
            type="text"
            className="form-control"
            value={scanValue}
            onChange={handleScanChange}
            onKeyDown={handleScanKeyDown}
            ref={scanInputRef}
            placeholder="Scan here..."
          />
        </div>
        <div className="form-group">
          <label className="form-label font-weight-500">Total Qty</label>
          <div className="form-control bg-light">{totalCountQty}</div>
        </div>
        <button
          className="btn btn-success"
          onClick={handleSave}
          disabled={loading || auditData?.length === 0}
        >
          Save
        </button>
      </div>

      <div className="table-responsive mt-3">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <table className="table table-bordered table-sm">
            <thead className="bg-light">
              <tr>
                <th>#</th>
                <th>Audit Date</th>
                <th>SKU</th>
                <th>Barcode</th>
                <th>Store Qty</th>
                <th>Count Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {auditData.length > 0 ? (
                auditData.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{moment(item.auditDate).format("YYYY-MM-DD")}</td>
                    <td>{item.sku}</td>
                    <td>{item.barcode}</td>
                    <td>{item.storeQty}</td>
                    <td>{item.countQty}</td>
                    <td
                      style={{
                        color: item.status === "Mismatch" ? "red" : "green",
                      }}
                    >
                      {item.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StockAudit;
