import { useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { theme as defaultTheme } from "@/theme/config";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Upload, Eye } from "lucide-react";

type ThemeColors = typeof defaultTheme.colors;
type ThemeFonts = typeof defaultTheme.fonts;

const FONT_PAIRINGS: { label: string; heading: string; body: string }[] = [
  { label: "Playfair Display + Inter", heading: "Playfair Display", body: "Inter" },
  { label: "Lora + DM Sans", heading: "Lora", body: "DM Sans" },
  { label: "Merriweather + Nunito", heading: "Merriweather", body: "Nunito" },
  { label: "DM Serif Display + Work Sans", heading: "DM Serif Display", body: "Work Sans" },
  { label: "Cormorant Garamond + Karla", heading: "Cormorant Garamond", body: "Karla" },
  { label: "Libre Baskerville + Source Sans 3", heading: "Libre Baskerville", body: "Source Sans 3" },
];

const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  background: "Background",
  primary: "Primary (Mauve)",
  secondary: "Secondary (Forest Green)",
  card: "Card Background",
  text: "Text Color",
  positive: "Positive / Warm",
  warning: "Warning",
  error: "Error",
  border: "Border",
};

const ThemeEditor = () => {
  const [colors, setColors] = useState<ThemeColors>({ ...defaultTheme.colors });
  const [fonts, setFonts] = useState<{ heading: string; body: string }>({ ...defaultTheme.fonts });
  const [brandName, setBrandName] = useState<string>(defaultTheme.brand.name);
  const [tagline, setTagline] = useState<string>(defaultTheme.brand.tagline);
  const [logoSrc, setLogoSrc] = useState<string>(defaultTheme.logo.src);
  const [selectedPairing, setSelectedPairing] = useState("Playfair Display + Inter");

  const handleColorChange = useCallback((key: keyof ThemeColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleFontPairingChange = useCallback((label: string) => {
    const pairing = FONT_PAIRINGS.find((p) => p.label === label);
    if (pairing) {
      setFonts({ heading: pairing.heading, body: pairing.body });
      setSelectedPairing(label);
    }
  }, []);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoSrc(url);
  }, []);

  const exportTheme = () => {
    const themeFile = `export const theme = {
  colors: {
${Object.entries(colors)
  .map(([k, v]) => `    ${k}: '${v}',`)
  .join("\n")}
  },
  fonts: {
    heading: '${fonts.heading}',
    body: '${fonts.body}',
  },
  radius: {
    card: '${defaultTheme.radius.card}',
    button: '${defaultTheme.radius.button}',
    input: '${defaultTheme.radius.input}',
  },
  logo: {
    src: '${logoSrc.startsWith("blob:") ? "/april-logo.png" : logoSrc}',
    alt: '${brandName} logo',
    width: ${defaultTheme.logo.width},
  },
  brand: {
    name: '${brandName}',
    tagline: '${tagline}',
  },
} as const;

export type Theme = typeof theme;
`;

    const blob = new Blob([themeFile], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.ts";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout showFooter={false}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1
            className="text-3xl sm:text-4xl font-bold text-foreground"
            style={{ fontFamily: `"${fonts.heading}", serif` }}
          >
            Theme Editor
          </h1>
          <p
            className="mt-2 text-sm text-muted-foreground"
            style={{ fontFamily: `"${fonts.body}", sans-serif` }}
          >
            This panel is for team use only — not linked in the public app.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            {/* Colors */}
            <Card
              className="border border-border bg-card"
              style={{ borderRadius: defaultTheme.radius.card }}
            >
              <CardContent className="p-6">
                <h3 className="font-heading text-lg font-bold text-foreground mb-4">
                  Colors
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(Object.keys(COLOR_LABELS) as (keyof ThemeColors)[]).map((key) => (
                    <div key={key} className="space-y-1.5">
                      <Label className="font-body text-sm text-foreground">
                        {COLOR_LABELS[key]}
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={colors[key]}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                          style={{ borderRadius: defaultTheme.radius.input }}
                          aria-label={`Pick color for ${COLOR_LABELS[key]}`}
                        />
                        <Input
                          value={colors[key]}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="flex-1 font-mono text-sm"
                          style={{ borderRadius: defaultTheme.radius.input }}
                          aria-label={`Hex value for ${COLOR_LABELS[key]}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fonts */}
            <Card
              className="border border-border bg-card"
              style={{ borderRadius: defaultTheme.radius.card }}
            >
              <CardContent className="p-6">
                <h3 className="font-heading text-lg font-bold text-foreground mb-4">
                  Font Pairing
                </h3>
                <Select value={selectedPairing} onValueChange={handleFontPairingChange}>
                  <SelectTrigger
                    style={{ borderRadius: defaultTheme.radius.input }}
                    aria-label="Select font pairing"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_PAIRINGS.map((p) => (
                      <SelectItem key={p.label} value={p.label}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-3 font-body text-xs text-muted-foreground">
                  Heading: <strong>{fonts.heading}</strong> · Body:{" "}
                  <strong>{fonts.body}</strong>
                </p>
              </CardContent>
            </Card>

            {/* Brand */}
            <Card
              className="border border-border bg-card"
              style={{ borderRadius: defaultTheme.radius.card }}
            >
              <CardContent className="p-6 space-y-4">
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                  Brand
                </h3>
                <div className="space-y-1.5">
                  <Label htmlFor="brand-name" className="font-body text-sm text-foreground">
                    Brand Name
                  </Label>
                  <Input
                    id="brand-name"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    style={{ borderRadius: defaultTheme.radius.input }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tagline" className="font-body text-sm text-foreground">
                    Tagline
                  </Label>
                  <Input
                    id="tagline"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    style={{ borderRadius: defaultTheme.radius.input }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-body text-sm text-foreground">Logo</Label>
                  <label
                    className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-border rounded-lg text-sm font-body text-foreground hover:bg-muted transition-colors w-fit"
                    style={{ borderRadius: defaultTheme.radius.button }}
                  >
                    <Upload size={16} />
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Export */}
            <Button
              variant="hero"
              size="xl"
              className="w-full font-heading text-lg gap-2"
              onClick={exportTheme}
            >
              <Download size={18} />
              Export Theme
            </Button>
          </div>

          {/* Live Preview */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={18} className="text-muted-foreground" />
              <span className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Live Preview
              </span>
            </div>

            <div
              className="rounded-xl border border-border overflow-hidden"
              style={{
                background: colors.background,
                borderRadius: defaultTheme.radius.card,
              }}
            >
              {/* Preview Navbar */}
              <div
                className="px-6 py-4 border-b flex items-center gap-3"
                style={{ borderColor: colors.border, background: colors.card }}
              >
                <img
                  src={logoSrc}
                  alt="Logo preview"
                  className="rounded-md"
                  style={{ width: defaultTheme.logo.width, height: defaultTheme.logo.width }}
                />
                <span
                  className="text-lg font-bold"
                  style={{
                    fontFamily: `"${fonts.heading}", serif`,
                    color: colors.secondary,
                  }}
                >
                  {brandName}
                </span>
              </div>

              {/* Preview Content */}
              <div className="p-6 space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: `"${fonts.heading}", serif`,
                    color: colors.text,
                  }}
                >
                  Your personal debt picture.
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: `"${fonts.body}", sans-serif`,
                    color: colors.text,
                    opacity: 0.6,
                  }}
                >
                  {tagline}
                </p>

                {/* Sample card */}
                <div
                  className="p-5 border"
                  style={{
                    background: colors.card,
                    borderColor: colors.border,
                    borderRadius: defaultTheme.radius.card,
                    boxShadow: "0 2px 12px 0 hsla(30, 20%, 50%, 0.08)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: colors.primary }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: `"${fonts.body}", sans-serif`,
                        color: colors.text,
                      }}
                    >
                      Chase Freedom Card
                    </span>
                  </div>
                  <p
                    className="text-xs"
                    style={{
                      fontFamily: `"${fonts.body}", sans-serif`,
                      color: colors.text,
                      opacity: 0.5,
                    }}
                  >
                    $4,200 · 24.99% APR · $85/mo minimum
                  </p>
                </div>

                {/* Sample buttons */}
                <div className="flex gap-3">
                  <button
                    className="px-5 py-2.5 text-sm font-semibold"
                    style={{
                      fontFamily: `"${fonts.heading}", serif`,
                      background: colors.primary,
                      color: "#FFFFFF",
                      borderRadius: defaultTheme.radius.button,
                    }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-5 py-2.5 text-sm font-semibold border"
                    style={{
                      fontFamily: `"${fonts.body}", sans-serif`,
                      borderColor: colors.border,
                      color: colors.text,
                      background: "transparent",
                      borderRadius: defaultTheme.radius.button,
                    }}
                  >
                    Outline
                  </button>
                </div>

                {/* Color swatches */}
                <div className="flex gap-2 mt-2">
                  {Object.entries(colors).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <div
                        className="w-8 h-8 rounded-full border border-border"
                        style={{ background: val }}
                        title={key}
                      />
                      <span
                        className="text-[9px] mt-1 block"
                        style={{
                          fontFamily: `"${fonts.body}", sans-serif`,
                          color: colors.text,
                          opacity: 0.5,
                        }}
                      >
                        {key}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ThemeEditor;
