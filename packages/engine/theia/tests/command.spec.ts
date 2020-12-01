import * as theia from '@theia/plugin';
import { CommandPlugin } from '../src/lib/command';


jest.mock('@theia/plugin', () => ({
  commands: () => jest.fn(),
}));

const methods = ['firstMethod', 'secondMethod'];
const profile = { name: 'mock', methods: methods }

describe('CommandPlugin', () => {
  let plugin: CommandPlugin;
  let disposable: theia.Disposable;


  beforeEach(() => {
    plugin = new CommandPlugin(profile)
    disposable = { dispose: jest.fn().mockImplementation(() => { return }) }
    theia.commands.registerCommand = jest.fn().mockReturnValue(disposable)
  })

  it('Plugin has a profile', () => {
    expect(plugin.profile).toEqual(profile)
    expect(plugin.name).toBe(profile.name);
  });

  it('Commands are registered on activation', () => {
    plugin.activate();
    expect(plugin.subscriptions.length).toBe(methods.length);
    expect(theia.commands.registerCommand).toHaveBeenCalledTimes(methods.length)
  });

  it('Commands are disposed on deactivation', () => {
    plugin.activate();
    plugin.deactivate();
    expect(disposable.dispose).toHaveBeenCalledTimes(methods.length)
  });
});
