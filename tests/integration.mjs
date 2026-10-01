import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const origin = process.env.TEST_ORIGIN || 'http://localhost:3001';
assert.match(origin, /^http:\/\/localhost:\d+$/);
const buildDirectory = process.env.TEST_BUILD_DIRECTORY || '.next';
async function actionIds() {
  const manifest = JSON.parse(await readFile(new URL(`../${buildDirectory}/server/server-reference-manifest.json`, import.meta.url), 'utf8'));
  return Object.fromEntries(Object.entries(manifest.node).map(([id, value]) => [value.exportedName, id]));
}
async function signup(name) {
  const email = `${randomUUID()}@example.com`;
  const response = await fetch(`${origin}/api/auth/sign-up/email`, { method:'POST', headers:{'Content-Type':'application/json',Origin:origin}, body:JSON.stringify({name,email,password:'Disposable-test-password-923!'}) });
  assert.equal(response.status,200);
  const cookie = response.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
  const body = await response.json();
  return {cookie,person:body.user};
}
async function action(options) {
  if (options.path) await fetch(`${origin}${options.path}`);
  const actions = await actionIds();
  const response = await fetch(`${origin}${options.path || '/'}`, {method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8',Origin:origin,Cookie:options.cookie,'Next-Action':actions[options.name]},body:JSON.stringify([options.argument])});
  const body = await response.text();
  const resultLine = body.split('\n').find(line=>/^1:\{/.test(line));
  assert.ok(resultLine, `Action ${options.name} returned status ${response.status}`);
  return JSON.parse(resultLine.slice(2));
}
const anonymous = await (await fetch(origin)).text();
assert.match(anonymous,/WELCOME BACK/);
assert.doesNotMatch(anonymous,/New todo/);
const first = await signup('Race one');
const personal = await (await fetch(origin,{headers:{Cookie:first.cookie}})).text();
assert.match(personal,/Your workspace is empty/);
const second = await signup('Race two');
const outsider = await signup('Outside');
const created = await action({name:'createWorkspace',argument:'Integration rebellion',cookie:first.cookie});
assert.ok(created.data);
assert.ok((await action({name:'changeWorkspace',cookie:'',argument:{id:created.data.id,mutation:{type:'add-group',group:{id:randomUUID(),name:'Forbidden',color:'blue'}}}})).error);
const workspace = created.data;
const joined = await action({name:'joinWorkspace',argument:workspace.inviteToken,cookie:second.cookie,path:`/invite/${workspace.inviteToken}`});
assert.equal(joined.data,workspace.id);
async function change(options) { return action({name:'changeWorkspace',cookie:options.cookie || first.cookie,argument:{id:workspace.id,mutation:options.mutation}}); }
const group = {id:randomUUID(),name:'Test group',color:'blue'};
assert.ok((await change({mutation:{type:'add-group',group}})).data);
function todo(person) { return {id:randomUUID(),title:`Task for ${person.name}`,groupId:group.id,completed:false,completedAt:null,assigneeId:person.id,priority:'normal',dueDate:'',notes:[{id:randomUUID(),text:'A real linked note'}]}; }
const firstTodo = todo(first.person);
const secondTodo = todo(second.person);
const concurrent = await Promise.all([change({mutation:{type:'add-todo',todo:firstTodo}}),change({cookie:second.cookie,mutation:{type:'add-todo',todo:secondTodo}})]);
assert.ok(concurrent.every(result=>result.data));
const read = await action({name:'readWorkspace',argument:workspace.id,cookie:second.cookie});
assert.equal(read.data.board.todos.length,2);
assert.equal(read.data.members.length,2);
assert.ok((await change({cookie:outsider.cookie,mutation:{type:'delete-todo',id:firstTodo.id}})).error);
const share = await action({name:'shareTodo',argument:{workspaceId:workspace.id,todoId:firstTodo.id},cookie:first.cookie});
assert.ok(share.data.startsWith('/share/'));
const shared = await fetch(`${origin}${share.data}`);
assert.equal(shared.status,200);
assert.match(await shared.text(),/A real linked note/);
assert.ok((await change({mutation:{type:'update-todo',id:firstTodo.id,changes:{title:'Renamed live shared task'}}})).data);
assert.match(await (await fetch(`${origin}${share.data}`)).text(),/Renamed live shared task/);
assert.ok((await change({mutation:{type:'rename-group',id:group.id,name:'Renamed group'}})).data);
const deletedGroup = await change({mutation:{type:'delete-group',id:group.id}});
assert.ok(deletedGroup.data.todos.every(item=>item.groupId===null));
assert.ok((await change({mutation:{type:'start-race',name:'Real race'}})).data);
assert.ok((await change({mutation:{type:'delete-todo',id:secondTodo.id}})).error);
assert.ok((await change({mutation:{type:'update-todo',id:secondTodo.id,changes:{completed:true}}})).error);
const firstFinish = await change({mutation:{type:'update-todo',id:firstTodo.id,changes:{completed:true}}});
assert.ok(firstFinish.data.race.entries.find(entry=>entry.personId===first.person.id).finishedAt);
const secondFinish = await change({cookie:second.cookie,mutation:{type:'update-todo',id:secondTodo.id,changes:{completed:true}}});
assert.ok(secondFinish.data.race.entries.every(entry=>entry.finishedAt));
assert.ok((await change({mutation:{type:'end-race'}})).data);
assert.ok((await change({mutation:{type:'delete-todo',id:firstTodo.id}})).data);
assert.equal((await fetch(`${origin}${share.data}`)).status,404);
console.log('PASS: real signup, collaborative invites, concurrent writes, member access, linked notes, groups, live sharing, race ownership/timestamps, deletion.');
