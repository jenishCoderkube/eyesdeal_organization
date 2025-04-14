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
