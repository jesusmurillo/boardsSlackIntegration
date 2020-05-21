const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { toBase64 } = require('base64-mongo-id');

const app = express();
const port;

const SLACK_WEBHOOK_URL = '';
const BASE_GLO_URL = '';

app.use(bodyParser.json());

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

const getCardAddedMessage = (body) => {
  const board = body.board;
  const card = body.object;
  const sender = body.sender;

  return {
    text: `New card created in board \`${board.name}\``,
    attachments: [
      {
        color: 'good',
        title: card.name,
        text: `${BASE_GLO_URL}/board/${toBase64(board.id)}/card/${toBase64(card.id)}`
      }
    ]
  };
};

const getCardDeletedMessage = (body) => {
  const board = body.board;
  const card = body.object;
  const sender = body.sender;

  return {
    text: `Card deleted in board \`${board.name}\``,
    attachments: [
      {
        color: '#FF0000',
        title: card.name
      }
    ]
  };
};

app.post('/glo-webhook', (req, res) => {
  console.log(req.headers['x-gk-webhooks-event']);
  console.log(req.body);
  console.log();

  let message;

  // Card added
  if (req.headers['x-gk-webhooks-event'] === 'cards' && req.body.action === 'added') {
    message = getCardAddedMessage(req.body);
  }
  // Card deleted
  if (req.headers['x-gk-webhooks-event'] === 'cards' && req.body.action === 'deleted') {
    message = getCardDeletedMessage(req.body);
  }

  if (message) {
    // Send Slack message
    return axios.post(SLACK_WEBHOOK_URL, message)
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  } else {
    res.sendStatus(304);
  }
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
