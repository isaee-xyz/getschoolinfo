
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const https = require('https');

const SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];
const SERVICE_ACCOUNT_FILE = './backend/temp_sa.json';

async function fetchConfig() {
    try {
        const auth = new GoogleAuth({
            keyFile: SERVICE_ACCOUNT_FILE,
            scopes: SCOPES,
        });

        const client = await auth.getClient();
        const projectId = await auth.getProjectId();
        const url = `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`;

        console.log(`Fetching Apps from: ${url}`);

        const res = await client.request({ url });
        const apps = res.data.apps;

        var appId; // Declare appId here to be accessible in both branches and after.

        if (!apps || apps.length === 0) {
            console.log("No Web Apps found. Creating one...");
            const createUrl = `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`;
            const createRes = await client.request({
                url: createUrl,
                method: 'POST',
                data: { displayName: "GetSchoolInfo Web" }
            });
            // Operation returns a Long Running Operation (LRO)
            // But usually for WebApp it's fast. The response contains the `name` of operation.
            // Actually, for simplicity, let's just wait 2 seconds and List again.
            // The create response might usually contain the resource immediately or op.
            console.log("Creation initiated. Waiting 5 seconds...");
            await new Promise(r => setTimeout(r, 5000));

            // List again
            const listRes = await client.request({ url });
            const newApps = listRes.data.apps;
            if (!newApps || newApps.length === 0) {
                throw new Error("Failed to create Web App or propagation delay.");
            }
            appId = newApps[0].appId;
        } else {
            appId = apps[0].appId;
        }

        console.log(`Found App ID: ${appId}`);

        const configUrl = `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps/${appId}/config`;
        const configRes = await client.request({ url: configUrl });

        console.log("FOUND_CONFIG:");
        console.log(JSON.stringify(configRes.data, null, 2));

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) console.error(error.response.data);
    }
}

fetchConfig();
