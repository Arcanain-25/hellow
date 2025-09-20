import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import SidebarItem from './SidebarItem/SidebarItem';
import ProductIcon from '../../../UI/icons/ProductIcon/ProductIcon';
import SettingsIcon from '../../../UI/icons/SettingsIcon/SettingsIcon';

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>Admin Panel</h2>
      </div>
      <nav className={styles.nav}>
        <ul>
          <SidebarItem 
            isOpen={true}
            title="Товары"
            link="/admin/products"
            icon={<ProductIcon />}
          />
          <SidebarItem 
            isOpen={true}
            title="Настройки"
            link="/admin/settings"
            icon={<SettingsIcon />}
          />
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
