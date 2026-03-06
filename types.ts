


export interface CampaignMetadata {
  clientName: string;
  campaignName: string;
  hashtag: string[];
  linkedinMention: string[];
  startDate: string;
  endDate: string;
  coverNote?: string; // New field for extra cover slide text
}

export interface ResourceLinks {
  mainDriveFolder: string;
  mainDriveFolder_visible?: boolean;
  top20XDriveLink: string;
  top20XDriveLink_visible?: boolean;
  visualsDriveLink: string;
  visualsDriveLink_visible?: boolean;
  shortsDriveLink: string;
  shortsDriveLink_visible?: boolean;
  brandwatchDriveLink: string;
  brandwatchDriveLink_visible?: boolean;
  youtubeLinks: { id: string; url: string; title: string }[];
  articleLinks: { id: string; url: string; title: string; caption: string }[];
  additionalMedia: string;
}

export interface SocialPost {
  id: string;
  title: string;
  platform: 'X' | 'LinkedIn';
  author?: string;
  date?: string;
  reach?: string;
  impressions?: string;
  views?: string; // Added views
  engagement?: string;
  engagements?: string;
  reactions?: string;
  clicks?: string;
  comments?: string;
  reposts?: string;
  engagementRate?: string;
  link: string;
  proofImage?: string; // base64 string
  contentType?: string;
}

export interface ArticleInfo {
  id: string;
  title: string;
  caption: string;
  link: string;
  proofImage?: string;
  date?: string;
}

export interface VideoInfo {
  id: string;
  type: 'interview' | 'collateral';
  title: string;
  link: string;
  thumbnail?: string;
  driveLink?: string;
  linkedinLink?: string;
  xLink?: string;
  extraLinks?: { type: 'linkedin' | 'x' | 'drive'; url: string }[]; // New: Multiple links
  base64Video?: string;
}

export interface CustomSlide {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  type: 'text' | 'link' | 'file'; // Legacy
  template: 'default' | 'executive' | 'grid' | 'comparison' | 'executive-snapshot' | 'top-posts'; // New Template Types
  link?: string; // Legacy
  linkText?: string; // Legacy
  fileData?: string; // Legacy single image
  
  // New Enhanced Fields
  bullets?: { text: string; link?: string; icon?: string }[];
  buttons?: { text: string; link: string }[];
  images?: { url: string; caption?: string }[];
  videos?: { 
    url: string; 
    title?: string;
    extraLinks?: { type: 'linkedin' | 'x' | 'drive'; url: string }[]; // New: Video support in custom slides with links
  }[]; 
  posts?: SocialPost[]; // New: For duplicating post lists
  comparisonData?: {
    headers: string[];
    rows: { label: string; values: (string | number)[]; isHeader?: boolean; hidden?: boolean }[];
  };
  metricsData?: { label: string; value: string; icon: string; color: string; group?: string }[];
}

export interface SlideConfig {
  id: string;
  label: string;
  enabled: boolean;
}

export interface ReportData {
  categoryId?: string;
  metadata: CampaignMetadata;
  resources: ResourceLinks;
  slideTitles: string[];
  slideSequence: SlideConfig[];
  inventoryVisibleColumns: string[];
  executiveKpiSelection: string[]; // IDs of KPIs to show on slide 2
  customExecutiveMetrics: { id: string; label: string; value: string; icon: string; color: string; group?: string }[]; // New Custom Metrics for Executive
  summaryOfActivities: string;
  activitiesList: { id: string; text: string; icon: string; link?: string; targetSlideId?: string }[];
  xMetrics: {
    reach: string;
    mentions: string;
    engagement: string;
    rate: string;
    impressions: string;
  };
  linkedinMetrics: {
    impressions: string;
    engagement: string;
    views: string;
    totalPosts: string;
    totalReactions: string;
    totalComments: string;
    totalClicks: string;
    totalReposts: string;
  };
  topXPosts: SocialPost[];
  topLinkedinPosts: SocialPost[];
  allLinkedinPosts: SocialPost[];
  linkedinNewsletters: SocialPost[]; 
  linkedinStandardPosts: SocialPost[];
  articles: ArticleInfo[];
  videoInterviews: VideoInfo[];
  videoCollateral: VideoInfo[];
  graphics: { url: string; label: string }[];
  newsletterInserts: { image: string; title?: string }[];
  iiotNewsletterInserts: { id: string; image: string; title?: string; link?: string }[];
  customSlides: CustomSlide[];
  additionalContent: string;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: any;
  viewerId?: string;
  viewerPassword?: string;
}

export enum ReportStep {
  BASICS = 'Basics',
  RESOURCES = 'Resources',
  DATA_UPLOAD = 'Data Feed',
  ASSETS = 'Asset Upload',
  PREVIEW = 'Review & Edit',
  FINAL = 'Live Report'
}
