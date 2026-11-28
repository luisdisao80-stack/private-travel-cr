// Paleta activa del panel /admin. Las opciones viven en app/globals.css
// (sección "Admin palette tokens"); aquí solo se elige cuál se aplica.
// "sitio" replica los colores de privatetravelcr.com y de los correos.
export type AdminPalette = "sitio" | "brand" | "light" | "natural";
export const ADMIN_PALETTE: AdminPalette = "sitio";
