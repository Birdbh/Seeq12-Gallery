import { GithubRepo, GalleryMetadata } from '../types';

const ORG_NAME = 'seeq12';

// High quality fallback images from Unsplash
const IMAGES = {
  python: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', // Code/Matrix
  charts: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', // Data Viz
  industrial: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', // Factory/Industrial
  connector: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', // Network/Cloud
  default: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', // Abstract Tech
  docs: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80' // Coding/Docs
};

// Fallback images based on technology/topic
export const getFallbackImage = (repo: GithubRepo): string => {
  const topics = (repo.topics || []).join(' ').toLowerCase();
  const lang = (repo.language || '').toLowerCase();
  const name = repo.name.toLowerCase();

  if (name.includes('documentation') || topics.includes('docs')) return IMAGES.docs;
  if (topics.includes('python') || lang.includes('python') || topics.includes('spy')) return IMAGES.python;
  if (topics.includes('azure') || topics.includes('cloud') || name.includes('connector')) return IMAGES.connector;
  if (topics.includes('visualization') || name.includes('plot') || name.includes('chart')) return IMAGES.charts;
  if (topics.includes('industrial') || topics.includes('asset')) return IMAGES.industrial;
  
  return IMAGES.default;
};

// Function to fetch fork details (parent)
export const getRepoDetails = async (owner: string, repo: string) => {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn("Failed to fetch repo details", e);
    return null;
  }
};

// Function to find the first image in README
export const getReadmeImage = async (repo: GithubRepo): Promise<string | null> => {
  try {
    const branch = repo.default_branch || 'master';
    const rawUrl = `https://raw.githubusercontent.com/${repo.full_name}/${branch}/README.md`;
    const res = await fetch(rawUrl);
    if (!res.ok) return null;
    
    const text = await res.text();
    
    // 1. Try Markdown image syntax: ![alt](url)
    const mdRegex = /!\[.*?\]\((.*?)\)/;
    const mdMatch = text.match(mdRegex);
    if (mdMatch && mdMatch[1]) {
      return resolveRelativeUrl(mdMatch[1], repo.full_name, branch);
    }

    // 2. Try HTML image syntax: <img src="url">
    const htmlRegex = /<img[^>]+src=["']([^"']+)["']/;
    const htmlMatch = text.match(htmlRegex);
    if (htmlMatch && htmlMatch[1]) {
       return resolveRelativeUrl(htmlMatch[1], repo.full_name, branch);
    }

    return null;
  } catch (e) {
    return null;
  }
};

const resolveRelativeUrl = (url: string, repoFullName: string, branch: string) => {
  if (url.startsWith('http')) return url;
  // Handle relative paths
  const cleanPath = url.startsWith('./') ? url.slice(2) : url.startsWith('/') ? url.slice(1) : url;
  return `https://raw.githubusercontent.com/${repoFullName}/${branch}/${cleanPath}`;
};

