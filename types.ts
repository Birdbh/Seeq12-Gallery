// GitHub API Types
export interface GalleryMetadata {
  displayName?: string;
  category: 'First Party' | 'Third Party';
  section: 'official' | 'third-party' | 'community';
  developer?: string;
  isPremium?: boolean;
  licenseUrl?: string;
  documentationUrl?: string;
  supportUrl?: string;
  extendedDescription?: string;
  thumbnailUrl?: string;
}

export interface GithubRepo {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
    node_id: string;
  } | null;
  topics: string[];
  default_branch: string; // Added for Raw content access
  owner: {
    login: string;
    avatar_url: string;
  };
  parent?: { // Added for Fork details
    full_name: string;
    html_url: string;
  };
  // Extended field for the Enhanced Gallery
  galleryMetadata?: GalleryMetadata;
}

export interface EnhancedAddonDetails {
  repoId: number;
  aiSummary: string;
  useCases: string[];
  technicalComplexity: 'Low' | 'Medium' | 'High';
  businessValue: string;
}

export enum ViewMode {
  GRID = 'GRID',
  LIST = 'LIST'
}

export enum SortOption {
  UPDATED = 'Last Updated',
  STARS = 'Stars',
  NAME = 'Name'
}