import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";
import { inventoryService } from "../../../services/inventoryService";
import moment from "moment";
import { useNavigate, useSearchParams } from "react-router-dom";

const StockAudit = () => {
  const [storeData, setStoreData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [auditData, setAuditData] = useState([]);
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  const [scanValue, setScanValue] = useState("");
  const [totalCountQty, setTotalCountQty] = useState(0);
  const [loading, setLoading] = useState(false);
  const scanInputRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const isInitialLoadRef = useRef(true);

  const editId = searchParams.get("editId");

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
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
      // handled by effects / helpers
    },
  });

  // ---------- helper API wrappers (they return data so caller controls ordering) ----------
  const fetchStores = async () => {
    try {
      const response = await inventoryService.getStores();
      if (response.success) {
        const stores = response?.data?.data || [];
        setStoreData(stores);
        return stores;
      } else {
        toast.error(response.message);
        return [];
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      return [];
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await inventoryService.getBrand();
      if (response.success) {
        const brands = response?.data?.data || [];
        setBrandData(brands);
        return brands;
      } else {
        toast.error(response.message);
        return [];
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      return [];
    }
  };

  // returns base inventory items (countQty = 0)
  const getInventoryBase = async (values) => {
    const storeId = values.store?.value || user?.stores?.[0];
    try {
      const response = await inventoryService.getInventoryStore(
        values.productCategory?.value || productOptions[0].value,
        values.brand?.value,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        [storeId],
        1,
        "",
        9999
      );

      if (response.success) {
        const base = response.data.data.docs.map((item) => {
          const storeQty = item?.quantity || 0;
          return {
            sku: item.product.sku,
            storeQty,
            product: item?.product?._id,
            countQty: 0,
            status: storeQty === 0 ? "Match" : "Mismatch",
            barcode:
              item.product?.newBarcode ||
              item.product?.oldBarcode ||
              item.product.sku,
          };
        });
        return base;
      } else {
        toast.error(response.message);
        return [];
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to fetch audit data");
      return [];
    }
  };

  // returns existing audit entries array for editId
  const getExistingAuditById = async (id) => {
    try {
      // Replace this with real API call: inventoryService.getStockAuditById(id)
      // const res = await inventoryService.getStockAuditById(id);
      // if (res.success) return res.data.data;

      // dummy data (keep for local testing) - replace in prod
      const resMock = [
        {
          _id: "68e3c32d800269af312b4e61",
          store: { _id: "64709e8b518c8594f121857b", name: "TESTING" },
          product: {
            _id: "6443f64c121900f79603862a",
            sku: "CA-FR-226-VZH-5617",
            newBarcode: "600218",
          },
          auditDate: "2025-10-06T00:00:00.000Z",
          brand: { _id: "6388875fe890e301c3b98579", name: "Carrera" },
          countQuantity: 3,
          storeQuantity: 1,
          productCategory: "eyeGlasses",
          status: "Mismatch",
        },
      ];

      return resMock; // return array
    } catch (error) {
      console.error("Error fetching existing audit:", error);
      return [];
    }
  };

  const mergeBaseWithExisting = (base = [], existing = []) => {
    const baseMap = new Map();
    base.forEach((it) => {
      const key = it.product || it.sku || it.barcode;
      baseMap.set(key, { ...it });
    });

    const topItems = [];
    const seenKeys = new Set();

    existing.forEach((r) => {
      const keysToTry = [
        r.product?._id,
        r.product?.sku,
        r.product?.newBarcode,
        r.sku,
      ];
      const key = keysToTry.find((k) => k && baseMap.has(k));

      if (key && baseMap.has(key)) {
        // ✅ existing product found in base → update + move to top
        const baseItem = baseMap.get(key);
        const updated = {
          ...baseItem,
          countQty: r.countQuantity || 0,
          status:
            (r.countQuantity || 0) === baseItem.storeQty ? "Match" : "Mismatch",
        };
        topItems.push(updated);
        seenKeys.add(key);
        baseMap.delete(key); // remove from base so not duplicated
      } else if (!key) {
        // ✅ new product that doesn’t exist in base → create fresh
        topItems.push({
          sku: r.product?.sku || r.sku,
          storeQty: r.storeQuantity || 0,
          product: r.product?._id || null,
          countQty: r.countQuantity || 0,
          status: r.countQuantity === r.storeQuantity ? "Match" : "Mismatch",
          barcode:
            r.product?.newBarcode || r.product?.oldBarcode || r.sku || "",
        });
      }
    });

    // remaining base items (not part of existing)
    const remaining = Array.from(baseMap.values());

    // ✅ final order: existing on top, rest below
    const merged = [...topItems, ...remaining];
    const total = merged.reduce((sum, i) => sum + (i.countQty || 0), 0);

    return { merged, total };
  };

  // fetch inventory and optionally overlay existing audit (used on initial load and when filters change)
  const fetchAndMaybeMerge = useCallback(
    async (values) => {
      setLoading(true);
      try {
        const base = await getInventoryBase(values);
        if (editId) {
          const existing = await getExistingAuditById(editId);
          if (existing && existing.length > 0) {
            const { merged, total } = mergeBaseWithExisting(base, existing);
            setAuditData(merged);
            setTotalCountQty(total);
            setDate(moment(existing[0].auditDate).format("YYYY-MM-DD"));
            setIsEditMode(true);
            return;
          }
        }

        // no edit or no existing data -> show base
        setAuditData(base);
        setTotalCountQty(0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [editId]
  );

  // initial load: stores, brands, then inventory (+ merge if editing)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const stores = await fetchStores();
        await fetchBrands();

        // auto-select default store using fetched stores (avoid reading stale state)
        const storedStoreId = user?.stores?.[0];
        if (storedStoreId && stores.length > 0) {
          const defaultStore = stores.find((s) => s._id === storedStoreId);
          if (defaultStore) {
            formik.setFieldValue("store", {
              value: defaultStore._id,
              label: defaultStore.name,
            });
          }
        }

        // fetch inventory and overlay existing audit (if any)
        await fetchAndMaybeMerge(formik.values);
      } finally {
        setLoading(false);
        isInitialLoadRef.current = false; // allow subsequent filter changes to trigger fetch
      }
    };

    load();
  }, [fetchAndMaybeMerge]);

  // when user changes filters after initial load
  useEffect(() => {
    if (isInitialLoadRef.current) return; // skip initial change triggered by load
    if (formik.values.store && formik.values.productCategory) {
      fetchAndMaybeMerge(formik.values);
    }
  }, [
    formik.values.store,
    formik.values.productCategory,
    formik.values.brand,
    fetchAndMaybeMerge,
  ]);

  useEffect(() => {
    if (scanInputRef.current) scanInputRef.current.focus();
  }, [auditData]);

  const handleScanChange = (e) => setScanValue(e.target.value);

  const handleScanKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const scanned = scanValue.trim();
    if (!scanned) return;

    let updatedItem = null;
    let found = false;

    const updatedAuditData = auditData.map((item) => {
      if (
        item.sku?.toString() === scanned.toString() ||
        item.barcode?.toString() === scanned.toString()
      ) {
        found = true;
        const newCount = (item.countQty || 0) + 1;
        updatedItem = {
          ...item,
          countQty: newCount,
          status: newCount === item.storeQty ? "Match" : "Mismatch",
        };
        return updatedItem;
      }
      return item;
    });

    if (found && updatedItem) {
      const reordered = [
        updatedItem,
        ...updatedAuditData.filter((i) => i !== updatedItem),
      ];
      setAuditData(reordered);
      setTotalCountQty((prev) => prev + 1);
    } else {
      toast.error("Scanned item not found in current inventory");
    }

    setScanValue("");
  };

  const handleSave = async () => {
    // Build base payload
    const payload = {
      store: formik.values.store?.value,
      productCategory: formik.values.productCategory?.value,
      auditDate: new Date(date).toISOString(),
      items: auditData
        .filter((item) => item.countQty > 0) // include only counted items
        .map((item) => ({
          product: item.product,
          storeQuantity: item.storeQty,
          countQuantity: item.countQty,
          status: item.status,
        })),
    };

    // ✅ Add brand only if selected
    if (formik.values.brand?.value) {
      payload.brand = formik.values.brand.value;
    }

    try {
      setLoading(true);
      let response;

      if (isEditMode) {
        console.log("Editing existing audit:", editId, payload);
        response = await inventoryService.updateStockAudit(editId, payload);
      } else {
        console.log("Creating new audit:", payload);
        response = await inventoryService.stockAudit(payload);
      }

      if (response.success) {
        toast.success(
          isEditMode
            ? "Stock audit updated successfully!"
            : "Stock audit saved successfully!"
        );
        navigate("/inventory/stock-audit-view");
      } else {
        toast.error(response.message || "Failed to save audit");
      }
    } catch (error) {
      console.error("Error while saving stock audit:", error);
      toast.error("Error while saving stock audit");
    } finally {
      setLoading(false);
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
              isClearable
              value={formik.values.brand}
              onChange={(option) => formik.setFieldValue("brand", option)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
        </div>
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
          {isEditMode ? "Update" : "Save"}
        </button>
      </div>

      {loading ? (
        <div className="text-center mt-5 pt-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table table-bordered table-sm">
            <thead className="bg-light">
              <tr>
                <th>#</th>
                <th>Barcode</th>
                <th>SKU</th>
                <th>Store Qty</th>
                <th>Count Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {auditData.length > 0 ? (
                auditData.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.barcode}</td>
                      <td>{item.sku}</td>
                      <td>{item.storeQty}</td>
                      <td
                        style={
                          item.countQty > 0
                            ? {
                                backgroundColor: "#e6f7e6", // light green background
                                color: "#0f5132", // dark green text
                                fontWeight: 600,
                              }
                            : {}
                        }
                      >
                        {item.countQty}
                      </td>

                      <td
                        style={{
                          color: item.status === "Mismatch" ? "red" : "green",
                        }}
                      >
                        {item.status}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockAudit;
