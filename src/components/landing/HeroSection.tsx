/**
 * Cabecera de la landing: titular, buscador y foto de fondo (claro/oscuro, con
 * difuminado en pantallas anchas), con movimiento por capas, hojas cayendo y
 * notas de la Nonna.
 */

import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Leaf, Sparkle } from 'lucide-react';
import heroBgPc from '../../assets/hero-background-pc.webp';
import heroBgPcDark from '../../assets/hero-background-pc-dark.webp';
import heroBgMobile from '../../assets/hero-background-mobile.webp';
import heroBgMobileDark from '../../assets/hero-background-mobile-dark.webp';
import { useHeroMotion } from '../../hooks/useHeroMotion';
import { useTheme } from '../../context/ThemeContext';
import InstallAppButton from '../InstallAppButton';
import SearchBar from './SearchBar';

// Retraso de entrada (ms) que leen las clases .hero-in/.hero-pop/... de index.css.
const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;
// Retraso y duración (s) de las hojas que caen y los destellos.
const cycle = (ms: number, seconds: number) => ({ '--d': `${ms}ms`, '--dur': `${seconds}s` }) as React.CSSProperties;

// Posiciones en % de la propia ilustración (por eso solo valen donde la imagen
// no se recorta: escritorio y móvil, no tablet).
const LEAVES_DESKTOP = [
  { left: '58%', top: '9%', size: 28, ms: 0, s: 12 },
  { left: '89%', top: '22%', size: 22, ms: 3500, s: 14 },
  { left: '63%', top: '52%', size: 24, ms: 6500, s: 13 },
  { left: '50%', top: '30%', size: 20, ms: 9000, s: 15 },
];
const LEAVES_MOBILE = [
  { left: '14%', top: '16%', size: 22, ms: 0, s: 12 },
  { left: '84%', top: '10%', size: 26, ms: 4000, s: 14 },
];

