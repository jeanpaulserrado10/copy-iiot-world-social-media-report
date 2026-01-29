import { db, storage } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { ReportData } from '../types';

export interface ReportMetadata {
  id: string;
  title: string;
  clientName: string;
  updatedAt: any;
  userId: string;
}

export class FirebaseService {
  
  private static async uploadFile(path: string, dataUrl: string): Promise<string> {
    // If it's already a URL (http/https) or empty, return as is
    if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
    
    try {
      // Create a reference to the storage location
      const storageRef = ref(storage, path);
      
      // Upload the base64 string
      await uploadString(storageRef, dataUrl, 'data_url');
      
      // Get the public download URL
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading file:", path, error);
      throw error;
    }
  }

  static async saveReport(userId: string, data: ReportData, reportId?: string) {
    // Generate an ID if one wasn't provided so we can construct storage paths
    const docId = reportId || doc(collection(db, 'reports')).id;
    const timestamp = Date.now();
    
    // Deep clone the data to avoid mutating the React state directly while we process it
    const reportCopy = JSON.parse(JSON.stringify(data));

    // Helper to process arrays containing media
    const processImages = async (items: any[], idField: string, imgField: string, prefix: string) => {
        if (!items) return;
        // Map uploads to promises so they happen in parallel
        await Promise.all(items.map(async (item: any, idx: number) => {
            if (item[imgField] && item[imgField].startsWith('data:')) {
                const itemId = item[idField] || idx;
                // Path structure: reports/{userId}/{reportId}/{type}_{itemId}_{timestamp}
                const path = `reports/${userId}/${docId}/${prefix}_${itemId}_${timestamp}`;
                item[imgField] = await FirebaseService.uploadFile(path, item[imgField]);
            }
        }));
    };

    // --- Upload Assets to Storage ---
    
    // 1. Top X Posts
    await processImages(reportCopy.topXPosts, 'id', 'proofImage', 'x_post');
    
    // 2. Top LinkedIn Posts
    await processImages(reportCopy.topLinkedinPosts, 'id', 'proofImage', 'li_post');

    // 3. Articles
    await processImages(reportCopy.articles, 'id', 'proofImage', 'article');

    // 4. Newsletters
    await processImages(reportCopy.linkedinNewsletters, 'id', 'proofImage', 'newsletter');
    
    // 5. Video Collateral
    await processImages(reportCopy.videoCollateral, 'id', 'base64Video', 'video');
    
    // 6. Graphics (Uses 'url' field and 'label' as ID proxy)
    await processImages(reportCopy.graphics, 'label', 'url', 'graphic');

    // 7. IIoT Newsletter Inserts
    await processImages(reportCopy.iiotNewsletterInserts, 'id', 'image', 'insert');

    // 8. Custom Slides
    await processImages(reportCopy.customSlides, 'id', 'fileData', 'custom');

    // --- Save Metadata to Firestore ---

    const reportPayload = {
      ...reportCopy,
      userId,
      updatedAt: serverTimestamp(),
      searchTitle: `${data.metadata.clientName} - ${data.metadata.campaignName}`
    };

    // Use setDoc to create or overwrite the document with the generated ID
    await setDoc(doc(db, 'reports', docId), reportPayload);
    
    return docId;
  }

  static async getUserReports(userId: string): Promise<ReportMetadata[]> {
    const q = query(collection(db, 'reports'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.searchTitle || 'Untitled Report',
        clientName: data.metadata?.clientName || 'Unknown Client',
        updatedAt: data.updatedAt,
        userId: data.userId
      };
    });
  }

  static async getReport(reportId: string): Promise<ReportData | null> {
    const docRef = doc(db, 'reports', reportId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as ReportData;
    } else {
      return null;
    }
  }
}