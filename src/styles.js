export default function() {/*
  @font-face {
    font-family: 'gerrit-f-button';
    src:
      url(data:application/font-woff;charset=utf-8;base64,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) format('woff'),
      url(data:application/x-font-ttf;charset=utf-8;base64,AAEAAAALAIAAAwAwT1MvMg8SBpIAAAC8AAAAYGNtYXDqJOpPAAABHAAAAFxnYXNwAAAAEAAAAXgAAAAIZ2x5ZppGirMAAAGAAAABoGhlYWQKmABpAAADIAAAADZoaGVhB8EDyAAAA1gAAAAkaG10eBIAAEIAAAN8AAAAHGxvY2EAyAFUAAADmAAAABBtYXhwAAsAOgAAA6gAAAAgbmFtZYv5+kUAAAPIAAAB5nBvc3QAAwAAAAAFsAAAACAAAwOAAZAABQAAApkCzAAAAI8CmQLMAAAB6wAzAQkAAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAAAAAAAAAAAABAAADp6APA/8AAQAPAAEAAAAABAAAAAAAAAAAAAAAgAAAAAAADAAAAAwAAABwAAQADAAAAHAADAAEAAAAcAAQAQAAAAAwACAACAAQAAQAg6Z3p6P/9//8AAAAAACDpnenn//3//wAB/+MWZxYeAAMAAQAAAAAAAAAAAAAAAAABAAH//wAPAAEAAAAAAAAAAAACAAA3OQEAAAAAAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAAAAAAAAAgAANzkBAAAAAAMAQP/AA8ADwAAZACEANwAAAS4BJy4BJy4BIyEiBhURFBYzITI2NRE0JicnHgEXIzUeARMUBiMhIiY1ETQ2MzA6AjEVFBY7AQOWES0ZGjMXJykL/hAhLy8hAuAhLw4chRclDZoRKYYJB/0gBwkJB5u6mxMN4ALbFzMaGS0RHA4vIfygIS8vIQJwCyknNhcpEZoNJfzoBwkJBwNgBwngDRMAAAAAAgABAEAD/wOAAA8AGwAAASEiBhcTHgEzITI2NxM2Jic0JiMhJyMiBh0BIQPY/FAUFwR2AyIUAqAUIgN2BBdsHBT+UCDQFBwDAALAHBP93hMcHBMCIhMcUBQcQBwUUAAAAgABAEAD/wOAAA8AGwAAATIWBwMOASMhIiYnAyY2MyUVITU0NjsBFyEyFgPYFBcEdgMiFP1gFCIDdgQXEwNZ/QAcFNAgAbAUHAJAHBP+XhMcHBMBohMc0JDQFBxAHAAAAQAAAAEAALTpHUtfDzz1AAsEAAAAAADTvN32AAAAANO83fYAAP/AA/8DwAAAAAgAAgAAAAAAAAABAAADwP/AAAAEAAAAAAAD/wABAAAAAAAAAAAAAAAAAAAABwQAAAAAAAAAAAAAAAIAAAAEAABABAAAAQQAAAEAAAAAAAoAFAAeAHAAoADQAAEAAAAHADgAAwAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAOAK4AAQAAAAAAAQAPAAAAAQAAAAAAAgAHAKgAAQAAAAAAAwAPAE4AAQAAAAAABAAPAL0AAQAAAAAABQALAC0AAQAAAAAABgAPAHsAAQAAAAAACgAaAOoAAwABBAkAAQAeAA8AAwABBAkAAgAOAK8AAwABBAkAAwAeAF0AAwABBAkABAAeAMwAAwABBAkABQAWADgAAwABBAkABgAeAIoAAwABBAkACgA0AQRnZXJyaXQtZi1idXR0b24AZwBlAHIAcgBpAHQALQBmAC0AYgB1AHQAdABvAG5WZXJzaW9uIDEuMABWAGUAcgBzAGkAbwBuACAAMQAuADBnZXJyaXQtZi1idXR0b24AZwBlAHIAcgBpAHQALQBmAC0AYgB1AHQAdABvAG5nZXJyaXQtZi1idXR0b24AZwBlAHIAcgBpAHQALQBmAC0AYgB1AHQAdABvAG5SZWd1bGFyAFIAZQBnAHUAbABhAHJnZXJyaXQtZi1idXR0b24AZwBlAHIAcgBpAHQALQBmAC0AYgB1AHQAdABvAG5Gb250IGdlbmVyYXRlZCBieSBJY29Nb29uLgBGAG8AbgB0ACAAZwBlAG4AZQByAGEAdABlAGQAIABiAHkAIABJAGMAbwBNAG8AbwBuAC4AAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA) format('truetype'),
      url(data:image/svg+xml;charset=utf-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiID4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8bWV0YWRhdGE+R2VuZXJhdGVkIGJ5IEljb01vb248L21ldGFkYXRhPgo8ZGVmcz4KPGZvbnQgaWQ9ImdlcnJpdC1mLWJ1dHRvbiIgaG9yaXotYWR2LXg9IjEwMjQiPgo8Zm9udC1mYWNlIHVuaXRzLXBlci1lbT0iMTAyNCIgYXNjZW50PSI5NjAiIGRlc2NlbnQ9Ii02NCIgLz4KPG1pc3NpbmctZ2x5cGggaG9yaXotYWR2LXg9IjEwMjQiIC8+CjxnbHlwaCB1bmljb2RlPSImI3gyMDsiIGhvcml6LWFkdi14PSI1MTIiIGQ9IiIgLz4KPGdseXBoIHVuaWNvZGU9IiYjeGU5OWQ7IiBnbHlwaC1uYW1lPSJmaWxlIiBkPSJNOTE3LjgwNiA3MzAuOTI0Yy0yMi4yMTIgMzAuMjkyLTUzLjE3NCA2NS43LTg3LjE3OCA5OS43MDRzLTY5LjQxMiA2NC45NjQtOTkuNzA0IDg3LjE3OGMtNTEuNTc0IDM3LjgyLTc2LjU5MiA0Mi4xOTQtOTAuOTI0IDQyLjE5NGgtNDk2Yy00NC4xMTIgMC04MC0zNS44ODgtODAtODB2LTg2NGMwLTQ0LjExMiAzNS44ODgtODAgODAtODBoNzM2YzQ0LjExMiAwIDgwIDM1Ljg4OCA4MCA4MHY2MjRjMCAxNC4zMzItNC4zNzIgMzkuMzUtNDIuMTk0IDkwLjkyNHpNNzg1LjM3NCA3ODUuMzc0YzMwLjctMzAuNyA1NC44LTU4LjM5OCA3Mi41OC04MS4zNzRoLTE1My45NTR2MTUzLjk0NmMyMi45ODQtMTcuNzggNTAuNjc4LTQxLjg3OCA4MS4zNzQtNzIuNTcyek04OTYgMTZjMC04LjY3Mi03LjMyOC0xNi0xNi0xNmgtNzM2Yy04LjY3MiAwLTE2IDcuMzI4LTE2IDE2djg2NGMwIDguNjcyIDcuMzI4IDE2IDE2IDE2IDAgMCA0OTUuOTU2IDAuMDAyIDQ5NiAwdi0yMjRjMC0xNy42NzIgMTQuMzI2LTMyIDMyLTMyaDIyNHYtNjI0eiIgLz4KPGdseXBoIHVuaWNvZGU9IiYjeGU5ZTc7IiBnbHlwaC1uYW1lPSJmb2xkZXIiIGQ9Ik05ODQuNSA3MDRoLTk0NWMtMjYuNCAwLTQzLjc2NC0yMS4xOC0zOC41ODYtNDcuMDY4bDExNy42NzItNTQ1Ljg2NGM1LjE3OC0yNS44ODggMzEuMDE0LTQ3LjA2OCA1Ny40MTQtNDcuMDY4aDY3MmMyNi4zOTggMCA1Mi4yMzQgMjEuMTggNTcuNDEyIDQ3LjA2OGwxMTcuNjc0IDU0NS44NjRjNS4xNzggMjUuODg4LTEyLjE4OCA0Ny4wNjgtMzguNTg2IDQ3LjA2OHpNODk2IDc4NGMwIDI2LjUxLTIxLjQ5IDQ4LTQ4IDQ4aC00MzJsLTMyIDY0aC0yMDhjLTI2LjUxIDAtNDgtMjEuNDktNDgtNDh2LTgwaDc2OHYxNnoiIC8+CjxnbHlwaCB1bmljb2RlPSImI3hlOWU4OyIgZ2x5cGgtbmFtZT0iZm9sZGVyLS1vcGVuIiBkPSJNOTg0LjUgNTc2YzI2LjQgMCA0My43NjQtMjEuMTggMzguNTg2LTQ3LjA2OGwtMTE3LjY3Mi00MTcuODY0Yy01LjE3OC0yNS44ODgtMzEuMDE0LTQ3LjA2OC01Ny40MTQtNDcuMDY4aC02NzJjLTI2LjQgMC01Mi4yMzYgMjEuMTgtNTcuNDE0IDQ3LjA2OGwtMTE3LjY3MiA0MTcuODY0Yy01LjE3OCAyNS44ODggMTIuMTg2IDQ3LjA2OCAzOC41ODYgNDcuMDY4aDk0NXpNODk2IDc4NHYtMTQ0aC03Njh2MjA4YzAgMjYuNTEgMjEuNDkgNDggNDggNDhoMjA4bDMyLTY0aDQzMmMyNi41MSAwIDQ4LTIxLjQ5IDQ4LTQ4eiIgLz4KPC9mb250PjwvZGVmcz48L3N2Zz4=) format('svg')
    ;
    font-weight: normal;
    font-style: normal;
  }

  [class^="f-button-icon__"],
  [class*=" f-button-icon__"] {
    font-family: 'gerrit-f-button' !important;
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .f-button-icon__file:before {
    content: "\e99d";
  }
  .f-button-icon__folder:before {
    content: "\e9e7";
  }
  .f-button-icon__folder--open:before {
    content: "\e9e8";
  }

  body.gerrit--with-f-button {
    margin-left: 280px;
  }

  body.gerrit--with-f-button-overlay {
    margin-left: 0;
  }

  .f-button__frame {
    position: fixed;
    top: 0;
    right: auto;
    bottom: 0;
    left: 0;

    width: 240px;
    overflow: auto;

    border-color: #aaa;
    border-right-style: solid;
    border-right-width: 1px;
    background: white;
    padding: 10px;

    font-size: 0.85em;
    line-height: 1.4;

    z-index: 6;
  }

  body.gerrit--with-f-button-overlay .f-button__frame {
    width: 50%;
    left: 25%;
    top: 50%;
    border-left-width: 1px;
    border-left-style: solid;
    border-top-style: solid;
    border-top-width: 1px;

    opacity: 0.85;
  }

  body.gerrit--with-f-button-overlay .f-button__frame:hover {
    opacity: 1;
  }

  .f-button__frame--commented-only .f-button-file:not(.f-button-file--commented) {
    display: none;
  }

  .f-button__frame--list-view .f-button-file__folder {
    padding-left: 0;
  }

  .f-button__frame--list-view .f-button-file__folder-header {
    display: none;
  }

  .f-button__controls {
    border-top: 1px solid #ddd;
    margin-top: 1em;
    padding-top: 1em;
  }

  .f-button__controls label {
    display: block;
  }

  .f-button__controls input {
    margin-top: 0;
    margin-bottom: 0;
    vertical-align: middle;
  }

  .f-button-file {
    list-style: none;
  }

  .f-button-file:hover, .f-button-file--selected {
    background: #fcfa96;
  }

  .f-button-file--active {
    background-color: #DEF;
  }

  .f-button-file__icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    vertical-align: middle;
    position: absolute;
    text-align: left;
  }

  .f-button-file__link {
    display: block;
    margin-right: 2em;
    margin-left: 16px;
    padding-left: 0.25em;
    line-height: 1.6;
    text-decoration: none;
    word-break: break-all;
  }

  .f-button-file__folder {
    list-style: none;
    margin-left: 0;
    padding-left: 0.5em;
  }

  .f-button-file__folder-header {
    font-weight: bold;
    margin-left: 1.5em;
  }

  .f-button-file__folder-header .f-button-icon__folder {
    margin-left: -1.5em;
  }

  .f-button-file__folder--root {
    padding-left: 0;
    margin: 0;
  }

  .f-button-file__comment-count {
    position: absolute;
    right: 0;
    max-width: 2em;
    padding-right: 1em;
    text-align: right;
    font-weight: bold;
    line-height: 1.6;
  }

  .f-button-file__icon.f-button-icon__file   { line-height: inherit; margin-top: 1px; }
  .f-button-file__icon.f-button-icon__folder { margin-top: 2px; }
*/}.toString().replace('function () {/*', '').replace('*/}', '');