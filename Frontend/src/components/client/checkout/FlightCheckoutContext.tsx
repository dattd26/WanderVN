/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import type { FlightOfferDto, PassengerDto } from '../../../types';
import type { PaymentMethod } from './PaymentSelector';

export interface CheckoutPassenger extends PassengerDto {
  type: 'adult' | 'child' | 'infant';
  seatPreference: string;
  mealPreference: string;
}

interface FlightCheckoutContextType {
  offer: FlightOfferDto | null;
  contactForm: { email: string; phone: string };
  setContactForm: React.Dispatch<React.SetStateAction<{ email: string; phone: string }>>;
  passengersList: CheckoutPassenger[];
  updatePassenger: (index: number, updatedFields: Partial<CheckoutPassenger>) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  bookingLoading: boolean;
  setBookingLoading: (loading: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
  isExpired: boolean;
  setIsExpired: (expired: boolean) => void;
  savePassengersToLocalStorage: () => void;
  copyContactToFirstPassenger: () => void;
}

const FlightCheckoutContext = createContext<FlightCheckoutContextType | undefined>(undefined);

export const useFlightCheckout = () => {
  const context = useContext(FlightCheckoutContext);
  if (!context) {
    throw new Error('useFlightCheckout must be used within a FlightCheckoutProvider');
  }
  return context;
};

interface ProviderProps {
  children: React.ReactNode;
  initialOffer: FlightOfferDto | null;
  passengerCounts: { adults: number; children: number; infants: number };
}

export const FlightCheckoutProvider: React.FC<ProviderProps> = ({
  children,
  initialOffer,
  passengerCounts,
}) => {
  const [offer] = useState<FlightOfferDto | null>(initialOffer);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vnpay');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const storedUserStr = localStorage.getItem('user');
  const storedUser = storedUserStr ? JSON.parse(storedUserStr) : {};

  const [contactForm, setContactForm] = useState({
    email: storedUser.email || localStorage.getItem('email') || '',
    phone: storedUser.phone || storedUser.phoneNumber || localStorage.getItem('phone') || '',
  });

  // Khởi tạo danh sách hành khách dựa trên passengerCounts
  const [passengersList, setPassengersList] = useState<CheckoutPassenger[]>(() => {
    const list: CheckoutPassenger[] = [];
    const basePassengerId = initialOffer?.duffelAirwaysPassengerId || initialOffer?.passengerId || 'pas_default';

    // Helper tạo passenger trắng
    const createEmptyPassenger = (type: 'adult' | 'child' | 'infant', index: number): CheckoutPassenger => {
      // Nếu là người lớn đầu tiên và có thông tin đăng nhập, tự điền nhanh
      const isFirstAdult = type === 'adult' && index === 0;
      return {
        id: index === 0 ? basePassengerId : `${basePassengerId}_${type}_${index}`,
        title: type === 'adult' ? 'mr' : type === 'child' ? 'mr' : 'mr', // danh xưng mặc định
        familyName: isFirstAdult ? (storedUser.lastName || '').toUpperCase() : '',
        givenName: isFirstAdult ? (storedUser.firstName || '').toUpperCase() : '',
        bornOn: '',
        email: isFirstAdult ? (storedUser.email || '') : '',
        phoneNumber: isFirstAdult ? (storedUser.phone || storedUser.phoneNumber || '') : '',
        gender: 'm',
        passportNumber: '',
        type,
        seatPreference: 'Tiêu chuẩn (Hãng quyết định)',
        mealPreference: 'Mặc định',
      };
    };

    // Tạo hành khách người lớn
    for (let i = 0; i < passengerCounts.adults; i++) {
      list.push(createEmptyPassenger('adult', i));
    }
    // Tạo hành khách trẻ em
    for (let i = 0; i < passengerCounts.children; i++) {
      list.push(createEmptyPassenger('child', i));
    }
    // Tạo hành khách em bé
    for (let i = 0; i < passengerCounts.infants; i++) {
      list.push(createEmptyPassenger('infant', i));
    }

    // Nếu không có counts nào được chọn (VD: URL trực tiếp), mặc định tạo 1 adult
    if (list.length === 0) {
      list.push(createEmptyPassenger('adult', 0));
    }

    return list;
  });

  const updatePassenger = (index: number, updatedFields: Partial<CheckoutPassenger>) => {
    setPassengersList((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, ...updatedFields } : p))
    );
  };

  const copyContactToFirstPassenger = () => {
    const firstAdultIdx = passengersList.findIndex((p) => p.type === 'adult');
    if (firstAdultIdx !== -1) {
      updatePassenger(firstAdultIdx, {
        email: contactForm.email,
        phoneNumber: contactForm.phone,
      });
    }
  };

  const savePassengersToLocalStorage = () => {
    try {
      const currentSaved = localStorage.getItem('saved_passengers');
      let savedList: CheckoutPassenger[] = currentSaved ? JSON.parse(currentSaved) : [];

      passengersList.forEach((pax) => {
        if (!pax.familyName || !pax.givenName) return;
        // Tránh trùng lặp theo Họ và Tên
        const index = savedList.findIndex(
          (s) =>
            s.familyName.toUpperCase() === pax.familyName.toUpperCase() &&
            s.givenName.toUpperCase() === pax.givenName.toUpperCase()
        );
        const paxToSave = { ...pax, id: '' }; // Không lưu ID tạm thời
        if (index !== -1) {
          savedList[index] = paxToSave;
        } else {
          savedList.push(paxToSave);
        }
      });

      // Chỉ lưu tối đa 10 người gần nhất
      if (savedList.length > 10) {
        savedList = savedList.slice(savedList.length - 10);
      }

      localStorage.setItem('saved_passengers', JSON.stringify(savedList));
    } catch (e) {
      console.error('Không thể lưu danh sách hành khách vào LocalStorage', e);
    }
  };

  return (
    <FlightCheckoutContext.Provider
      value={{
        offer,
        contactForm,
        setContactForm,
        passengersList,
        updatePassenger,
        paymentMethod,
        setPaymentMethod,
        bookingLoading,
        setBookingLoading,
        errorMessage,
        setErrorMessage,
        isExpired,
        setIsExpired,
        savePassengersToLocalStorage,
        copyContactToFirstPassenger,
      }}
    >
      {children}
    </FlightCheckoutContext.Provider>
  );
};
