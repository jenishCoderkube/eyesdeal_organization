import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";
import { inventoryService } from "../../../services/inventoryService";
import ImageSliderModalProduct from "../../../components/Products/ViewProducts/ImageSliderModalProduct";
import { FaSearch } from "react-icons/fa";
import { defalutImageBasePath } from "../../../utils/constants";
import ReactPaginate from "react-paginate";
import Pagination from "../../Common/Pagination";
const InventoryForm = () => {
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);

  const [categoryData, setCategoryData] = useState([]);
  const [frameType, setFrameType] = useState([]);
  const [frameShape, setShapeType] = useState([]);
  const [material, setMaterial] = useState([]);
  const [color, setColor] = useState([]);
  const [preType, setPreType] = useState([]);
  const [collection, setCollection] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
    { value: "kids", label: "Kids" },
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
      stores: Yup.array()
        .of(Yup.object().shape({ value: Yup.string(), label: Yup.string() }))
        .min(1, "At least one store is required")
        .required("Store is required"),
      selectedProduct: Yup.object().nullable().required("Product is required"),
      // brand: Yup.object().nullable().required("Brand is required"),
    }),
    onSubmit: (values) => {
      getInventoryData(values);
    },
  });

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
      console.error(" error:", error);
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
      console.error(" error:", error);
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
      console.error(" error:", error);
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
      console.error(" error:", error);
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
      console.error(" error:", error);
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
      console.error(" error:", error);
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
      console.error(" error:", error);
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
      console.error(" error:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getInventoryData();
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const getInventoryData = async (values, page = 1) => {
    const storeId = values?.stores?.map((option) => option.value);

    setLoadingInventory(true);

    try {
      const response = await inventoryService.getInventory(
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
        storeId || user?.stores,
        page, // Use the page parameter
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
  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1; // React Paginate is 0-based, API is 1-based
    getInventoryData(formik.values, selectedPage);
  };
  const exportProduct = async (e) => {
    e.preventDefault();

    const finalData = [];

    inventory?.docs?.forEach((item) => {
      const selected = item.product;
      const quantity = parseInt(item.quantity) || 0;

      // for (let i = 0; i < quantity; i++) {
      finalData.push({
        sku: selected.sku,
        Barcode: selected.oldBarcode,
        stock: item.quantity,
        sold: item?.sold,
        mrp: selected?.MRP,
        brand: selected?.brandData?.name,
        "Frame Type": selected?.frameType?.name,
        "Frame Shape": selected?.frameShape?.name,
        gender: selected?.gender,
        "Frame Material": selected?.frameMaterial?.name,
        "Frame Color": selected?.frameColor?.name,
        "Frame Size": selected?.frameSize,
      });
      // }
    });

    const finalPayload = {
      data: finalData, // Wrap your array like this
    };

    setLoading(true);

    try {
      const response = await inventoryService.exportCsv(finalPayload);

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
  };
  const handleViewMoreImages = (photos) => {
    const fullImageUrls = photos.map(
      (photo) => `${defalutImageBasePath}${photo}`
    );
    setSelectedImages(fullImageUrls);
    setShowImageModal(true);
  };
  const exportProductCp = async (e) => {
    e.preventDefault();

    const finalData = [];

    inventory?.docs?.forEach((item) => {
      const selected = item.product;
      const quantity = parseInt(item.quantity) || 0;

      // for (let i = 0; i < quantity; i++) {
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
      });
      // }
    });

    const finalPayload = {
      data: finalData, // Wrap your array like this
    };

    setLoading(true);

    try {
      const response = await inventoryService.exportCsv(finalPayload);

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
  };

  return (
    <div className="card-body px-3 py-3">
      <form onSubmit={formik.handleSubmit}>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          <div className="col">
            <label
              className="form-label font-weight-500 font-weight-500"
              htmlFor="stores"
            >
              Store <span className="text-danger">*</span>
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
              Product <span className="text-danger">*</span>
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
            // disabled={formik.isSubmitting}
          >
            Submit
          </button>
        </div>
      </form>

      <div className="card p-0 shadow-none border mt-5">
        <h6 className="fw-bold px-3 pt-3">Inventory</h6>
        <div className="card-body p-0">
          <div className="d-flex flex-column px-3  flex-md-row gap-3 mb-4">
            <p className="mb-0 fw-normal text-black">
              Total Quantity: {inventory?.countResult?.[0]?.totalQuantity}
            </p>
            <p className="mb-0 fw-normal text-black">
              Total Sold: {inventory?.countResult?.[0]?.totalSold}
            </p>

            <button
              className="btn custom-button-bgcolor ms-md-auto"
              onClick={(e) => exportProduct(e)}
            >
              Export Product
            </button>
            <button
              onClick={(e) => exportProductCp(e)}
              className="btn custom-button-bgcolor"
            >
              Export Product CP
            </button>
          </div>
          <div className="mb-4  col-md-5">
            <div className="input-group px-2">
              <span className="input-group-text bg-white border-end-0">
                <FaSearch
                  className="text-muted custom-search-icon"
                  style={{ color: "#94a3b8" }}
                />
              </span>
              <input
                type="search"
                className="form-control py-2 border-start-0"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                    <th className="custom-perchase-th">NewBarcode</th>
                    <th className="custom-perchase-th">OldBarcode</th>
                    <th className="custom-perchase-th">Photo</th>
                    <th className="custom-perchase-th">SKU</th>
                    <th className="custom-perchase-th">MRP</th>
                    <th className="custom-perchase-th">Stock</th>
                    <th className="custom-perchase-th">Sold</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {inventory?.docs?.length > 0 ? (
                    inventory.docs.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>{item.product?.newBarcode}</td>
                        <td>{item.product?.oldBarcode}</td>
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
                        <td>{item.product?.sku}</td>
                        <td>{item.product?.MRP}</td>
                        <td>{item.quantity}</td>
                        <td>{item.sold}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
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

            <Pagination
              pageCount={inventory?.totalPages || 1}
              onPageChange={handlePageClick}
            />
          </div>
        </div>
        {/* <ImageSliderModal
        show={showModal}
        onHide={closeImageModal}
        images={modalImages}
      /> */}
        {/* <InventoryTable data={inventory} /> */}
        <ImageSliderModalProduct
          show={showImageModal}
          onHide={() => setShowImageModal(false)}
          images={selectedImages}
        />
      </div>
    </div>
  );
};

export default InventoryForm;
