import React from 'react';
import nonnaPhoto from '../../assets/nonna.webp';

const TAGS = ['Cero desperdicio', 'Cariño en cada paso', 'Ajo siempre de más', 'Nada de prisas'];

const MeetNonnaSection: React.FC = () => (
  <section className="landing-grain bg-[#FCF6EC] dark:bg-[#130F0A] py-16 md:py-24">
    <div className="max-w-5xl mx-auto px-6">
      <div className="group bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 rounded-2xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12 items-center transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">

        <div className="text-center">
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 overflow-hidden transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2">
            <img src={nonnaPhoto} alt="La Nonna" className="w-full h-full object-cover" />
          </div>
          <div className="text-sm font-semibold text-[#241B10] dark:text-[#F8F2E6]">La Nonna</div>
          <div className="text-xs text-[#6B5D48] dark:text-[#9A8D74] mt-0.5">Tu chef de IA</div>
        </div>

        <div>
          <span className="block text-xs font-semibold text-primary mb-2.5">Quién está detrás</span>
          <h2 className="mb-4 text-2xl md:text-[28px] font-bold tracking-tight text-[#241B10] dark:text-[#F8F2E6]">No es un chatbot. Es tu Nonna.</h2>
          <p className="mb-5 text-sm leading-relaxed text-[#5C4E3A] dark:text-[#A89C86] max-w-lg">
            Le hemos enseñado a nuestra IA a razonar como una abuela italiana: aprovechar cada ingrediente, saltarse la receta cuando hace falta y añadir siempre ese cariño que ninguna app tiene.
          </p>
          <div className="font-voice text-lg text-[#8A5A2B] dark:text-[#F0DFC4] mb-0.5">"Bambino, con lo que tienes en la nevera ya tenemos cena."</div>
          <div className="font-hand text-lg text-[#6B5D48] dark:text-[#C3B89F] mb-5">— La Nonna</div>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
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
);

export default MeetNonnaSection;
