
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { loginSchema } from '@shoophouse/shared';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (data: any) => api.post('/auth/login', data),
    onSuccess: (data: any) => {
      setAuth(data.user, data.accessToken);
      navigate('/');
    },
  });

  const onSubmit = (data: any) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t('auth.login')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-2">{t('auth.email')}</label>
              <Input
                type="email"
                {...register('email')}
                placeholder={t('auth.email')}
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">
                  {errors.email.message as string}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-2">{t('auth.password')}</label>
              <Input
                type="password"
                {...register('password')}
                placeholder={t('auth.password')}
              />
              {errors.password && (
                <p className="text-destructive text-sm mt-1">
                  {errors.password.message as string}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Loading...' : t('auth.login')}
            </Button>
            {loginMutation.isError && (
              <p className="text-destructive text-sm text-center">
                Invalid credentials
              </p>
            )}
            <p className="text-center text-sm">
              {t('auth.dontHaveAccount')}{' '}
              <Link to="/auth/register" className="text-primary">
                {t('auth.register')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


