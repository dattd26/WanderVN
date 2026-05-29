import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Leaf, Waves, Landmark, Mountain, Users, Heart, ArrowLeft, type LucideIcon } from 'lucide-react';

import HotelCard from '../../components/client/HotelCard';
import { homeService, type TravelMoodDetailResponse } from '../../services/client/homeService';

const iconMap: Record<string, LucideIcon> = {
  Leaf,
  Waves,
  Landmark,
  Mountain,
  Users,
  Heart
};

const MoodCollection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<TravelMoodDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setIsLoading(true);
        const response = await homeService.getTravelMoodById(id as string);
        setData(response);
      } catch (error) {
        console.error('Error fetching mood collection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCollection();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-container-max mx-auto animate-pulse">
          <div className="h-64 md:h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-12"></div>
          <div className="flex flex-col gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[250px] bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.mood) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy bộ sưu tập</h2>
        <button
          onClick={() => navigate('/')}
          className="text-primary hover:text-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Trở về trang chủ
        </button>
      </div>
    );
  }

  const { mood, hotels } = data;
  const Icon = iconMap[mood.iconName] || Leaf;

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Banner */}
      <div className="relative w-full h-[40vh] md:h-[50vh] min-h-[300px]">
        <img
          src={mood.imageUrl}
          alt={mood.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4">
          <Icon className="w-12 h-12 text-white mb-4 opacity-90" strokeWidth={1.5} />
          <h1 className="font-display-lg text-4xl md:text-5xl lg:text-6xl text-white font-medium mb-4 drop-shadow-md">
            {mood.title}
          </h1>
          <p className="text-white/90 max-w-2xl text-lg md:text-xl drop-shadow">
            {mood.description}
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 md:top-8 md:left-8 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition-all"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Grid Danh sách khách sạn */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display-md text-2xl md:text-3xl font-medium text-on-surface mb-2">
            Được tuyển chọn cho bạn
          </h2>
          <p className="text-on-surface-variant text-base">
            Khám phá {hotels.length} địa điểm lưu trú mang tinh thần {mood.title.toLowerCase()}
          </p>
        </div>

        {hotels.length > 0 ? (
          <div className="flex flex-col gap-6 md:gap-8">
            {hotels.map(hotel => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-on-surface-variant bg-surface-container-low rounded-2xl">
            <Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Bộ sưu tập này đang được cập nhật thêm các địa điểm tuyệt vời.</p>
            <p className="mt-2 text-sm opacity-80">Vui lòng quay lại sau nhé.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodCollection;
