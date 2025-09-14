import classes from './Form.module.css';

interface IFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

const Form: React.FC<IFormProps> = ({ children, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} noValidate className={classes.form}>
      {children}
    </form>
  );
};

export default Form;
