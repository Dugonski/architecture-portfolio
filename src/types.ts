export type Language = 'pt' | 'en';

/** A string available in every supported language. */
export type Localized = Record<Language, string>;

export type Vec3 = [number, number, number];

export type ProjectCategory = 'residential' | 'commercial' | 'institutional' | 'interiors';

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

export interface GalleryImage {
  src: string;
  kind: 'photo' | 'render' | 'plan';
  caption: Localized;
}

export interface Project {
  slug: string;
  title: Localized;
  category: ProjectCategory;
  year: number;
  location: Localized;
  /** Built area in square meters. */
  area: number;
  status: Localized;
  summary: Localized;
  description: Localized[];
  cover: string;
  gallery: GalleryImage[];
  model?: ProjectModel;
}
