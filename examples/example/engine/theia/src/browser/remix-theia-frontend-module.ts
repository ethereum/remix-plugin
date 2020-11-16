import { CommandContribution, MenuContribution } from '@theia/core';
import { ContainerModule } from "inversify";
import { RemixConsoleLogContribution, RemixConsoleLogMenuContribution } from './remix-contribution';


export default new ContainerModule(bind => {
  bind(CommandContribution).to(RemixConsoleLogContribution);
  bind(MenuContribution).to(RemixConsoleLogMenuContribution);
});
