import Resolver from '@forge/resolver';
import ProjectService from './service/ProjectService';
import api, { route, store } from '@forge/api';
import { storage, asUser } from '@forge/api';
// import TimerServiceBe from '../src/service/TimerServiceBe';

// const timerService = new TimerServiceBe();
const resolver = new Resolver();
const projectService = new ProjectService();
const uniqueKey = 'uniqueKey';

resolver.define('fetchLabels', async (req) => {
  const key = req.context.extension.issue.key;

  const res = await api.asUser().requestJira(
    route`/rest/api/3/issue/${key}?fields=labels`
  );

  const data = await res.json();

  const label = data.fields.labels;
  if (label == undefined) {
    console.warn(`${key}: Failed to find labels`);
    return [];
  }
  return label;
});


// ---------------------------------------------------
// -------------- User State Persistance--------------
resolver.define('SET TimeLog', async ({ seconds, accountId, issueId, projectId }) => {
  console.log('SET TimeLog function called successfully');

  // Generate Unique Key using 'accountId', 'projectId' and 'issueId'
  const uniqueKey = projectService.generateUniqueKey(accountId, projectId, issueId);

  // If Current User is allowed to click 'Start' Button.
  // const userAllowedToClick = projectService.isUserAllowedToClick(uniqueKey);
  if (true) {
    console.log("Enterd in first condition");
    // Store the start time, elapsed seconds and owner's userId (when the timer starts)
    let currTimeLog = Math.floor(new Date().getTime() / 1000); // Store current time in seconds
    let storedSeconds = seconds || 0;  // If 'seconds' is passed, use that, otherwise default to 0

    // If a clock does not exist for particular issueId
    let value = await storage.get(issueId);
    await storage.set(issueId, {startime: startTimeLog, seconds: storedSeconds, owner: uniqueKey});
  }
  // User is not allowed to make changes  
  else {
    console.log("As only onwer can Start/Stop the clock, You cannot click the button");
  }
});

// IF the 'browser' is reloaded, check the presence of 'timer' in storage
// and render the 'timer' at frontend, if present.
resolver.define('GET TimeLog', async (req) => {
  console.log('GET TimeLog function called successfully');

  let value = await storage.get('issueId');

  // If No clock was running at the backend
  if (value == null) {
    return { elapsed: 0, isRunning: false };
  }

  let [startTimeStamp, storedSeconds] = value;
  // Calculate how much time has passed since the start time (only if the timer is running)
  let currTimeStamp = Math.floor(new Date().getTime() / 1000);
  let newTimeToDisplay = storedSeconds;
  let isRunning = false;

  // If the timer is still running, add the difference to the stored time
  if (startTimeStamp !== null) {
    newTimeToDisplay += Math.floor(currTimeStamp - startTimeStamp);
    isRunning = true;
  }

  console.log("New Time to display:", newTimeToDisplay);
  return { timeToDisplay: newTimeToDisplay, isRunning: isRunning };
});

// This function simply Checks whether the 'TimeLog' is already present in
// Storage or not...
resolver.define('isTimeLogPresent', async (req) => {
  let value = await storage.get('issueId');
  if (value == null) return false;
  return true;
})

// If 'stop' button is pressed, then update the 'timeLog' with 'updatedSeconds'
resolver.define('UPDATE TimeLog', async (elapsedTimeLog) => {
  console.log('UPDATE TimeLog function called successfully');

  let value = await storage.get(uniqueKey);
  if (value != null) {
    let [startTimeLog, storedSeconds] = value;
    // Calculate the elapsed time since the last start
    let prevTimeLog = elapsedTimeLog;
    let newTimeInSeconds = Math.floor(prevTimeLog - startTimeLog);
    // Update the stored seconds with the new elapsed time and clear the start time
    await storage.set(uniqueKey, [null, Math.floor(storedSeconds + newTimeInSeconds)]);

    console.log("ON Clicking Stop, Stored values are ", await storage.get(uniqueKey));
  }
});

resolver.define('RESET TimeLog', async (req) => {
  console.log('RESET TimeLog function called successfully');
  // Delete the time log from Forge storage
  // await storage.delete(uniqueKey);
  await storage.delete('issueId');
  console.log('Timer has been reset and removed from storage.');
});

resolver.define('getCurrentUser', async () => {
  const res = await api.asUser().requestJira(route`/rest/api/3/myself`);
  const data = await res.json();
  console.log("Current User's Detail -> ", data);
  return data;
});



export const handler = resolver.getDefinitions();
