import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable as a module
import numberToWords from "number-to-words"; // Import for dynamic amount-to-words conversion
import logo from "../../assets/Logo-small.png"; // Adjust the path to your logo image

const generateInvoicePDF = (saleData) => {
  const doc = new jsPDF();

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return amount ? amount.toFixed(2) : "0.00";
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .split("/")
      .join("-");
  };

  // Calculate CGST and SGST (assuming totalTax is inclusive and split equally)
  const totalTax = saleData.totalTax || 0;
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;

  // Prepare table data for orders, including product (if exists), right lens, and left lens as separate rows
  const tableData = [];
  saleData.orders.forEach((order, index) => {
    const product = order.product || {};
    const rightLens = order.rightLens || {};
    const leftLens = order.leftLens || {};

    // Calculate number of items (product + lenses) for tax distribution
    const itemCount =
      (product.displayName ? 1 : 0) +
      (rightLens.displayName ? 1 : 0) +
      (leftLens.displayName ? 1 : 0);

    // Add product row only if it exists
    if (product.displayName) {
      tableData.push([
        tableData.length + 1, // Sr
        product.displayName, // Particulars
        1, // Qty
        formatCurrency(product.mrp || 0), // MRP
        formatCurrency(product.perPieceDiscount || 0), // DIS
        product.unit || "1Pcs", // Unit
        formatCurrency(cgst / (saleData.orders.length * itemCount)), // CGST
        formatCurrency(sgst / (saleData.orders.length * itemCount)), // SGST
        formatCurrency(product.perPieceAmount || 0), // Amount
      ]);
    }

    // Add right lens row
    if (rightLens.displayName) {
      tableData.push([
        tableData.length + 1, // Sr
        rightLens.displayName + " (Right Lens)", // Particulars
        1, // Qty
        formatCurrency(rightLens.mrp || 0), // MRP
        formatCurrency(rightLens.perPieceDiscount || 0), // DIS
        rightLens.unit || "1Pcs", // Unit
        formatCurrency(cgst / (saleData.orders.length * itemCount)), // CGST
        formatCurrency(sgst / (saleData.orders.length * itemCount)), // SGST
        formatCurrency(rightLens.perPieceAmount || 0), // Amount
      ]);
    }

    // Add left lens row
    if (leftLens.displayName) {
      tableData.push([
        tableData.length + 1, // Sr
        leftLens.displayName + " (Left Lens)", // Particulars
        1, // Qty
        formatCurrency(leftLens.mrp || 0), // MRP
        formatCurrency(leftLens.perPieceDiscount || 0), // DIS
        leftLens.unit || "1Pcs", // Unit
        formatCurrency(cgst / (saleData.orders.length * itemCount)), // CGST
        formatCurrency(sgst / (saleData.orders.length * itemCount)), // SGST
        formatCurrency(leftLens.perPieceAmount || 0), // Amount
      ]);
    }
  });

  // Add Logo
  try {
    doc.addImage(logo, "PNG", 170, 10, 30, 20); // Adjust x, y, width, height as needed
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
    // Fallback: Add placeholder text if logo fails
    doc.setFontSize(10);
    doc.text("EYESDEAL", 170, 15);
    doc.text("THE EYEWEAR STORE", 170, 20);
  }

  // Header Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Safwan Enterprise", 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("GREEN PALADIA, PALANPUR PATIA", 14, 26);
  doc.text("CONTACT NUMBER: +", 14, 32);
  doc.text("GST NO: 24GSIPR0270P1Z6", 14, 38);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Sale Invoice", 90, 20);

  // Party Details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Party Name: ${saleData.customerName || "N/A"}`, 14, 50);
  doc.text(`Contact Number: +${saleData.customerPhone || "N/A"}`, 14, 56);

  // Bill Details
  doc.text(`Bill No: ${saleData.saleNumber || "N/A"}`, 150, 50);
  doc.text(`Date: ${formatDate(saleData.createdAt)}`, 150, 56);

  // Table Headers
  const headers = [
    "Sr",
    "Particulars",
    "Qty",
    "MRP",
    "DIS",
    "Unit",
    "CGST",
    "SGST",
    "Amount",
  ];

  // Generate Table using jspdf-autotable
  autoTable(doc, {
    startY: 70,
    head: [headers],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 10 }, // Sr
      1: { cellWidth: 60 }, // Particulars
      2: { cellWidth: 10 }, // Qty
      3: { cellWidth: 15 }, // MRP
      4: { cellWidth: 15 }, // DIS
      5: { cellWidth: 20 }, // Unit
      6: { cellWidth: 15 }, // CGST
      7: { cellWidth: 15 }, // SGST
      8: { cellWidth: 20 }, // Amount
    },
  });

  // Calculate the position after the table
  const finalY = doc.lastAutoTable.finalY || 70;

  // Amount in Words (Dynamic conversion)
  doc.setFontSize(10);
  doc.text(`Amount In Words`, 14, finalY + 10);
  const amountInWords = numberToWords.toWords(saleData.netAmount || 0);
  doc.text(amountInWords, 14, finalY + 16);

  // Terms and Conditions
  doc.text(`Terms And Conditions:`, 14, finalY + 22);

  // Total Section
  doc.text(
    `Total Amount: ${formatCurrency(saleData.netAmount)}`,
    150,
    finalY + 10
  );
  doc.text(`Coupon Discount: ${formatCurrency(0)}`, 150, finalY + 16); // Assuming no coupon discount in data
  doc.text(
    `Flat Discount: ${formatCurrency(saleData.flatDiscount)}`,
    150,
    finalY + 22
  );
  doc.text(
    `Paid Amount: ${formatCurrency(
      saleData.receivedAmount.reduce((sum, amt) => sum + (amt.amount || 0), 0)
    )}`,
    150,
    finalY + 28
  );
  doc.text(
    `Due Amount: ${formatCurrency(
      saleData.netAmount -
        saleData.receivedAmount.reduce((sum, amt) => sum + (amt.amount || 0), 0)
    )}`,
    150,
    finalY + 34
  );
  doc.text(`For Safwan Enterprise`, 150, finalY + 46);

  // Authorized Signatory
  doc.setFontSize(8);
  doc.text(`Authorized Signatory`, 150, finalY + 60);

  // Convert PDF to Blob
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  return pdfUrl;
};

export default generateInvoicePDF;
