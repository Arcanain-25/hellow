import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '../../../store/store';
import { register } from '../../../store/UserSlice';
import { RegisterCredentials } from '../../../types/common';
import { authFormValidator } from '../../../utils/validators';
import useForm from '../../../hooks/useForm';
import Form from '../../UI/Form/Form';
import Input from '../../UI/Input/Input';
import Button from '../../UI/Button/Button';
import BaseLink from '../../UI/BaseLink/BaseLink';
import { PATHS } from '../../../constants/routes';
import classes from './RegisterForm.module.css';

const RegisterForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const initialFormData: RegisterCredentials = {
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    agreeToTerms: false,
  };

  const handleSubmit = async () => {
    try {
      await dispatch(register(input)).unwrap();
      navigate(PATHS.profile, { replace: true });
    } catch (error) {
      console.error('Registration error:', error);
      alert('Ошибка регистрации: ' + (error as any)?.message || 'Неизвестная ошибка');
    }
  };

  const { input, errors, handleChange, submit } = useForm(
    initialFormData,
    handleSubmit,
    authFormValidator
  );

  return (
    <div className={classes.container}>
      <div className={classes.formWrapper}>
        <h2 className={classes.title}>Регистрация</h2>
        
        <Form onSubmit={submit}>
          <Input
            label="Имя"
            name="name"
            type="text"
            placeholder="Введите ваше имя"
            value={input.name}
            onChange={handleChange}
            errorText={errors.name}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Введите ваш email"
            value={input.email}
            onChange={handleChange}
            errorText={errors.email}
            required
          />

          <Input
            label="Телефон"
            name="phone"
            type="tel"
            placeholder="Введите ваш телефон"
            value={input.phone || ''}
            onChange={handleChange}
            errorText={errors.phone}
          />

          <Input
            label="Пароль"
            name="password"
            type="password"
            placeholder="Введите пароль"
            value={input.password}
            onChange={handleChange}
            errorText={errors.password}
            required
          />

          <Input
            label="Подтвердите пароль"
            name="confirmPassword"
            type="password"
            placeholder="Подтвердите пароль"
            value={input.confirmPassword}
            onChange={handleChange}
            errorText={errors.confirmPassword}
            required
          />

          <div className={classes.checkbox}>
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={input.agreeToTerms}
              onChange={handleChange}
              required
            />
            <label htmlFor="agreeToTerms">
              Я согласен с условиями использования
            </label>
          </div>

          <Button mode="primary" type="submit">
            Зарегистрироваться
          </Button>
        </Form>

        <div className={classes.footer}>
          <p className={classes.text}>
            Уже есть аккаунт?{' '}
            <BaseLink to={PATHS.login} className={classes.link}>
              Войти
            </BaseLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
