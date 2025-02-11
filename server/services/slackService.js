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
      console.error('Error creating Slack channel:', error);
   }
};

exports.sendSlackMessage = async function sendSlackMessage(channelId, message) {
   try {
      const response = await slackClient.chat.postMessage({
         channel: channelId,
         text: message
      });
      
      console.log(`Message sent to Slack channel (channel ID: ${channelId})`);
      return response;
   } catch (error) {
      console.error('Error sending message to Slack:', error);
   }
};