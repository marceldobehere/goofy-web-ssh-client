# Goofy Web SSH client (Websocket)

A web based client for ssh over websockets.

Meant to be used as a web alternative for the [Goofy Websocket SSH Client](https://github.com/marceldobehere/Goofy-SSH) and used with the [Goofy Websocket Socket Bridge](https://github.com/marceldobehere/Goofy-Websocket-Socket-Bridge).


You can statically host the site or just download and open it locally.

NOTE: If you want to be able to access normal (`ws://`) websockets, you **cannot** host this site using https, because it will be blocked! If it is hosted on https it will only work with secure websockets (`wss://`).


## Screenshot
![Example](./images/logged%20in.PNG)


## Thanks to
* [libssh2.js](https://github.com/sitepi/libssh2.js)
* [xterm.js](https://github.com/xtermjs/xterm.js)