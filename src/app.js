const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid project ID'})
  }

  return next();
}

app.use('/repositories/:id', validateId);

app.get("/repositories", (request, response) => {
  const { title } = request.query;
  const results = title
    ? repositories.filter( repository => repository.title.includes(title))
    : repositories;
  return response.json(results)
});

app.post("/repositories", (request, response) => {
  const { title, url, techs} = request.body;

  const repository = { id: uuid(), title, url, techs, likes: 0}
  repositories.push(repository)

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const repoIndex = repositories.findIndex( repo => repo.id == id)

  if (repoIndex < 0) {
    return response.status(400).json({ error: 'Repo not found.'})
  }

  const repo = {
    id,
    title,
    url,
    techs,
    likes: repositories[repoIndex].likes
  }

  repositories[repoIndex] = repo;
  return response.json(repo);
});

app.delete("/repositories/:id", (req, res) => {
  const { id } = req.params;
  const repoIndex = repositories.findIndex( repo => repo.id == id)

  if (repoIndex < 0) {
    return res.status(400).json({ error: 'Project not found.'})
  }

  repositories.splice(repoIndex, 1);
  return res.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const repoIndex = repositories.findIndex( repo => repo.id == id)

  if (repoIndex < 0) {
    return response.status(400).json({ error: 'Project not found.'})
  }
  repositories[repoIndex].likes += 1

  return response.json(repositories[repoIndex]);
});

module.exports = app;
