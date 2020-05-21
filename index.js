const express =  require('express');
const { toBase64 } = require('base64-mongo-id');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port =;

app.use(bodyParser.json());

// Creating constant variables for slack webhook url and glo URL
const SLACK_WEBHOOK_URL = ''
const BASE_GLO_URL = '';

//test route
//hitting localhost:9999/hello will return hello world
app.get('/hello', (req, res) => {
    res.send("Hello world!")
});

// build message that will post to slack
const cardAdded = (body) => {

    const board = body.board;
    const card = body.card;
    const sender = body.sender;

    return{

        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `_Added_ to board \`${board.name}\`` + '\n' +
                                `*Card name:* <${BASE_GLO_URL}/board/${toBase64(board.id)}/card/${toBase64(card.id)}|${card.name}>` + '\n' +
                                `Created by: \`${sender.username}\``
                }
            },
            {
                type: `divider`
            }
        ]
    };
};

//build message for when card is deleted
const cardDeleted = (body) => {

    const board = body.board;
    const card = body.card;
    const sender = body.sender;
    const description = body.card.description;

    return {

        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `_Deleted_ from board \`${board.name}\`` + `\n` + 
                            `*Card name:* ${card.name}` + `\n` +
                            `Deleted by: \`${sender.username}\`` + '\n' +
                            `\`\`\` Description: ${description.text}\`\`\``
                        }
            },
            {
                type: 'divider'
            }
        ]
    };
};

//build message for when card is archived
const cardArchived = (body) => {

    const board = body.board;
    const card = body.card;
    const sender = body.sender;

    return {

        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `_Archived_ from board \`${board.name}\`` + `\n` +
                            `*Card name:* <${BASE_GLO_URL}/board/${toBase64(board.id)}/card/${toBase64(card.id)}|${card.name}>` + `\n` +
                            `Card archived by: \`${sender.username}\``
                }
            },
            {
                type: 'divider'
            }
        ]
    };
};

app.post('/', (req, res) => {

    let message;

    // trigger on added
    if (req.headers['x-gk-event'] === 'cards' && req.body.action === 'added') {
        message = cardAdded(req.body);
    }

    // trigger on deleted 
    else if (req.headers['x-gk-event'] === 'cards' && req.body.action === 'deleted') {
        message = cardDeleted(req.body);
    }

    //trigger on archive
    else if (req.headers['x-gk-event'] === 'cards' && req.body.action === 'archived') {
        message = cardArchived(req.body);
    }    

    //------------------------------------------------------------------------------->>
    //NOT IS USE FOR SLACK MESSAGES

    // trigger on duplicated
    else if (req.headers['x-gk-event'] === 'cards' && req.body.action === 'copied') {
        console.log(req.body.action + ' - ' + req.body.sender.username);
    }

    // trigger on update
    else if (req.headers['x-gk-event'] === 'cards' && req.body.action === 'updated') {
        console.log(req.body.action + ' - ' + req.body.sender.username);
    }

    // trigger on move
    else if (req.headers['x-gk-event'] === 'cards' && req.body.action === 'moved_column') {
        console.log(req.body.action + ' - ' + req.body.sender.username);
    }
    //<<-------------------------------------------------------------------------------

    if (message) {
        //Post message to slack
        return axios.post(SLACK_WEBHOOK_URL, message)
          .then(() => res.sendStatus(200))
          .catch(() => res.sendStatus(500));
    } else {
        res.sendStatus(200);
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});