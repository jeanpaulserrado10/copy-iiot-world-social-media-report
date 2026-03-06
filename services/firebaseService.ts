
import { db, storage, auth } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where, serverTimestamp, setDoc, updateDoc, deleteDoc, addDoc, orderBy, limit } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { ReportData, Category } from '../types';

export interface ReportMetadata {
  id: string;
  title: string;
  clientName: string;
  updatedAt: any;
  userId: string;
  categoryId?: string;
}

export class FirebaseService {
  
  private static async uploadFile(path: string, dataUrl: string): Promise<string> {
    if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
    
    try {
      const storageRef = ref(storage, path);
      await uploadString(storageRef, dataUrl, 'data_url');
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading file:", path, error);
      throw error;
    }
  }

  static async saveReport(userId: string, data: ReportData, reportId?: string) {
    const docId = reportId || doc(collection(db, 'reports')).id;
    const timestamp = Date.now();
    const reportCopy = JSON.parse(JSON.stringify(data));

    const processImages = async (items: any[], idField: string, imgField: string, prefix: string) => {
        if (!items) return;
        await Promise.all(items.map(async (item: any, idx: number) => {
            if (item[imgField] && item[imgField].startsWith('data:')) {
                const itemId = item[idField] || idx;
                const path = `reports/${userId}/${docId}/${prefix}_${itemId}_${timestamp}`;
                item[imgField] = await FirebaseService.uploadFile(path, item[imgField]);
            }
        }));
    };

    await processImages(reportCopy.topXPosts, 'id', 'proofImage', 'x_post');
    await processImages(reportCopy.topLinkedinPosts, 'id', 'proofImage', 'li_post');
    await processImages(reportCopy.articles, 'id', 'proofImage', 'article');
    await processImages(reportCopy.linkedinNewsletters, 'id', 'proofImage', 'newsletter');
    await processImages(reportCopy.videoCollateral, 'id', 'base64Video', 'video');
    await processImages(reportCopy.graphics, 'label', 'url', 'graphic');
    await processImages(reportCopy.iiotNewsletterInserts, 'id', 'image', 'insert');
    await processImages(reportCopy.customSlides, 'id', 'fileData', 'custom');

    if (reportCopy.customSlides) {
        await Promise.all(reportCopy.customSlides.map(async (slide: any) => {
            if (slide.images && slide.images.length > 0) {
                 await Promise.all(slide.images.map(async (img: any, idx: number) => {
                    if (img.url && img.url.startsWith('data:')) {
                         const path = `reports/${userId}/${docId}/custom_${slide.id}_img_${idx}_${timestamp}`;
                         img.url = await FirebaseService.uploadFile(path, img.url);
                    }
                 }));
            }
        }));
    }

    const reportPayload = {
      ...reportCopy,
      userId,
      updatedAt: serverTimestamp(),
      searchTitle: `${data.metadata.clientName} - ${data.metadata.campaignName}`
    };

    await setDoc(doc(db, 'reports', docId), reportPayload);
    return docId;
  }

  static async duplicateReport(reportId: string, userId: string): Promise<string | null> {
    try {
      const original = await this.getReport(reportId);
      if (!original) return null;

      // Deep copy
      const copy = JSON.parse(JSON.stringify(original));
      
      // Update Title to indicate copy
      copy.metadata.campaignName = `${copy.metadata.campaignName} (Copy)`;
      
      // Save as new report (saveReport handles new ID generation and keeps existing URLs for assets)
      return await this.saveReport(userId, copy);
    } catch (e) {
      console.error("Error duplicating report:", e);
      throw e;
    }
  }

