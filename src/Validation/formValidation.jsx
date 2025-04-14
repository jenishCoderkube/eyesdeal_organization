import * as Yup from 'yup';

export const loginInitialValues = {
  phone: '',
};

export const loginValidationSchema = Yup.object().shape({
  phone: Yup.string()
    .min(8, ({min}) => `Password must be at least ${min} characters`)
    .required('Password is required'),
});
