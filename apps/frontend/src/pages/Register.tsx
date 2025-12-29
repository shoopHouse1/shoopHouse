import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { registerSchema } from '@shoophouse/shared';
import { UserRole } from '@shoophouse/shared';
import { useTranslation } from 'react-i18next';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: UserRole.BUYER,
    },
  });

  const selectedRole = watch('role');

  const registerMutation = useMutation({
    mutationFn: (data: any) => api.post('/auth/register', data),
    onSuccess: () => {
      navigate('/auth/login');
    },
  });

  const onSubmit = (data: any) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t('auth.register')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-2">{t('auth.name')}</label>
              <Input
                {...register('name')}
                placeholder={t('auth.name')}
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1">
                  {errors.name.message as string}
                </p>
              )}
            </div>
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
            <div>
              <label className="block mb-2">نوع الحساب / Account Type</label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setValue('role', value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الحساب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.BUYER}>
                    مشتري / Buyer
                  </SelectItem>
                  <SelectItem value={UserRole.SELLER}>
                    بائع / Seller
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-destructive text-sm mt-1">
                  {errors.role.message as string}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Loading...' : t('auth.register')}
            </Button>
            {registerMutation.isError && (
              <p className="text-destructive text-sm text-center">
                Registration failed
              </p>
            )}
            <p className="text-center text-sm">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/auth/login" className="text-primary">
                {t('auth.login')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

