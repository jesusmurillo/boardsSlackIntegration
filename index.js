const express =  require('express');
const { toBase64 } = require('base64-mongo-id');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 0000;

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
                    text: `:pencil: _Added_ to board \`${board.name}\`` + '\n' +
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

// Card added to Feature column
const cardAddedFeature = (body) => {

    const board = body.board;
    const card = body.card;
    const sender = body.sender;

    return{

        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `:sparkles: _Added_ to board \`${board.name}\`` + '\n' +
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

// Card added to Bug column
const cardAddedBug = (body) => {

    const board = body.board;
    const card = body.card;
    const sender = body.sender;

    return{

        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `:bug: _Added_ to board \`${board.name}\`` + '\n' +
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
                    text: `:file_cabinet: _Archived_ from board \`${board.name}\`` + `\n` +
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

//build message for when card is moved to feature column
const cardMovedFeature = (body) => {

    const board = body.board;
    const card = body.card;
    const sender = body.sender;

    return {

        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `_Moved_ to column \`Feature\`` + `\n` +
                            `*Card name:* <${BASE_GLO_URL}/board/${board.id}/card/${card.id}|${card.name}>` + `\n` +
                            `Card moved by: \`${sender.username}\``
                }
            },
            {
                type: 'divider'
            }
        ]
    };
};

//build message for when label On-Hold is added to card
const cardOnHoldAdded = (body) => {

    const board = body.board;
    const card = body.card;
    const sender = body.sender;

    return {

        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `:skull_and_crossbones: Card is \`On-Hold\`` + `\n` +
                            `*Card name:* <${BASE_GLO_URL}/board/${board.id}/card/${card.id}|${card.name}>`
                }
            },
            {
                type: 'divider'
            }
        ]
    };
};

//build message for when label On-Hold is removed from card
const cardOnHoldRemoved = (body) => {

    const board = body.board;
    const card = body.card;
    const sender = body.sender;

    return {

        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `:party-time: \`On-Hold\` removed` + `\n` +
                            `*Card name:* <${BASE_GLO_URL}/board/${board.id}/card/${card.id}|${card.name}>`
                }
            },
            {
                type: 'divider'
            }
        ]
    };
};

/// this will create a new text file when the label In Production is added
const writeToTextFile = (body) => {

    const cardIndentification = body.card.id;
    const cardName = body.card.name;

    fs.writeFile(`/Users/jesusmurillo/testfiles/${cardIndentification}.txt`, cardName, 'utf8', function() {
        console.log("Success! File created for " + cardName);
    })
}

app.post('/', (req, res) => {

    let message;
    let divider = new RegExp('\-\-\-')

    // trigger on added
    if (req.headers['x-gk-event'] === 'cards' && req.body.action === 'added') {

        //Feature
        if (req.body.card.column_id == `5eaa58a94435d10014b755bb`) {

            if (req.body.card.name === divider) {
                message = console.log('This is a divider: added by ' + req.body.sender.username)
            }
            else 
                message = cardAddedFeature(req.body);
        }

        //Bug
        else if (req.body.card.column_id == `5eaa58bf6cb04e00112aab3b`) {
            message = cardAddedBug(req.body);
        } 
        else 
            message = console.log(req.body.action + ' - ' + req.body.sender.username);
    }

    //trigger on archive
    else if (req.headers['x-gk-event'] === 'cards' && req.body.action === 'archived') {
        message = cardArchived(req.body);
    }
    // trigger on move
    else if (req.headers['x-gk-event'] === 'cards' && req.body.action === 'moved_column') {

        //column Feature
        if (req.body.card.column_id == `5eaa58a94435d10014b755bb`) {
            message = cardMovedFeature(req.body);
        }
        //Need Bug column and need to create new message
        else
            console.log(req.body.action + ' - ' + req.body.sender.username);
    }

    //labels_updates
    else if (req.headers['x-gk-event'] === 'cards' && req.body.action === 'labels_updated') {
        let labelsAdded = req.body.labels.added;
        let labelsRemoved = req.body.labels.removed;

        if (labelsAdded.length >= 1) {
            for (let i = 0; i < labelsAdded.length; i++) {
                if (labelsAdded[i].id === '5eb0d9e14435d10014b81b00') {
                    message = cardOnHoldAdded(req.body);
                }

                /// In Production label
                /// Need to extract emails form description
                else if (labelsAdded[i].id === `5f2cca65cbb2fc00112155b3`){
                    writeToTextFile(req.body);
                }
                else
                    console.log(req.body.action + ' - ' + req.body.sender.username);
            }
        }
        else if (labelsRemoved.length >= 1) {
            for (let i = 0; i < labelsRemoved.length; i++) {
                if (labelsRemoved[i].id === '5eb0d9e14435d10014b81b00') {
                    message = cardOnHoldRemoved(req.body);
                }
                else 
                    console.log(req.body.action + ' - ' + req.body.sender.username);
            }
        }
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

    // trigger on deleted 
    else if (req.headers['x-gk-event'] === 'cards' && req.body.action === 'deleted') {
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