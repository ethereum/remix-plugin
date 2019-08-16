import { IBox } from './api'
import { LibraryProfile } from '../../types'

export const boxProfile: LibraryProfile<IBox> = {
  name: 'box',
  methods: [
    'login',
    'isEnabled',
    'getUserAddress',
    'openSpace',
    'closeSpace',
    'isSpaceOpened',
    'getSpacePrivateValue',
    'setSpacePrivateValue',
    'getSpacePublicValue',
    'setSpacePublicValue',
    'getSpacePublicData',
    'getSpaceName'
  ],
  events: ['enabled', 'loggedIn', 'loggedOut', 'spaceClosed', 'spaceOpened']
}
