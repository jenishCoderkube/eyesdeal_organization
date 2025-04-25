import {uploadToMediaLibrary} from '../services/uploadToMediaLibrary';

const constants = {
  USER: 'USER',
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
  const location = 'eyesdeal/website/image/seo/';
  const fileName = name;

  try {
    const result = await uploadToMediaLibrary(file, location, fileName);
    return result?.data[0]?.key;
  } catch (error) {
    console.log('Upload failed:', error);
  }
};

export const productOptions = [
  {value: 'eyeGlasses', label: 'Eye Glasses'},
  {value: 'accessories', label: 'Accessories'},
  {value: 'sunGlasses', label: 'Sunglasses'},
  {value: 'spectacleLens', label: 'Spectacle Lens'},
  {value: 'contactLens', label: 'Contact Lens'},
  {value: 'readingGlasses', label: 'Reading Glasses'},
  {value: 'contactSolutions', label: 'Contact Solutions'},
];
