import { IFilePanel as IFilePanel } from './api'
import { LocationProfile, Profile } from '@remixproject/plugin-utils'

export const filePanelProfile: Profile<IFilePanel> & LocationProfile = {
  name: "filePanel",
  displayName: "File explorers",
  description: "Provides communication between remix file explorers and remix-plugin",
  location: "sidePanel",
  documentation: "",
  version: "0.0.1",
  methods: ['getCurrentWorkspace', 'getWorkspaces', 'createWorkspace', 'renameWorkspace', 'registerContextMenuItem'],
  events: ['setWorkspace', 'renameWorkspace', 'deleteWorkspace', 'createWorkspace', 'customAction']
};