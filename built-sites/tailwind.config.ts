import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core Brand Colors
        primary: {
          DEFAULT: "hsl(var(--primary))",
          dark: "hsl(var(--primary-dark))",
          light: "hsl(var(--primary-light))",
          foreground: "hsl(var(--foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          dark: "hsl(var(--secondary-dark))",
          light: "hsl(var(--secondary-light))",
          foreground: "hsl(var(--foreground))",
        },

        // Terminal Colors
        terminal: {
          bg: "hsl(var(--terminal-bg))",
          text: "hsl(var(--terminal-text))",
          comment: "hsl(var(--terminal-comment))",
          keyword: "hsl(var(--terminal-keyword))",
          string: "hsl(var(--terminal-string))",
          error: "hsl(var(--terminal-error))",
          warning: "hsl(var(--terminal-warning))",
        },

        // Accent Colors
        accent: {
          purple: "hsl(var(--accent-purple))",
          orange: "hsl(var(--accent-orange))",
          pink: "hsl(var(--accent-pink))",
          cyan: "hsl(var(--accent-cyan))",
        },

        // Background System
        background: {
          DEFAULT: "hsl(var(--background))",
          dark: "hsl(var(--background-dark))",
          elevated: "hsl(var(--background-elevated))",
          overlay: "hsl(var(--background-overlay))",
        },

        // Surface System
        surface: {
          DEFAULT: "hsl(var(--surface))",
          hover: "hsl(var(--surface-hover))",
          active: "hsl(var(--surface-active))",
          border: "hsl(var(--surface-border))",
        },

        // Text System
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          secondary: "hsl(var(--foreground-secondary))",
          muted: "hsl(var(--foreground-muted))",
          disabled: "hsl(var(--foreground-disabled))",
        },

        // Status Colors
        success: {
          DEFAULT: "hsl(var(--success))",
          bg: "hsl(var(--success-bg))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          bg: "hsl(var(--warning-bg))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          bg: "hsl(var(--error-bg))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          bg: "hsl(var(--info-bg))",
        },

        // Code Syntax Colors
        code: {
          bg: "hsl(var(--code-bg))",
          text: "hsl(var(--code-text))",
          comment: "hsl(var(--code-comment))",
          keyword: "hsl(var(--code-keyword))",
          string: "hsl(var(--code-string))",
          number: "hsl(var(--code-number))",
          function: "hsl(var(--code-function))",
          variable: "hsl(var(--code-variable))",
          constant: "hsl(var(--code-constant))",
        },

        // shadcn/ui compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      animation: {
        "slide-in-down":
          "slideInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-left":
          "slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-right":
          "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-up": "slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-scale":
          "fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-blur":
          "fade-in-blur 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "glow-border": "glowing-border-trace 4s linear infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
      },

      boxShadow: {
        "glow-primary": "0 0 20px hsla(var(--primary), 0.3)",
        "glow-secondary": "0 0 20px hsla(var(--secondary), 0.3)",
        "glow-error": "0 0 20px hsla(var(--error), 0.3)",
        "glow-success": "0 0 20px hsla(var(--success), 0.3)",
        "glow-terminal": "0 0 20px hsla(var(--terminal-text), 0.2)",
      },

      backdropBlur: {
        xs: "2px",
      },

      transitionTimingFunction: {
        "bounce-out": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        "smooth-fast": "cubic-bezier(0.4, 0, 0.6, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
