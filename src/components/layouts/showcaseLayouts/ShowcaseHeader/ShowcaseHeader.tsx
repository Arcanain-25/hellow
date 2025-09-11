import { useState } from "react";
import Badge from '../../../UI/Badge/Badge';
import CartIcon from '../../../UI/icons/CartIcon/CartIcon';
import FavoriteIcon from '../../../UI/icons/FavoriteIcon/FavoriteIcon';
import classes from './ShowcaseHeader.module.css';
import Logo from '../../../../assets/logo.png';
import { PATHS } from '../../../../constants/routes';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import Menu from '../../../showcase/Menu/Menu';
import { Link, useNavigate } from 'react-router-dom';

const ShowcaseHeader: React.FC = () => {
  const categories = useSelector((state: RootState) => state.category.categories);
  const { wishlist, cart } = useSelector((state: RootState) => state.user);
  const totalProductsQuantityInCart = cart.reduce((res, val) => res + val.quantity, 0);

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");

  const ADMIN_PASSWORD = "77777"; // простой пароль, можно заменить

  const handleAdminClick = () => {
    setIsModalOpen(true);
    setInputPassword("");
    setError("");
  };

  const handlePasswordSubmit = () => {
    if (inputPassword === ADMIN_PASSWORD) {
      setIsModalOpen(false);
      navigate(`${PATHS.admin}${PATHS.orders}`);
    } else {
      setError("Неверный пароль");
    }
  };

  return (
    <header className={classes.header}>
      <div className={classes['admin-link-wrapper']}>
        <button className={classes.link} onClick={handleAdminClick}>
          Перейти в админку
        </button>
      </div>

      <div className={classes['wrapper']}>
        <Link to={PATHS.showcase}>
          <img src={Logo} alt="Logo" className={classes.logo} />
        </Link>

        <div className={classes['actions-wrapper']}>
          <Menu categories={categories} />

          <div className={classes['badge-wrapper']}>
            <Badge
              icon={<FavoriteIcon width={24} height={24} />}
              to={PATHS.wishlist}
              count={wishlist?.length}
              title={'Избранное'}
            />
            <Badge
              icon={<CartIcon width={24} height={24} />}
              to={PATHS.cart}
              count={totalProductsQuantityInCart}
              title={'Корзина'}
            />
          </div>
        </div>
      </div>

      {/* Модальное окно для пароля */}
      {isModalOpen && (
        <div className={classes.modal}>
          <div className={classes.modalContent}>
            <h3>Введите пароль администратора</h3>
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
            />
            <button onClick={handlePasswordSubmit}>Войти</button>
            {error && <p style={{color: "red"}}>{error}</p>}
            <button onClick={() => setIsModalOpen(false)}>Отмена</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default ShowcaseHeader;

