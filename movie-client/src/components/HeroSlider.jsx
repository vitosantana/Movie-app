
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function HeroSlider({ items = [] }) {
  const slides = items.filter(m => m?.backdrop_path);
  if (!slides.length) return null;

  return (
    <div className="hero">
      <Swiper modules={[Pagination]} slidesPerView={1} pagination={{ clickable: true }}>
        {slides.map(m => (
          <SwiperSlide key={m.id}>
            <img
              src={`https://image.tmdb.org/t/p/w1280${m.backdrop_path}`}
              alt={m.title || m.name}
              style={{ width: "100%", display: "block", borderRadius: 14 }}
              loading="lazy"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

