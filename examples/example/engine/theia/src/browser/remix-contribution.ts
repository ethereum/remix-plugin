import { CommonMenus } from '@theia/core/lib/browser';
import { Command, CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry} from '@theia/core/lib/common';
import {injectable } from 'inversify';

const LogToConsole: Command = {
    id: 'logToRemixConsole.command',
    label: 'Say hello by remix console plugin',
};

@injectable()
export class RemixConsoleLogContribution implements CommandContribution {

    constructor(
    ) { }

    registerCommands(registry: CommandRegistry): void {};
}

@injectable()
export class RemixConsoleLogMenuContribution implements MenuContribution {
    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: LogToConsole.id,
            label: LogToConsole.label
        });
    }
}
