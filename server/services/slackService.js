const { WebClient } = require('@slack/web-api');
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

exports.createSlackChannel = async function createSlackChannel(projectName) {
   try {
      const response = await slackClient.conversations.create({
         name: projectName.toLowerCase().replace(/\s+/g, '-'), // Convert name to Slack-friendly format
         is_private: false
      });

      console.log(`Slack channel created: ${response.channel.id}`);
      return response.channel.id;
   } catch (error) {
      console.error('Error creating Slack channel: ', error);
   }
};

exports.renameSlackChannel = async function renameSlackChannel(channelId, newName) {
   try {
      const response = await slackClient.conversations.rename({
         channel: channelId,
         name: newName.toLowerCase().replace(/\s+/g, '-')
      });

      console.log(`Slack channel renamed to ${response.channel.name}`);
      return response;
   } catch (error) {
      console.error('Error renaming Slack channel: ', error);
   }
}

exports.archiveSlackChannel = async function archiveSlackChannel(channelId) {
   try {
      const response = await slackClient.conversations.archive({ channel: channelId });
      
      console.log(`Slack channel ${channelId} has been archived.`);
      return response;
   } catch (error) {
      console.error('Error archiving Slack channel: ', error);
   }
}


exports.inviteUsersToChannel = async function inviteUsersToChannel(channelId, userIdList) {
   try {
      const response = await slackClient.conversations.invite({
         channel: channelId,
         users: userIdList.join()
      });

      userIdList.length > 1
         ? console.log(`${userIdList.length} Users added to channel ${channelId}`)
         : console.log(`1 User added to channel ${channelId}`);

      return response;
   } catch (error) {
      console.error('Error inviting user(s) to Slack channel: ', error);
   }
}

exports.removeUserFromChannel = async function removeUserFromChannel(channelId, userId) {
   try {
      const response = await slackClient.conversations.kick({
         channel: channelId,
         user: userId
      });

      console.log(`User ${userId} removed from channel ${channelId}`);
      return response;
   } catch (error) {
      console.error('Error removing user from Slack channel: ', error);
   }
}


exports.sendSlackMessage = async function sendSlackMessage(channelId, message) {
   try {
      const response = await slackClient.chat.postMessage({
         channel: channelId,
         text: message
      });
      
      console.log(`Message sent to Slack channel (channel ID: ${channelId})`);
      return response;
   } catch (error) {
      console.error('Error sending message to Slack: ', error);
   }
};