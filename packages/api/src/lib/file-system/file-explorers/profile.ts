import { IFileExplorer } from './api'
import { LocationProfile, Profile } from '@remixproject/plugin-utils'

export const fileExplorerProfile: Profile<IFileExplorer> & LocationProfile = {
  name: "fileExplorers",
  displayName: "File explorers",
  description: "Provides communication between remix file explorers and remix-plugin",
  location: "sidePanel",
  documentation: "",
  version: "0.0.1",
  methods: ['getCurrentWorkspace', 'getWorkspaces', 'createWorkspace', 'renameWorkspace'],
  events: ['setWorkspace', 'renameWorkspace', 'deleteWorkspace', 'createWorkspace']
};