// ============================================================
// Eleos Design Foundations — Design Tokens
// Source: Figma › Eleos Design Foundations
// Last synced: 2026-05-01
// ============================================================

const tokens = {

  // ──────────────────────────────────────────────────────────
  // COLORS
  // ──────────────────────────────────────────────────────────
  colors: {

    // ── Semantic (Color Tokens collection) ──────────────────
    semantic: {
      primary: {
        lighter: "#eaedfa",  // Color Tokens › Primary/Lighter  (Eleos/50)
        light:   "#8194e1",  // Color Tokens › Primary/Light    (Eleos/300)
        main:    "#2d4ccd",  // Color Tokens › Primary/Main     (Eleos/500)
        dark:    "#293d87",  // Color Tokens › Primary/Dark     (Eleos/900)
      },
      secondary: {
        lighter: "#edfcf8",  // Color Tokens › Secondary/Lighter (Eleos Mint/50)
        light:   "#95ecd3",  // Color Tokens › Secondary/Light   (Eleos Mint/300)
        main:    "#46bc9e",  // Color Tokens › Secondary/Main    (Eleos Mint/700)
        dark:    "#3a877c",  // Color Tokens › Secondary/Dark    (Eleos Mint/900)
      },
      error: {
        light: "#ef9a9a",    // Color Tokens › Error/Light  (Red/200)
        main:  "#d32f2f",    // Color Tokens › Error/Main   (Red/700)
        dark:  "#b71c1c",    // Color Tokens › Error/Dark   (Red/900)
      },
      warning: {
        lighter: "#fff3e0",  // Color Tokens › Warning/Lighter (Orange/50)
        light:   "#ff9800",  // Color Tokens › Warning/Light   (Orange/500)
        main:    "#ef6c00",  // Color Tokens › Warning/Main    (Orange/700)
        dark:    "#e65100",  // Color Tokens › Warning/Dark    (Orange/900)
      },
      success: {
        lighter: "#e8f5e9",  // Color Tokens › Success/Lighter (Green/50)
        light:   "#4caf50",  // Color Tokens › Success/Light   (Green/500)
        main:    "#2e7d32",  // Color Tokens › Success/Main    (Green/800)
        dark:    "#1b5e20",  // Color Tokens › Success/Dark    (Green/900)
      },
      info: {
        lighter: "#e1f5fe",  // Color Tokens › Info/Lighter (Light Blue/50)
        light:   "#03a9f4",  // Color Tokens › Info/Light   (Light Blue/500)
        main:    "#0288d1",  // Color Tokens › Info/Main    (Light Blue/700)
        dark:    "#01579b",  // Color Tokens › Info/Dark    (Light Blue/900)
      },
      text: {
        primary:   "#212121",   // Color Tokens › Text/Primary   (Grey/900)
        secondary: "#21212199", // Color Tokens › Text/Secondary  (Grey/900 @ 60%)
        disabled:  "#21212161", // Color Tokens › Text/Disabled   (Grey/900 @ 38%)
        divider:   "#0000001f", // Color Tokens › Text/Divider
      },
      action: {
        active:           "#2121218f", // Color Tokens › Action/active
        hover:            "#2121210a", // Color Tokens › Action/hover
        selected:         "#21212114", // Color Tokens › Action/selected
        focus:            "#2121211f", // Color Tokens › Action/focus
        disabled:         "#2d4ccd61", // Color Tokens › Action/disabled
        disabledBg:       "#2d4ccd1f", // Color Tokens › Action/disabledBackground
        divider:          "#2121211f", // Color Tokens › Action/divider
      },
      contrast: {
        onDark: "#ffffff",  // Color Tokens › Contrast/On Dark
      },
      components: {
        input:          "#ffffff",  // Color Tokens › _components/input
        backdrop:       "#223648cc",// Color Tokens › _components/backdrop
        tooltip:        "#223648e5",// Color Tokens › _components/tooltip
        enabledBorder:  "#2121213b",// Color Tokens › _components/enabledBorder
      },
    },

    // ── Primitives › Eleos brand scale ──────────────────────
    eleos: {
      50:  "#eaedfa", // _ColorPrimitives › Eleos/50
      100: "#d5dbf5", // _ColorPrimitives › Eleos/100
      200: "#abb7eb", // _ColorPrimitives › Eleos/200
      300: "#8194e1", // _ColorPrimitives › Eleos/300
      400: "#5770d7", // _ColorPrimitives › Eleos/400
      500: "#2d4ccd", // _ColorPrimitives › Eleos/500
      600: "#2d4bc6", // _ColorPrimitives › Eleos/600
      700: "#2c49bf", // _ColorPrimitives › Eleos/700
      800: "#2b46b1", // _ColorPrimitives › Eleos/800
      900: "#293d87", // _ColorPrimitives › Eleos/900
    },

    // ── Primitives › Eleos Mint (secondary) ─────────────────
    mint: {
      50:  "#edfcf8", // _ColorPrimitives › Eleos Mint/50
      100: "#dcf9f0", // _ColorPrimitives › Eleos Mint/100
      200: "#b9f3e1", // _ColorPrimitives › Eleos Mint/200
      300: "#95ecd3", // _ColorPrimitives › Eleos Mint/300
      400: "#72e6c4", // _ColorPrimitives › Eleos Mint/400
      500: "#4fe0b5", // _ColorPrimitives › Eleos Mint/500
      600: "#4bcea9", // _ColorPrimitives › Eleos Mint/600
      700: "#46bc9e", // _ColorPrimitives › Eleos Mint/700
      800: "#3e9987", // _ColorPrimitives › Eleos Mint/800
      900: "#3a877c", // _ColorPrimitives › Eleos Mint/900
    },

    // ── Primitives › Eleos Yellow ────────────────────────────
    yellow: {
      50:  "#fef8eb", // _ColorPrimitives › Eleos Yellow/50
      100: "#fef0d6", // _ColorPrimitives › Eleos Yellow/100
      200: "#fde1ae", // _ColorPrimitives › Eleos Yellow/200
      300: "#ffd54f", // _ColorPrimitives › Eleos Yellow/300
      400: "#fac45d", // _ColorPrimitives › Eleos Yellow/400
      500: "#f9b534", // _ColorPrimitives › Eleos Yellow/500
      600: "#e4a735", // _ColorPrimitives › Eleos Yellow/600
      700: "#ce9a37", // _ColorPrimitives › Eleos Yellow/700
      800: "#8e723b", // _ColorPrimitives › Eleos Yellow/800
      900: "#8e723b", // _ColorPrimitives › Eleos Yellow/900
    },

    // ── Primitives › Neutrals ────────────────────────────────
    grey: {
      50:  "#fafafa", // _ColorPrimitives › Grey/50
      100: "#f5f5f5", // _ColorPrimitives › Grey/100
      200: "#eeeeee", // _ColorPrimitives › Grey/200
      300: "#e0e0e0", // _ColorPrimitives › Grey/300
      400: "#bdbdbd", // _ColorPrimitives › Grey/400
      500: "#9e9e9e", // _ColorPrimitives › Grey/500
      600: "#757575", // _ColorPrimitives › Grey/600
      700: "#616161", // _ColorPrimitives › Grey/700
      800: "#424242", // _ColorPrimitives › Grey/800
      900: "#212121", // _ColorPrimitives › Grey/900
    },
    greyBlue: {
      50:  "#eceff1", // _ColorPrimitives › Grey Blue/50
      100: "#cfd8dc", // _ColorPrimitives › Grey Blue/100
      200: "#b0bec5", // _ColorPrimitives › Grey Blue/200
      300: "#90a4ae", // _ColorPrimitives › Grey Blue/300
      400: "#78909c", // _ColorPrimitives › Grey Blue/400
      500: "#607d8b", // _ColorPrimitives › Grey Blue/500
      600: "#546e7a", // _ColorPrimitives › Grey Blue/600
      700: "#455a64", // _ColorPrimitives › Grey Blue/700
      800: "#37474f", // _ColorPrimitives › Grey Blue/800
      900: "#263238", // _ColorPrimitives › Grey Blue/900
    },

    // ── Primitives › Status scales (full) ───────────────────
    red: {
      50:  "#ffebee", 100: "#fecdd2", 200: "#ef9a9a",
      300: "#e57373", 400: "#ef5350", 500: "#f44336",
      600: "#e53935", 700: "#d32f2f", 800: "#c62828", 900: "#b71c1c",
    },
    green: {
      50:  "#e8f5e9", 100: "#c8e6c9", 200: "#a5d6a7",
      300: "#81c784", 400: "#66bb6a", 500: "#4caf50",
      600: "#43a047", 700: "#388e3c", 800: "#2e7d32", 900: "#1b5e20",
    },
    orange: {
      50:  "#fff3e0", 100: "#ffe0b2", 200: "#ffcc80",
      300: "#ffb74d", 400: "#ffa726", 500: "#ff9800",
      600: "#fb8c00", 700: "#f57c00", 800: "#ef6c00", 900: "#e65100",
    },
    lightBlue: {
      50:  "#e1f5fe", 100: "#b3e5fc", 200: "#81d4fa",
      300: "#4fc3f7", 400: "#29b6f6", 500: "#03a9f4",
      600: "#039be5", 700: "#0288d1", 800: "#0277bd", 900: "#01579b",
    },
    deepPurple: {
      50:  "#ede7f6", 100: "#d1c4e9", 200: "#b39ddb",
      300: "#9575cd", 400: "#7e57c2", 500: "#673ab7",
      600: "#5e35b1", 700: "#512da8", 800: "#4527a0", 900: "#311b92",
    },

    // ── Marketing palette (separate Figma collection) ───────
    marketing: {
      teal:     { 100: "#e2f4f4", 500: "#93c7c7", 900: "#558a8a" },  // Marketing › Color/Teal
      gold:     { 100: "#fff4d7", 300: "#ffdb1e", 500: "#ffc04c", 700: "#eda939" }, // Marketing › Color/Gold
      indigo:   { 100: "#d7edfc", 300: "#acbeca", 500: "#294355", 900: "#1c2b36" }, // Marketing › Color/Indigo
      seashell: { 100: "#fef1ed", 500: "#ff97a4", 900: "#926168" }, // Marketing › Color/Seashell
    },

    // ── Base ─────────────────────────────────────────────────
    white: "#ffffff", // _ColorPrimitives › White
    black: "#000000", // _ColorPrimitives › Black
  },

  // ──────────────────────────────────────────────────────────
  // TYPOGRAPHY
  // Source: Typography collection + Text styles
  // ──────────────────────────────────────────────────────────
  typography: {
    fontFamily: {
      sans: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", // Typography › font-family/font-family
      mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    },
    fontWeight: {
      regular:  400, // Typography › font-weight/regular
      medium:   500, // Typography › font-weight/medium
      semibold: 600, // Typography › font-weight/semibold
      bold:     700, // Typography › font-weight/bold
    },
    fontSize: {
      h1:        96, // Typography › font-size/h1
      h2:        60, // Typography › font-size/h2
      h3:        48, // Typography › font-size/h3
      h4:        34, // Typography › font-size/h4
      h5:        24, // Typography › font-size/h5
      h6:        20, // Typography › font-size/h6
      subtitle1: 16, // Typography › font-size/subtitle-1
      subtitle2: 16, // Typography › font-size/subtitle-2
      subtitle3: 18, // Typography › font-size/subtitle-3  (highlighted text)
      subtitle4: 18, // Typography › font-size/subtitle-4  (bold subtitles)
      body1:     16, // Typography › font-size/body-1
      body2:     14, // Typography › font-size/body-2
      caption:   12, // Typography › font-size/caption
      overline:  12, // Typography › font-size/overline
    },
    lineHeight: {
      h1: 1.167,   // standard MUI — matches DS scale
      h2: 1.2,
      h3: 1.167,
      h4: 1.235,
      h5: 1.334,
      h6: 1.6,
      subtitle1: 1.75,
      subtitle2: 1.57,
      body1: 1.5,
      body2: 1.43,
      caption: 1.66,
      overline: 2.66,
    },
    // Button text styles
    button: {
      small:  { fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }, // button/Text/ButtonText_Small
      medium: { fontSize: 14, fontWeight: 600, letterSpacing: "0.04em" }, // button/Text/ButtonText_Medium
    },
  },

  // ──────────────────────────────────────────────────────────
  // SPACING
  // Source: Spacing collection
  // ──────────────────────────────────────────────────────────
  spacing: {
    xs:  4,  // Spacing › XS
    s:   8,  // Spacing › S
    m:   16, // Spacing › M
    l:   24, // Spacing › L
    xl:  56, // Spacing › XL
  },

  // ──────────────────────────────────────────────────────────
  // BORDER RADIUS
  // Source: Radius collection
  // ──────────────────────────────────────────────────────────
  radii: {
    small:   4,   // Radius › Small
    medium:  8,   // Radius › Medium
    large:   16,  // Radius › Large
    rounded: 999, // Radius › Rounded (pill/chip)
  },

  // ──────────────────────────────────────────────────────────
  // SHADOWS / ELEVATION
  // Derived from DS backdrop color (#223648) and MUI elevation
  // ──────────────────────────────────────────────────────────
  shadows: {
    xs: "0 1px 2px rgba(34,54,72,0.04)",
    sm: "0 1px 2px rgba(34,54,72,0.06), 0 1px 1px rgba(34,54,72,0.04)",
    md: "0 4px 12px rgba(34,54,72,0.08), 0 2px 4px rgba(34,54,72,0.04)",
    lg: "0 12px 32px rgba(34,54,72,0.12), 0 4px 8px rgba(34,54,72,0.06)",
    xl: "0 24px 60px rgba(34,54,72,0.18)",
  },

  // ──────────────────────────────────────────────────────────
  // COMPONENT TOKENS
  // Source: componentSize collection + Color Tokens _components
  // ──────────────────────────────────────────────────────────
  components: {
    button: {
      paddingX:   12,  // componentSize › Padding-X
      paddingY:   4,   // componentSize › Padding-Y
      textSize:   12,  // componentSize › textSize
      radius:     4,   // Radius › Small
      // Variants (from semantic tokens)
      primary: {
        bg:           "#2d4ccd", // Color Tokens › Primary/Main
        hover:        "#2c49bf", // Color Tokens › Primary/Dark
        text:         "#ffffff", // Color Tokens › Contrast/On Dark
        disabledBg:   "#2d4ccd1f",
        disabledText: "#2d4ccd61",
      },
      secondary: {
        bg:    "#46bc9e", // Color Tokens › Secondary/Main
        hover: "#3a877c", // Color Tokens › Secondary/Dark
        text:  "#ffffff",
      },
      outlined: {
        border:      "#2121213b", // Color Tokens › _components/enabledBorder
        hoverBorder: "#212121",   // Color Tokens › _components/hoverBorder (Text/Primary)
      },
    },

    chip: {
      paddingX: 0,     // componentSize › chipPadding
      radius:   999,   // Radius › Rounded
      selectedBg: "#2d4ccd14", // Color Tokens › Primary/_states/selectedChip
    },

    input: {
      bg:            "#ffffff",   // Color Tokens › _components/input
      border:        "#2121213b", // Color Tokens › _components/enabledBorder
      hoverBorder:   "#212121",   // Color Tokens › _components/hoverBorder
      focusBorder:   "#2d4ccd",   // Color Tokens › Primary/Main
      radius:        4,           // Radius › Small
    },

    card: {
      bg:     "#ffffff",
      radius: 8,       // Radius › Medium
      border: "#cfd8dc", // Grey Blue/100
    },

    badge: {
      radius:  4,      // Radius › Small
      // Status badge colors (from semantic tokens)
      error:   { bg: "#ffebee", text: "#d32f2f", border: "#ef9a9a" },
      warning: { bg: "#fff3e0", text: "#ef6c00", border: "#ffcc80" },
      success: { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" },
      info:    { bg: "#e1f5fe", text: "#0288d1", border: "#81d4fa" },
      neutral: { bg: "#eceff1", text: "#455a64", border: "#b0bec5" },
    },

    tooltip: {
      bg:     "#223648e5", // Color Tokens › _components/tooltip
      text:   "#ffffff",
      radius: 4,
    },

    overlay: {
      backdrop: "#223648cc", // Color Tokens › _components/backdrop
    },

    // Focus ring (for accessibility)
    focus: {
      primary:   "#2d4ccd4d", // Color Tokens › Primary/_states/focusVisible
      secondary: "#46bc9e4d",
    },
  },
};

export default tokens;
