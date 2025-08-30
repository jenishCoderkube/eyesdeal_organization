// InventoryPairs.jsx
import React from "react";
import AsyncSelect from "react-select/async";
import { saleService } from "../../../services/saleService";
const BASE_URL =
    "https://s3.ap-south-1.amazonaws.com/eyesdeal.blinklinksolutions.com/";
export default function InventoryPairs({ inventoryPairs, setInventoryPairs, defaultStore }) {
    // Async loaders
    console.log("inventoryPairs<<",inventoryPairs);
    
    const fetchLensOptions = async (input) => {
        try {
            const resp = await saleService.getLensData(input);
            if (resp?.success) {
                return resp.data.data.docs.map((p) => ({
                    value: p._id,
                    label: `${p.newBarcode ?? ""} / ${p.sku ?? ""}`,
                    data: p,
                }));
            }
            return [];
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const fetchProductOptions = async (input) => {
        try {
            const resp = await saleService.listProducts(input);
            if (resp?.success) {
                return resp.data.data.docs.map((p) => ({
                    value: p._id,
                    label: `${p.newBarcode ?? ""} / ${p.sku ?? ""}`,
                    data: p,
                }));
            }
            return [];
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const fetchInventoryDetails = async (prodID) => {
        try {
            if (!defaultStore?.value) {
                alert("Select store first");
                return null;
            }
            const resp = await saleService.checkInventory(prodID, defaultStore.value);
            if (resp?.success) {
                const inv = resp.data.data.docs?.[0];
                if (!inv) {
                    alert("Product not in inventory");
                    return null;
                }
                if ((inv.quantity ?? 0) <= 0) {
                    alert("Out of stock");
                    return null;
                }
                return { ...inv.product, quantity: inv.quantity };
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const calcInvoice = (mrp = 0, srp = 0, tax = 0) => {
        const base = srp / (1 + (Number(tax) || 0) / 100);
        const taxAmount = srp - base;
        const discount = mrp - srp;
        return {
            taxAmount: Number(taxAmount.toFixed(2)),
            discount: Number(discount.toFixed(2)),
            totalAmount: Number(Number(srp).toFixed(2)),
        };
    };

    const normalizeForPair = (prod) => {
        const mrp = Number(prod?.MRP) || 0;
        const srp = Number(prod?.sellPrice) || 0;
        const tax = Number(prod?.tax) || 0;
        const { taxAmount, discount, totalAmount } = calcInvoice(mrp, srp, tax);

        return {
            id: prod._id,
            displayName: prod.productName || prod.displayName || "",
            barcode: prod.newBarcode ?? prod.oldBarcode ?? "",
            sku: prod.sku ?? "",
            photos: prod.photos ?? [],
            mrp,
            srp,
            taxRate: `${tax} (Inc)`,
            taxAmount,
            discount,
            totalAmount,
            quantity: prod.quantity ?? 1,
            raw: prod,
        };
    };

    const updatePair = (pairId, patch) => {
        setInventoryPairs((prev) => prev.map((p) => (p.pairId === pairId ? { ...p, ...patch } : p)));
    };

    // Handler when a slot (product/leftLens/rightLens) is selected or cleared
    const handleSlotChange = async (pairId, slot, option) => {
        const pair = inventoryPairs.find((p) => p.pairId === pairId);
        if (!pair) return;

        // clearing selection
        if (!option) {
            if (slot === "product") {
                // ✅ Only remove frame, keep lenses as-is
                updatePair(pairId, { product: null });
                // if pair is now fully empty (no product and no lenses), then remove it
                setInventoryPairs((prev) =>
                    prev.filter(
                        (q) => !(q.pairId === pairId && !q.product && !q.leftLens && !q.rightLens)
                    )
                );
                return;
            }

            if (slot === "leftLens") {
                const wasAuto = pair.autoFilledRight;
                updatePair(pairId, {
                    leftLens: null,
                    autoFilledRight: false,
                    rightLens: wasAuto ? null : pair.rightLens,
                });
                setInventoryPairs((prev) =>
                    prev.filter(
                        (q) => !(q.pairId === pairId && !q.product && !q.leftLens && !q.rightLens)
                    )
                );
                return;
            }

            if (slot === "rightLens") {
                updatePair(pairId, { rightLens: null });
                setInventoryPairs((prev) =>
                    prev.filter(
                        (q) => !(q.pairId === pairId && !q.product && !q.leftLens && !q.rightLens)
                    )
                );
                return;
            }
        }

        // selection (option is present). Need to resolve full inventory details to get quantity etc.
        const inv = await fetchInventoryDetails(option.value);
        if (!inv) return;
        const normalized = normalizeForPair(inv);

        if (slot === "product") {
            updatePair(pairId, { product: normalized });
            return;
        }

        if (slot === "leftLens") {
            // left lens selected -> auto fill right lens too
            updatePair(pairId, { leftLens: normalized, rightLens: normalized, autoFilledRight: true });
            return;
        }

        if (slot === "rightLens") {
            // right lens selected -> DO NOT touch left
            updatePair(pairId, { rightLens: normalized });
            return;
        }
    };

    const handleRemovePair = (pairId) => {
        setInventoryPairs((prev) => prev.filter((p) => p.pairId !== pairId));
    };

    // Render helpers
    const renderRow = (label, item, pairId, slot) => {
        if (!item) return null;
        return (
            <tr>
                <td>{item.barcode}</td>
                <td>
                    <div style={{ whiteSpace: "pre-wrap" }}>{item.sku}</div>
                </td>
                <td>
                    {item.photos?.length > 0 ? <>
                        <img
                            src={`${BASE_URL + item?.photos[0]}`}
                            alt="Product"
                            style={{
                                width: "50px",
                                height: "50px",
                            }}
                        />
                        {/* <div
                            style={{
                                textDecoration: "underline",
                                color: "blue",
                                cursor: "pointer",
                            }}
                        >
                            View More
                        </div> */}
                    </> : <div style={{ width: 50, height: 50 }}>No image</div>}
                </td>
                <td>{item.quantity}</td>
                <td>{item.mrp}</td>
                <td>
                    <input
                    className=""
                    style={{
                        width:"100px"
                    }}
                        type="number"
                        value={item.srp}
                        onChange={(e) => {
                            const newSrp = Number(e.target.value) || 0;
                            // update srp and derived amounts
                            setInventoryPairs((prev) =>
                                prev.map((p) => {
                                    if (p.pairId !== pairId) return p;
                                    const clone = { ...p };
                                    if (slot === "product" && clone.product) {
                                        const mrp = Number(clone.product.mrp || 0);
                                        const tax = Number(clone.product.raw?.tax || 0);
                                        const base = newSrp / (1 + tax / 100);
                                        const taxAmount = Number((newSrp - base).toFixed(2));
                                        const discount = Number((mrp - newSrp).toFixed(2));
                                        clone.product = { ...clone.product, srp: newSrp, taxAmount, discount, totalAmount: newSrp };
                                    } else if (slot === "leftLens" && clone.leftLens) {
                                        const mrp = Number(clone.leftLens.mrp || 0);
                                        const tax = Number(clone.leftLens.raw?.tax || 0);
                                        const base = newSrp / (1 + tax / 100);
                                        const taxAmount = Number((newSrp - base).toFixed(2));
                                        const discount = Number((mrp - newSrp).toFixed(2));
                                        clone.leftLens = { ...clone.leftLens, srp: newSrp, taxAmount, discount, totalAmount: newSrp };
                                        if (clone.autoFilledRight && clone.rightLens) {
                                            clone.rightLens = { ...clone.rightLens, srp: newSrp, taxAmount, discount, totalAmount: newSrp };
                                        }
                                    } else if (slot === "rightLens" && clone.rightLens) {
                                        const mrp = Number(clone.rightLens.mrp || 0);
                                        const tax = Number(clone.rightLens.raw?.tax || 0);
                                        const base = newSrp / (1 + tax / 100);
                                        const taxAmount = Number((newSrp - base).toFixed(2));
                                        const discount = Number((mrp - newSrp).toFixed(2));
                                        clone.rightLens = { ...clone.rightLens, srp: newSrp, taxAmount, discount, totalAmount: newSrp };
                                    }
                                    return clone;
                                })
                            );
                        }}
                    />
                </td>
                <td>{item.taxRate}</td>
                <td>{item.taxAmount ?? 0}</td>
                <td>{item.discount ?? 0}</td>
                <td>{item.totalAmount ?? item.srp ?? 0}</td>
                <td>
                    <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleSlotChange(pairId, slot, null)}
                    >
                        Remove
                    </button>
                </td>
            </tr>
        );
    };

    if (!inventoryPairs || inventoryPairs.length === 0) {
        return <div className="text-center py-3">No pairs added</div>;
    }

    return (
        <div>
            {inventoryPairs.map((pair, idx) => {
                return (
                    <div key={pair.pairId} className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong>Pair {idx + 1}</strong>
                            <button className="btn btn-sm btn-danger" onClick={() => handleRemovePair(pair.pairId)}>
                                Remove Pair
                            </button>
                        </div>
<div className="table-responsive">
  
    <table className="table table-sm table-striped">
        <thead>
            <tr>
                <th>Barcode</th>
                <th>SKU / Name</th>
                <th>Photos</th>
                <th>Qty</th>
                <th>MRP</th>
                <th>SRP</th>
                <th>Tax Rate</th>
                <th>Tax Amount</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {pair.product && renderRow("Frame", pair.product, pair.pairId, "product")}
            {pair.leftLens && renderRow("Left Lens", pair.leftLens, pair.pairId, "leftLens")}
            {pair.rightLens && renderRow("Right Lens", pair.rightLens, pair.pairId, "rightLens")}
        </tbody>
    </table>
</div>


                        <div style={{ display: "flex", gap: 12 }}>
                            {/* Show frame selector only if product is missing */}
                            {!pair.product && (
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Frame</label>
                                    <AsyncSelect
                                        cacheOptions
                                        loadOptions={fetchProductOptions}
                                        placeholder="Select frame..."
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        onChange={(opt) => handleSlotChange(pair.pairId, "product", opt)}
                                    />
                                </div>
                            )}

                            {/* left lens select (visible if missing) */}
                            {!pair.leftLens && (
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Left Lens</label>
                                    <AsyncSelect
                                        cacheOptions
                                        loadOptions={fetchLensOptions}
                                        placeholder="Select left lens..."
                                        isClearable
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        onChange={(opt) => handleSlotChange(pair.pairId, "leftLens", opt)}
                                    />
                                </div>
                            )}

                            {/* right lens select (visible if missing) */}
                            {!pair.rightLens && (
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Right Lens</label>
                                    <AsyncSelect
                                        cacheOptions
                                        loadOptions={fetchLensOptions}
                                        placeholder="Select right lens..."
                                        isClearable
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        onChange={(opt) => handleSlotChange(pair.pairId, "rightLens", opt)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
