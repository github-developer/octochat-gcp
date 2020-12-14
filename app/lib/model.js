const logger = require('../lib/logger');
const Firestore = require('@google-cloud/firestore');

const db = new Firestore();

// send a message
const messageAdd = async (msgObj) => {
  const payload = {
    toId: msgObj.toId,
    to: msgObj.to,
    fromId: msgObj.fromId,
    from: msgObj.from,
    message: msgObj.message,
    receivedAt: (new Date()).getTime()
  };

  try {
    await db.collection('messages').add(payload);
  } catch (error) {
    logger.error(`[messageAdd] error: ${error}`);
  }

  return true;
};

// list the received messages
const messagesReceivedList = async (toId) => {
  try {
    const data = [];
    const query = await db.collection('messages').where('toId', '==', toId).get();

    for (const message of query.docs) {
      data.push(message.data());
    }
    return data;
  } catch (error) {
    logger.error(`[messagesReceivedList] error: ${error}`);
  }
};

// list the sent messages
const messagesSentList = async (fromId) => {
  try {
    const data = [];
    const query = await db.collection('messages').where('fromId', '==', fromId).get();

    for (const message of query.docs) {
      data.push(message.data());
    }
    return data;
  } catch (error) {
    logger.error(`[messagesSentList] error: ${error}`);
  }
};

// get messages between two user ids
const messagesBetween = async (user1, user2) => {
  // gather messages from user2 sent to user1
  const received = (await messagesReceivedList(user1)).filter(msg => parseInt(msg.fromId, 10) === parseInt(user2, 10));
  // gather messages to user2 sent by user1
  const sent = (await messagesSentList(user1)).filter(msg => parseInt(msg.toId, 10) === parseInt(user2, 10));
  // combine into one array and sort by received date
  return [].concat(received, sent).sort((a, b) => new Date(a.receivedAt) - new Date(b.receivedAt));
};

module.exports = {
  messageAdd,
  messagesReceivedList,
  messagesSentList,
  messagesBetween
};
