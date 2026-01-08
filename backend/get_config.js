
const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./temp_sa.json');

// Initialize with a unique name to avoid conflicts if default app exists
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
}, 'configFetcher');

async function getProjectConfig() {
    try {
        if (typeof app.projectManagement !== 'function') {
            console.error("projectManagement() is NOT a function on app instance.");
            console.log("App keys:", Object.keys(app));
            return;
        }
        const projectManagement = app.projectManagement();
        const webApps = await projectManagement.listWebApps();

        if (webApps.length === 0) {
            console.log("No Web Apps found in this project.");
            return;
        }

        // Get the first web app (or iterate if needed)
        const webApp = webApps[0];
        const config = await webApp.getConfig();

        console.log("FOUND_CONFIG:");
        console.log(JSON.stringify(config, null, 2));

    } catch (error) {
        console.error("Error fetching config:", error);
    }
}

getProjectConfig();
