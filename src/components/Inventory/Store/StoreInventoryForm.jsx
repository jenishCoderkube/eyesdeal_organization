import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";
import { inventoryService } from "../../../services/inventoryService";
import { FaSearch } from "react-icons/fa";
import moment from "moment";
import { defalutImageBasePath } from "../../../utils/constants";
import ImageSliderModalProduct from "../../../components/Products/ViewProducts/ImageSliderModalProduct";
import ReactPaginate from "react-paginate";
const StoreInventoryForm = () => {
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [frameType, setFrameType] = useState([]);
  const [frameShape, setShapeType] = useState([]);
  const [material, setMaterial] = useState([]);
  const [color, setColor] = useState([]);
  const [preType, setPreType] = useState([]);
  const [collection, setCollection] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [inventoryGetCount, setInventoryGetCount] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  // Options for select fields
  const productOptions = [
    { value: "eyeGlasses", label: "Eye Glasses" },
    { value: "accessories", label: "Accessories" },
    { value: "sunGlasses", label: "Sunglasses" },
    { value: "spectacleLens", label: "Spectacle Lens" },
    { value: "contactLens", label: "Contact Lens" },
    { value: "readingGlasses", label: "Reading Glasses" },
    { value: "contactSolutions", label: "Contact Solutions" },
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "unisex", label: "Unisex" },
  ];

  const frameSizeOptions = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  // Formik setup with Yup validation
  const formik = useFormik({
    initialValues: {
      stores: [],
      selectedProduct: productOptions[0],
      brand: null,
      frameType: null,
      frameShape: null,
      gender: null,
      frameMaterial: null,
      frameColor: null,
      frameSize: null,
      prescriptionType: null,
      frameCollection: null,
    },
    validationSchema: Yup.object({
      stores: Yup.array().notRequired(),
      selectedProduct: Yup.object().notRequired(),
    }),
    onSubmit: (values) => {
      getInventoryData(values);
      getInventoryGetCount(values);
    },
  });
  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1; // React Paginate is 0-based, API is 1-based
    getInventoryData(formik.values, selectedPage);
    getInventoryGetCount(formik.values, selectedPage);
  };
  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  const brandOptions = categoryData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  const frameTypeOptions = frameType?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  const frameShapeOptions = frameShape?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  const frameMaterialOptions = material?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  const frameColorOptions = color?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  const prescriptionTypeOptions = preType?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));
  const frameCollectionOptions = collection?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  useEffect(() => {
    const storedStoreId = user?.stores?.[0];
    if (storedStoreId && storeData.length > 0) {
      const defaultStore = storeData.find(
        (store) => store._id === storedStoreId
      );
      if (defaultStore) {
        formik.setFieldValue("stores", [
          {
            value: defaultStore._id,
            label: defaultStore.name,
          },
        ]);
      }
    }
  }, [storeData]);

  useEffect(() => {
    getStores();
    getBrand();
    getFrameTypeData();
    getFrameShapeData();
    getMaterialData();
    getColorData();
    getPreTypeData();
    getCollectionData();
  }, []);

  const getStores = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getStores();
      if (response.success) {
        setStoreData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBrand = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getBrand();
      if (response.success) {
        setCategoryData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFrameTypeData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getFrameType();
      if (response.success) {
        setFrameType(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFrameShapeData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getFrameShape();
      if (response.success) {
        setShapeType(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMaterialData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getMaterial();
      if (response.success) {
        setMaterial(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getColorData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getColor();
      if (response.success) {
        setColor(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPreTypeData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getPrescriptionType();
      if (response.success) {
        setPreType(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCollectionData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getCollection();
      if (response.success) {
        setCollection(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInventoryData = async (values = formik.values, page = 1) => {
    const storeId = values?.stores?.map((option) => option.value);
    const storedStoreId = user?.stores;

    setLoadingInventory(true);

    try {
      const response = await inventoryService.getInventoryStore(
        values?.selectedProduct?.value || productOptions[0]?.value,
        values?.brand?.value,
        values?.gender?.value,
        values?.frameSize?.value,
        values?.frameType?.value,
        values?.frameShape?.value,
        values?.frameMaterial?.value,
        values?.frameColor?.value,
        values?.frameCollection?.value,
        values?.prescriptionType?.value,
        storeId?.length !== 0 ? storeId : storedStoreId || storedStoreId,
        page, // Use page parameter
        searchQuery,
        20
      );
      if (response.success) {
        setInventory(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoadingInventory(false);
    }
  };

  const getInventoryGetCount = async (values = formik.values, page = 1) => {
    const storeId = values?.stores?.map((option) => option.value);
    const storedStoreId = user?.stores;

    setLoading(true);
    try {
      const response = await inventoryService.getInventoryGetCount(
        values?.selectedProduct?.value || productOptions[0]?.value,
        values?.brand?.value,
        values?.gender?.value,
        values?.frameSize?.value,
        values?.frameType?.value,
        values?.frameShape?.value,
        values?.frameMaterial?.value,
        values?.frameColor?.value,
        values?.frameCollection?.value,
        values?.prescriptionType?.value,
        storeId?.length !== 0 ? storeId : storedStoreId || storedStoreId,

        page,
        searchQuery,
        20
      );
      if (response.success) {
        setInventoryGetCount(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (itemId, newState) => {
    setLoading(true);
    try {
      const response = await inventoryService.updateInventoryStatus(itemId, {
        is_global: newState, // Changed to is_global to match API
      });
      if (response.success) {
        setInventory((prevInventory) => ({
          ...prevInventory,
          docs: prevInventory.docs.map((item) =>
            item._id === itemId ? { ...item, is_global: newState } : item
          ),
        }));
        toast.success(
          `Inventory set to ${newState ? "Global" : "Local"} successfully`
        );
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Failed to update Global/Local status");
    } finally {
      setLoading(false);
    }
  };
  // useEffect(() => {
  //   const storedStoreId = user?.stores?.[0];
  //   if (storedStoreId && storeData.length > 0) {
  //     const defaultStore = storeData.find(
  //       (store) => store._id === storedStoreId
  //     );
  //     if (defaultStore) {
  //       const newStores = [
  //         { value: defaultStore._id, label: defaultStore.name },
  //       ];
  //       formik.setFieldValue("stores", newStores);
  //       // Trigger initial API calls only once after setting the default store
  //       getInventoryData({ ...formik.values, stores: newStores }, 1);
  //       getInventoryGetCount({ ...formik.values, stores: newStores }, 1);
  //     }
  //   }
  // }, [storeData]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      // Only trigger API calls for search query changes if stores are set
      getInventoryData(formik.values, 1);
      getInventoryGetCount(formik.values, 1);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);
  const exportProduct = async (e) => {
    e.preventDefault();

    const finalData = [];

    inventory?.docs?.forEach((item) => {
      const product = item?.product;
      if (!product) return;

      finalData?.push({
        sku: product.sku || "",
        Barcode: product.oldBarcode || "",
        Store: product.displayName || "",
        stock: item.quantity ?? 0,
        sold: item.sold ?? 0,
        mrp: product.MRP ?? 0,
        brand: product.brand.name || "",
        "Frame Type": product.frameType?.name || "",
        "Frame Shape": product.frameShape?.name || "",
        gender: product?.gender || "",
        "Frame Material": product.frameMaterial?.name || "",
        "Frame Color": product.frameColor?.name || "",
        "Frame Size": product.frameSize || "",
        is_global: item.is_global ? "Global" : "Local", // Add is_global to export
      });
    });

    const finalPayload = {
      data: finalData,
    };

    setLoading(true);

    if (finalData.length > 0) {
      try {
        const response = await inventoryService.exportCsv(finalPayload);
        if (response.success) {
          const csvData = response.data;
          const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "barcodes.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Export error:", error);
        toast.error("Failed to export product data");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("No data to export");
      setLoading(false);
    }
  };

  const exportProductCp = async (e) => {
    e.preventDefault();

    const finalData = [];

    inventory?.docs?.forEach((item) => {
      const selected = item.product;
      const quantity = parseInt(item.quantity) || 0;

      finalData.push({
        sku: selected.sku,
        Barcode: selected.oldBarcode,
        stock: item.quantity,
        sold: item?.sold,
        mrp: selected?.MRP,
        costPrice: selected?.sellPrice,
        brand: selected?.brandData?.name,
        "Frame Type": selected?.frameType?.name,
        "Frame Shape": selected?.frameShape?.name,
        gender: selected?.gender,
        "Frame Material": selected?.frameMaterial?.name,
        "Frame Color": selected?.frameColor?.name,
        "Frame Size": selected?.frameSize,
        is_global: item.is_global ? "Global" : "Local", // Add is_global to export
      });
    });

    const finalPayload = {
      data: finalData,
    };

    setLoading(true);

    if (finalData.length > 0) {
      try {
        const response = await inventoryService.exportCsv(finalPayload);
        if (response.success) {
          const csvData = response.data;
          const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "barcodes_with_cp.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Export error:", error);
        toast.error("Failed to export product CP data");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("No data to export");
      setLoading(false);
    }
  };
  const handleViewMoreImages = (photos) => {
    const fullImageUrls = photos.map(
      (photo) => `${defalutImageBasePath}${photo}`
    );
    setSelectedImages(fullImageUrls);
    setShowImageModal(true);
  };
  return (
    <div className="card-body px-3 py-3">
      <form onSubmit={formik.handleSubmit}>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          <div className="col">
            <label className="form-label font-weight-500" htmlFor="stores">
              Store
            </label>
            <Select
              options={storeOptions}
              value={formik.values.stores}
              isMulti
              onChange={(option) => formik.setFieldValue("stores", option)}
              onBlur={() => formik.setFieldTouched("stores", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
              className={
                formik.touched.stores && formik.errors.stores
                  ? "is-invalid"
                  : ""
              }
            />
            {formik.touched.stores && formik.errors.stores && (
              <div className="text-danger mt-1">{formik.errors.stores}</div>
            )}
          </div>
          <div className="col">
            <label
              className="form-label font-weight-500"
              htmlFor="selectedProduct"
            >
              Product
            </label>
            <Select
              options={productOptions}
              value={formik.values.selectedProduct}
              onChange={(option) =>
                formik.setFieldValue("selectedProduct", option)
              }
              onBlur={() => formik.setFieldTouched("selectedProduct", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
              className={
                formik.touched.selectedProduct && formik.errors.selectedProduct
                  ? "is-invalid"
                  : ""
              }
            />
            {formik.touched.selectedProduct &&
              formik.errors.selectedProduct && (
                <div className="text-danger mt-1">
                  {formik.errors.selectedProduct}
                </div>
              )}
          </div>
          <div className="col">
            <label className="form-label font-weight-500" htmlFor="brand">
              Brand
            </label>
            <Select
              options={brandOptions}
              value={formik.values.brand}
              onChange={(option) => formik.setFieldValue("brand", option)}
              onBlur={() => formik.setFieldTouched("brand", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
              className={
                formik.touched.brand && formik.errors.brand ? "is-invalid" : ""
              }
            />
            {formik.touched.brand && formik.errors.brand && (
              <div className="text-danger mt-1">{formik.errors.brand}</div>
            )}
          </div>
          <div className="col">
            <label className="form-label font-weight-500" htmlFor="frameType">
              Frame Type
            </label>
            <Select
              options={frameTypeOptions}
              value={formik.values.frameType}
              onChange={(option) => formik.setFieldValue("frameType", option)}
              onBlur={() => formik.setFieldTouched("frameType", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label className="form-label font-weight-500" htmlFor="frameShape">
              Frame Shape
            </label>
            <Select
              options={frameShapeOptions}
              value={formik.values.frameShape}
              onChange={(option) => formik.setFieldValue("frameShape", option)}
              onBlur={() => formik.setFieldTouched("frameShape", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label className="form-label font-weight-500" htmlFor="gender">
              Gender
            </label>
            <Select
              options={genderOptions}
              value={formik.values.gender}
              onChange={(option) => formik.setFieldValue("gender", option)}
              onBlur={() => formik.setFieldTouched("gender", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label
              className="form-label font-weight-500"
              htmlFor="frameMaterial"
            >
              Frame Material
            </label>
            <Select
              options={frameMaterialOptions}
              value={formik.values.frameMaterial}
              onChange={(option) =>
                formik.setFieldValue("frameMaterial", option)
              }
              onBlur={() => formik.setFieldTouched("frameMaterial", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label className="form-label font-weight-500" htmlFor="frameColor">
              Frame Color
            </label>
            <Select
              options={frameColorOptions}
              value={formik.values.frameColor}
              onChange={(option) => formik.setFieldValue("frameColor", option)}
              onBlur={() => formik.setFieldTouched("frameColor", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label className="form-label font-weight-500" htmlFor="frameSize">
              Frame Size
            </label>
            <Select
              options={frameSizeOptions}
              value={formik.values.frameSize}
              onChange={(option) => formik.setFieldValue("frameSize", option)}
              onBlur={() => formik.setFieldTouched("frameSize", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label
              className="form-label font-weight-500"
              htmlFor="prescriptionType"
            >
              Prescription Type
            </label>
            <Select
              options={prescriptionTypeOptions}
              value={formik.values.prescriptionType}
              onChange={(option) =>
                formik.setFieldValue("prescriptionType", option)
              }
              onBlur={() => formik.setFieldTouched("prescriptionType", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label
              className="form-label font-weight-500"
              htmlFor="frameCollection"
            >
              Frame Collection
            </label>
            <Select
              options={frameCollectionOptions}
              value={formik.values.frameCollection}
              onChange={(option) =>
                formik.setFieldValue("frameCollection", option)
              }
              onBlur={() => formik.setFieldTouched("frameCollection", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="btn custom-button-bgcolor"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>

      <div className="card p-0 shadow-none border mt-5">
        <h6 className="fw-bold px-3 pt-3">Inventory</h6>
        <div className="card-body p-0">
          <div className="d-flex flex-column px-3 flex-md-row gap-3 mb-4">
            <p className="mb-0 fw-normal text-black">
              Total Quantity: {inventoryGetCount?.[0]?.totalQuantity || 0}
            </p>
            <p className="mb-0 fw-normal text-black">
              Total Sold: {inventoryGetCount?.[0]?.totalSold || 0}
            </p>
            <button
              className="btn custom-button-bgcolor ms-md-auto"
              onClick={(e) => exportProduct(e)}
              disabled={loading}
            >
              {loading ? "Exporting..." : "Export Product"}
            </button>
            <button
              onClick={(e) => exportProductCp(e)}
              className="btn custom-button-bgcolor"
              disabled={loading}
            >
              {loading ? "Exporting..." : "Export Product CP"}
            </button>
          </div>
          <div className="mb-4 col-md-5">
            <div className="input-group px-2">
              <span className="input-group-text bg-white border-end-0">
                <FaSearch
                  className="text-muted custom-search-icon"
                  style={{ color: "#94a3b8" }}
                />
              </span>
              <input
                type="search"
                className="form-control border-start-0 py-2"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="table-responsive px-2">
            {loadingInventory ? (
              <div className="d-flex justify-content-center">
                <h4>Loading Data...</h4>
              </div>
            ) : (
              <table className="table table-sm">
                <thead className="text-xs text-uppercase text-muted bg-light border">
                  <tr>
                    <th className="custom-perchase-th">Barcode</th>
                    <th className="custom-perchase-th">Date</th>
                    <th className="custom-perchase-th">Photo</th>
                    <th className="custom-perchase-th">Store</th>
                    <th className="custom-perchase-th">Sku</th>
                    <th className="custom-perchase-th">Brand</th>
                    <th className="custom-perchase-th">Mrp</th>
                    <th className="custom-perchase-th">Stock</th>
                    <th className="custom-perchase-th">Sold</th>
                    <th className="custom-perchase-th">Global / Local</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {inventory?.docs?.length > 0 ? (
                    inventory.docs.map((item, index) => (
                      <tr key={item._id || index}>
                        <td style={{ minWidth: "80px" }}>
                          {item.product?.newBarcode || "-"}
                        </td>
                        <td style={{ minWidth: "100px" }}>
                          {item.product?.createdAt
                            ? moment(item.product.createdAt).format(
                                "YYYY-MM-DD"
                              )
                            : "-"}
                        </td>
                        <td>
                          <div>
                            {item?.product?.photos?.length > 0 ? (
                              <>
                                <img
                                  src={`https://s3.ap-south-1.amazonaws.com/eyesdeal.blinklinksolutions.com/${item?.product?.photos[0]}`}
                                  alt=""
                                  className="img-fluid rounded"
                                  style={{ width: "50px", height: "50px" }}
                                />
                                <div>
                                  <a
                                    href="#"
                                    className="text-primary text-decoration-underline"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleViewMoreImages(
                                        item?.product?.photos
                                      );
                                    }}
                                  >
                                    View More
                                  </a>
                                </div>
                              </>
                            ) : (
                              <div>-</div>
                            )}
                          </div>
                        </td>
                        <td style={{ minWidth: "200px" }}>
                          {item.store?.name || "-"}
                        </td>
                        <td style={{ minWidth: "210px" }}>
                          {item.product?.sku || "-"}
                        </td>
                        <td style={{ minWidth: "200px" }}>
                          {item.product?.brand?.name || "-"}{" "}
                          {item.product?.__t || ""}
                        </td>
                        <td>{item.product?.MRP || "-"}</td>
                        <td>{item.quantity ? item.quantity : "-"}</td>
                        <td>{item.sold ? item.sold : "-"}</td>
                        <td style={{ minWidth: "120px" }}>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={item.is_global || false}
                              onChange={() =>
                                handleToggle(item._id, !item.is_global)
                              }
                              disabled={loading}
                              aria-label={`Toggle ${
                                item.is_global ? "Global" : "Local"
                              } for ${item.product?.sku || "item"}`}
                            />
                            <span className="slider"></span>
                          </label>
                          <span className="ms-2">
                            {item.is_global ? "Global" : "Local"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="10"
                        className="text-center add_power_title py-3"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          <div className="d-flex px-3 pb-3 flex-column flex-sm-row justify-content-between align-items-center mt-3">
            <div className="text-sm text-muted mb-3 mb-sm-0">
              Showing{" "}
              <span className="fw-medium">
                {(inventory?.page - 1) * inventory?.limit + 1}
              </span>{" "}
              to{" "}
              <span className="fw-medium">
                {Math.min(
                  inventory?.page * inventory?.limit,
                  inventory?.totalDocs
                )}
              </span>{" "}
              of <span className="fw-medium">{inventory?.totalDocs || 0}</span>{" "}
              results
            </div>
            <ReactPaginate
              previousLabel={"Previous"}
              nextLabel={"Next"}
              breakLabel={"..."}
              pageCount={inventory?.totalPages || 1}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName={"btn-group"}
              pageClassName={"btn btn-outline-primary"}
              previousClassName={"btn btn-outline-primary"}
              nextClassName={"btn btn-outline-primary"}
              breakClassName={"btn btn-outline-primary"}
              activeClassName={"active"}
              disabledClassName={"disabled"}
            />
          </div>
        </div>
      </div>
      <ImageSliderModalProduct
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        images={selectedImages}
      />
      <style>
        {`
          .switch {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 20px;
          }
          .switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: 0.4s;
            border-radius: 20px;
          }
          .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
          }
          input:checked + .slider {
            background-color: #28a745;
          }
          input:checked + .slider:before {
            transform: translateX(20px);
          }
          input:disabled + .slider {
            cursor: not-allowed;
            opacity: 0.6;
          }
        `}
      </style>
    </div>
  );
};

export default StoreInventoryForm;
