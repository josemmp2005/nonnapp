/**
 * Configuración de Tailwind: modo oscuro por clase, paleta de marca (primary,
 * accent y neutros cálidos crema/tinta), tipografías Nunito y Fredoka, sombras
 * suaves y plugins.
 */

import defaultTheme from 'tailwindcss/defaultTheme.js';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Naranja cálido — vuelve a ser el color dominante de la UI (feedback
                // explícito: el verde oliva como color principal quedaba "acuoso").
                // El manual sugería oliva=primary/naranja=accent; se invirtió a
                // propósito, se mantienen los mismos nombres de token para no tocar
                // los 187+ usos de bg-primary/text-primary ya existentes.
                primary: {
                    DEFAULT: '#F28B3C',
                    50: '#FFF6EC',
                    100: '#FFE9CF',
                    200: '#FFD09E',
                    300: '#FFB264',
                    400: '#F99A46',
                    500: '#F28B3C',
                    600: '#DF7025',
                    700: '#B95720',
                    800: '#93461F',
                    900: '#773C1D',
                },
                // Verde oliva — pasa a ser el acento puntual, no el color dominante.
                accent: {
                    DEFAULT: '#7C8B5E',
                    50: '#F5F6F0',
                    100: '#EAEDDF',
                    200: '#D5DBC1',
                    300: '#B9C39C',
                    400: '#99A878',
                    500: '#7C8B5E',
                    600: '#66744D',
                    700: '#525D40',
                    800: '#444C36',
                    900: '#39402E',
                },
                // Antes verde esmeralda casi sin uso real (3 sitios) — repuntado a un
                // tono "info" neutro del manual (sección 11).
                secondary: '#718B93',
                success: '#69875C',
                warning: '#D99A3D',
                error: '#C85B4B',
                info: '#718B93',
                // Neutros cálidos ya usados como hex sueltos en la app (fondo crema,
                // texto marrón oscuro, tonos apagados) — aquí solo se centralizan como
                // tokens, no se cambian los valores.
                cream: {
                    DEFAULT: '#FCF6EC',
                    dark: '#130F0A',
                },
                surface: {
                    DEFAULT: '#FFFFFF',
                    dark: '#18130D',
                },
                // Tono alterno para franjas de sección/paneles hundidos (más oscuro que
                // `surface-dark`, casi blanco puro en claro) — la landing ya alternaba
                // entre fondo normal y este tono para dar ritmo a las secciones.
                paper: {
                    DEFAULT: '#FFFBF3',
                    dark: '#0D0A06',
                },
                ink: {
                    DEFAULT: '#241B10',
                    light: '#F5E6CD',
                },
                body: {
                    DEFAULT: '#3A2E1D',
                    dark: '#D4D4D8',
                },
                muted: {
                    DEFAULT: '#6B5D48',
                    dark: '#9A8D74',
                },
                // Dorado — acento reservado para el tier de precios "premium" (La
                // Nonna), no forma parte del sistema principal oliva/naranja.
                gold: {
                    DEFAULT: '#9C7A32',
                    light: '#C9A876',
                },
            },
            fontFamily: {
                sans: ['Nunito', ...defaultTheme.fontFamily.sans],
                display: ['Fredoka', ...defaultTheme.fontFamily.sans],
            },
            boxShadow: {
                soft: '0 4px 20px rgba(80, 62, 45, 0.08)',
                'soft-md': '0 8px 30px rgba(80, 62, 45, 0.12)',
                'soft-lg': '0 16px 40px rgba(80, 62, 45, 0.16)',
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
            }
        },
    },
    plugins: [
        require('tailwindcss-animate'),
    ],
}