  static async createCaseStudy(reportId: string, userId: string): Promise<string | null> {
    try {
      const original = await this.getReport(reportId);
      if (!original) return null;

      const copy = JSON.parse(JSON.stringify(original));
      const oldClientName = copy.metadata.clientName || '';
      const aliasClient = "Confidential Client";
      const aliasCampaign = "Digital Impact Campaign";

      // Helper to replace client name in strings
      const replaceText = (str: string) => {
          if (!str || typeof str !== 'string') return str;
          if (!oldClientName || oldClientName.length < 3) return str;
          const regex = new RegExp(oldClientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          return str.replace(regex, aliasClient);
      };

      // Recursively sanitize object
      const sanitizeObj = (obj: any): any => {
         if (typeof obj === 'string') return replaceText(obj);
         if (Array.isArray(obj)) return obj.map(sanitizeObj);
         if (typeof obj === 'object' && obj !== null) {
             const newObj: any = {};
             Object.keys(obj).forEach(key => {
                 const val = obj[key];
                 // Skip asset data to avoid performance hit or corruption, but still checking keys
                 if (['proofImage', 'image', 'base64Video', 'fileData'].includes(key)) {
                     newObj[key] = val; 
                     return;
                 }
                 // Clear links
                 if (['link', 'mainDriveFolder', 'top20XDriveLink', 'visualsDriveLink', 'shortsDriveLink', 'brandwatchDriveLink', 'linkedinLink', 'xLink', 'driveLink'].includes(key)) {
                    // If it looks like a URL, clear it. If it's internal ID, keep it? 
                    // Usually these keys are URLs in our types.
                    if (typeof val === 'string' && (val.startsWith('http') || val.startsWith('www'))) {
                        newObj[key] = "";
                        return;
                    }
                 }
                 newObj[key] = sanitizeObj(val);
             });
             return newObj;
         }
         return obj;
      };

      // 1. Metadata Replacement
      copy.metadata.clientName = aliasClient;
      copy.metadata.campaignName = aliasCampaign;

      // 2. Specific Section Sanitization (Targeted logic is safer than blind deep recursion for some arrays)
      
      // Posts (Anonymize authors)
      const sanitizePost = (p: any) => ({ ...p, author: 'Brand Partner', link: '', title: replaceText(p.title) });
      copy.topXPosts = copy.topXPosts.map(sanitizePost);
      copy.topLinkedinPosts = copy.topLinkedinPosts.map(sanitizePost);
      copy.allLinkedinPosts = copy.allLinkedinPosts.map(sanitizePost);
      copy.linkedinNewsletters = copy.linkedinNewsletters.map(sanitizePost);
      copy.linkedinStandardPosts = (copy.linkedinStandardPosts || []).map(sanitizePost);

      // Articles
      copy.articles = copy.articles.map((a: any) => ({ ...a, title: replaceText(a.title), caption: replaceText(a.caption), link: '' }));

      // Videos
      const sanitizeVideo = (v: any) => ({ 
          ...v, 
          title: replaceText(v.title), 
          link: '', 
          linkedinLink: '', 
          xLink: '', 
          driveLink: '', 
          extraLinks: [] 
      });
      copy.videoInterviews = copy.videoInterviews.map(sanitizeVideo);
      copy.videoCollateral = copy.videoCollateral.map(sanitizeVideo);

      // Slide Content & Titles
      copy.slideTitles = copy.slideTitles.map(replaceText);
      copy.slideSequence = copy.slideSequence.map((s: any) => ({ ...s, label: replaceText(s.label) }));
      
      // Custom Slides (Deep replacement for content blocks)
      copy.customSlides = copy.customSlides.map((s: any) => {
          // Manually clear buttons and bullets links first
          if (s.buttons) s.buttons = s.buttons.map((b: any) => ({...b, text: replaceText(b.text), link: ''}));
          if (s.bullets) s.bullets = s.bullets.map((b: any) => {
             if (typeof b === 'string') return replaceText(b);
             return { ...b, text: replaceText(b.text), link: '' };
          });
          // Sanitize rest (title, content, etc)
          return sanitizeObj(s);
      });

      // Summary
      copy.summaryOfActivities = replaceText(copy.summaryOfActivities);

      // 3. Save as new report
      // Search Title helps identify it in dashboard
      // We don't change category so it stays with original project group
      
      return await this.saveReport(userId, copy);

    } catch (e) {
      console.error("Error creating case study:", e);
      throw e;
    }
  }

  static async getUserReports(userId?: string): Promise<ReportMetadata[]> {
    console.log("Fetching reports. UserId filter:", userId || "ALL");
    
    try {
        let q;
        if (userId) {
            q = query(collection(db, 'reports'), where('userId', '==', userId), limit(100));
        } else {
            q = query(collection(db, 'reports'), limit(100));
        }
        
        const querySnapshot = await getDocs(q);
        console.log("Reports snapshot size:", querySnapshot.size);
        
        const reports = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.searchTitle || 'Untitled Report',
            clientName: data.metadata?.clientName || 'Unknown Client',
            updatedAt: data.updatedAt,
            userId: data.userId,
            categoryId: data.categoryId
          };
        });
        
