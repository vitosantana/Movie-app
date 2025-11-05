import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function HeroSlider({ items = [] }) {
  // Movies that only have box art
  const slides = useMemo(() => items.filter(m => !!m?.backdrop_path), [items]);
  if (!slides.length) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <Swiper
        modules={[Pagination]}
        slidesPerView={1}
        pagination={{ clickable: true }}
        allowTouchMove
        style={{
          width: "100%",
          maxWidth: "1400px, 96vw",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        {slides.map((m, i) => (
          <SwiperSlide key={m.id}>
            <div
              style={{
                width: "100%",
                height: "420px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                borderRadius: 8,
                position: "relative",
                background: "#111",
              }}
            >
              <img
                src={`https://image.tmdb.org/t/p/w1280${m.backdrop_path}`}
                alt={m.title}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 1,
                  filter: "none",
                  mixBlendMode: "normal",
                }}
                onLoad={(e) => console.log("HERO loaded:", e.currentTarget.src)}
                onError={(e) => console.warn("HERO failed:", e.currentTarget.src)}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,.65), rgba(0,0,0,0) 60%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 24,
                  right: 24,
                  bottom: 24,
                  color: "white",
                  textShadow: "0 2px 8px rgba(0,0,0,.7)",
                  maxWidth: 900,
                  zIndex: 2,
                }}
              >
                <h2 style={{ margin: 0 }}>{m.title}</h2>
                {m.overview && (
                  <p
                    style={{
                      marginTop: 8,
                      opacity: 0.9,
                      maxHeight: 90,
                      overflow: "hidden",
                    }}
                  >
                    {m.overview}
                  </p>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* keep Swiper layers neutral/transparent */}
      <style>{`
        .swiper, .swiper-wrapper, .swiper-slide {
          background: transparent !important;
        }
        .swiper {
          max-width: 1280px;
          margin: 0 auto;
          overflow: hidden;
        }
        .swiper-pagination {
          position: relative !important;
          bottom: 0 !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          z-index: 9999 !important;
        }
      `}</style>
    </div>
  );
}

