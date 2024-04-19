import { authData } from '../../db/auth';

interface LoginProps {
  authData: () => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ authData: LoginProps }) => {
  return (
    <div>
      <h1>Login</h1>
      <button onClick={authData}>Login</button>
    </div>
  );
};

export default Login;
