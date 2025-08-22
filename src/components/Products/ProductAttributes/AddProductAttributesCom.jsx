import React, { useState } from "react";
import { Container, Row, Col, Nav, Form, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { productAttributeService } from "../../../services/productAttributeService";
import { toast } from "react-toastify";

function AddProductAttributes() {
  const [activeTab, setActiveTab] = useState("brand");
  const [formData, setFormData] = useState({
    name: "",
  });

  const [loading, setLoading] = useState(false);
  // Attribute list for tabs
  const attributes = [
    "brand",
    "collection",
    "feature",
    "color",
    "frameStyle",
    "frameType",
    "unit",
    "frameShape",
    "material",
    "readingPower",
    "prescriptionType",
    "subCategory",
    "tax",
    "warranty",
    "lensTechnology",
    "disposability",
  ];

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData({ name: "", value: "" });
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }
    if (
      (activeTab === "tax" || activeTab === "warranty") &&
      !formData.value.trim()
    ) {
      alert("Value is required for this attribute");
      return;
    }

    setLoading(true);
    try {
      // 👇 Call API
      const response = await productAttributeService.addAttribute(
        activeTab,
        formData
      );

      if (response.success) {
        toast.success(`${activeTab} added successfully`);
        setFormData({ name: "" }); // Reset form after submission
      } else {
        toast.error(response.message || `Failed to add ${activeTab}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="px-4 py-5">
      <style>
        {`
          .text-color-purple {
            color: #6f42c1;
          }
        `}
      </style>
      {/* Mobile Horizontal Tabs */}
      <div className="d-md-none bg-light border-bottom">
        <div className="max-width-90 mx-auto py-md-3 py-2">
          <Nav
            className="flex-row flex-nowrap overflow-x-auto"
            style={{ whiteSpace: "nowrap" }}
          >
            {attributes.map((item) => (
              <Nav.Item key={item} className="me-1">
                <Nav.Link
                  active={activeTab === item}
                  onClick={() => handleTabChange(item)}
                  className={`fw-normal ${
                    activeTab === item
                      ? "active text-color-purple"
                      : "text-black"
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === item ? "rgb(238, 242, 255)" : "transparent",
                    borderRadius: "0.25rem",
                    display: "inline-block",
                    marginRight: "0.5rem",
                  }}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </div>
      </div>
      <Row className="max-width-90 mx-auto mt-5">
        {/* Desktop Vertical Tabs */}
        <Col
          md={2}
          className="d-none d-md-block bg-light mt-5 border-end"
          style={{ minHeight: "100vh" }}
        >
          <div className="mx-auto mt-4">
            <Nav className="flex-column">
              {attributes.map((item) => (
                <Nav.Item key={item}>
                  <Nav.Link
                    active={activeTab === item}
                    onClick={() => handleTabChange(item)}
                    className={`font-weight-600 ${
                      activeTab === item
                        ? "active text-color-purple"
                        : "text-black"
                    }`}
                    style={{
                      backgroundColor:
                        activeTab === item
                          ? "rgb(238, 242, 255)"
                          : "transparent",
                      borderRadius: "0.25rem",
                    }}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </div>
        </Col>
        {/* Right-side Form */}
        <Col md={10} className="p-md-4 mt-5 mt-md-0">
          <div className="">
            <h6 className="fw-bold px-3 pt-3">
              Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h6>
            <div className="card-body p-4">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="block text-sm font-weight-500 mb-1">
                    Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-100"
                    placeholder="Enter name"
                  />
                </Form.Group>
                {(activeTab === "tax" || activeTab === "warranty") && (
                  <Form.Group className="mb-4">
                    <p className="block text-sm font-normal text-decoration-underline">
                      Value in days for warranty and percentage for tax
                    </p>
                    <Form.Label className="block text-sm font-medium mb-1">
                      Value <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      className="w-100"
                      placeholder="Enter value"
                    />
                  </Form.Group>
                )}
                <Button
                  type="submit"
                  className="bg-indigo-500 hover-bg-indigo-600 text-white"
                >
                  Submit
                </Button>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default AddProductAttributes;
