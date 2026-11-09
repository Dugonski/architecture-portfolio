export type Language = 'pt' | 'en';

/** A string available in every supported language. */
export type Localized = Record<Language, string>;

export type Vec3 = [number, number, number];

export type ProjectCategory = 'residential' | 'commercial' | 'institutional';

/**
 * A selectable part of a model (room, area, piece of furniture...).
 *
 * Triangles are assigned to a zone when they belong to one of the listed
 * glTF node/mesh names, or when all their vertices lie inside one of the
 * boxes. Zones are evaluated in order: the first match wins.
 */
export interface ModelZone {
  id: string;
  name: Localized;
  description: Localized;
  /** Floor area in square meters, shown in the info card. */
  area?: number;
  /** Names of glTF nodes or meshes that belong to this zone. */
  nodes?: string[];
  /** Axis-aligned boxes in model coordinates (meters). */
  boxes?: { min: Vec3; max: Vec3 }[];
}

export interface ProjectModel {
  url: string;
  zones: ModelZone[];
}

export interface ProjectImage {
  src: string;
  caption: Localized;
  /** Spans the full row in multi-column layouts (very wide drawings). */
  wide?: boolean;
}

/** A joinery detail sheet (prancha de marcenaria). */
export interface DetailSheet {
  code: string;
  title: Localized;
  room: Localized;
  src: string;
}

export interface Material {
  swatch: string;
  name: Localized;
  application: Localized;
}

/** A tool used in the project and what it was used for. */
export interface ProjectTool {
  name: string;
  use: Localized;
}

export interface Project {
  slug: string;
  title: Localized;
  category: ProjectCategory;
  summary: Localized;
  description: Localized;
  /** Floor area in square meters, when known. */
  area?: number;
  year?: number;
  tools: ProjectTool[];
  cover: string;
  renders: ProjectImage[];
  /** Floor plans and elevations; the first one is the main floor plan. */
  plans: ProjectImage[];
  /**
   * `side`: portrait floor plan with the other drawings stacked beside it.
   * `stacked`: landscape floor plan with the other drawings in a grid below.
   */
  planLayout?: 'side' | 'stacked';
  isometric: ProjectImage[];
  details: DetailSheet[];
  materials: Material[];
  model?: ProjectModel;
}
