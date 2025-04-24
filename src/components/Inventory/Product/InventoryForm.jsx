import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import {toast} from 'react-toastify';
import {inventoryService} from '../../../services/inventoryService';

const InventoryForm = () => {
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

  // Options for select fields

  const productOptions = [
    {value: 'eyeGlasses', label: 'Eye Glasses'},
    {value: 'accessories', label: 'Accessories'},
    {value: 'sunGlasses', label: 'Sunglasses'},
    {value: 'spectacleLens', label: 'Spectacle Lens'},
    {value: 'contactLens', label: 'Contact Lens'},
    {value: 'readingGlasses', label: 'Reading Glasses'},
    {value: 'contactSolutions', label: 'Contact Solutions'},
  ];

  const genderOptions = [
    {value: 'male', label: 'Male'},
    {value: 'female', label: 'Female'},
    {value: 'unisex', label: 'Unisex'},
  ];

  const frameSizeOptions = [
    {value: 'small', label: 'Small'},
    {value: 'medium', label: 'Medium'},
    {value: 'large', label: 'Large'},
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
        .of(Yup.object().shape({value: Yup.string(), label: Yup.string()}))
        .min(1, 'At least one store is required')
        .required('Store is required'),
      selectedProduct: Yup.object().nullable().required('Product is required'),
      brand: Yup.object().nullable().required('Brand is required'),
    }),
    onSubmit: (values) => {
      console.log('Form submitted:', values);
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
    getStores();
    getCategoryData();
    getFrameTypeData();
    getFrameShapeData();
    getMaterialData();
    getColorData();
    getPreTypeData();
    getCollectionData();
    getInventoryData();
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
      console.error(' error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getCategory();
      if (response.success) {
        setCategoryData(response?.data?.data?.docs);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(' error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFrameTypeData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getFrameType();
      if (response.success) {
        console.log('response', response?.data);
        setFrameType(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(' error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFrameShapeData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getFrameShape();
      if (response.success) {
        console.log('response', response?.data);
        setShapeType(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(' error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaterialData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getMaterial();
      if (response.success) {
        console.log('response', response?.data);
        setMaterial(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(' error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getColor();
      if (response.success) {
        console.log('response', response?.data);
        setColor(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(' error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPreTypeData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getPrescriptionType();
      if (response.success) {
        console.log('response', response?.data);
        setPreType(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(' error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCollectionData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getCollection();
      if (response.success) {
        console.log('response', response?.data);
        setCollection(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(' error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInventoryData = async (values) => {
    const storeId = values?.stores?.map((option) => option.value);

    setLoading(true);

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
        storeId,
        1
      );
      if (response.success) {
        console.log('response', response);
        setInventory(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-body px-3 py-3">
      <form onSubmit={formik.handleSubmit}>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          <div className="col">
            <label className="form-label font-weight-500" htmlFor="stores">
              Store <span className="text-danger">*</span>
            </label>
            <Select
              options={storeOptions}
              value={formik.values.stores}
              isMulti
              onChange={(option) => formik.setFieldValue('stores', option)}
              onBlur={() => formik.setFieldTouched('stores', true)}
              placeholder="Select..."
              classNamePrefix="react-select"
              className={
                formik.touched.stores && formik.errors.stores
                  ? 'is-invalid'
                  : ''
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
                formik.setFieldValue('selectedProduct', option)
              }
              onBlur={() => formik.setFieldTouched('selectedProduct', true)}
              placeholder="Select..."
              classNamePrefix="react-select"
              className={
                formik.touched.selectedProduct && formik.errors.selectedProduct
                  ? 'is-invalid'
                  : ''
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
              Brand <span className="text-danger">*</span>
            </label>
            <Select
              options={brandOptions}
              value={formik.values.brand}
              onChange={(option) => formik.setFieldValue('brand', option)}
              onBlur={() => formik.setFieldTouched('brand', true)}
              placeholder="Select..."
              classNamePrefix="react-select"
              className={
                formik.touched.brand && formik.errors.brand ? 'is-invalid' : ''
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
              onChange={(option) => formik.setFieldValue('frameType', option)}
              onBlur={() => formik.setFieldTouched('frameType', true)}
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
              onChange={(option) => formik.setFieldValue('frameShape', option)}
              onBlur={() => formik.setFieldTouched('frameShape', true)}
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
              onChange={(option) => formik.setFieldValue('gender', option)}
              onBlur={() => formik.setFieldTouched('gender', true)}
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
                formik.setFieldValue('frameMaterial', option)
              }
              onBlur={() => formik.setFieldTouched('frameMaterial', true)}
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
              onChange={(option) => formik.setFieldValue('frameColor', option)}
              onBlur={() => formik.setFieldTouched('frameColor', true)}
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
              onChange={(option) => formik.setFieldValue('frameSize', option)}
              onBlur={() => formik.setFieldTouched('frameSize', true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label
              className="form-label font-weight-500 "
              htmlFor="prescriptionType"
            >
              Prescription Type
            </label>
            <Select
              options={prescriptionTypeOptions}
              value={formik.values.prescriptionType}
              onChange={(option) =>
                formik.setFieldValue('prescriptionType', option)
              }
              onBlur={() => formik.setFieldTouched('prescriptionType', true)}
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
                formik.setFieldValue('frameCollection', option)
              }
              onBlur={() => formik.setFieldTouched('frameCollection', true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            // disabled={formik.isSubmitting}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;
