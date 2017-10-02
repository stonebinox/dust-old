const _ = require('lodash');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const getConversations = (userId) => {
  return new Promise((resolve, reject) => {
    Conversation.find({ participants: userId })
      .select('_id participants')
      .populate({
        path: 'participants'
      })
      .exec((err, conversations) => {
        if (err) {
          reject(err);
        }

        if (conversations.length === 0) {
          resolve([]);
        }

        // Set up empty array to hold conversations + most recent message
        const fullConversations = [];
        try {
          conversations.forEach((conversation) => {
            const el = _.find(conversation.participants, (e) => {
              return e._id.toString() !== userId.toString();
            });

            fullConversations.push(Object.assign({}, el.toObject(), {
              conversationId: conversation._id
            }));

            if (fullConversations.length === conversations.length) {
              resolve(fullConversations);
            }
          });
        } catch (e) {
          resolve([]);
        }
      });
  });
};

const getOtherParticipant = (conversationId, currentUserId) => {
  return new Promise((resolve, reject) => {
    Conversation.findOne({ _id: conversationId })
      .populate({
        path: 'participants',
        select: 'profile.firstName profile.lastName email'
      })
      .exec((err, conversation) => {
        if (err) {
          reject(err);
        } else {
          const el = _.find(conversation.participants, (e) => {
            return e._id.toString() !== currentUserId.toString();
          });

          resolve(el);
        }
      });
  });
};

exports.index = async (req, res) => {
  if (!req.user.verified) {
    return res.redirect('/?unverified=true');
  }

  const conversations = await getConversations(req.user._id);

  res.render('messages', {
    title: 'Messages',
    fixedHeader: true,
    conversations
  });
};

exports.message = (req, res) => {
  if (!req.user) {
    req.redirect('/signup');
  }

  if (!req.user.verified) {
    return res.redirect('/?unverified=true');
  }

  Message.find({ conversationId: req.params.conversationId })
    .select('createdAt body author')
    .sort('createdAt')
    .populate({
      path: 'author',
      select: 'profile.firstName profile.lastName email'
    })
    .exec(async (err, messages) => {
      if (err) {
        res.send({ error: err });
      }

      const user = await getOtherParticipant(req.params.conversationId, req.user._id);

      res.render('message', {
        title: 'Message',
        fixedHeader: true,
        currentUser: req.user._id,
        conversationId: req.params.conversationId,
        userName: `${req.user.profile.firstName} ${req.user.profile.lastName}`,
        userEmail: req.user.email,
        otherParticipant: {
          name: `${user.profile.firstName} ${user.profile.lastName}`,
          email: user.email
        },
        messages
      });
    });
};

exports.createConversation = (req, res) => {
  if (!req.user.verified) {
    return res.redirect('/?unverified=true');
  }

  Conversation.findOne({ $or: [
    { participants: [req.user._id, req.params.recipient] },
    { participants: [req.params.recipient, req.user._id] }
  ] })
    .exec((err, conversation) => {
      if (err || !conversation) {
        const conversation = new Conversation({
          participants: [req.user._id, req.params.recipient]
        });

        return conversation.save((err) => {
          if (err) {
            res.send({ error: err });
          }

          res.redirect(`/messages/${conversation._id}`);
        });
      }

      return res.redirect(`/messages/${conversation._id}`);
    });
};

exports.reply = (req, res) => {
  try {
    const reply = new Message({
      conversationId: req.params.conversationId,
      body: req.body.composedMessage,
      author: req.user._id
    });

    reply.save((err) => {
      if (err) {
        res.redirect('/');
      }

      res.status(200).json({ message: 'Reply successfully sent!' });
    });
  } catch (e) {
    res.redirect('/');
  }
};
