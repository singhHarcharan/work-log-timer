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
  console.log('SET TimeLog Function Called Successfully')

  // Store the currentTime as {Key: CurrentTime, seconds}
  // 'seconds' will be updated only if 'stop' button is clicked
  // Then 'currTime' will become 'currentTime' + 'seconds'

  // Step 1: If Button is pressed for the first time, store currentTime
  //          as {'uniqueKey' : currentTime, seconds}

  // Step 2: If 'Stop' button is clicked, find the 'uniqueKey' value &
  // update 'seconds'

  // Step 3: If 'Log' or 'Reset' Button is clicked, then remove 'uniqueKey'
  let currTimeLog = new Date().getTime() / 1000;
  let seconds = 0;

  // If 'Start' button is pressed for the first time
  let value = await storage.get(uniqueKey);
  if (value == null) {
    await storage.set(uniqueKey, [currTimeLog, seconds])
  }
  else {
    // set new log of 'currTime' with 'updatedSeconds' in storage.
    let [prevTimeLog, updatedSeconds] = value;
    let newTimeLog = new Date().getTime() / 1000;
    await storage.set(uniqueKey, [newTimeLog, updatedSeconds])
  }

  console.log("ON Clicking Start, Stored values are ");
  let storedValue = await storage.get(uniqueKey);
  console.log(storedValue);
})



resolver.define('GET TimeLog', async (req) => {
  console.log('GET TimeLog function called Successfully');
  let [, seconds] = await storage.get(uniqueKey);
  return seconds;
})

resolver.define('UPDATE TimeLog', async (req) => {
  console.log('UPDATE TimeLog function called Successfully');
  // If 'Stop' Button is pressed, then update 'seconds' with 'currTimeLog'
  // means 'seconds' can be used again to start timer again
  const [oldTimeLog, alreadyPresentSeconds] = await storage.get(uniqueKey);
  if (oldTimeLog != null) {
    // let currTimeInSeconds = timerService.timeLogToSeconds(new Date().getTime()/1000);
    let currTimeLog = new Date().getTime() / 1000;
    // console.log("Current Time Log in seconds is " + currTimeLog);
    // console.log("Difference Between current and prev is " + (currTimeLog - oldTimeLog))
    let updatedSeconds = alreadyPresentSeconds + (currTimeLog - oldTimeLog);
    await storage.set(uniqueKey, [oldTimeLog, updatedSeconds])

    // console.log("ON Clicking Stop, Stored values are ");
    // let [, totalTime] = await storage.get(uniqueKey);
    // console.log("Final Seconds are " + totalTime);
  }
})

resolver.define('RESET TimeLog', async (req) => {
  console.log('RESET TimeLog function called Successfully');
  await storage.delete(uniqueKey);
})


export const handler = resolver.getDefinitions();
