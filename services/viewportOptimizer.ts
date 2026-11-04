import { StudioSplitRatio, WorkspaceLayoutMode } from '../types';

export type ScreenProfileTier =
  | 'ULTRAWIDE_4K'
  | 'DESKTOP_WIDESCREEN'
  | 'LAPTOP_COMPACT'
  | 'TABLET_TOUCH'
  | 'MOBILE_PORTRAIT';

export type HudDensityMode = 'AUTO' | 'FOCUS_MINIMAL' | 'BALANCED' | 'FULL_COMMAND';

export type WorkspacePresetId =
  | 'AUTO_TIER'
  | 'GRAPH_CINEMA'
  | 'DUAL_COCKPIT'
  | 'COMMAND_WALL';

export interface WorkspacePresetSpec {
  id: WorkspacePresetId;
  label: string;
  shortLabel: string;
  description: string;
  layoutMode?: WorkspaceLayoutMode;
  splitRatio?: StudioSplitRatio;
  hudDensity: HudDensityMode;
  defaultScaleOffset: number;
}

export const WORKSPACE_PRESET_SPECS: WorkspacePresetSpec[] = [
  {
    id: 'AUTO_TIER',
    label: 'Auto Screen Tier',
    shortLabel: 'Auto Tier',
    description:
      'Automatically adapts optical scale, split-pane balance, and HUD drawer folding to your current screen tier.',
    hudDensity: 'AUTO',
    defaultScaleOffset: 0
  },
  {
    id: 'GRAPH_CINEMA',
    label: 'Deep Graph Cinema',
    shortLabel: 'Cinema',
    description:
      'Full-bleed 100% spatial graph canvas with compact 95% single-line HUD pills and maximum safe-area framing.',
    layoutMode: 'GRAPH_ONLY',
    hudDensity: 'FOCUS_MINIMAL',
    defaultScaleOffset: -0.05
  },
  {
    id: 'DUAL_COCKPIT',
    label: 'Balanced Dual-Cockpit',
    shortLabel: 'Dual Cockpit',
    description:
      'Synchronized Spatial Graph + Creative Studio split (65/35 on laptops, 50/50 on desktop/ultrawide) with docked HUDs.',
    layoutMode: 'SPLIT_STUDIO',
    splitRatio: 'GRAPH_WIDE_65_35',
    hudDensity: 'BALANCED',
    defaultScaleOffset: 0
  },
  {
    id: 'COMMAND_WALL',
    label: 'Telemetry Command Wall',
    shortLabel: 'Command Wall',
    description:
      'Full analytical workstation posture with expanded Continents, Biomimetic Plasticity, Legend, and Telemetry Matrix.',
    layoutMode: 'GRAPH_ONLY',
    hudDensity: 'FULL_COMMAND',
    defaultScaleOffset: 0.04
  }
];

export const OPTICAL_SCALE_STEPS: Array<{ value: number; label: string; tag: string }> = [
  { value: 0.9, label: '90%', tag: 'Compact' },
  { value: 0.95, label: '95%', tag: 'Refined' },
  { value: 1.0, label: '100%', tag: 'Native' },
  { value: 1.05, label: '105%', tag: 'Comfort' },
  { value: 1.1, label: '110%', tag: 'Large' }
];

export interface SafeViewportInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ScreenOptimizationProfile {
  width: number;
  height: number;
  dpr: number;
  aspectRatio: number;
  tier: ScreenProfileTier;
  tierLabel: string;
  isTouchPrimary: boolean;
  isPortrait: boolean;
  uiScale: number;
  effectiveUiScale: number;
  isManualScaleOverride: boolean;
  activePreset: WorkspacePresetId;
  recommendedSplitRatio: StudioSplitRatio;
  recommendedLayoutMode: WorkspaceLayoutMode;
  physicsScaleFactor: number;
  recommendedContinentSeparation: number;
  recommendedChargeStrength: number;
  recommendedLinkDistance: number;
  autoCollapseSecondaryHud: boolean;
  compactHeader: boolean;
  compactFooter: boolean;
  safeInsets: SafeViewportInsets;
}

