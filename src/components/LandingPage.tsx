import React from 'react';
import { Link } from 'react-router-dom';
import tomatoSoup from '../assets/tomato-soup.webp';
import nonnaPhoto from '../assets/nonna.webp';

const NonnaAvatar: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <img
    src={nonnaPhoto}
    alt="La Nonna"
    className={`${className} rounded-full object-cover flex-shrink-0 ring-1 ring-primary/30`}
  />
);

const CheckIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12l5 5L20 6" />
  </svg>
);

const LandingPage: React.FC = () => {
  return (
    <div className="overflow-hidden">

      {/* HERO */}
      <section className="relative landing-hero-lines bg-[#FCF6EC] dark:bg-[#130F0A] pt-16 pb-0">
        <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 w-[640px] h-[320px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.14)_0%,rgba(249,115,22,0)_72%)] dark:bg-[radial-gradient(circle,rgba(249,115,22,0.12)_0%,rgba(249,115,22,0)_72%)]" />

        <div className="max-w-[820px] mx-auto px-6 relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="mb-5 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] text-[#241B10] dark:text-[#F8F2E6]">
            Tu despensa, convertida<br />en la cena de hoy.
          </h1>

          <p className="mb-9 text-base md:text-lg leading-relaxed text-[#5C4E3A] dark:text-[#A89C86] max-w-md mx-auto">
            Dile a Nonnapp qué tienes en la nevera. En segundos recibes una receta completa, con foto real del plato, pensada como lo haría tu abuela.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 md:mb-16">
            <Link
              to="/app"
              className="group flex items-center gap-2 px-7 py-3 bg-primary text-[#130F0A] text-sm font-semibold rounded-lg shadow-lg shadow-primary/25 hover:bg-orange-400 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300"
            >
              Entrar a la Cocina
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <a
              href="#como-funciona"
              className="group flex items-center gap-1.5 text-sm font-medium text-[#3A2E1D] dark:text-[#E7DCC5] hover:text-primary dark:hover:text-primary transition-colors duration-300"
            >
              Ver cómo funciona
              <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
        </div>

        {/* Product mock */}
        <div className="max-w-[960px] mx-auto px-6 pb-20 md:pb-24 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
          <div className="hidden sm:block font-hand absolute -top-1 right-14 md:right-16 z-20 -rotate-[4deg] bg-[#F0E4CE] text-[#2A2114] px-4 py-2 rounded-sm text-base md:text-lg shadow-lg border border-black/5">
            Directo de la cocina de la Nonna
          </div>

          <div className="bg-[#18130D] border border-[#F5E6CD]/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 transition-transform duration-500 hover:-translate-y-1.5">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#F5E6CD]/10">
              <span className="w-2.5 h-2.5 rounded-full bg-[#453A28]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#453A28]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#453A28]" />
              <span className="ml-2 text-[11px] text-[#6E6350]">nonnapp.com/app/generate</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr]">
              <div className="p-6 border-b sm:border-b-0 sm:border-r border-[#F5E6CD]/10">
                <div className="text-[11px] font-semibold tracking-wide uppercase text-[#6E6350] mb-3">Tus ingredientes</div>
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="px-3 py-1.5 bg-[#221B12] border border-[#F5E6CD]/10 rounded-full text-xs text-[#E7DCC5]">Huevos</span>
                  <span className="px-3 py-1.5 bg-[#221B12] border border-[#F5E6CD]/10 rounded-full text-xs text-[#E7DCC5]">Tomate</span>
                  <span className="px-3 py-1.5 bg-[#221B12] border border-[#F5E6CD]/10 rounded-full text-xs text-[#E7DCC5]">Pan duro</span>
                </div>
                <div className="text-[11px] font-semibold tracking-wide uppercase text-[#6E6350] mb-2">Modo</div>
                <div className="text-sm text-[#E7DCC5] mb-5">Cero desperdicio</div>
                <div className="text-center py-2.5 bg-primary text-[#130F0A] text-sm font-semibold rounded-lg">Generar receta</div>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-2.5 p-3 bg-primary/[0.06] border border-primary/15 rounded-lg mb-4">
                  <NonnaAvatar className="w-9 h-9 mt-0.5" />
                  <div>
                    <div className="font-voice text-sm leading-snug text-[#F0DFC4]">"¡Bambino! Con huevos, tomate y pan duro ya tenemos cena."</div>
                    <div className="font-hand text-base text-[#C3B89F] -mt-0.5">— La Nonna</div>
                  </div>
                </div>
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div>
                    <div className="text-base font-bold text-[#F8F2E6] mb-1">Pappa al Pomodoro Toscana</div>
                    <div className="text-xs text-[#6E6350]">Sugerida por la Nonna · basada en tu despensa</div>
                  </div>
                  <span className="px-2.5 py-1 bg-primary/15 text-orange-400 text-[11px] font-semibold rounded whitespace-nowrap">Cero desperdicio</span>
                </div>
                <div className="rounded-lg overflow-hidden mb-4">
                  <img src={tomatoSoup} alt="Pappa al Pomodoro" className="w-full h-[170px] object-cover [filter:saturate(1.08)_sepia(.08)_contrast(1.02)]" />
                </div>
                <div className="flex gap-5 pb-4 mb-4 border-b border-[#F5E6CD]/10">
                  <div className="flex items-center gap-1.5 text-xs text-[#A89C86]">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
                    20 min
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#A89C86]">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /><circle cx="12" cy="7" r="4" /></svg>
                    4 raciones
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#A89C86]">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c1.4 2.8-1 4.3-1 6.8 0 1.6 1.2 2.9 2.9 2.9s2.9-1.3 2.9-2.9c0-.9-.4-1.6-.9-2.2C17.4 8.4 19 10.9 19 13.8a7 7 0 1 1-14 0c0-2.9 1.3-5.2 3-6.9C9.8 4.9 11 3.5 12 2z" /></svg>
                    Fácil
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2.5 text-xs text-[#B4A98F]"><span className="text-[#5C5346]">1</span> Sofríe el ajo y añade el tomate triturado.</div>
                  <div className="flex gap-2.5 text-xs text-[#5C5346]"><span className="text-[#3A3A3E]">2</span> Incorpora el pan duro troceado y deja reposar.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-[#241B10]/10 dark:border-[#F5E6CD]/10 bg-[#FCF6EC] dark:bg-[#130F0A]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 divide-x divide-[#241B10]/10 dark:divide-[#F5E6CD]/10">
          <div className="py-7 text-center">
            <div className="text-xl md:text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] tracking-tight">3 pasos</div>
            <div className="text-[11px] md:text-xs text-[#8C7C63] dark:text-[#7C715E] mt-1">de la despensa al plato</div>
          </div>
          <div className="py-7 text-center">
            <div className="text-xl md:text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] tracking-tight">&lt; 20 seg</div>
            <div className="text-[11px] md:text-xs text-[#8C7C63] dark:text-[#7C715E] mt-1">para generar una receta</div>
          </div>
          <div className="py-7 text-center">
            <div className="text-xl md:text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] tracking-tight">0%</div>
            <div className="text-[11px] md:text-xs text-[#8C7C63] dark:text-[#7C715E] mt-1">desperdicio como objetivo</div>
          </div>
        </div>
      </section>

      {/* MEET LA NONNA */}
      <section className="landing-grain bg-[#FCF6EC] dark:bg-[#130F0A] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="group bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 rounded-2xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12 items-center transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">

            <div className="text-center">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 overflow-hidden transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2">
                <img src={nonnaPhoto} alt="La Nonna" className="w-full h-full object-cover" />
              </div>
              <div className="text-sm font-semibold text-[#241B10] dark:text-[#F8F2E6]">La Nonna</div>
              <div className="text-xs text-[#8C7C63] dark:text-[#7C715E] mt-0.5">Tu chef de IA</div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-primary mb-2.5">Quién está detrás</span>
              <h2 className="mb-4 text-2xl md:text-[28px] font-bold tracking-tight text-[#241B10] dark:text-[#F8F2E6]">No es un chatbot. Es tu Nonna.</h2>
              <p className="mb-5 text-sm leading-relaxed text-[#5C4E3A] dark:text-[#A89C86] max-w-lg">
                Le hemos enseñado a nuestra IA a razonar como una abuela italiana: aprovechar cada ingrediente, saltarse la receta cuando hace falta y añadir siempre ese cariño que ninguna app tiene.
              </p>
              <div className="font-voice text-lg text-[#8A5A2B] dark:text-[#F0DFC4] mb-0.5">"Bambino, con lo que tienes en la nevera ya tenemos cena."</div>
              <div className="font-hand text-lg text-[#8C7C63] dark:text-[#C3B89F] mb-5">— La Nonna</div>
              <div className="flex flex-wrap gap-2">
                {['Cero desperdicio', 'Cariño en cada paso', 'Ajo siempre de más', 'Nada de prisas'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 border border-[#241B10]/15 dark:border-[#F5E6CD]/10 rounded-full text-xs text-[#5C4E3A] dark:text-[#B4A98F] transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="landing-grain bg-[#FCF6EC] dark:bg-[#130F0A] border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-lg mb-12 md:mb-14">
            <span className="block text-xs font-semibold text-primary mb-2.5">Cómo funciona</span>
            <h2 className="text-2xl md:text-[34px] font-bold tracking-tight text-[#241B10] dark:text-[#F8F2E6]">De la despensa al plato en tres pasos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#241B10]/10 dark:bg-[#F5E6CD]/10 border border-[#241B10]/10 dark:border-[#F5E6CD]/10 rounded-xl overflow-hidden">
            {[
              {
                n: '01',
                title: 'Cuéntale qué tienes',
                text: 'Ingredientes, sobras o alergias: dile a la Nonna qué hay hoy en tu nevera.',
                icon: <path d="M4 9h16l-1.5 10.2a2 2 0 0 1-2 1.8H7.5a2 2 0 0 1-2-1.8L4 9z" />,
                icon2: <path d="M8.5 9l1-4.5M15.5 9l-1-4.5M9.5 13v4M14.5 13v4" />,
              },
              {
                n: '02',
                title: 'Ella piensa como una Nonna',
                text: 'La IA cruza tradición italiana con tu despensa para crear algo delicioso, sin desperdiciar nada.',
                icon: <path d="M12 2c1.4 2.8-1 4.3-1 6.8 0 1.6 1.2 2.9 2.9 2.9s2.9-1.3 2.9-2.9c0-.9-.4-1.6-.9-2.2C17.4 8.4 19 10.9 19 13.8a7 7 0 1 1-14 0c0-2.9 1.3-5.2 3-6.9C9.8 4.9 11 3.5 12 2z" />,
              },
              {
                n: '03',
                title: 'Cocina con receta y foto',
                text: 'Pasos claros y una foto realista del resultado, lista para guardar o imprimir.',
                icon: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7l1.4-2.5h5.2L16 7" /><circle cx="12" cy="13.5" r="3.4" /></>,
              },
            ].map((step) => (
              <div key={step.n} className="group bg-[#FCF6EC] dark:bg-[#130F0A] p-7 transition-all duration-300 hover:bg-white dark:hover:bg-[#18130D] hover:z-10 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1">
                <div className="text-xs font-semibold text-[#8C7C63] dark:text-[#6E6350] mb-4">{step.n}</div>
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {step.icon}{step.icon2}
                  </svg>
                </div>
                <h3 className="mb-2 text-[15px] font-semibold text-[#241B10] dark:text-[#F8F2E6]">{step.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-[#8C7C63] dark:text-[#948974]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECRET / FEATURES */}
      <section className="landing-grain bg-[#FCF6EC] dark:bg-[#130F0A] border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-xl mb-12 md:mb-14">
            <span className="block text-xs font-semibold text-primary mb-2.5">El secreto</span>
            <h2 className="mb-4 text-2xl md:text-[34px] font-bold tracking-tight text-[#241B10] dark:text-[#F8F2E6]">Lo que hace especial a Nonnapp</h2>
            <p className="text-sm md:text-[15.5px] leading-relaxed text-[#5C4E3A] dark:text-[#8B8B90]">¿Cómo cocinaba tu abuela un banquete con tres ingredientes en la nevera? Le hemos enseñado esa magia a nuestra IA.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: 'Cero desperdicio',
                text: 'La Nonna nunca tiraba comida. La IA prioriza lo que ya tienes, ahorrando dinero y cuidando el planeta.',
                icon: <><path d="M6 20C4 12 9 5 19 4c0 10-7 15-13 16z" /><path d="M6.5 19.5C9 14 12 10 17 6" /></>,
              },
              {
                title: 'Cocina con alma',
                text: 'No son solo instrucciones robóticas: recibes consejos y trucos con ese cariño de cocina de casa.',
                icon: <path d="M12 20s-7-4.3-9.5-8.8C.8 8 2.6 4.5 6 4.5c2 0 3.4 1 6 3.5 2.6-2.5 4-3.5 6-3.5 3.4 0 5.2 3.5 3.5 6.7C19 15.7 12 20 12 20z" />,
              },
              {
                title: 'Velocidad moderna',
                text: 'La sabiduría de antaño a la velocidad de hoy: receta y lista de la compra en segundos.',
                icon: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" stroke="none" />,
              },
            ].map((f) => (
              <div key={f.title} className="group bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 p-7 rounded-xl transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5">
                <div className="w-[34px] h-[34px] rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="mb-2 text-[15.5px] font-semibold text-[#241B10] dark:text-[#F8F2E6]">{f.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-[#8C7C63] dark:text-[#948974]">{f.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-12 border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10">
            <div className="flex items-baseline gap-3.5 mb-6">
              <span className="text-xs font-semibold text-primary">Los mandamientos de la Nonna</span>
              <span className="font-hand text-base text-[#8C7C63] dark:text-[#7C715E]">escritos con cariño</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
              {[
                'Nunca se tira comida.',
                'Si dudas, añade más ajo.',
                'La paciencia es el ingrediente secreto.',
                'Todo sabe mejor compartido.',
              ].map((rule, i) => (
                <div key={rule} className="group flex items-center gap-4 py-4 border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 transition-all duration-300 hover:pl-2 hover:border-primary/40">
                  <span className="text-xs font-semibold text-primary flex-shrink-0 transition-transform duration-300 group-hover:scale-125">0{i + 1}</span>
                  <span className="text-sm text-[#3A2E1D] dark:text-[#D4D4D8] transition-colors duration-300 group-hover:text-primary">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="landing-grain bg-[#FCF6EC] dark:bg-[#130F0A] border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-14">
            <span className="block text-xs font-semibold text-primary mb-2.5">La Famiglia</span>
            <h2 className="mb-3 text-2xl md:text-[34px] font-bold tracking-tight text-[#241B10] dark:text-[#F8F2E6]">Elige tu lugar en la mesa</h2>
            <p className="text-sm text-[#8C7C63] dark:text-[#8B8B90]">Desde el nieto que aprende hasta la Nonna que lo sabe todo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">

            {/* Il Nipote */}
            <div className="bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 p-8 rounded-xl flex flex-col transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-2">
              <h3 className="mb-1 text-base font-semibold text-[#241B10] dark:text-[#F8F2E6]">Il Nipote</h3>
              <p className="mb-5 text-xs text-[#8C7C63] dark:text-[#6C6C72]">El nieto aprendiz</p>
              <div className="mb-6 text-3xl font-bold tracking-tight text-[#241B10] dark:text-[#F8F2E6]">Gratis</div>
              <div className="flex flex-col gap-3 mb-7 flex-grow">
                <div className="flex items-center gap-2.5 text-[13px] text-[#3A2E1D] dark:text-[#B4B4B9]">
                  <CheckIcon className="w-3.5 h-3.5 text-primary" /> 2 recetas al día
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-[#3A2E1D] dark:text-[#B4B4B9]">
                  <CheckIcon className="w-3.5 h-3.5 text-primary" /> Modo despensa básico
                </div>
                <div className="text-[13px] text-[#B7AA92] dark:text-[#4E4E52] line-through">Sin imágenes generadas</div>
                <div className="text-[13px] text-[#B7AA92] dark:text-[#4E4E52] line-through">Sin chat con el chef</div>
              </div>
              <Link to="/app" className="text-center py-2.5 rounded-lg border border-[#241B10]/15 dark:border-[#F5E6CD]/15 text-[#241B10] dark:text-[#F8F2E6] text-sm font-semibold hover:bg-[#241B10]/[0.03] dark:hover:bg-white/5 hover:border-primary/40 active:scale-95 transition-all duration-300">
                Empezar a aprender
              </Link>
            </div>

            {/* La Mamma — always dark, brand-forward */}
            <div className="bg-[#18130D] border border-primary/50 p-8 rounded-xl flex flex-col relative transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 md:scale-[1.02] hover:md:scale-[1.05]">
              <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-primary text-[#130F0A] text-[10px] font-bold tracking-wide uppercase rounded">Más popular</div>
              <h3 className="mb-1 text-lg font-semibold text-[#F8F2E6]">La Mamma</h3>
              <p className="mb-5 text-xs text-[#6C6C72]">La jefa de cocina</p>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-[34px] font-bold tracking-tight text-[#F8F2E6]">9,99€</span>
                <span className="text-xs text-[#6C6C72]">/mes</span>
              </div>
              <div className="flex flex-col gap-3 mb-7 flex-grow">
                {['Recetas ilimitadas', 'Fotos 4K de tus platos', 'Historial completo', 'Chat con el chef 24/7'].map((t) => (
                  <div key={t} className="flex items-center gap-2.5 text-[13px] text-[#D4D4D8] font-medium">
                    <CheckIcon className="w-3.5 h-3.5 text-primary" /> {t}
                  </div>
                ))}
              </div>
              <Link to="/auth" className="text-center py-3 rounded-lg bg-primary text-[#130F0A] text-sm font-semibold shadow-lg shadow-primary/30 hover:bg-orange-400 hover:shadow-xl hover:shadow-primary/40 active:scale-95 transition-all duration-300">
                Gestionar la cocina
              </Link>
            </div>

            {/* La Nonna */}
            <div className="bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 p-8 rounded-xl flex flex-col transition-all duration-300 hover:border-[#9C7A32]/40 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-2">
              <h3 className="mb-1 text-base font-semibold text-[#241B10] dark:text-[#F8F2E6] flex items-center gap-1.5">
                La Nonna
                <svg className="w-3.5 h-3.5 text-[#9C7A32] dark:text-[#C9A876]" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l-1.5-9L8 12l4-8 4 8 5.5-3L20 18z" /></svg>
              </h3>
              <p className="mb-5 text-xs text-[#8C7C63] dark:text-[#6C6C72]">La matriarca suprema</p>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-[30px] font-bold tracking-tight text-[#241B10] dark:text-[#F8F2E6]">19,99€</span>
                <span className="text-xs text-[#8C7C63] dark:text-[#6C6C72]">/mes</span>
              </div>
              <div className="flex flex-col gap-3 mb-7 flex-grow">
                <div className="flex items-center gap-2.5 text-[13px] text-[#3A2E1D] dark:text-[#D4D4D8] font-medium">
                  <svg className="w-3.5 h-3.5 text-[#9C7A32] dark:text-[#C9A876]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7L2 9.2l7.1-.6L12 2z" /></svg>
                  Todo lo de La Mamma
                </div>
                {['Planificador semanal', 'Recetas secretas de temporada', 'Soporte prioritario VIP'].map((t) => (
                  <div key={t} className="flex items-center gap-2.5 text-[13px] text-[#3A2E1D] dark:text-[#B4B4B9]">
                    <CheckIcon className="w-3.5 h-3.5 text-[#9C7A32] dark:text-[#C9A876]" /> {t}
                  </div>
                ))}
              </div>
              <Link to="/auth" className="text-center py-2.5 rounded-lg border border-[#9C7A32]/50 dark:border-[#C9A876]/50 text-[#9C7A32] dark:text-[#C9A876] text-sm font-semibold hover:bg-[#9C7A32]/5 dark:hover:bg-[#C9A876]/5 active:scale-95 transition-all duration-300">
                Heredar el secreto
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 bg-[#FCF6EC] dark:bg-[#130F0A] py-20 md:py-28 text-center overflow-hidden">
        <div className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2 w-[520px] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.12)_0%,rgba(249,115,22,0)_72%)] dark:bg-[radial-gradient(circle,rgba(249,115,22,0.1)_0%,rgba(249,115,22,0)_72%)]" />
        <div className="max-w-xl mx-auto px-6 relative z-10">
          <h2 className="mb-8 text-3xl md:text-[40px] font-bold tracking-tight leading-tight text-[#241B10] dark:text-[#F8F2E6]">
            La mesa está servida.<br />Solo faltas tú.
          </h2>
          <Link
            to="/app"
            className="group inline-flex items-center gap-2 px-7 py-3 bg-primary text-[#130F0A] text-sm font-semibold rounded-lg shadow-lg shadow-primary/25 hover:bg-orange-400 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300"
          >
            Empezar a cocinar
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
          <p className="mt-5 text-xs text-[#8C7C63] dark:text-[#6C6C72]">Prueba gratis. Sin tarjeta de crédito.</p>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
