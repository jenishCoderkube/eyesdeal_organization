import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import logoUrl from "../../../assets/Logo-small.png";

const OrderImageTemplate = ({ order, details }) => {
  // Check if orders array exists and has at least one item
  console.log("details<<<", details);

  const orderItem =
    order.orders && order.orders.length > 0 ? order.orders[0] : {};

  return (
    <div
      className="container p-3"
      style={{
        width: "800px",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        border: "1px solid #000",
        backgroundColor: "#fff",
      }}
    >
      {/* Header with Logo */}
      <div className="text-center mb-3">
        <img
          src={logoUrl}
          alt="Eyesdeal Logo"
          style={{ width: "150px", height: "auto" }}
        />
        <p style={{ margin: 0, fontSize: "10px", color: "#ff6200" }}>
          eyesdeal.com
        </p>
        <p style={{ margin: 0, fontSize: "8px", color: "#000" }}>
          THE TRUSTED EYEWEAR STORE
        </p>
      </div>

      {/* Top Section */}
      <table className="table table-bordered mb-3">
        <tbody>
          <tr>
            <td style={{ backgroundColor: "#e0e0e0", width: "30%" }}>
              Branch Name
            </td>
            <td>{order.store?.name || "N/A"}</td>
          </tr>
          <tr>
            <td style={{ backgroundColor: "#e0e0e0" }}>Vendor Note</td>
            <td>{details?.vendorNote || order.vendorNote || "N/A"}</td>
          </tr>
          <tr>
            <td style={{ backgroundColor: "#e0e0e0" }}>Store Note</td>
            <td>{order.note || "N/A"}</td>
          </tr>
          <tr>
            <td style={{ backgroundColor: "#e0e0e0", width: "30%" }}>
              Customer Name
            </td>
            <td style={{ width: "30%" }}>{order.customerName || "N/A"}</td>
            <td style={{ backgroundColor: "#e0e0e0", width: "20%" }}>
              Order Number
            </td>
            <td style={{ width: "20%" }}>{orderItem.billNumber || "N/A"}</td>
          </tr>
          <tr>
            <td style={{ backgroundColor: "#e0e0e0" }}>Frame SKU</td>
            <td style={{ width: "30%" }}>{orderItem.product?.sku || "N/A"}</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>Order Date</td>
            <td>
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "N/A"}
            </td>
          </tr>
          <tr>
            <td style={{ backgroundColor: "#e0e0e0" }}>Right Vendor</td>
            <td>
              {details?.rightVendor?.label ||
                orderItem.currentRightJobWork?.vendor?.companyName ||
                "N/A"}
            </td>
            <td style={{ backgroundColor: "#e0e0e0" }}>Left Vendor</td>
            <td>
              {details?.leftVendor?.label ||
                orderItem.currentLeftJobWork?.vendor?.companyName ||
                "N/A"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Lens Section */}
      <table className="table table-bordered mb-3">
        <thead>
          <tr>
            <th
              colSpan={5}
              style={{ backgroundColor: "#e0e0e0", textAlign: "center" }}
            >
              Right Eye
            </th>
            <th
              colSpan={5}
              style={{ backgroundColor: "#e0e0e0", textAlign: "center" }}
            >
              Left Eye
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ backgroundColor: "#e0e0e0" }}>Lens SKU</td>
            <td colSpan={4}>{orderItem.rightLens?.sku || "N/A"}</td>
            <td style={{ backgroundColor: "#e0e0e0" }}></td>
            <td colSpan={4}>{orderItem.leftLens?.sku || "N/A"}</td>
          </tr>
          <tr>
            <td style={{ backgroundColor: "#e0e0e0" }}>Specs</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>SPH</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>CYL</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>AXIS</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>ADD</td>
            <td style={{ backgroundColor: "#e0e0e0" }}></td>
            <td style={{ backgroundColor: "#e0e0e0" }}>SPH</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>CYL</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>AXIS</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>ADD</td>
          </tr>
          <tr>
            <td style={{ backgroundColor: "#e0e0e0" }}>Dist</td>
            <td>{order.powerAtTime?.specs?.right?.distance?.sph || "0"}</td>
            <td>{order.powerAtTime?.specs?.right?.distance?.cyl || "0"}</td>
            <td>{order.powerAtTime?.specs?.right?.distance?.axis || "0"}</td>
            <td>{order.powerAtTime?.specs?.right?.distance?.add || "0"}</td>
            <td style={{ backgroundColor: "#e0e0e0" }}></td>
            <td>{order.powerAtTime?.specs?.left?.distance?.sph || "0"}</td>
            <td>{order.powerAtTime?.specs?.left?.distance?.cyl || "0"}</td>
            <td>{order.powerAtTime?.specs?.left?.distance?.axis || "0"}</td>
            <td>{order.powerAtTime?.specs?.left?.distance?.add || "0"}</td>
          </tr>
          <tr>
            <td style={{ backgroundColor: "#e0e0e0" }}>Near</td>
            <td>{order.powerAtTime?.specs?.right?.near?.sph || "0"}</td>
            <td>{order.powerAtTime?.specs?.right?.near?.cyl || "0"}</td>
            <td>{order.powerAtTime?.specs?.right?.near?.axis || "0"}</td>
            <td></td>
            <td style={{ backgroundColor: "#e0e0e0" }}></td>
            <td>{order.powerAtTime?.specs?.left?.near?.sph || "0"}</td>
            <td>{order.powerAtTime?.specs?.left?.near?.cyl || "0"}</td>
            <td>{order.powerAtTime?.specs?.left?.near?.axis || "0"}</td>
            <td></td>
          </tr>
          <tr>
            <td style={{ backgroundColor: "#e0e0e0" }}>Contact</td>
            <td>{order.powerAtTime?.contacts?.right?.distance?.sph || "0"}</td>
            <td>{order.powerAtTime?.contacts?.right?.distance?.cyl || "0"}</td>
            <td>{order.powerAtTime?.contacts?.right?.distance?.axis || "0"}</td>
            <td>{order.powerAtTime?.contacts?.right?.distance?.add || "0"}</td>
            <td style={{ backgroundColor: "#e0e0e0" }}></td>
            <td>{order.powerAtTime?.contacts?.left?.distance?.sph || "0"}</td>
            <td>{order.powerAtTime?.contacts?.left?.distance?.cyl || "0"}</td>
            <td>{order.powerAtTime?.contacts?.left?.distance?.axis || "0"}</td>
            <td>{order.powerAtTime?.contacts?.left?.distance?.add || "0"}</td>
          </tr>
        </tbody>
      </table>

      {/* Additional Specs Section */}
      <table
        className="table mb-3"
        style={{ border: "1px solid #000", borderCollapse: "collapse" }}
      >
        <tbody>
          <tr>
            <td style={{ backgroundColor: "#e0e0e0" }}>Psm(R)</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>Pd(R)</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>Fh(R)</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>IPD</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>Psm(L)</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>Pd(L)</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>Fh(L)</td>
          </tr>
          <tr>
            <td>{order.powerAtTime?.specs?.right?.psm || ""}</td>
            <td>{order.powerAtTime?.specs?.right?.pd || ""}</td>
            <td>{order.powerAtTime?.specs?.right?.fh || ""}</td>
            <td>{order.powerAtTime?.specs?.ipd || ""}</td>
            <td>{order.powerAtTime?.specs?.left?.psm || ""}</td>
            <td>{order.powerAtTime?.specs?.left?.pd || ""}</td>
            <td>{order.powerAtTime?.specs?.left?.fh || ""}</td>
          </tr>
          <tr>
            <td style={{ backgroundColor: "#e0e0e0" }}>Asize</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>Bsize</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>DBL</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>FTH</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>P Design</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>F type</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>DE</td>
          </tr>
          <tr>
            <td>{order.powerAtTime?.specs?.aSize || ""}</td>
            <td>{order.powerAtTime?.specs?.bSize || ""}</td>
            <td>{order.powerAtTime?.specs?.dbl || ""}</td>
            <td>{order.powerAtTime?.specs?.fth || ""}</td>
            <td>{order.powerAtTime?.specs?.pDesign || ""}</td>
            <td>{order.powerAtTime?.specs?.ft || ""}</td>
            <td>{order.powerAtTime?.specs?.de || ""}</td>
          </tr>
          <tr>
            <td style={{ backgroundColor: "#e0e0e0" }}>K(R)</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>Dia(R)</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>Bc(R)</td>
            <td style={{ backgroundColor: "#e0e0e0" }}></td>
            <td style={{ backgroundColor: "#e0e0e0" }}>K(L)</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>Dia(L)</td>
            <td style={{ backgroundColor: "#e0e0e0" }}>Bc(L)</td>
          </tr>
          <tr>
            <td>{order.powerAtTime?.contacts?.right?.k || ""}</td>
            <td>{order.powerAtTime?.contacts?.right?.dia || ""}</td>
            <td>{order.powerAtTime?.contacts?.right?.bc || ""}</td>
            <td></td>
            <td>{order.powerAtTime?.contacts?.left?.k || ""}</td>
            <td>{order.powerAtTime?.contacts?.left?.dia || ""}</td>
            <td>{order.powerAtTime?.contacts?.left?.bc || ""}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default OrderImageTemplate;
