import admin from 'firebase-admin';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = () => {
    if (firebaseApp) return firebaseApp;

    try {
        if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
            // Initialize with Service Account File (Dev/Local)
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(SERVICE_ACCOUNT_PATH),
            });
            console.log('Firebase Admin initialized with service-account.json');
        } else {
            // Initialize with Default/Env Credentials (Prod/Cloud)
            // This expects GOOGLE_APPLICATION_CREDENTIALS env var or GCloud environment
            firebaseApp = admin.initializeApp();
            console.log('Firebase Admin initialized with default credentials');
        }
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
        throw error;
    }

    return firebaseApp;
};

export const getAuth = () => {
    if (!firebaseApp) initializeFirebase();
    return admin.auth();
};

export const getFirestore = () => {
    if (!firebaseApp) initializeFirebase();
    return admin.firestore();
};
