"use strict";
/**
 * Generated using theia-plugin-generator
 */
Object.defineProperty(exports, "__esModule", { value: true });
const theia = require("@theia/plugin");
function start(context) {
    const informationMessageTestCommand = {
        id: 'hello-world-example-generated',
        label: "Hello World"
    };
    context.subscriptions.push(theia.commands.registerCommand(informationMessageTestCommand, (...args) => {
        theia.window.showInformationMessage('Hello World!');
    }));
}
exports.start = start;
function stop() {
}
exports.stop = stop;
//# sourceMappingURL=example-backend.js.map