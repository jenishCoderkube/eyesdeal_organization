import * as Yup from 'yup';

export const loginInitialValues = {
  phone: '',
  password: '',
};

export const loginValidationSchema = Yup.object().shape({
  phone: Yup.string()
    .min(8, ({min}) => `Phone must be at least ${min} characters`)
    .required('phone is required'),

  password: Yup.string().required('Password is required'),
});
