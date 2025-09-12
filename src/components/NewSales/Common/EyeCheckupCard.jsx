import React from "react";
import "../../../assets/css/NewSalesStyle/EyeCheckupCard.css";
import { FaArrowRightLong } from "react-icons/fa6";

const EyeCheckupCard = ({
  title = "Eye Check-up",
  imgSrc = "https://picsum.photos/200/300?grayscale",
  onClick,
}) => {
  return (
    <div className="eye-checkup-card" onClick={onClick}>
      <div className="card-content">
        <h2 className="card-title">{title}</h2>
        <p className="card-arrow mt-4">
          <FaArrowRightLong size={20} />
        </p>
      </div>
      <img src={imgSrc} alt="Eye Check-up" className="card-image" />
    </div>
  );
};

export default EyeCheckupCard;
