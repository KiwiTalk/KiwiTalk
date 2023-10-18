/* TODO: this file using deprecated login page. need to refactoring */

import { AppLoginContent } from '@/app/login/content';
import { useLocation, useNavigate } from '@solidjs/router';

export const LoginPage = () => {
  const location = useLocation<{ error?: string}>();
  const navigate = useNavigate();

  return (
    <AppLoginContent
      errorMessage={location.state?.error}
      onLogin={() => {
        navigate('/main/');
      }}
    />
  );
};
