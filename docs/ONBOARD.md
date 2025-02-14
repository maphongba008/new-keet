# Keet Onboarding

### Handling Discover Communities

The main goal is to provide new users (fresh download) with ways of getting started, especially if they downloaded Keet from seeing socials and not via a friend invite.

_PS: Only empty lobby sees Discover Community_

You can find the list of discover community rooms with non-expiry invites hard-coded in [screens/DiscoveryCommunity/keet_community_rooms.js](https://github.com/holepunchto/keet-mobile/blob/main/src/screen/DiscoverCommunity/keet_community_rooms.js). The list contains the discoveryId and the room invite link to specific rooms listed. The list of public keet rooms can be found [here](https://github.com/gasolin/awesome-pears/blob/main/keet_rooms.md)

List of room we start with:

- 🍐 Pear Community
- Bug Bandits 🐞
- Keet News
- 🍐 Pear Development
- @bitcoin 🔥

Subsequently, we can add more rooms to the list by providing the discoveryId, room invite url amongst other details in the `keet_community_rooms.js` file.
