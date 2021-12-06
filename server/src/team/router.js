import Router from 'koa-router';
import teamStore from './store';
import { broadcast } from "../utils";

export const router = new Router();

router.get('/', async (ctx) => {
  const response = ctx.response;
  const userId = ctx.state.user._id;
  response.body = await teamStore.find({ userId });
  response.status = 200; // ok
});

router.get('/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const team = await teamStore.findOne({ _id: ctx.params.id });
  const response = ctx.response;
  if (team) {
    if (team.userId === userId) {
      response.body = team;
      response.status = 200; // ok
    } else {
      response.status = 403; // forbidden
    }
  } else {
    response.status = 404; // not found
  }
});

const createTeam = async (ctx, team, response) => {
  try {
    const userId = ctx.state.user._id;
    team.userId = userId;
    response.body = await teamStore.insert(team);
    response.status = 201; // created
    broadcast(userId, { type: 'created', payload: team });
  } catch (err) {
    response.body = { message: err.message };
    response.status = 400; // bad request
  }
};

router.post('/', async ctx => await createTeam(ctx, ctx.request.body, ctx.response));

router.put('/:id', async (ctx) => {
  const team = ctx.request.body;
  const id = ctx.params.id;
  const teamId = team._id;
  const response = ctx.response;
  if (teamId && teamId !== id) {
    response.body = { message: 'Param id and body _id should be the same' };
    response.status = 400; // bad request
    return;
  }
  if (!teamId) {
    await createTeam(ctx, team, response);
  } else {
    const userId = ctx.state.user._id;
    team.userId = userId;
    const updatedCount = await teamStore.update({ _id: id }, team);
    if (updatedCount === 1) {
      response.body = team;
      response.status = 200; // ok
      broadcast(userId, { type: 'updated', payload: team });
    } else {
      response.body = { message: 'Resource no longer exists' };
      response.status = 405; // method not allowed
    }
  }
});

router.del('/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const team = await teamStore.findOne({ _id: ctx.params.id });
  if (team && userId !== team.userId) {
    ctx.response.status = 403; // forbidden
  } else {
    await teamStore.remove({ _id: ctx.params.id });
    broadcast(userId, { type: 'deleted', payload: team });
    ctx.response.status = 204; // no content
  }
});
