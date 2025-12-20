import { type CodegenConfig } from '@graphql-codegen/cli';
import 'dotenv/config';

const config: CodegenConfig = {
  schema:
    process.env.NEXT_PUBLIC_GRAPHQL_URI_FOR_CODEGEN ??
    process.env.NEXT_PUBLIC_GRAPHQL_URI,

  documents: ['./graphql/**/*.graphql'],
  config: {
    preResolveTypes: true,
    namingConvention: 'keep',
    avoidOptionals: {
      field: true,
    },
    nonOptionalTypename: true,
    omitOperationSuffix: true,
    skipTypeNameForRoot: true,
  },
  generates: {
    './': {
      preset: 'near-operation-file',
      presetConfig: {
        baseTypesPath: './__generated__/globalTypes.ts',
        extension: '.ts',
        folder: '__generated__',
      },
      plugins: [
        'typescript-operations',
        {
          add: {
            content: [
              '/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */',
              '// @ts-nocheck',
            ],
          },
        },
      ],
    },
    './__generated__/globalTypes.ts': {
      plugins: ['typescript'],
    },
  },
};

export default config;