// Manual Data from the existing Gallery page
const GALLERY_OVERRIDES: Record<string, GalleryMetadata> = {
  // --- OFFICIAL SEEQ ADD-ONS ---
  'correlation': {
    displayName: 'Correlation',
    category: 'First Party',
    section: 'official',
    documentationUrl: 'https://seeq12.github.io/gallery/addons/correlation/', 
    thumbnailUrl: 'https://github.com/seeq12/gallery/raw/master/addons/correlation/thumbnail.png', 
    extendedDescription: 'Analyze correlations and lags amongst time series signals. Perform offline cross correlation analysis and deploy in Seeq to monitor for correlation and/or lag changes.'
  },
  'seeq-correlation': { 
    displayName: 'Correlation',
    category: 'First Party',
    section: 'official',
    documentationUrl: 'https://seeq12.github.io/gallery/addons/correlation/',
    thumbnailUrl: 'https://github.com/seeq12/gallery/raw/master/addons/correlation/thumbnail.png',
    extendedDescription: 'Analyze correlations and lags amongst time series signals. Perform offline cross correlation analysis and deploy in Seeq to monitor for correlation and/or lag changes.'
  },
  'spy-ip': { 
    displayName: 'Multivariate Pattern Search (MPS)',
    category: 'First Party',
    section: 'official',
    documentationUrl: 'https://seeq12.github.io/gallery/addons/mps/',
    thumbnailUrl: IMAGES.charts,
    extendedDescription: 'Find similar or dissimilar periods for multivariate continuous and batch processes. Gain insights into key contributors and bad actors.'
  },
  'mps': {
    displayName: 'Multivariate Pattern Search (MPS)',
    category: 'First Party',
    section: 'official',
    documentationUrl: 'https://seeq12.github.io/gallery/addons/mps/',
    thumbnailUrl: IMAGES.charts,
    extendedDescription: 'Find similar or dissimilar periods for multivariate continuous and batch processes. Gain insights into key contributors and bad actors.'
  },
  'seeq-plot-curve': {
    displayName: 'Plot Curve',
    category: 'First Party',
    section: 'official',
    documentationUrl: 'https://seeq12.github.io/gallery/addons/plot-curve/',
    thumbnailUrl: IMAGES.charts,
    extendedDescription: 'Fit curves to tabular data and push resulting formulas to Seeq Workbench.'
  },
  'seeq-udf-ui': {
    displayName: 'User Defined Function (UDF) Editor',
    category: 'First Party',
    section: 'official',
    documentationUrl: 'https://seeq12.github.io/gallery/addons/udf-editor/',
    thumbnailUrl: IMAGES.python,
    extendedDescription: 'Create, edit, and manage user-defined formula functions in Seeq.'
  }
};

// Items that are NOT in the seeq12 repo but need to be listed
const THIRD_PARTY_ADDONS: GithubRepo[] = [
  {
    id: 9001,
    node_id: 'tp-1',
    name: 'visualization-toolbox',
    full_name: 'itvizion/visualization-toolbox',
    private: false,
    html_url: 'https://itvizion.com', 
    description: 'Visualizations supported presently include Pair Plot and Violin Plot.',
    fork: false,
    url: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    homepage: 'https://itvizion.com/docs/viz-toolbox',
    size: 0,
    stargazers_count: 0,
    watchers_count: 0,
    language: 'Tool',
    has_issues: false,
    has_projects: false,
    has_downloads: false,
    has_wiki: false,
    has_pages: false,
    forks_count: 0,
    archived: false,
    disabled: false,
    open_issues_count: 0,
    default_branch: 'main',
    license: { key: 'proprietary', name: 'Proprietary', spdx_id: 'Proprietary', url: '', node_id: '' },
    topics: ['visualization', 'third-party', 'premium'],
    owner: { login: 'IT Vizion', avatar_url: '' },
    galleryMetadata: {
      displayName: 'Visualization Toolbox',
      category: 'Third Party',
      section: 'third-party',
      developer: 'IT Vizion, Inc.',
      isPremium: true,
      licenseUrl: 'https://itvizion.com/eula/',
      documentationUrl: 'https://itvizion.com/docs/viz-toolbox',
      supportUrl: 'https://support.itvizion.com',
      thumbnailUrl: IMAGES.charts,
      extendedDescription: 'Introducing the Visualization Toolbox Add-on from IT Vizion, Inc. Visualizations supported presently include Pair Plot and Violin Plot. The interactive Pair Plot enables users to explore relationships between two variables and identify trends, patterns, and outliers with the assistance of a modal filter.'
    }
  },
  {
    id: 9002,
    node_id: 'tp-2',
    name: 'asset-tree-manager',
    full_name: 'itvizion/asset-tree-manager',
    private: false,
    html_url: 'https://itvizion.com',
    description: 'Streamline and scale your industrial analytics with structured asset hierarchies.',
    fork: false,
    url: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    homepage: 'https://itvizion.com/docs/atm',
    size: 0,
    stargazers_count: 0,
    watchers_count: 0,
    language: 'Tool',
    has_issues: false,
    has_projects: false,
    has_downloads: false,
    has_wiki: false,
    has_pages: false,
    forks_count: 0,
    archived: false,
    disabled: false,
    open_issues_count: 0,
    default_branch: 'main',
    license: { key: 'proprietary', name: 'Proprietary', spdx_id: 'Proprietary', url: '', node_id: '' },
    topics: ['asset-management', 'third-party', 'premium'],
    owner: { login: 'IT Vizion', avatar_url: '' },
    galleryMetadata: {
      displayName: 'IT Vizion Asset Tree Manager',
      category: 'Third Party',
      section: 'third-party',
      developer: 'IT Vizion, Inc.',
      isPremium: true,
      licenseUrl: 'https://itvizion.com/eula/',
      documentationUrl: 'https://itvizion.com/docs/atm',
      supportUrl: 'https://support.itvizion.com',
      thumbnailUrl: IMAGES.industrial,
      extendedDescription: 'Streamline and scale your industrial analytics with structured asset hierarchies purpose-built for Seeq. This add-on enables users to automatically build, visualize, and manage asset trees, linking data sources and contextual metadata with minimal manual effort.'
    }
  }
];

