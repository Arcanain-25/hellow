import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppDispatch } from '../../../store/store';
import { login } from '../../../store/UserSlice';
import { LoginCredentials } from '../../../types/common';
import { authFormValidator } from '../../../utils/validators';
import useForm from '../../../hooks/useForm';
import Form from '../../UI/Form/Form';
import Input from '../../UI/Input/Input';
import Button from '../../UI/Button/Button';
import BaseLink from '../../UI/BaseLink/BaseLink';
import { PATHS } from '../../../constants/routes';
import classes from './LoginForm.module.css';

const LoginForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const initialFormData: LoginCredentials = {
    email: '',
    password: '',
  };

  const handleSubmit = async () => {
    try {
      await dispatch(login(input)).unwrap();
      const from = (location.state as any)?.from?.pathname || PATHS.profile;
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      alert('Ошибка входа: ' + (error as any)?.message || 'Неверный email или пароль');
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
        <h2 className={classes.title}>Вход в систему</h2>
        
        <Form onSubmit={submit}>
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
            label="Пароль"
            name="password"
            type="password"
            placeholder="Введите ваш пароль"
            value={input.password}
            onChange={handleChange}
            errorText={errors.password}
            required
          />

          <Button mode="primary" type="submit">
            Войти
          </Button>
        </Form>

        <div className={classes.footer}>
          <p className={classes.text}>
            Нет аккаунта?{' '}
            <BaseLink to={PATHS.register} className={classes.link}>
              Зарегистрироваться
            </BaseLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
