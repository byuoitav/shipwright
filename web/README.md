# Web

## Component Hierarchy

```text

Key: <component name> (any modals used by this component)
**Note**: does *_not_* represent directory structure, but which components hold which others.

AppComponent
|
|-->DashboardComponent (SettingsModal)
|   |
|   |-->DashPanelComponent* *_interface_*
|       |
|       |-->AlertTableComponent* (RespondModal)
|       |-->BatteryReportComponent* (unsure?)
|
|-->ConfigurationComponent
|   |
|   |-->BuildingListComponent
|       |---made of BuildingComponents (BuildingModal)
|       |
|       |-->RoomListComponent
|           |---made of RoomComponents (RoomModal)
|           |
|           |-->RoomPageComponent
|               |
|               |-->SummaryComponent
|               |   |
|               |   |-->AlertTableComponent (RespondModal)
|               |   |-->(? other things I'm sure)
|               |
|               |-->BuilderComponent (many modals... port configuration, UI preset stuff, etc.)
|               |   |
|               |   |-->(? unsure right now, but probably many things)
|               |
|               |-->StateComponent
|               |
|               |-->DeviceListComponent
|                   |
|                   |-->DeviceComponent (DeviceModal)
|
|-->StateComponent
```

## Services

APIService

    - Obtains information from the back end using HTTP calls.
    - Used for non-real time data acquisition, i.e. querying information from Couch or ELK.
    - Does not store the information, but merely performs functions to obtain information.

SocketService

    - Obtains information from websocket connections to the back end.
    - Used for real time data acquisition, i.e. alerts, events, and other real-time data.
    - Does not store the information, but merely relays information to interested parties.

DataService

    - Essentially a local copy of the database information to be used.
    - Stores the information that is used by the different components to create and edit new information for Pi Control Systems.
    - Typically uses the APIService to obtain its information since it is not needed in real time.

StaticService

    - A local copy of the static records needed from ELK for device states, room states, and DMPS room information.
    - Typically uses the APIService to obtain its information since it is not needed in real time.

MonitoringService

    - The front end storage for alert information to be presented in the AlertTable and any other monitoring portions of the front end.
    - Typically uses the SocketService to obtain its information since it is needed in real time.

ModalService

    - A central service for opening, closing, and performing transactions that take place around modals/pop-ups.

StringsService

    - A central service for keeping the text used on the page that is not dynamically created.
    - This includes, but is not limited to, text for:
        - Tooltips
        - Labels & Links
        - Error Messages
        - Any other static text needed
    - The idea is that if text needs to be changed then we only have to change it in one location rather than hunt down every reference in every file.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.1.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
