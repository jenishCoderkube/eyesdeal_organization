import React from "react";

const OrderMediaCell = ({ orderMedia }) => {
  if (!orderMedia) return <span>-</span>;

  const isVideo = orderMedia.endsWith(".mp4") || orderMedia.endsWith(".mov");

  return (
    <td className="py-3 text-center">
      {isVideo ? (
        <video
          src={orderMedia}
          width="60"
          height="60"
          style={{
            borderRadius: "8px",
            cursor: "pointer",
            objectFit: "cover",
          }}
          onClick={() => window.open(orderMedia, "_blank")}
          muted
        />
      ) : (
        <img
          src={orderMedia}
          alt="Order Media"
          width="60"
          height="60"
          style={{
            borderRadius: "8px",
            cursor: "pointer",
            objectFit: "cover",
          }}
          onClick={() => window.open(orderMedia, "_blank")}
        />
      )}
    </td>
  );
};

export default OrderMediaCell;
