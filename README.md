**Volleyball Teams**

name: String

location: String

isLeader: boolean

numberOfMatches: number

**features of the app**

**ionic1**:
Implement a master-detail user interface

Use a REST service to fetch data

Use web sockets to receive server-side notifications

**ionic2**:
Use the local storage for storing data fetched from server

Use lists with pagination (infinite scrolling)

Authenticate user using JWT

Use secured REST services

Use secured web sockets


Show the network status (online/offline), 1p

Authenticate users, 1p

After login, app stores the auth token in local storage

When app starts, the login page is not opened if the user is authenticated

App allows users to logout

Link the resource instances to the authenticated user, 1p

REST services return only the resources linked to the authenticated user

Web socket notifications are sent only if the modified resources are linked to the authenticated user

Online/offline behaviour, 2p

In online mode, the app tries first to use the REST services when new items are created/updated

In offline mode or if the REST calls fail, the app stores data locally

Inform user about the items not sent to the server

When entering the online mode, the app automatically tries to send data to the server, 1p

Use pagination, 2p

Use search & filter, 1p

**ionic3**:
Use camera

Use file system

Use location

Use maps

Use animations

Assessment

Use camera

In the context of the edit page allow user to take a photo 1p

Show photo when the resource is shown (in list/view/edit pages), 1p

Save photo on the device, 1p

Upload photo, 1p

Use maps

In the context of the edit page allow user to open a map in order to select a location of that resource, 1.5p

Later, allow user to open a map in order to locate the resource, 1.5p

Use animations

Animate some components, 1p

Override existing component animations, 1p