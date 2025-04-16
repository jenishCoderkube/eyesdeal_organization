import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";

const productOptions = [
  { value: "product1", label: "Product 1" },
  { value: "product2", label: "Product 2" },
  { value: "product3", label: "Product 3" },
];

function BarcodeGenerate() {
  const [items, setItems] = useState([]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="container-fluid p-md-5 ">
      <form onSubmit={handleSubmit} className="px-md-5 px-2 ">
        <div className="card mb-4">
          <div className="card-body ">
            {items.map((item, index) => (
              <div key={index} className="card mb-3">
                <div className="card-body p-4">
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
                        className="btn btn-danger btn-sm w-auto p-2"
                        onClick={() => handleRemove(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="d-flex gap-3 ">
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
