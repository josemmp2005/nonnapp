## Design skill precedence

This project uses external design skills such as Taste and Emil Kowalski.

These skills are encouraged and should be used to improve:
- visual hierarchy
- spacing
- composition
- interaction design
- motion
- responsive behavior
- polish
- UX quality

However, they MUST NOT override the Nonnapp brand system.

For any conflict, use this precedence:

1. Existing functional requirements and architecture
2. Nonnapp Visual Manual 1.0
3. Project design system / tokens
4. Taste and Emil Kowalski design recommendations
5. General aesthetic preferences

In particular, external skills must not independently replace:
- Nonnapp color palette
- Nunito / Fredoka / Caveat typography strategy
- olive + cream + warm orange identity
- Nonna mascot
- rounded visual language
- warm Mediterranean / homemade aesthetic
- established component tokens

Use Taste and Emil Kowalski to make Nonnapp better, not to turn Nonnapp into their default visual style.

## Cabecera obligatoria en cada archivo

Todo archivo de código o configuración empieza, **lo primero de todo y antes de los imports**, con un comentario que explica qué hace (1-3 líneas, en español, sin repetir el nombre del archivo). Aplica a cada archivo nuevo y también hay que actualizarlo si el propósito del archivo cambia.

- `.ts`, `.tsx`, `.js`: bloque `/** ... */`.
- `.css`: bloque `/* ... */`.
- `.html`: `<!-- ... -->` justo después del `<!DOCTYPE html>`.
- `Dockerfile`, `.yml`, `nginx.conf`: líneas `# ...`.
- Quedan fuera los formatos que no admiten comentarios (`.json`, lockfiles) y los archivos generados o binarios.
- No escribir la secuencia `*/` dentro del texto de un bloque `/** */` (por ejemplo al citar un glob como `src/**/*.ts`): cierra el comentario antes de tiempo, y ni `tsc` ni ESLint lo detectan en los archivos de configuración.