export function detectScreenOptimizationProfile(
  width: number,
  height: number,
  dpr: number = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
  densityMode: HudDensityMode = 'AUTO',
  hasSelectedNode: boolean = false,
  studioOpen: boolean = false,
  activePreset: WorkspacePresetId = 'AUTO_TIER',
  opticalScaleOverride: number | null = null
): ScreenOptimizationProfile {
  const safeW = Math.max(320, width);
  const safeH = Math.max(320, height);
  const aspectRatio = Number((safeW / safeH).toFixed(2));
  const isPortrait = safeH > safeW;
  const isTouchPrimary =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches;

  let tier: ScreenProfileTier = 'DESKTOP_WIDESCREEN';
  let tierLabel = 'Desktop Widescreen';

  if (safeW >= 1920 && safeH >= 950) {
    tier = 'ULTRAWIDE_4K';
    tierLabel = 'Ultrawide / 4K Command';
  } else if (safeW >= 1440 && safeH >= 800) {
    tier = 'DESKTOP_WIDESCREEN';
    tierLabel = 'Desktop HD';
  } else if (safeW >= 1024) {
    tier = 'LAPTOP_COMPACT';
    tierLabel = 'Laptop / Compact Desktop';
  } else if (safeW >= 768) {
    tier = 'TABLET_TOUCH';
    tierLabel = 'Tablet Viewport';
  } else {
    tier = 'MOBILE_PORTRAIT';
    tierLabel = 'Mobile Viewport';
  }

  // Calculate normalized diagonal relative to a 1440x900 baseline (diag ~ 1698px)
  const baselineDiag = 1698;
  const currentDiag = Math.hypot(safeW, safeH);
  const rawScale = currentDiag / baselineDiag;
  const physicsScaleFactor = Number(Math.max(0.58, Math.min(1.35, rawScale)).toFixed(2));

  // Base automatic UI Optical Scale per screen tier
  let uiScale = 1.0;
  if (tier === 'MOBILE_PORTRAIT') uiScale = 0.88;
  else if (tier === 'TABLET_TOUCH') uiScale = 0.92;
  else if (tier === 'LAPTOP_COMPACT') uiScale = safeH < 780 ? 0.93 : 0.96;
  else if (tier === 'DESKTOP_WIDESCREEN') uiScale = 1.0;
  else if (tier === 'ULTRAWIDE_4K') uiScale = 1.05;

  const presetSpec =
    WORKSPACE_PRESET_SPECS.find(p => p.id === activePreset) || WORKSPACE_PRESET_SPECS[0];

  const isManualScaleOverride = typeof opticalScaleOverride === 'number';
  const computedAutoScale = Number(
    Math.max(0.85, Math.min(1.12, uiScale + presetSpec.defaultScaleOffset)).toFixed(2)
  );
  const effectiveUiScale = isManualScaleOverride
    ? Number(Math.max(0.85, Math.min(1.15, opticalScaleOverride as number)).toFixed(2))
    : computedAutoScale;

  // Recommended split-pane ratio & layout mode per tier + active preset
  const recommendedSplitRatio: StudioSplitRatio =
    tier === 'ULTRAWIDE_4K' || tier === 'DESKTOP_WIDESCREEN'
      ? 'BALANCED_50_50'
      : 'GRAPH_WIDE_65_35';

  const recommendedLayoutMode: WorkspaceLayoutMode =
    presetSpec.layoutMode || (studioOpen ? 'SPLIT_STUDIO' : 'GRAPH_ONLY');

  // Decide whether secondary HUD drawers should auto-collapse to preserve canvas breathing room
  const effectiveDensityMode: HudDensityMode =
    activePreset !== 'AUTO_TIER' && densityMode === 'AUTO'
      ? presetSpec.hudDensity
      : densityMode;

  const autoCollapseSecondaryHud =
    effectiveDensityMode === 'FOCUS_MINIMAL' ||
    (effectiveDensityMode === 'AUTO' &&
      (tier === 'MOBILE_PORTRAIT' ||
        tier === 'TABLET_TOUCH' ||
        tier === 'LAPTOP_COMPACT' ||
        studioOpen ||
        safeH < 860));

  const compactHeader = safeW < 1480 || studioOpen;
  const compactFooter = safeW < 1280;

  // Compute unobstructed safe-area insets inside the Graph canvas scaled by effectiveUiScale
  const effectiveGraphWidth = studioOpen ? safeW * 0.55 : safeW;
  const topInset = (safeW < 768 ? 80 : 94) * effectiveUiScale;
  const bottomInset = (autoCollapseSecondaryHud ? 54 : 108) * effectiveUiScale;
  const leftInset =
    (autoCollapseSecondaryHud || effectiveGraphWidth < 1100 ? 28 : 316) * effectiveUiScale;
  const rightInset =
    hasSelectedNode && !studioOpen
      ? Math.min(440 * effectiveUiScale, effectiveGraphWidth * 0.38)
      : (autoCollapseSecondaryHud ? 28 : 276) * effectiveUiScale;

  return {
    width: safeW,
    height: safeH,
    dpr: Number(dpr.toFixed(2)),
    aspectRatio,
    tier,
    tierLabel,
    isTouchPrimary,
    isPortrait,
    uiScale,
    effectiveUiScale,
    isManualScaleOverride,
    activePreset,
    recommendedSplitRatio,
    recommendedLayoutMode,
    physicsScaleFactor,
    recommendedContinentSeparation: Math.round(320 * physicsScaleFactor),
    recommendedChargeStrength: Math.round(-620 * physicsScaleFactor),
    recommendedLinkDistance: Math.round(88 * physicsScaleFactor),
    autoCollapseSecondaryHud,
    compactHeader,
    compactFooter,
    safeInsets: {
      top: Math.round(topInset),
      right: Math.round(rightInset),
      bottom: Math.round(bottomInset),
      left: Math.round(leftInset)
    }
  };
}
