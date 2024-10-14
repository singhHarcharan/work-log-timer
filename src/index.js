import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
const resolver = new Resolver();

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
resolver.define('SET TimeLog', async(req) => {
  console.log('SET TimeLog Function Called Successfully')
  console.log(new Date().getTime() / 1000); // coz it gives result in miliseconds
})

resolver.define('GET TimeLog', async(req) => {
  console.log('GET TimeLog function called Successfully');
})

resolver.define('RESET TimeLog', async(req) => {
  console.log('RESET TimeLog function called Successfully');
})


export const handler = resolver.getDefinitions();
