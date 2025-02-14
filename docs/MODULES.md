# MODULES & MODULE OWNER

In order to streamline issue resolution and manage new feature requests efficiently within the Keet mobile app, we've established a dedicated point of contact for each module. Here's a quick guide on how to navigate this process:

## Task Creation

When Creating Tasks on Asana:

1. **Unsure of category**: If you're unsure about which category an issue belongs to, please create an Asana task under "Untriaged Bugs" https://app.asana.com/0/1207558849244259/1207562492713303

2. **Add the module category**: Write task title as `[MODULE] descriptions ...`. `[MODULE]` is defined as following modules below. CC the App/Module reviewer to triage and gather feedback for the task.

## Code Submission

> [!IMPORTANT]
> Reference to the template when create pull request https://github.com/holepunchto/keet-mobile/blob/main/.github/PULL_REQUEST_TEMPLATE.md

----

## Responsibilities of Module Owners:

The module owner should:

- Triage the reported issue to determine its validity or seek input/help from others.
- **Code review** for the related module (drop-by review is still encouraged)
- Include any noteworthy bugs or requests in the weekly report for reference.
- Raise performance & stability improvement proposals

## Modules

For each sub categories or module, reach out to the following individuals:

> [!IMPORTANT]
> Reviewers will be auto assigned according to the PR's title. Defined in https://github.com/holepunchto/keet-mobile/blob/main/.github/workflows/assign.yml#L31 . Devs are encouraged to do drop-by review.

### SYSTEM

- System (Internal)
- Store/API (cross team)
- Stats/Network/Connections
- Push Notifications

### CI

- build scripts / Build Customization
- github actions
- Translations

### ROOM

- Identity Onboarding
- Group Chat
- Broadcast Feed
- Direct messages (DM)
- Lobby screen
  - Search/Join/Create/Leave Room
  - list Room, room stats, message preview
- Room Options screen
  - Invite link
  - Manage Members
  - Preferences
- Profile screen
- Passcode

### CHAT

- Chat view
- Message list, scroll
- Event types
- Text based messages (Media will be deal by `MEDIA`)
- Message Input
- Emojis
- Reactions

### MEDIA

Media and Files beyond text

- File download, status, thumnails
- Video / player
- Image / image viewer
- Voice / Voice Recorder
- Media & Files (in Room Options Screen)
- Share from other App

### CALL

- Call UI
- Voice/Video Call
- Screen Sharing

### Wallet

- Wallet Setup
- history, Send, Receive

## Ongoing Updates:

This list is dynamic and evolving. Feel free to ping Fred when you're ready to take ownership of a module. Fred will facilitate discussions with current module owners to ensure a smooth transition and update the list accordingly.

For further insights, we've drawn inspiration from the [Mozilla Modules & Module Owners structure](https://www.mozilla.org/en-US/about/governance/policies/module-ownership/). Let's work together to maintain a robust and efficient system for issue resolution and feature enhancement.
