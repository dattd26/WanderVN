import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const passengerSchema = z.object({
  fullName: z.string().min(3, 'Họ tên là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  phoneNumber: z.string().min(9, 'Số điện thoại là bắt buộc'),
  passportNumber: z.string().min(3, 'Số hộ chiếu là bắt buộc')
});

export type PassengerFormValues = z.infer<typeof passengerSchema>;

interface PassengerFormProps {
  formId: string;
  onSubmit: (values: PassengerFormValues) => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string | null;
}

export const PassengerForm: React.FC<PassengerFormProps> = ({ formId, onSubmit, isSubmitting, errorMessage }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PassengerFormValues>({
    resolver: zodResolver(passengerSchema),
    mode: 'onTouched',
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      passportNumber: ''
    }
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="rounded-[32px] border border-outline-variant/20 bg-surface shadow-2xl shadow-black/5 p-8 space-y-6">
      <fieldset disabled={isSubmitting} className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Thông tin hành khách</p>
            <h2 className="font-display-md text-headline-md text-primary mt-3">Điền thông tin cơ bản</h2>
          </div>
          <span className="rounded-full bg-gold-300/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-gold-200">Premium</span>
        </div>

      {errorMessage && (
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface">Họ và tên</label>
          <input
            {...register('fullName')}
            placeholder="Nguyễn Văn A"
            className="w-full rounded-3xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          {errors.fullName && <p className="text-rose-300 text-xs mt-1">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="example@gmail.com"
            className="w-full rounded-3xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          {errors.email && <p className="text-rose-300 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface">Số điện thoại</label>
          <input
            {...register('phoneNumber')}
            type="tel"
            placeholder="0987123456"
            className="w-full rounded-3xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          {errors.phoneNumber && <p className="text-rose-300 text-xs mt-1">{errors.phoneNumber.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface">Số hộ chiếu</label>
          <input
            {...register('passportNumber')}
            placeholder="B1234567"
            className="w-full rounded-3xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          {errors.passportNumber && <p className="text-rose-300 text-xs mt-1">{errors.passportNumber.message}</p>}
        </div>
      </div>

      <div className="rounded-3xl border border-outline-variant/15 bg-black/5 p-5 text-sm text-on-surface-variant">
        <p className="font-semibold text-on-surface">Lưu ý</p>
        <p className="mt-2">Những trường đánh dấu là bắt buộc. Chúng tôi sẽ dùng thông tin này để gửi yêu cầu đặt vé và xác thực với Duffel.</p>
      </div>
      </fieldset>
    </form>
  );
};
