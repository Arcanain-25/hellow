import { Link } from 'react-router-dom';
import classes from './BaseLink.module.css';

interface IBaseLinkProps {
  children: string;
  to: string;
  button?: boolean;
  size?: 's' | 'm';
  className?: string;
}
const BaseLink: React.FC<IBaseLinkProps> = ({ children, to, button, size = 'm', className }) => {
  return (
    <Link to={to} className={`${classes.link} ${button && classes.button} ${classes[size]} ${className || ''}`}>
      {children}
    </Link>
  );
};

export default BaseLink;
