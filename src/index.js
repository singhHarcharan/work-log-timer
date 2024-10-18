import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import { storage } from '@forge/api';
// import TimerServiceBe from '../src/service/TimerServiceBe';

// const timerService = new TimerServiceBe();
const resolver = new Resolver();
const uniqueKey = 'uniqueKey';

resolver.define('fetchLabels', async (req) => {
  const key = req.context.extension.issue.key;

  const res = await api.asUser().requestJira(route`/rest/api/3/issue/${key}?fields=labels`);

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
resolver.define('SET TimeLog', async (req) => {
  console.log('SET TimeLog function called successfully');

  // Store the start time and elapsed seconds when the timer starts
  let currTimeLog = Math.floor(new Date().getTime() / 1000); // Store current time in seconds
  let seconds = req.payload.seconds || 0;  // If 'seconds' is passed, use that, otherwise default to 0

  // If storage is empty (timer starting for the first time)
  let value = await storage.get(uniqueKey);
  if (value == null) {
      await storage.set(uniqueKey, [currTimeLog, seconds]);
  } else {
      // If there's already a time log present, update the start time and keep previous seconds
      let [prevTimeLog, updatedSeconds] = value;
      await storage.set(uniqueKey, [currTimeLog, updatedSeconds]);
  }

  console.log("ON Clicking Start, Stored values are ", await storage.get(uniqueKey));
});


// IF the 'browser' is reloaded, check the presence of 'timer' in storage
// and render the 'timer' at frontend, if present.
resolver.define('GET TimeLog', async (req) => {
  console.log('GET TimeLog function called successfully');
  
  let value = await storage.get(uniqueKey);

  // If No clock was running at the backend
  if (value == null) {
      return { elapsed: 0, isRunning: false }; 
  }

  let [startTimeLog, storedSeconds] = value;
  // Calculate how much time has passed since the start time (only if the timer is running)
  let currTime = Math.floor(new Date().getTime() / 1000);
  let newTimeToDisplay = storedSeconds;
  let isRunning = false;

  // If the timer is still running, add the difference to the stored time
  if (startTimeLog !== null) {
      newTimeToDisplay += Math.floor(currTime - startTimeLog);
      isRunning = true;
  }

  console.log("New Time to display:", newTimeToDisplay);
  return { timeToDisplay: newTimeToDisplay, isRunning: isRunning };
});


// This function simply Checks whether the 'TimeLog' is already present in
// Storage or not...
resolver.define('isTimeLogPresent', async (req) => {
  let value = await storage.get(uniqueKey);
  if(value != null) return true;
  return false;
})

// If 'stop' button is pressed, then update the 'timeLog' with 'updatedSeconds'
resolver.define('UPDATE TimeLog', async (req) => {
  console.log('UPDATE TimeLog function called successfully');
  
  let value = await storage.get(uniqueKey);
  if (value != null) {
      let [startTimeLog, storedSeconds] = value;
      // Calculate the elapsed time since the last start
      let prevTimeLog = req.payload.elapsedTimeLog;
      let newTimeInSeconds = Math.floor(prevTimeLog - startTimeLog);
      // Update the stored seconds with the new elapsed time and clear the start time
      await storage.set(uniqueKey, [null, Math.floor(storedSeconds + newTimeInSeconds)]);

      console.log("ON Clicking Stop, Stored values are ", await storage.get(uniqueKey));
  }
});



resolver.define('RESET TimeLog', async (req) => {
  console.log('RESET TimeLog function called successfully');
  // Delete the time log from Forge storage
  await storage.delete(uniqueKey);
  console.log('Timer has been reset and removed from storage.');
});



export const handler = resolver.getDefinitions();
