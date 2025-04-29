import React from 'react'
import AsyncSelect from "react-select/async";
import { saleService } from '../../services/saleService';
import { v4 as uuidv4 } from 'uuid';

export default function ProductSelector({
    showProductSelector,
    defaultStore,
    setInventoryData,
    setShowProductSelector,
    setInventoryPairs
}) {

    const fetchProductData = async (inputValue) => {
        try {
            const response = await saleService.listProducts(inputValue);

            if (response.success) {
                return response.data.data.docs.map((prod) => ({
                    value: prod._id,
                    label: `${prod.oldBarcode} / ${prod.sku}`,
                    data: prod,
                }));
            } else {
                console.error(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    const fetchInventoryDetails = async (prodID, storeID) => {
        try {
            const response = await saleService.checkInventory(prodID, storeID);

            if (response.success) {
                const newItem = response?.data?.data?.docs?.[0];
                if (newItem) {
                    return newItem.product
                }
                if (response.data.data.docs.length == 0) {
                    alert("product out of stock");
                }
            } else {
                console.error(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    }

    const handleAddProduct = async (selectedProduct) => {
        const productDetails = await fetchInventoryDetails(selectedProduct?.value, defaultStore.value);
        if (productDetails) {
            const pairId = uuidv4(); // generate unique ID

            setInventoryData(prev => [
                ...prev,
                { type: "product", data: productDetails, pairId },
                { type: "lensDropdown", pairId }
            ]);

            const newPair = {
                pairId,
                product: productDetails,
                lens: null,
            };
            setInventoryPairs((prev) => [...prev, newPair]);

        }
    };

    return (
        <>
            {showProductSelector && (
                <div className="d-flex gap-4 w-100 mb-3">
                    <div className="w-100">
                        <label htmlFor="product" className="custom-label">
                            Product
                        </label>
                        <AsyncSelect
                            cacheOptions
                            loadOptions={fetchProductData}
                            onChange={async (selectedOption) => {
                                handleAddProduct(selectedOption);
                                setShowProductSelector(false);
                            }}
                        />
                        {/* <AsyncSelect
                            cacheOptions
                            loadOptions={fetchProductData}
                            onChange={async (selectedOption) => {
                                const product = selectedOption || {};
                                const inventoryDetails = await fetchInventoryDetails(product?.value, defaultStore.value);
                                if (inventoryDetails) {
                                    const newItem = {
                                        product: inventoryDetails,
                                        quantity: 1,
                                        taxAmount: 0,
                                        discount: 0,
                                        totalAmount: 0,
                                    };
                                handleAddProduct(selectedOption);
                                setInvertoryData([...invertoryData, newItem]);
                                setInventoryPairs(prev => [...prev, { product, lens: null }]);
                                }
                                setShowProductSelector(false); // hide dropdown after selection
                            }}
                        /> */}
                    </div>
                </div>
            )}
        </>
    )
}