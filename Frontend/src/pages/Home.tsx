import React from 'react';
import { SearchForm } from '../components/SearchForm';
import { Compass, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Home: React.FC = () => {
  const featuredDestinations = [
    {
      id: 1,
      name: 'Hà Giang',
      tag: 'Kỳ quan Đá vôi & Cao nguyên mờ sương',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 102,
      name: 'Hội An',
      tag: 'Di sản Đèn lồng & Kiến trúc Thuộc địa',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 101,
      name: 'Phú Quốc',
      tag: 'Đại dương Tây cực & Hoàng hôn Đảo ngọc',
      image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 3,
      name: 'Đà Nẵng',
      tag: 'Cầu Rồng Di sản & Bãi biển Mỹ Khê',
      image: 'https://images.unsplash.com/photo-1559592443-7f87aae4f4ed?auto=format&fit=crop&w=600&q=80',
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Cinematic Hero Section */}
      <header className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Phong cảnh sương mù Hà Giang"
            className="w-full h-full object-cover object-center scale-105 animate-subtle-zoom"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXA9z5TK_uYkaobAHAdHalVqzNVWXVGZhjGa0pBjAe2sO4NfQE-Ex8vfc6OPYt6UvV_YIwzHeO0wE520ACR5YMc7-F7dO_b3OsjVZM54wTW_b7CArOBzxCwryXqrcGDRJy05uDBVIDCr7QgypTX8YnFEGF15ODb-DsqLrexR1QQ6ekzs6lWOXwQ6LYheZRfXe9G7Dl8CpYQ6RwL_mYNS57CfaIkdempRsaL-1UcqcTP_DEqr9KC0b9EGfY-5f_5uO5Qy6PzM6x8sw"
          />
          <div className="absolute inset-0 bg-black/45"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto mt-12">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-primary mb-6 leading-tight select-none">
            Khám phá Việt Nam <br className="hidden md:inline" /> Vượt ngoài lối mòn thông thường
          </h1>
          <p className="font-body-lg text-body-lg text-surface-container-low max-w-2xl mx-auto mb-16 leading-relaxed select-none">
            Bộ sưu tập phòng nghỉ boutique chọn lọc, trải nghiệm bản địa sâu sắc được thiết kế riêng cho những lữ khách tinh tế.
          </p>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-container-max px-margin-mobile md:px-margin-desktop z-20">
          <SearchForm />
        </div>
      </header>

      {/* Featured Destinations Showcase */}
      <section className="py-section-gap bg-background px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-label-md text-label-md text-secondary uppercase tracking-widest block mb-3">
            Những Điểm Đến Tinh Hoa
          </span>
          <h2 className="font-display-lg text-headline-lg text-primary mb-4 leading-snug">
            Khởi đầu cho hành trình di sản
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Từ cao nguyên đá Hà Giang mờ sương đến biển Phú Quốc rì rào sóng vỗ, mỗi vùng đất là một trang nhật ký du ký đầy chất thơ đang chờ lữ khách chắp bút.
          </p>
        </div>

        {/* Destination Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {featuredDestinations.map((dest) => (
            <div
              key={dest.id}
              className="group cursor-pointer overflow-hidden rounded-lg relative aspect-[3/4] limestone-shadow border border-outline-variant/20 hover:border-outline/40 transition-all duration-500"
              onClick={() => {
                // Nhấn vào điểm đến sẽ chuyển sang tìm kiếm khách sạn vùng đó
                window.location.href = `/stays?locationId=${dest.id}`;
              }}
            >
              <img
                alt={dest.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                src={dest.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-on-primary">
                <h3 className="font-display-lg text-headline-md font-semibold mb-1 group-hover:text-secondary-fixed transition-colors duration-300">
                  {dest.name}
                </h3>
                <p className="font-caption text-caption text-surface-container-low opacity-90 line-clamp-2">
                  {dest.tag}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Values / Philosophy */}
      <section className="py-20 bg-surface-container-low border-y border-surface-variant/30 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center p-6 bg-surface rounded-lg limestone-shadow">
            <div className="p-4 bg-tertiary-fixed/30 rounded-full mb-6 text-secondary">
              <Compass className="h-8 w-8" />
            </div>
            <h4 className="font-display-lg text-headline-md text-primary mb-3">Tuyển chọn Tỉ mỉ</h4>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Mỗi căn biệt thự, mỗi phòng khách sạn đều được chúng tôi kiểm định nghiêm ngặt về tính bản địa, kiến trúc di sản và dịch vụ độc bản.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-surface rounded-lg limestone-shadow">
            <div className="p-4 bg-tertiary-fixed/30 rounded-full mb-6 text-secondary">
              <HeartHandshake className="h-8 w-8" />
            </div>
            <h4 className="font-display-lg text-headline-md text-primary mb-3">Tâm hồn Bản địa</h4>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Chúng tôi kết nối lữ khách với những nghệ nhân bản địa, đưa bạn chạm vào văn hóa sâu sắc thay vì chỉ lướt qua bề nổi của điểm đến.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-surface rounded-lg limestone-shadow">
            <div className="p-4 bg-tertiary-fixed/30 rounded-full mb-6 text-secondary">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h4 className="font-display-lg text-headline-md text-primary mb-3">Đặc quyền Thượng lưu</h4>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Hỗ trợ cá nhân hóa lịch trình 24/7, quyền lợi nhận phòng sớm, trả phòng muộn và xe đưa đón riêng tư sang trọng suốt chuyến đi.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
