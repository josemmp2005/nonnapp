import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Importar Nodemailer desde npm
import nodemailer from "npm:nodemailer@6.9.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string; // Versión texto plano (opcional)
}

serve(async (req) => {
  // Manejar preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verificar autenticación del usuario
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Usuario no autenticado");
    }

    // Obtener datos del request
    const { to, subject, html, text }: EmailRequest = await req.json();

    // Validar datos requeridos
    if (!to || !subject || !html) {
      throw new Error("Faltan campos requeridos: to, subject, html");
    }

    // Obtener credenciales de Gmail desde variables de entorno
    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailUser || !gmailAppPassword) {
      throw new Error(
        "Variables de entorno GMAIL_USER o GMAIL_APP_PASSWORD no configuradas"
      );
    }

    // Configurar transporter de Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // Opciones del email
    const mailOptions = {
      from: `Sabora App <${gmailUser}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || "", // Si no hay texto plano, dejar vacío
    };

    // Enviar el email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email enviado:", info.messageId);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: info.messageId,
        message: "Email enviado correctamente",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error al enviar email:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
