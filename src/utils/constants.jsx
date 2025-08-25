import { uploadToMediaLibrary } from "../services/uploadToMediaLibrary";

const constants = {
  USER: "USER",
};

export default constants;

export const saveUserLocally = (user) => {
  localStorage.setItem(constants.USER, user);
};

export const getUser = () => {
  return localStorage.getItem(constants.USER);
};

export const printLogs = (msg) => {
  console.log(msg);
};

export const uploadImage = async (fileObje, name) => {
  const file = fileObje; // This should be a File object from input
  const location = "eyesdeal/website/image/seo/";
  const fileName = name;

  try {
    const result = await uploadToMediaLibrary(file, location, fileName);
    return result?.data[0]?.key;
  } catch (error) {
    console.log("Upload failed:", error);
  }
};

export const productOptions = [
  { value: "eyeGlasses", label: "Eye Glasses" },
  { value: "accessories", label: "Accessories" },
  { value: "sunGlasses", label: "Sunglasses" },
  { value: "spectacleLens", label: "Spectacle Lens" },
  { value: "contactLens", label: "Contact Lens" },
  { value: "readingGlasses", label: "Reading Glasses" },
  { value: "contactSolutions", label: "Contact Solutions" },
];

export const defalutImageBasePath =
  "https://s3.ap-south-1.amazonaws.com/eyesdeal.blinklinksolutions.com/";

// Dummy product ranges based on product type
export const productRangesByType = {
  sunGlasses: [
    { label: "1 - 1000", value: "1-1000" },
    { label: "1001 - 2000", value: "1001-2000" },
    { label: "2001 - 3000", value: "2001-3000" },
  ],
  eyeGlasses: [
    { label: "1 - 500", value: "1-500" },
    { label: "501 - 1000", value: "501-1000" },
    { label: "1001 - 1500", value: "1001-1500" },
  ],
  contactLenses: [
    { label: "1 - 1500", value: "1-1500" },
    { label: "1501 - 3000", value: "1501-3000" },
    { label: "3001 - 4439", value: "3001-4439" },
  ],
};

export const parseRange = (range) => {
  const [min, max] = range.split("-").map(Number);
  return { min, max };
};
