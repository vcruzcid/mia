import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TurnstileWidget } from './TurnstileWidget';
import { apiService, getErrorMessage } from '../services/apiService';
import type { RegistrationRequest, RegistrationResponse } from '../types/api';
import type { MembershipType } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';

// Form validation schema
const registrationSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos'),
  acceptNewsletter: z.boolean(),
  gdprAccepted: z.boolean().refine(val => val === true, 'Debes aceptar el tratamiento de datos'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormWithAPIProps {
  selectedMembership: MembershipType;
  discountCode?: string;
  onSuccess: (data: RegistrationResponse) => void;
  onCancel: () => void;
}

export function RegistrationFormWithAPI({ 
  selectedMembership, 
  discountCode, 
  onSuccess, 
  onCancel 
}: RegistrationFormWithAPIProps) {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      acceptTerms: false,
      acceptNewsletter: false,
      gdprAccepted: false,
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    if (!turnstileToken) {
      setSubmitError('Por favor, completa la verificación de seguridad');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const registrationData: RegistrationRequest = {
        ...data,
        membershipType: selectedMembership.id,
        turnstileToken,
        discountCode: discountCode || '',
      };

      const result = await apiService.register(registrationData);
      onSuccess(result);
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token);
    setSubmitError(null);
  };

  const handleTurnstileError = () => {
    setTurnstileToken(null);
    setSubmitError('Error en la verificación de seguridad. Por favor, inténtalo de nuevo.');
  };

  const handleTurnstileExpire = () => {
    setTurnstileToken(null);
    setSubmitError('La verificación de seguridad ha expirado. Por favor, inténtalo de nuevo.');
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl text-white">
          Registro para {selectedMembership.name}
        </CardTitle>
        <CardDescription className="text-gray-300">
          Completa tus datos para proceder con el registro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Nombre *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Tu nombre"
                        className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Apellidos *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Tus apellidos"
                        className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email"
                      placeholder="tu@email.com"
                      className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Teléfono (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="tel"
                      placeholder="+34 666 777 888"
                      className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-gray-300">
                        Acepto los{' '}
                        <a href="/terminos-condiciones" className="text-red-400 hover:text-red-300 underline" target="_blank">
                          términos y condiciones
                        </a>{' '}
                        de la membresía
                      </FormLabel>
                      <FormMessage className="text-red-400" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gdprAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-gray-300">
                        Acepto el tratamiento de mis datos personales según la{' '}
                        <a href="/politica-privacidad" className="text-red-400 hover:text-red-300 underline" target="_blank">
                          política de privacidad
                        </a>
                      </FormLabel>
                      <FormMessage className="text-red-400" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptNewsletter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-gray-300">
                        Quiero recibir newsletters y comunicaciones sobre eventos y oportunidades de MIA
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Turnstile CAPTCHA */}
            <div className="space-y-2">
              <Label className="text-gray-300">Verificación de seguridad *</Label>
              <TurnstileWidget
                onSuccess={handleTurnstileSuccess}
                onError={handleTurnstileError}
                onExpire={handleTurnstileExpire}
              />
            </div>

            {/* Error Display */}
            {submitError && (
              <div className="p-4 rounded-lg border flex items-start gap-3 bg-red-900/10 border-red-400/30 text-red-400">
                <span>{submitError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !turnstileToken}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? 'Procesando...' : 'Continuar al Pago'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}