        // Sort in-memory
        reports.sort((a, b) => {
            const timeA = a.updatedAt?.seconds || 0;
            const timeB = b.updatedAt?.seconds || 0;
            return timeB - timeA;
        });

        console.log("Parsed reports:", reports);
        return reports;
    } catch (error: any) {
        console.error("Error in getUserReports:", error);
        if (error.code === 'failed-precondition') {
            console.error("Missing index for reports query. Please create it in Firebase Console.");
        }
        throw error;
    }
  }

  static async getReport(reportId: string): Promise<ReportData | null> {
    console.log("Fetching report:", reportId);
    try {
        const docRef = doc(db, 'reports', reportId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Report found:", reportId);
          return docSnap.data() as ReportData;
        } else {
          console.log("Report not found:", reportId);
          return null;
        }
    } catch (error) {
        console.error("Error in getReport:", error);
        throw error;
    }
  }

  static async deleteReport(reportId: string) {
    await deleteDoc(doc(db, 'reports', reportId));
  }

  static async updateReportCategory(reportId: string, categoryId: string | null) {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, { categoryId: categoryId });
  }

  static async getCategory(categoryId: string): Promise<Category | null> {
    try {
        const docRef = doc(db, 'categories', categoryId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Category;
        }
        return null;
    } catch (error) {
        console.error("Error in getCategory:", error);
        throw error;
    }
  }

  static async getCategories(userId?: string): Promise<Category[]> {
    console.log("Fetching categories. UserId filter:", userId || "ALL");
    try {
        let q;
        if (userId) {
            q = query(collection(db, 'categories'), where('userId', '==', userId), limit(100));
        } else {
            q = query(collection(db, 'categories'), limit(100));
        }
        
        const querySnapshot = await getDocs(q);
        console.log("Categories snapshot size:", querySnapshot.size);
        const categories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        
        // Sort in-memory
        categories.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });

        return categories;
    } catch (error: any) {
        console.error("Error in getCategories:", error);
        if (error.code === 'failed-precondition') {
            console.error("Missing index for categories query. Please create it in Firebase Console.");
        }
        throw error;
    }
  }

  static async saveCategory(userId: string, name: string, viewerId?: string, viewerPassword?: string): Promise<string> {
    const docRef = await addDoc(collection(db, 'categories'), {
      name,
      userId,
      createdAt: serverTimestamp(),
      viewerId: viewerId || null,
      viewerPassword: viewerPassword || null
    });
    return docRef.id;
  }

  static async updateCategory(categoryId: string, data: Partial<Category>) {
    const docRef = doc(db, 'categories', categoryId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  static async deleteCategory(categoryId: string) {
    await deleteDoc(doc(db, 'categories', categoryId));
    
    // Fetch all reports to find those in this category (regardless of user)
    const reports = await FirebaseService.getUserReports();
    const reportsToUpdate = reports.filter(r => r.categoryId === categoryId);
    
    await Promise.all(reportsToUpdate.map(r => updateDoc(doc(db, 'reports', r.id), { categoryId: null })));
  }
}
