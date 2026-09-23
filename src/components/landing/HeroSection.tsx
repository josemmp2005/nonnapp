import React from 'react';
import { Heart } from 'lucide-react';
import heroBgPc from '../../assets/hero-background-pc.webp';
import heroBgMobile from '../../assets/hero-background-mobile.webp';
import SearchBar from './SearchBar';

// Retraso de entrada (ms) que leen las clases .hero-in/.hero-pop/... de index.css.
const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;

// Tres composiciones con la misma ilustración de fondo:
// - Móvil (< md): apilado. El texto va en flujo normal, con aire (no metido en
//   el hueco de la imagen vertical), y debajo la Nonna, recortada a la parte
//   inferior de la imagen y difuminada por los bordes para empalmar con el
//   fondo crema.
// - Tablet (md-lg): imagen apaisada de fondo con altura fija y texto encima.
// - Escritorio (lg+): el hero conserva la proporción de la imagen (sin
//   recortarla, salvo en pantallas ultra anchas) y el texto se coloca en % de
//   la propia ilustración, así que el hueco del texto y la Nonna nunca se
//   pisan sea cual sea el ancho — con altura fija + object-cover cada ancho
//   recortaba distinto y los chips acababan encima de los tomates.
// Todo va dentro de un envoltorio centrado de 2200px como máximo (los tamaños
// fluidos en vw tienen su tope justo a ese ancho): en pantallas 4K la
// composición no crece sin fin, se queda centrada y sus bordes se difuminan
// hacia el fondo crema (.hero-pc-fade) en lugar de dejar un hueco en blanco.
// Sin versión oscura: la sección se queda con look claro fijo aunque el resto
// de la app esté en modo oscuro (mismo criterio que la tarjeta "La Mamma" en
// precios), para no acabar con texto claro sobre un fondo que sigue siendo crema.
const HeroSection: React.FC = () => (
  <section className="relative overflow-hidden bg-cream">
    <div className="relative mx-auto w-full max-w-[2200px]">
      <div className="hero-pc-fade hidden md:block h-[520px] lg:h-auto lg:aspect-[1672/941]">
        <img
          src={heroBgPc}
          alt=""
          aria-hidden="true"
          width={1672}
          height={941}
          className="hero-fade w-full h-full object-cover object-[80%_34%] lg:object-center"
        />
      </div>

      <div className="relative z-10 px-6 pt-10 pb-2 sm:pt-14 md:absolute md:inset-0 md:flex md:items-center md:p-0">
        <div className="max-w-md mx-auto md:mx-0 md:ml-6 md:w-[44%] md:max-w-none lg:ml-[8%] lg:w-[42%] text-left">
          <span
            style={delay(0)}
            className="hero-in block font-hand text-[22px] md:text-[clamp(1.35rem,2vw,2.75rem)] text-ink/80 mb-2"
          >
            Tu cocina, un poco más fácil
          </span>

          <h1 className="font-display font-bold text-[40px] sm:text-5xl md:text-[clamp(2.75rem,5.6vw,7.7rem)] leading-[1.05] md:leading-[1.02] tracking-tight text-ink mb-5 md:mb-6">
            <span style={delay(100)} className="hero-in block">
              Recetas que{' '}
            </span>
            <span style={delay(220)} className="hero-in block">
              saben a{' '}
              <span style={delay(560)} className="hero-pop inline-block text-primary">
                casa.
              </span>
            </span>
          </h1>

          <p
            style={delay(360)}
            className="hero-in text-[15px] sm:text-base md:text-[clamp(1rem,1.3vw,1.8rem)] font-medium leading-7 md:leading-relaxed text-body mb-7 md:mb-8 max-w-[34rem]"
          >
            Encuentra recetas, aprovecha lo que tienes en la nevera y pregunta a Nonna cuando necesites ayuda.
          </p>

          <SearchBar animateIn baseDelay={480} className="max-w-[37rem]" />
        </div>
      </div>

      <div className="hero-mobile-mask md:hidden relative mx-auto w-full max-w-[520px] aspect-[941/1084] mt-2">
        <img
          src={heroBgMobile}
          alt=""
          aria-hidden="true"
          width={941}
          height={1672}
          className="hero-fade w-full h-full object-cover object-bottom"
        />
      </div>

      <div aria-hidden="true" className="hidden lg:block pointer-events-none absolute inset-0">
        <div
          style={delay(950)}
          className="hero-fade absolute top-[11%] right-[12%] w-[11%] -rotate-6 font-hand text-[clamp(1rem,1.5vw,2.05rem)] leading-tight text-ink/85"
        >
          Cocinar siempre sabe mejor en buena compañía{' '}
          <Heart className="inline w-[0.9em] h-[0.9em] text-primary" />
        </div>
        <svg
          className="absolute top-[30%] right-[14.5%] w-[3.4%] min-w-[34px] text-primary"
          viewBox="0 0 60 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path pathLength={100} style={delay(1250)} className="hero-draw" d="M52 6C46 26 32 40 10 46" />
          <path pathLength={100} style={delay(1750)} className="hero-draw" d="M10 46l11-2M10 46l6-9" />
        </svg>
        <ul className="absolute top-[34%] right-[2.2%] font-hand text-[clamp(1rem,1.45vw,2rem)] leading-snug text-ink/80">
          <li style={delay(1050)} className="hero-in">Recetas</li>
          <li style={delay(1140)} className="hero-in pl-2">Ideas</li>
          <li style={delay(1230)} className="hero-in">Consejos</li>
          <li style={delay(1320)} className="hero-in pl-1">Y mucho más</li>
        </ul>
      </div>
    </div>
  </section>
);

export default HeroSection;
