import React from 'react';
import { Users } from 'lucide-react';
import { useFlightCheckout } from './FlightCheckoutContext';
import { PassengerCard } from './PassengerCard';

export const PassengerListSection: React.FC = () => {
  const { passengersList } = useFlightCheckout();

  const getSummaryText = () => {
    const adults = passengersList.filter((p) => p.type === 'adult').length;
    const children = passengersList.filter((p) => p.type === 'child').length;
    const infants = passengersList.filter((p) => p.type === 'infant').length;

    const parts = [];
    if (adults > 0) parts.push(`${adults} Người lớn`);
    if (children > 0) parts.push(`${children} Trẻ em`);
    if (infants > 0) parts.push(`${infants} Em bé`);

    return parts.join(', ');
  };

  return (
    <section className="border border-outline-variant/30 rounded-lg bg-surface-container-lowest overflow-hidden">
      {/* Tiêu đề mục */}
      <div className="px-6 py-5 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-outline tabular-nums">02</span>
          <h2 className="text-base font-semibold text-primary tracking-tight">
            Thông Tin Hành Khách
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/15">
          <Users className="h-3.5 w-3.5" />
          <span>{getSummaryText()}</span>
        </div>
      </div>

      {/* Danh sách các thẻ nhập liệu hành khách */}
      <div className="p-6 space-y-6">
        {passengersList.map((passenger, index) => (
          <PassengerCard
            key={passenger.id || index}
            index={index}
            passenger={passenger}
          />
        ))}
      </div>
    </section>
  );
};
