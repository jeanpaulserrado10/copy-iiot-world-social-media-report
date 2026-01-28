
export interface CampaignMetadata {
  clientName: string;
  campaignName: string;
  hashtag: string[];
  linkedinMention: string[];
  startDate: string;
  endDate: string;
}

export interface ResourceLinks {
  mainDriveFolder: string;
  top20XDriveLink: string;
  visualsDriveLink: string;
  shortsDriveLink: string;
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
  engagement?: string;
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
  base64Video?: string;
}

export interface CustomSlide {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  type: 'text' | 'link' | 'file';
  link?: string;
  linkText?: string;
  fileData?: string;
}

export interface ReportData {
  metadata: CampaignMetadata;
  resources: ResourceLinks;
  slideTitles: string[];
  inventoryVisibleColumns: string[];
  executiveKpiSelection: string[]; // IDs of KPIs to show on slide 2
  summaryOfActivities: string;
  activitiesList: { id: string; text: string; icon: string; link?: string }[];
  xMetrics: {
    reach: string;
    mentions: string;
    engagement: string;
    rate: string;
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
  iiotNewsletterInserts: { id: string; image: string; title?: string }[];
  customSlides: CustomSlide[];
  additionalContent: string;
}

export enum ReportStep {
  BASICS = 'Basics',
  RESOURCES = 'Resources',
  DATA_UPLOAD = 'Data Feed',
  ASSETS = 'Asset Upload',
  PREVIEW = 'Review & Edit',
  FINAL = 'Live Report'
}
