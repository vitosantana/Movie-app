import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./hero.css";

export default function HeroSlider({ items = [] }) { /* The = [] is a default so if the parent doesn’t pass items, items will be an empty array and also prevents runtime errors */
  const slides = (items || []).filter(m => !!m?.backdrop_path);
  if (!slides.length) return null;

  // helper to truncate long text
  const truncate = (text = "", n = 160) =>
    text.length > n ? text.slice(0, n - 1).trim() + "…" : text;

  return (
    <div className="hero-slider" role="region" aria-label="Featured movies">
      <Swiper
        modules={[Pagination, Autoplay]}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        style={{ height: "100%" }}
      >
        {slides.map(m => (
          <SwiperSlide key={m.id}>
            <div className="hero-slide">
              <img
                className="hero-img"
                src={`https://image.tmdb.org/t/p/original${m.backdrop_path}`}
                alt={m.title || m.name}
                loading="lazy"
              />

              {/* Overlay container  */}
              <div className="hero-overlay" aria-hidden="false">
                <div className="hero-inner">
                  <h2 className="hero-title">{m.title || m.name}</h2>
                  {m.overview ? (
                    <p className="hero-desc">{truncate(m.overview, 180)}</p>
                  ) : null}

                  <div className="hero-actions">
                    <button
                      className="btn btn-play"
                      onClick={() => {
                        // integrate play action: navigate to /movie/:id or open player
                        window.location.href = `/movie/${m.id}`; // replace with router navigation
                      }}
                      aria-label={`Play ${m.title || m.name}`}
                    >
                      ▶ Play
                    </button>

                    <button
                      className="btn btn-info"
                      onClick={() => {
                        // Navigates to details page
                        window.location.href = `/movie/${m.id}`; // example
                      }}
                      aria-label={`More information about ${m.title || m.name}`}
                    >
                      ℹ More Info
                    </button>
                  </div>
                </div>
              </div>

              {/* subtle left gradient to improve text contrast */}
              <div className="hero-gradient" aria-hidden="true" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