// Fallback data
const MOCK_REPOS: GithubRepo[] = [
  {
    id: 1,
    node_id: '1',
    name: 'seeq-python',
    full_name: 'seeq12/seeq-python',
    private: false,
    html_url: 'https://github.com/seeq12/seeq-python',
    description: 'The official Python SDK for Seeq Server.',
    fork: false,
    url: '',
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2023-10-25T00:00:00Z',
    pushed_at: '2023-10-25T00:00:00Z',
    homepage: null,
    size: 5000,
    stargazers_count: 45,
    watchers_count: 45,
    language: 'Python',
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: true,
    has_pages: false,
    forks_count: 20,
    archived: false,
    disabled: false,
    open_issues_count: 5,
    default_branch: 'master',
    license: { key: 'apache-2.0', name: 'Apache License 2.0', spdx_id: 'Apache-2.0', url: '', node_id: '' },
    topics: ['sdk', 'data-science'],
    owner: { login: 'seeq12', avatar_url: '' }
  }
];

export const fetchSeeqRepos = async (): Promise<GithubRepo[]> => {
  let repos: GithubRepo[] = [];
  
  try {
    const response = await fetch(`https://api.github.com/users/${ORG_NAME}/repos?per_page=100&sort=updated`);
    if (!response.ok) {
      repos = MOCK_REPOS;
    } else {
      repos = await response.json();
    }
  } catch (error) {
    repos = MOCK_REPOS;
  }

  // Enhance repos
  const enhancedRepos = repos.map(repo => {
    // Correct Documentation links if missing but has pages
    if (repo.has_pages && !repo.homepage) {
        // Construct standard GitHub Pages URL
        repo.homepage = `https://${repo.owner.login}.github.io/${repo.name}/`;
    }

    // Try exact match or match inside the name
    const matchKey = Object.keys(GALLERY_OVERRIDES).find(key => 
      repo.name.toLowerCase() === key || repo.name.toLowerCase() === `seeq-${key}`
    );
    
    if (matchKey) {
      const override = GALLERY_OVERRIDES[matchKey];
      return {
        ...repo,
        galleryMetadata: override
      };
    }
    
    // Default to 'community' section if not manually overridden
    return {
      ...repo,
      galleryMetadata: {
        category: 'First Party' as const,
        section: 'community' as const
      }
    };
  });

  // Filter out any duplicates
  const uniqueEnhanced = enhancedRepos.filter(r => !THIRD_PARTY_ADDONS.some(tp => tp.name === r.name));

  const allRepos = [...uniqueEnhanced, ...THIRD_PARTY_ADDONS];

  // Sort by updated
  return allRepos.sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
};