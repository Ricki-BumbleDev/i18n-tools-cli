# i18n Tools CLI

CLI for transforming translation files from INI format to JSON format and vice versa plus translating INI files using Google Translate

## Installation

```
npm i -g i18n-tools-cli
```

## Usage

```
Commands:
  i18n to-json <base-language>                      Convert i18n file to JSON file
  i18n from-json <base-language>                    Convert JSON file to i18n file
  i18n translate <base-language> <target-language>  Translate i18n file
  i18n extract-keys <base-language>                 Extract translation keys to file
  i18n extract-translations <base-language>         Extract translations (without keys) to file

Options:
  --help             Show help                      [boolean]
  --version          Show version number            [boolean]
  --base-dir, -b                               [default: "."]
  --input-file, -i
  --output-file, -o
```
