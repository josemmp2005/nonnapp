import React from 'react';
import { Shield, Lock, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20 pt-8">
      <Link 
        to="/"
        className="inline-flex items-center gap-2 text-[#8C7C63] dark:text-[#7C715E] hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al Inicio
      </Link>

      <div className="bg-white dark:bg-[#18130D] rounded-3xl p-8 md:p-12 shadow-sm border border-[#241B10]/10 dark:border-[#F5E6CD]/10 transition-colors duration-300">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#241B10] dark:text-[#F8F2E6] mb-4">Legal y Privacidad</h1>
          <p className="text-[#8C7C63] dark:text-[#7C715E]">Última actualización: Octubre 2025</p>
        </div>

        <div className="space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6]">Términos de Uso</h2>
            </div>
            <div className="prose text-[#5C4E3A] dark:text-[#A89C86] text-sm leading-relaxed space-y-4">
              <p>
                Bienvenido a nonnapp. Al utilizar nuestra aplicación web, aceptas cumplir con los siguientes términos y condiciones.
                Este servicio utiliza Inteligencia Artificial (Gemini) para generar contenido culinario.
              </p>
              <p>
                <strong>Uso de la IA:</strong> Las recetas y consejos generados son sugerencias creativas basadas en modelos de lenguaje. 
                nonnapp no se hace responsable de imprecisiones en los tiempos de cocción, ingredientes o valores nutricionales. 
                Siempre usa el sentido común al cocinar, especialmente con alérgenos.
              </p>
              <p>
                <strong>Cuenta de Usuario:</strong> Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. 
                Nos reservamos el derecho de suspender cuentas que hagan un uso abusivo de la API.
              </p>
            </div>
          </section>

          <div className="h-px bg-primary/10"></div>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6]">Política de Privacidad</h2>
            </div>
            <div className="prose text-[#5C4E3A] dark:text-[#A89C86] text-sm leading-relaxed space-y-4">
              <p>
                Tu privacidad es importante para nosotros. A continuación explicamos qué datos recopilamos y cómo los usamos.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Datos Personales:</strong> Recopilamos tu email y nombre de usuario únicamente para la gestión de la sesión y guardar tus preferencias.
                </li>
                <li>
                  <strong>Preferencias Culinarias:</strong> Almacenamos tus alergias y utensilios para personalizar los prompts enviados a la IA.
                </li>
                <li>
                  <strong>Imágenes:</strong> Las imágenes de perfil y de recetas generadas se almacenan de forma segura en nuestra base de datos.
                </li>
                <li>
                  <strong>Terceros:</strong> No vendemos tus datos. Utilizamos Google Gemini API para el procesamiento de recetas.
                </li>
              </ul>
            </div>
          </section>

          <div className="h-px bg-primary/10"></div>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6]">Propiedad Intelectual</h2>
            </div>
            <div className="prose text-[#5C4E3A] dark:text-[#A89C86] text-sm leading-relaxed space-y-4">
              <p>
                Todo el código fuente, diseño y marca "nonnapp" son propiedad exclusiva de sus creadores. 
                El contenido generado por la IA para ti es de libre uso personal.
              </p>
            </div>
          </section>
        </div>
        
        <div className="mt-12 pt-8 border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 text-center text-xs text-[#8C7C63] dark:text-[#6E6350]">
          Para consultas legales, contáctanos en legal@nonnapp.app
        </div>
      </div>
    </div>
  );
};

export default TermsPage;