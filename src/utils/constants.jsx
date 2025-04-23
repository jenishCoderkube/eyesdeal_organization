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
  const accessToken = localStorage.getItem('accessToken');
  const file = fileObje; // This should be a File object from input
  const location = 'eyesdeal/website/stores/';
  const fileName = name;

  try {
    const result = await uploadToMediaLibrary(
      file,
      location,
      fileName,
      accessToken,
    );
    return result?.data[0]?.key;
  } catch (error) {
    console.log('Upload failed:', error);
  }
};
