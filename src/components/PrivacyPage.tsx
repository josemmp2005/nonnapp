import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FCF6EC] dark:bg-[#130F0A] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:text-orange-600 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="bg-white dark:bg-[#18130D] rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-4">
            Política de Privacidad
          </h1>
          <p className="text-[#8C7C63] dark:text-[#7C715E] mb-8">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-4">1. Información que recopilamos</h2>
              <p className="text-[#3A2E1D] dark:text-[#D4D4D8]">
                En Sabora (nonnapp), recopilamos la siguiente información cuando te registras o utilizas nuestros servicios:
              </p>
              <ul className="list-disc pl-6 text-[#3A2E1D] dark:text-[#D4D4D8] space-y-2">
                <li><strong>Información de cuenta:</strong> Nombre, correo electrónico, nombre de usuario</li>
                <li><strong>Información de perfil de Google:</strong> Nombre, foto de perfil, email (si inicias sesión con Google)</li>
                <li><strong>Contenido generado:</strong> Recetas creadas, preferencias culinarias, historial</li>
                <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador, sistema operativo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-4">2. Cómo usamos tu información</h2>
              <ul className="list-disc pl-6 text-[#3A2E1D] dark:text-[#D4D4D8] space-y-2">
                <li>Proporcionar y mejorar nuestros servicios</li>
                <li>Personalizar tu experiencia culinaria</li>
                <li>Generar recetas personalizadas con IA</li>
                <li>Gestionar tu cuenta y suscripción</li>
                <li>Comunicarnos contigo sobre actualizaciones y novedades</li>
                <li>Garantizar la seguridad de la plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-4">3. Compartir información</h2>
              <p className="text-[#3A2E1D] dark:text-[#D4D4D8]">
                <strong>No vendemos ni compartimos tu información personal con terceros</strong> para fines publicitarios. 
                Solo compartimos información con:
              </p>
              <ul className="list-disc pl-6 text-[#3A2E1D] dark:text-[#D4D4D8] space-y-2">
                <li><strong>Proveedores de servicios:</strong> Supabase (almacenamiento), Google Gemini (IA), proveedores de email</li>
                <li><strong>Requisitos legales:</strong> Cuando sea requerido por ley</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-4">4. Seguridad de datos</h2>
              <p className="text-[#3A2E1D] dark:text-[#D4D4D8]">
                Utilizamos medidas de seguridad estándar de la industria para proteger tu información:
              </p>
              <ul className="list-disc pl-6 text-[#3A2E1D] dark:text-[#D4D4D8] space-y-2">
                <li>Cifrado SSL/TLS para todas las comunicaciones</li>
                <li>Almacenamiento seguro en Supabase con Row Level Security (RLS)</li>
                <li>Autenticación robusta con soporte OAuth</li>
                <li>Backups regulares y recuperación ante desastres</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-4">5. Tus derechos</h2>
              <p className="text-[#3A2E1D] dark:text-[#D4D4D8]">Tienes derecho a:</p>
              <ul className="list-disc pl-6 text-[#3A2E1D] dark:text-[#D4D4D8] space-y-2">
                <li>Acceder a tu información personal</li>
                <li>Corregir o actualizar tus datos</li>
                <li>Eliminar tu cuenta y todos tus datos</li>
                <li>Exportar tus recetas e información</li>
                <li>Oponerte al procesamiento de tus datos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-4">6. Cookies y tecnologías similares</h2>
              <p className="text-[#3A2E1D] dark:text-[#D4D4D8]">
                Utilizamos cookies y localStorage para mantener tu sesión activa y mejorar tu experiencia. 
                Puedes desactivar las cookies en la configuración de tu navegador, pero esto puede afectar 
                la funcionalidad del sitio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-4">7. Uso de Google OAuth</h2>
              <p className="text-[#3A2E1D] dark:text-[#D4D4D8]">
                Cuando inicias sesión con Google, recibimos información básica de tu perfil (nombre, email, foto). 
                Esto nos permite crear tu cuenta sin necesidad de una contraseña adicional. Google nos proporciona 
                un token de acceso que nunca compartimos con terceros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-4">8. Cambios a esta política</h2>
              <p className="text-[#3A2E1D] dark:text-[#D4D4D8]">
                Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios importantes por email 
                o mediante un aviso en la plataforma. El uso continuado del servicio después de estos cambios 
                constituye tu aceptación de la nueva política.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#241B10] dark:text-[#F8F2E6] mb-4">9. Contacto</h2>
              <p className="text-[#3A2E1D] dark:text-[#D4D4D8]">
                Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tus datos, contáctanos:
              </p>
              <ul className="list-none text-[#3A2E1D] dark:text-[#D4D4D8] space-y-2">
                <li><strong>Email:</strong> privacy@sabora.app</li>
                <li><strong>Sitio web:</strong> https://sabora.app</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
