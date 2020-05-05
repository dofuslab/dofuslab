/* eslint-disable */
const fs = require('fs');
const chalk = require('chalk');
const typescript = require('typescript');
const path = require('path');

// https://github.com/i18next/i18next-scanner/issues/142#issuecomment-610640269
const DEFAULT_NS = 'ALL_NAMESPACES_DO_NOT_USE';

module.exports = {
  input: [
    './**/*.{ts,tsx}',
    // Use ! to filter out files or directories
    '!**/node_modules/**',
  ],
  output: './',
  options: {
    debug: true,
    func: {
      list: ['i18next.t', 'i18n.t', 't'],
      extensions: ['.ts', '.tsx'],
    },
    trans: {
      component: 'Trans',
    },
    lngs: ['en', 'es', 'de', 'fr', 'it', 'pt'],
    ns: ['auth', 'common', 'mage', 'stat', 'status', 'weapon_spell_effect'],
    defaultLng: 'en',
    defaultNs: DEFAULT_NS,
    defaultValue: '__STRING_NOT_TRANSLATED__',
    resource: {
      loadPath: 'public/static/locales/{{lng}}/{{ns}}.json',
      savePath: 'public/static/locales/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
      lineEnding: '\n',
    },
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
  transform: function customTransform(file, enc, done) {
    const { parser } = this;
    const { base, ext } = path.parse(file.path);

    if (['.ts', '.tsx'].includes(ext) && !base.includes('.d.ts')) {
      const content = fs.readFileSync(file.path, enc);
      let ns;
      const match = content.match(/useTranslation\(.+\)/);
      if (match) {
        const [firstMatch] = match;
        // eslint-disable-next-line
        ns = firstMatch.split(/('|")/)[2];
      }
      let count = 0;

      const { outputText } = typescript.transpileModule(content, {
        compilerOptions: {
          target: 'es2018',
        },
        fileName: path.basename(file.path),
      });

      parser.parseFuncFromString(outputText, { list: ['t'] }, (key, options) => {
        parser.set(key, {
          ns: ns || DEFAULT_NS,
          nsSeparator: false,
          keySeparator: '.',
          ...options,
        });
        count += 1;
      });
      parser.parseTransFromString(
        outputText,
        { component: 'Trans', i18nKey: 'i18nKey' },
        (key, options) => {
          parser.set(key.split(':')[1], {
            ...options,
            ns: key.split(':')[0],
            nsSeparator: false,
            keySeparator: '.',
          });
          count += 1;
        },
      );
      if (count > 0) {
        // eslint-disable-next-line
        console.log(
          `i18next-scanner: count=${chalk.cyan(count)}, file=${chalk.yellow(
            JSON.stringify(file.relative),
          )}`,
        );
      }
    }

    done();
  },
};
