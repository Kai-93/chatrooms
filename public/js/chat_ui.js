/*
 * @Author: Kaiser
 * @Date: 2020-07-05 19:26:58
 * @Last Modified by: Kaiser
 * @Last Modified time: 2020-07-13 14:21:57
 * @Description:
 */

function processUserInput(chatApp, socket) {
  const domOfSendMessage = getDOM('#send-message');
  const message = domOfSendMessage.value;
  let systemMessage;
  if (message.startsWith('/')) {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
      addMessages(divSystemContentElement(systemMessage));
    }
    domOfSendMessage.value = '';
    return;
  }
  chatApp.sendMessage(getDOM('#room').innerText, message);
  addMessages(divEscapedContentElement(`You: ${message}`));
  domOfSendMessage.value = '';
}

function scrollBottom() {
  const dom = getDOM('#messages');
  dom.scrollTop = dom.scrollHeight || 0;
}

function addMessages(content) {
  const dom = getDOM('#messages');
  dom.appendChild(content);
  scrollBottom();
}
