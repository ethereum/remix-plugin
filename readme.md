# Remix Plugin and Modules

This project aims to build an interoperable way of communicating amongst the IDE developped on top of Remix technologies. It's based on modules communicating with each other through an `AppManager`.

## Module vs Plugins

- Modules: Internal logic, build by the core team, that runs inside the IDE.
- Plugin: External logic, build by the community, that runs inside iframes.

## AppManager

Modules and Plugins communicates with each other through the `AppManager`.

