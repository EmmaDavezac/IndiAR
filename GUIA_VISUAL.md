# GUIA_VISUAL.md - Guía Visual de IndiAR

> **Esta es la autoridad suprema sobre colores, tipografía, espaciado, componentes y interacciones.**
> Todos los equipos (humanos y agentes de IA) deben seguir estas directrices en todas las decisiones de UI/UX.

## 1. Identidad Visual Argentina

### 1.2. Tipografía

### 1.2.1. Familia de Fuente

```css
font-family: var(--font-base), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
```

### 1.2.2. Tamaños de Fuente Escalados

| Variable | Tamaño | Uso |
|----------|--------|-----|
| `--font-size-xs` | 0.75rem (12px) | Texto auxiliar, metadatos |
| `--font-size-sm` | 0.875rem (14px) | Etiquetas de form, ayuda |
| `--font-size-md` | 1rem (16px) | Texto corporal por defecto |
| `--font-size-lg` | 1.125rem (18px) | Títulos grandes, highlights |

### 1.2.3. Peso de Fuente

- `--font-weight-normal`: 400 (normal)
- `--font-weight-medium`: 500 (medio)
- `--font-weight-bold`: 700 (negrita)
```

## 3. Sistema de Espaciado

Utilizar siempre múltiplos de 4px (4pts system). Las variables están definidas como:

| Variable | Valor | Uso |
|----------|-------|-----|
| `--space-xs` | 0.25rem (4px) | Entre líneas de texto, padding mínimo |
| `--space-sm` | 0.5rem (8px) | Entre campos de form, márgenes pequeños |
| `--space-md` | 1rem (16px) | Espaciado estándar entre secciones |
| `--space-lg` | 1.5rem (24px) | Márgenes de sección, padding de cards |
| `--space-xl` | 3rem (48px) | Márgenes de página, separación entre grandes grupos |

**Nunca** usar valores impares o px puros sin usar las variables.