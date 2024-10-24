import { storage, store } from "@forge/api";

class ProjectService {

    getProjectData = async (payload) => {
        const accountId = payload;
        console.log("overall data inside project service ->", payload);
        // console.log("Account id is -> ", accountId);
        // return {accountId: accountId, issueId: 0, projectId: 0};    
    }

    generateUniqueKey = (accountId, projectId, issueId) => {
        // Join the accountId, issueId, and projectId using '-' as a separator
        return `${accountId}-${projectId}-${issueId}`;
    }

    isUserAllowedToClick = async (uniqueKey) => {
        let value = await storage.get(uniqueKey);
        if(value == null)   return false;
        else                return true;
    }
}

export default ProjectService;      