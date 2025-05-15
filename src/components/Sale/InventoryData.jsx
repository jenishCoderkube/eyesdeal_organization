import React, {useEffect, useState} from 'react';
import {saleService} from '../../services/saleService';
import AsyncSelect from 'react-select/async';
import {v4 as uuidv4} from 'uuid';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function InventoryData({
  inventoryData,
  setInventoryData,
  inventoryPairs,
  setInventoryPairs,
}) {
  const [lensSelections, setLensSelections] = useState({});

  const fetchLensData = async (inputValue) => {
    try {
      const response = await saleService.getLensData(inputValue);
      if (response.success) {
        return response.data.data.docs.map((prod) => ({
          value: prod._id,
          label: `${prod.oldBarcode} / ${prod.sku}`,
          data: prod,
        }));
      } else {
        console.error(response.data.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching lenses:', error);
      return [];
    }
  };

  const calculateInvoiceValues = (mrp, srp, taxRate) => {
    const basePrice = srp / (1 + taxRate / 100);
    const taxAmount = srp - basePrice;
    const discount = mrp - srp;
    const totalAmount = srp;

    return {
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    };
  };

  useEffect(() => {
    const updatedData = inventoryData.map((item) => {
      const data = item.data || {};
      const mrp = parseFloat(data?.MRP) || 0;
      const srp = parseFloat(data?.sellPrice) || 0;
      const taxRate = parseFloat(data?.tax) || 0;

      const {taxAmount, discount, totalAmount} = calculateInvoiceValues(
        mrp,
        srp,
        taxRate,
      );
      return {
        ...item,
        taxAmount,
        discount,
        totalAmount,
      };
    });
    setInventoryData(updatedData);
  }, [inventoryData.length, setInventoryData]);

  const handleLensSelection = (selectedLens, lensType, groupId, index) => {
    if (!selectedLens) {
      setLensSelections((prev) => ({
        ...prev,
        [groupId]: {
          ...prev[groupId],
          [lensType]: null,
        },
      }));
      setInventoryPairs((prev) => {
        const updated = prev.map((pair) => {
          if (pair.pairId === groupId) {
            return {
              ...pair,
              [lensType]: null,
            };
          }
          return pair;
        });
        return updated;
      });
      return;
    }

    const mrp = parseFloat(selectedLens?.data?.MRP) || 0;
    const srp = parseFloat(selectedLens?.data?.sellPrice) || 0;
    const taxRate = parseFloat(selectedLens?.data?.tax) || 0;

    const {taxAmount, discount, totalAmount} = calculateInvoiceValues(
      mrp,
      srp,
      taxRate,
    );

    setLensSelections((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [lensType]: {
          barcode: selectedLens.data.oldBarcode,
          sku: selectedLens.data.sku,
          item: selectedLens.data._id,
        },
      },
    }));

    setInventoryPairs((prev) => {
      const updated = prev.map((pair) => {
        if (pair.pairId === groupId) {
          const newPair = {
            ...pair,
            [lensType]: {
              item: selectedLens.data._id,
              unit: selectedLens.data.unit?.name || 'Pieces',
              displayName: selectedLens.data.productName || 'Lens',
              barcode: selectedLens.data.oldBarcode,
              sku: selectedLens.data.sku,
              mrp,
              srp,
              perPieceDiscount: discount,
              taxRate: `${taxRate} (Inc)`,
              perPieceTax: taxAmount,
              perPieceAmount: totalAmount,
              inclusiveTax: selectedLens.data.inclusiveTax ?? true,
              manageStock: selectedLens.data.manageStock ?? false,
              incentiveAmount: selectedLens.data.incentiveAmount || 0,
            },
          };

          if (newPair.rightLens && newPair.leftLens) {
            const newGroupId = uuidv4();
            console.log('====================================');
            console.log(newPair);
            console.log('====================================');
            setInventoryData((prevData) => {
              const updatedData = [...prevData];
              updatedData.splice(index, 1);
              updatedData.push({
                type: 'rightLens',
                data:
                  newPair.rightLens.item === selectedLens.data._id
                    ? selectedLens.data
                    : pair.rightLens,
                quantity: 1,
                taxAmount: newPair.rightLens.perPieceTax,
                discount: newPair.rightLens.perPieceDiscount,
                totalAmount: newPair.rightLens.perPieceAmount,
                pairId: groupId,
                groupId,
              });
              updatedData.push({
                type: 'leftLens',
                data:
                  newPair.leftLens.item === selectedLens.data._id
                    ? selectedLens.data
                    : pair.leftLens,
                quantity: 1,
                taxAmount: newPair.leftLens.perPieceTax,
                discount: newPair.leftLens.perPieceDiscount,
                totalAmount: newPair.leftLens.perPieceAmount,
                pairId: groupId,
                groupId,
              });
              updatedData.push({
                type: 'lensDropdown',
                pairId: newGroupId,
                groupId: newGroupId,
              });
              return updatedData;
            });

            setInventoryPairs((prevPairs) => [
              ...prevPairs,
              {
                pairId: newGroupId,
                rightLens: null,
                leftLens: null,
              },
            ]);

            setLensSelections((prev) => ({
              ...prev,
              [newGroupId]: {
                rightLens: null,
                leftLens: null,
              },
            }));
          }
          return newPair;
        }
        return pair;
      });
      return updated;
    });
  };

  // Function to remove an entire group (table)
  const handleRemoveGroup = (groupId) => {
    // Filter out all items in inventoryData with the specified groupId
    setInventoryData((prev) => prev.filter((item) => item.groupId !== groupId));

    // Remove the corresponding pair from inventoryPairs
    setInventoryPairs((prev) => prev.filter((pair) => pair.pairId !== groupId));

    // Remove the lens selections for this group
    setLensSelections((prev) => {
      const newSelections = {...prev};
      delete newSelections[groupId];
      return newSelections;
    });
  };

  // Function to remove a specific row within a group
  const handleRemoveRow = (groupId, index) => {
    // Filter out the specific row from inventoryData based on groupId and index
    setInventoryData((prev) =>
      prev.filter((item, i) => !(item.groupId === groupId && i === index)),
    );

    // If no items remain in the group (except possibly the lensDropdown), remove the group entirely
    const remainingItems = inventoryData.filter(
      (item) => item.groupId === groupId,
    );
    if (
      remainingItems.length <= 1 &&
      remainingItems.every((item) => item.type === 'lensDropdown')
    ) {
      setInventoryPairs((prev) =>
        prev.filter((pair) => pair.pairId !== groupId),
      );
      setLensSelections((prev) => {
        const newSelections = {...prev};
        delete newSelections[groupId];
        return newSelections;
      });
    }
  };
  const groupedData = inventoryData.reduce((acc, item) => {
    const groupId = item.groupId || item.pairId || uuidv4();
    if (!acc[groupId]) acc[groupId] = [];
    acc[groupId].push({...item, groupId});
    return acc;
  }, {});

  return (
    <div className="px-2">
      <style>
        {`
          .table th, .table td {
            padding: 0.75rem 0.5rem;
            white-space: nowrap;
            vertical-align: middle;
          }
          .table thead {
            background-color: #f8fafc;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
            text-transform: uppercase;
            font-size: 0.75rem;
            color: #64748b;
            font-weight: 600;
          }
          .table tbody {
            font-size: 0.875rem;
          }
          .form-input {
            width: 100%;
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
            line-height: 1.25rem;
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
            background-color: #fff;
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075);
          }
          .form-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          }
          .border-slate-300 {
            border-color: #d1d5db;
          }
          .text-slate-500 {
            color: #64748b;
          }
          .bg-slate-50 {
            background-color: #f8fafc;
          }
          .border-slate-200 {
            border-color: #e5e7eb;
          }
          .text-red-500 {
            color: #ef4444;
          }
          .text-red-500:hover {
            color: #dc2626;
          }
          .table-responsive {
            max-height: 400px;
            overflow-y: auto;
          }
          .lens-dropdown-container {
            display: flex;
            gap: 1rem;
            align-items: center;
          }
          .lens-dropdown {
            flex: 1;
          }
        `}
      </style>
      <div className="table-responsive">
        <table className="table table-auto w-100">
          {/* <thead className="text-xs font-semibold uppercase text-slate-500 bg-slate-50 border-t border-b border-slate-200">
            <tr>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "80px" }}>
                  Barcode
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "160px" }}>
                  SKU
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "80px" }}>
                  Photos
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "20px" }}>
                  Stock
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "80px" }}>
                  MRP
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "80px" }}>
                  SRP
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "80px" }}>
                  Tax Rate
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "20px" }}>
                  Tax Amount
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "20px" }}>
                  Discount
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "50px" }}>
                  Total Amount
                </div>
              </th>
            </tr>
          </thead> */}
          <tbody className="text-sm">
            {Object.keys(groupedData).length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center">
                  No products added
                </td>
              </tr>
            ) : (
              Object.entries(groupedData).map(
                ([groupId, items], groupIndex) => (
                  <React.Fragment key={`group-${groupId}`}>
                    <tr>
                      <td colSpan="10" className="py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-semibold">
                            Product Group {groupIndex + 1}
                          </span>
                          <button
                            onClick={() => handleRemoveGroup()}
                            className="text-red-500 hover:text-red-700">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                        <table className="table table-auto w-100 mt-2">
                          <thead className="text-xs font-semibold uppercase text-slate-500 bg-slate-50 border-t border-b border-slate-200">
                            <tr>
                              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div
                                  className="font-semibold text-left break-words"
                                  style={{minWidth: '80px'}}>
                                  Barcode
                                </div>
                              </th>
                              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div
                                  className="font-semibold text-left break-words"
                                  style={{minWidth: '160px'}}>
                                  SKU
                                </div>
                              </th>
                              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div
                                  className="font-semibold text-left break-words"
                                  style={{minWidth: '80px'}}>
                                  Photos
                                </div>
                              </th>
                              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div
                                  className="font-semibold text-left break-words"
                                  style={{minWidth: '20px'}}>
                                  Stock
                                </div>
                              </th>
                              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div
                                  className="font-semibold text-left break-words"
                                  style={{minWidth: '80px'}}>
                                  MRP
                                </div>
                              </th>
                              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div
                                  className="font-semibold text-left break-words"
                                  style={{minWidth: '80px'}}>
                                  SRP
                                </div>
                              </th>
                              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div
                                  className="font-semibold text-left break-words"
                                  style={{minWidth: '80px'}}>
                                  Tax Rate
                                </div>
                              </th>
                              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div
                                  className="font-semibold text-left break-words"
                                  style={{minWidth: '20px'}}>
                                  Tax Amount
                                </div>
                              </th>
                              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div
                                  className="font-semibold text-left break-words"
                                  style={{minWidth: '20px'}}>
                                  Discount
                                </div>
                              </th>
                              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div
                                  className="font-semibold text-left break-words"
                                  style={{minWidth: '50px'}}>
                                  Total Amount
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {items
                              .filter((item) => item.type !== 'lensDropdown')
                              .map((item, index) => {
                                const data = item.data || item.product;
                                const isProduct = item.type === 'product';

                                const handleSellPriceChange = (e) => {
                                  const updated = [...inventoryData];
                                  const newSRP =
                                    parseFloat(e.target.value) || 0;
                                  const mrp = parseFloat(data?.MRP) || 0;
                                  const taxRate = parseFloat(data?.tax) || 0;
                                  console.log(
                                    '====================================',
                                  );
                                  console.log('newsrppp', updated);
                                  console.log(
                                    '====================================',
                                  );

                                  updated[index].data.sellPrice =
                                    e.target.value;

                                  const {taxAmount, discount, totalAmount} =
                                    calculateInvoiceValues(
                                      mrp,
                                      newSRP,
                                      taxRate,
                                    );

                                  updated[index].taxAmount = taxAmount;
                                  updated[index].discount = discount;
                                  updated[index].totalAmount = totalAmount;

                                  setInventoryData(updated);

                                  setInventoryPairs((prev) => {
                                    const updated = prev.map((pair) => {
                                      if (pair.pairId === item.pairId) {
                                        const lensKey =
                                          item.type === 'rightLens'
                                            ? 'rightLens'
                                            : item.type === 'leftLens'
                                            ? 'leftLens'
                                            : null;
                                        if (lensKey) {
                                          return {
                                            ...pair,
                                            [lensKey]: {
                                              ...pair[lensKey],
                                              srp: newSRP,
                                              perPieceDiscount: discount,
                                              perPieceTax: taxAmount,
                                              perPieceAmount: totalAmount,
                                            },
                                          };
                                        }
                                      }
                                      return pair;
                                    });
                                    return updated;
                                  });
                                };

                                return (
                                  <tr key={`item-${groupId}-${index}`}>
                                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                      <div className="d-flex align-items-center">
                                        <button
                                          onClick={() =>
                                            handleRemoveRow(
                                              groupId,
                                              inventoryData.findIndex(
                                                (i) => i === item,
                                              ),
                                            )
                                          }
                                          className="text-red-500 hover:text-red-700 me-2">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round">
                                            <line
                                              x1="18"
                                              y1="6"
                                              x2="6"
                                              y2="18"></line>
                                            <line
                                              x1="6"
                                              y1="6"
                                              x2="18"
                                              y2="18"></line>
                                          </svg>
                                        </button>
                                        {data?.oldBarcode || ''}
                                      </div>
                                    </td>
                                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                      <textarea
                                        className="form-input w-70"
                                        rows="1"
                                        cols="5"
                                        type="text"
                                        readOnly
                                        value={
                                          isProduct
                                            ? data?.sku
                                            : data?.productName
                                        }
                                        style={{height: '50px'}}
                                      />
                                    </td>
                                    <td className="px-2 first:pl-1 last:pr-1 py-3 whitespace-nowrap">
                                      <div className="border border-bottom-0 position-relative">
                                        {data?.photos?.length > 0 ? (
                                          <>
                                            <img
                                              src={data?.photos[0]}
                                              alt="Product"
                                              style={{
                                                width: '50px',
                                                height: '50px',
                                              }}
                                            />
                                            <div
                                              style={{
                                                textDecoration: 'underline',
                                                color: 'blue',
                                                cursor: 'pointer',
                                              }}>
                                              View More
                                            </div>
                                          </>
                                        ) : (
                                          <p style={{width: 50, height: 50}}>
                                            No image
                                          </p>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                      <input
                                        type="text"
                                        value={item?.quantity || 1}
                                        readOnly
                                        className="form-input w-100"
                                      />
                                    </td>
                                    <td
                                      class
                                      b
                                      className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                      <input
                                        type="number"
                                        value={data?.MRP || ''}
                                        readOnly
                                        className="form-input w-100"
                                      />
                                    </td>
                                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                      <input
                                        type="number"
                                        value={data?.sellPrice || ''}
                                        className="form-input w-100"
                                        onChange={handleSellPriceChange}
                                      />
                                    </td>
                                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                      <input
                                        type="text"
                                        value={`${data?.tax || 0} (Inc)`}
                                        readOnly
                                        className="form-input w-100"
                                      />
                                    </td>
                                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                      <input
                                        type="number"
                                        value={item?.taxAmount || 0}
                                        readOnly
                                        className="form-input w-100"
                                      />
                                    </td>
                                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                      <input
                                        type="number"
                                        value={item?.discount || 0}
                                        readOnly
                                        className="form-input w-100"
                                      />
                                    </td>
                                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                      <input
                                        type="number"
                                        value={item?.totalAmount || 0}
                                        readOnly
                                        className="form-input w-100"
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            <tr className="border-b-2 border-slate-300">
                              <td colSpan="10">
                                <div className="lens-dropdown-container">
                                  <div className="lens-dropdown">
                                    <label className="d-block text-sm font-medium mb-1">
                                      Right Lens
                                    </label>
                                    {!lensSelections[groupId]?.rightLens ? (
                                      <AsyncSelect
                                        cacheOptions
                                        loadOptions={fetchLensData}
                                        placeholder="Select..."
                                        isClearable
                                        onChange={(selectedLens) =>
                                          handleLensSelection(
                                            selectedLens,
                                            'rightLens',
                                            groupId,
                                            inventoryData.findIndex(
                                              (i) => i.groupId === groupId,
                                            ),
                                          )
                                        }
                                      />
                                    ) : (
                                      <p className="mb-0">
                                        Selected:{' '}
                                        {
                                          lensSelections[groupId].rightLens
                                            .barcode
                                        }{' '}
                                        /{' '}
                                        {lensSelections[groupId].rightLens.sku}
                                      </p>
                                    )}
                                  </div>
                                  <div className="lens-dropdown">
                                    <label className="d-block text-sm font-medium mb-1">
                                      Left Lens
                                    </label>
                                    {!lensSelections[groupId]?.leftLens ? (
                                      <AsyncSelect
                                        cacheOptions
                                        loadOptions={fetchLensData}
                                        placeholder="Select..."
                                        isClearable
                                        onChange={(selectedLens) =>
                                          handleLensSelection(
                                            selectedLens,
                                            'leftLens',
                                            groupId,
                                            inventoryData.findIndex(
                                              (i) => i.groupId === groupId,
                                            ),
                                          )
                                        }
                                      />
                                    ) : (
                                      <p className="mb-0">
                                        Selected:{' '}
                                        {
                                          lensSelections[groupId].leftLens
                                            .barcode
                                        }{' '}
                                        / {lensSelections[groupId].leftLens.sku}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </React.Fragment>
                ),
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
