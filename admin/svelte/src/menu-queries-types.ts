/**
 * Type definitions for Menu Queries module
 */

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface MetaQuery {
  key: string;
  value: string;
  compare: string;
  type: string;
  clauseName: string;
}

export interface QueryConfig {
  queryType: 'post' | 'taxonomy';
  postType: string;
  taxonomy: string;
  orderBy: string;
  order: string;
  postCount: number;
  offset: number;
  childOf: number;
  includeChildren: boolean;
  hierarchical: boolean;
  showLabelOnEmpty: boolean;
  emptyLabel: string;
  includePosts: number[];
  excludePosts: number[];
  includeTerms: number[];
  excludeTerms: number[];
  includeTaxonomies: number[];
  excludeTaxonomies: number[];
  metaQueries: MetaQuery[];
  rawWPQuery?: string;
}

export interface MenuQueriesData {
  apiUrl: string;
  nonce: string;
  ajaxUrl: string;
  ajaxNonce: string;
  cacheTTL: number;
}

// Global WordPress data injected via wp_localize_script
declare global {
  interface Window {
    abMenuQueriesData: MenuQueriesData;
  }
}

export {};