// Hojitas que caen despacio y un destello junto al ojo del guiño: la imagen es
// una sola pieza plana, así que la vida viene de estos elementos encima.
const Drifters: React.FC<{ leaves: typeof LEAVES_DESKTOP; sparkle: { left: string; top: string }; twin: { left: string; top: string } }> = ({
  leaves,
  sparkle,
  twin,
}) => (
  <>
    {leaves.map((leaf) => (
      <span key={leaf.left + leaf.top} className="hero-depth-3 absolute text-accent" style={{ left: leaf.left, top: leaf.top, width: leaf.size, height: leaf.size }}>
        <span className="hero-drift block w-full h-full" style={cycle(leaf.ms, leaf.s)}>
          <Leaf className="w-full h-full" fill="currentColor" fillOpacity={0.3} />
        </span>
      </span>
    ))}
    <span className="absolute text-primary" style={{ left: `calc(${sparkle.left} - 13px)`, top: `calc(${sparkle.top} - 13px)`, width: 26, height: 26 }}>
      <span className="hero-twinkle block w-full h-full" style={cycle(1800, 3.8)}>
        <Sparkle className="w-full h-full" fill="currentColor" />
      </span>
    </span>
    <span className="absolute text-primary" style={{ left: `calc(${twin.left} - 8px)`, top: `calc(${twin.top} - 8px)`, width: 16, height: 16 }}>
      <span className="hero-twinkle block w-full h-full" style={cycle(3200, 4.6)}>
        <Sparkle className="w-full h-full" fill="currentColor" />
      </span>
    </span>
  </>
);

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
// Movimiento: la escena "respira" (zoom lento), la imagen sigue un poco al
// ratón, las notas y hojas se mueven más (parallax por capas, ver
// useHeroMotion) y hay hojas cayendo, un destello junto al guiño y un
// corazón que late. Todo se apaga con prefers-reduced-motion y se pausa fuera
// de pantalla.
// Con variante oscura desde que llegaron las fotos hero-background-*-dark:
// bg-cream-dark en la sección (para que el difuminado de los bordes,
// .hero-pc-fade/.hero-mobile-mask, empalme con el color correcto) y dark: en
// cada texto — antes se quedaba fijo en claro justamente para no tener texto
// claro sobre una foto que seguía siendo crema; ahora que la foto sí cambia,
// hace falta lo contrario.
const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const list = t('landing.hero.list', { returnObjects: true }) as string[];
  const sectionRef = useRef<HTMLElement>(null);
  useHeroMotion(sectionRef);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-cream dark:bg-cream-dark">
      <div className="relative mx-auto w-full max-w-[2200px]">
        <div className="hero-pc-fade hidden md:block h-[520px] lg:h-auto lg:aspect-[1672/941] overflow-hidden">
          <div className="hero-depth-1 w-full h-full">
            <div className="hero-breathe w-full h-full">
              <img
                src={theme === 'dark' ? heroBgPcDark : heroBgPc}
                alt=""
                aria-hidden="true"
                width={1672}
                height={941}
                className="hero-fade w-full h-full object-cover object-[80%_34%] lg:object-center"
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 px-6 pt-10 pb-2 sm:pt-14 md:absolute md:inset-0 md:flex md:items-center md:p-0">
          <div className="max-w-md mx-auto md:mx-0 md:ml-6 md:w-[44%] md:max-w-none lg:ml-[8%] lg:w-[42%] text-left">
            <span
              style={delay(0)}
              className="hero-in block font-hand text-[22px] md:text-[clamp(1.35rem,2vw,2.75rem)] text-ink/80 dark:text-ink-light/80 mb-2"
            >
              {t('landing.hero.eyebrow')}
            </span>

            <h1 className="font-display font-bold text-[40px] sm:text-5xl md:text-[clamp(2.75rem,5.6vw,7.7rem)] leading-[1.05] md:leading-[1.02] tracking-tight text-ink dark:text-ink-light mb-5 md:mb-6">
              <span style={delay(100)} className="hero-in block">
                {t('landing.hero.line1')}{' '}
              </span>
              <span style={delay(220)} className="hero-in block">
                {t('landing.hero.line2Prefix')}{' '}
                <span style={delay(560)} className="hero-pop inline-block text-primary">
                  {t('landing.hero.highlight')}
                </span>
              </span>
            </h1>

            <p
              style={delay(360)}
              className="hero-in text-[15px] sm:text-base md:text-[clamp(1rem,1.3vw,1.8rem)] font-medium leading-7 md:leading-relaxed text-body dark:text-body-dark mb-7 md:mb-8 max-w-[34rem]"
            >
              {t('landing.hero.paragraph')}
            </p>

            <SearchBar animateIn baseDelay={480} className="max-w-[37rem]" />

            <InstallAppButton className="hero-in md:hidden mt-5" style={delay(900)} />
          </div>
        </div>

        <div className="hero-mobile-mask md:hidden relative mx-auto w-full max-w-[520px] aspect-[941/1084] mt-2 overflow-hidden">
          <div className="hero-breathe w-full h-full">
            <img
              src={theme === 'dark' ? heroBgMobileDark : heroBgMobile}
              alt=""
              aria-hidden="true"
              width={941}
              height={1672}
              className="hero-fade w-full h-full object-cover object-bottom"
            />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <Drifters leaves={LEAVES_MOBILE} sparkle={{ left: '76%', top: '33%' }} twin={{ left: '30%', top: '52%' }} />
          </div>
        </div>

        <div aria-hidden="true" className="hidden lg:block pointer-events-none absolute inset-0">
          <Drifters leaves={LEAVES_DESKTOP} sparkle={{ left: '77%', top: '42%' }} twin={{ left: '68%', top: '20%' }} />

          <div className="hero-depth-2 absolute top-[11%] right-[12%] w-[11%]">
            <div className="hero-bob">
              <div
                style={delay(950)}
                className="hero-fade -rotate-6 font-hand text-[clamp(1rem,1.5vw,2.05rem)] leading-tight text-ink/85 dark:text-ink-light/85"
              >
                {t('landing.hero.noteCard')}{' '}
                <Heart className="hero-heart w-[0.9em] h-[0.9em] text-primary" />
              </div>
            </div>
          </div>
          <svg
            className="hero-depth-2 absolute top-[30%] right-[14.5%] w-[3.4%] min-w-[34px] text-primary"
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
          <div className="hero-depth-3 absolute top-[34%] right-[2.2%]">
            <ul className="hero-bob font-hand text-[clamp(1rem,1.45vw,2rem)] leading-snug text-ink/80 dark:text-ink-light/80">
              <li style={delay(1050)} className="hero-in">{list[0]}</li>
              <li style={delay(1140)} className="hero-in pl-2">{list[1]}</li>
              <li style={delay(1230)} className="hero-in">{list[2]}</li>
              <li style={delay(1320)} className="hero-in pl-1">{list[3]}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
