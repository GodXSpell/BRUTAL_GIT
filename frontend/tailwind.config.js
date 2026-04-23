/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      "colors": {
              "on-tertiary-container": "#fffcff",
              "on-tertiary-fixed-variant": "#5810bf",
              "error-container": "#93000a",
              "on-error-container": "#ffdad6",
              "on-primary-fixed-variant": "#005319",
              "on-tertiary": "#3e008e",
              "inverse-surface": "#dfe2eb",
              "outline-variant": "#3f4a3d",
              "on-secondary": "#363100",
              "outline": "#899485",
              "tertiary-container": "#8853f0",
              "surface-container-lowest": "#0a0e14",
              "on-primary-container": "#f9fff3",
              "inverse-primary": "#006e23",
              "primary-container": "#238636",
              "error": "#ffb4ab",
              "surface-variant": "#31353c",
              "surface": "#10141a",
              "on-primary": "#00390e",
              "secondary-container": "#ab9d00",
              "secondary-fixed-dim": "#d8c93a",
              "surface-dim": "#10141a",
              "tertiary": "#d2bbff",
              "on-secondary-fixed-variant": "#4f4800",
              "secondary-fixed": "#f5e555",
              "inverse-on-surface": "#2d3137",
              "on-tertiary-fixed": "#25005a",
              "tertiary-fixed-dim": "#d2bbff",
              "on-secondary-container": "#393400",
              "primary-fixed-dim": "#7bdb80",
              "surface-bright": "#353940",
              "on-surface-variant": "#becaba",
              "on-background": "#dfe2eb",
              "primary": "#7bdb80",
              "primary-fixed": "#97f999",
              "surface-container-high": "#262a31",
              "background": "#10141a",
              "secondary": "#d8c93a",
              "surface-tint": "#7bdb80",
              "surface-container-low": "#181c22",
              "on-surface": "#dfe2eb",
              "tertiary-fixed": "#eaddff",
              "on-secondary-fixed": "#1f1c00",
              "surface-container-highest": "#31353c",
              "surface-container": "#1c2026",
              "on-primary-fixed": "#002106",
              "on-error": "#690005"
      },
      "borderRadius": {
              "DEFAULT": "0px",
              "lg": "0px",
              "xl": "0px",
              "full": "0px"
      },
      "spacing": {
              "sm": "16px",
              "base": "4px",
              "lg": "48px",
              "md": "24px",
              "xl": "80px",
              "xs": "8px",
              "gutter": "24px"
      },
      "fontFamily": {
              "headline-lg": [
                      "Space Grotesk"
              ],
              "headline-xl": [
                      "Space Grotesk"
              ],
              "label-sm": [
                      "Inter"
              ],
              "body-md": [
                      "Inter"
              ]
      },
      "fontSize": {
              "headline-lg": [
                      "32px",
                      {
                              "lineHeight": "1.2",
                              "letterSpacing": "-0.02em",
                              "fontWeight": "700"
                      }
              ],
              "headline-xl": [
                      "64px",
                      {
                              "lineHeight": "1.1",
                              "letterSpacing": "-0.04em",
                              "fontWeight": "700"
                      }
              ],
              "label-sm": [
                      "12px",
                      {
                              "lineHeight": "1",
                              "fontWeight": "600"
                      }
              ],
              "body-md": [
                      "16px",
                      {
                              "lineHeight": "1.5",
                              "fontWeight": "400"
                      }
              ]
      }
    },
  },
  plugins: [],
};
