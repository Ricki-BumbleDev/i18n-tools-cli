#!/usr/bin/env node
import googleTranslate from '@k3rn31p4nic/google-translate-api';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const splitAtFirstEqualSign = string => {
  const firstEqualSignPosition = string.indexOf('=');
  return [string.substring(0, firstEqualSignPosition), string.substring(firstEqualSignPosition + 1)];
};

const getFilePath = (baseLanguage, baseDir, overwriteFilePath, type = 'ini') => {
  if (overwriteFilePath) {
    return overwriteFilePath;
  }
  if (type === 'json') {
    return path.join(baseDir, baseLanguage + '.i18n.json');
  }
  if (fs.existsSync(path.join(baseDir, baseLanguage + '.i18n'))) {
    return path.join(baseDir, baseLanguage + '.i18n');
  }
  if (fs.existsSync(path.join(baseDir, baseLanguage + '.i18n.properties'))) {
    return path.join(baseDir, baseLanguage + '.i18n.properties');
  }
  return path.join(baseDir, baseLanguage + '.i18n.ini');
};

const loadIniFile = filePath =>
  Object.fromEntries(
    fs
      .readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .filter(translation => translation.includes('='))
      .map(splitAtFirstEqualSign)
  );

const writeIniFile = (translations, filePath) =>
  fs.writeFileSync(
    filePath,
    Object.entries(translations)
      .map(entry => entry.join('='))
      .join('\n')
  );

const loadJsonFile = filePath => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const writeJsonFile = (translations, filePath) => fs.writeFileSync(filePath, JSON.stringify(translations));

const toJson = ({ baseLanguage, baseDir, inputFile, outputFile }) => {
  const translations = loadIniFile(getFilePath(baseLanguage, baseDir, inputFile));
  writeJsonFile(translations, getFilePath(baseLanguage, baseDir, outputFile, 'json'));
};

const fromJson = ({ baseLanguage, baseDir, inputFile, outputFile }) => {
  const translations = loadJsonFile(getFilePath(baseLanguage, baseDir, inputFile, 'json'));
  writeIniFile(translations, getFilePath(baseLanguage, baseDir, outputFile));
};

const translate = async ({ baseLanguage, targetLanguage, baseDir, inputFile, outputFile }) => {
  const translations = loadIniFile(getFilePath(baseLanguage, baseDir, inputFile));
  const targetTranslations = Object.fromEntries(
    await Promise.all(
      Object.entries(translations).map(async ([key, value]) => {
        try {
          return [key, (await googleTranslate(value, { from: baseLanguage, to: targetLanguage })).text];
        } catch (error) {
          return [key, 'Translation error'];
        }
      })
    )
  );
  writeIniFile(targetTranslations, getFilePath(targetLanguage, baseDir, outputFile));
};

const extractKeys = async ({ baseLanguage, baseDir, inputFile, outputFile }) => {
  const translations = loadIniFile(getFilePath(baseLanguage, baseDir, inputFile));
  fs.writeFileSync(outputFile || path.join(baseDir, 'keys.txt'), Object.keys(translations).join('\n'));
};

const extractTranslations = async ({ baseLanguage, baseDir, inputFile, outputFile }) => {
  const translations = loadIniFile(getFilePath(baseLanguage, baseDir, inputFile));
  fs.writeFileSync(outputFile || path.join(baseDir, baseLanguage + '.txt'), Object.values(translations).join('\n'));
};

yargs(hideBin(process.argv))
  .command('to-json <base-language>', 'Convert i18n file to JSON file', {}, toJson)
  .command('from-json <base-language>', 'Convert JSON file to i18n file', {}, fromJson)
  .command('translate <base-language> <target-language>', 'Translate i18n file', {}, translate)
  .command('extract-keys <base-language>', 'Extract translation keys to file', {}, extractKeys)
  .command(
    'extract-translations <base-language>',
    'Extract translations (without keys) to file',
    {},
    extractTranslations
  )
  .option('base-dir', { alias: 'b', type: 'path', default: '.' })
  .option('input-file', { alias: 'i', type: 'path' })
  .option('output-file', { alias: 'o', type: 'path' })
  .parse();
