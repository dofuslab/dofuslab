/** @jsxImportSource @emotion/react */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { useTheme } from '@emotion/react';
import { Alert, Button, Empty, Tooltip } from 'antd';
import { ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as gtag from 'gtag';

import {
  BuildDiscoveryBuild,
  BuildDiscoveryElement,
  BuildDiscoveryImportContext,
  BuildDiscoveryQueryInput,
  BuildDiscoveryResponse,
  DEFAULT_BUILD_DISCOVERY_INPUT,
  buildDiscoveryResultKey,
  generatedBuildName,
  useBuildDiscoveryMutation,
} from 'common/buildDiscovery';
import { mq } from 'common/constants';
import { checkAuthentication, navigateToNewCustomSet } from 'common/utils';
import ClassesQuery from 'graphql/queries/classes.graphql';
import { classes } from 'graphql/queries/__generated__/classes';
import ImportGeneratedCustomSetMutation from 'graphql/mutations/importGeneratedCustomSet.graphql';
import {
  importGeneratedCustomSet,
  importGeneratedCustomSetVariables,
} from 'graphql/mutations/__generated__/importGeneratedCustomSet';

import BuildComparison, {
  IndexedBuild,
} from './build-discovery/BuildComparison';
import BuildDiscoveryForm from './build-discovery/BuildDiscoveryForm';
import BuildDiscoveryResultCard from './build-discovery/BuildDiscoveryResultCard';
import {
  LoadingExperience,
  QuerySummary,
} from './build-discovery/presentation';

function minimumApForLevel(level: number) {
  if (level >= 200) {
    return 10;
  }
  if (level >= 100) {
    return 7;
  }
  return 6;
}

export default function BuildDiscoveryPage() {
  const theme = useTheme();
  const router = useRouter();
  const client = useApolloClient();
  const { t } = useTranslation('common');
  const { data: classData } = useQuery<classes>(ClassesQuery);
  const [input, setInput] = useState<BuildDiscoveryQueryInput>({
    ...DEFAULT_BUILD_DISCOVERY_INPUT,
  });
  const [submittedInput, setSubmittedInput] =
    useState<BuildDiscoveryQueryInput | null>(null);
  const [displayedResult, setDisplayedResult] = useState<{
    input: BuildDiscoveryQueryInput;
    response: BuildDiscoveryResponse;
  } | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [promotionError, setPromotionError] = useState<string | null>(null);
  const [savedBuildCount, setSavedBuildCount] = useState(0);
  const latestRunId = useRef(0);

  const classOptions = useMemo(
    () =>
      [...(classData?.classes ?? [])]
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((dofusClass) => ({
          label: dofusClass.name,
          value: dofusClass.enName,
        })),
    [classData?.classes],
  );
  const targetLevel = input.level ?? 200;
  const minimumAp = minimumApForLevel(targetLevel);
  const minimumMp = targetLevel >= 200 ? 5 : 3;
  const queryInput = submittedInput ?? input;
  const { error, loading, buildDiscovery } = useBuildDiscoveryMutation();
  const response = displayedResult?.response;
  const builds = response?.builds ?? [];
  const isGenerating = loading;
  const [importBuildMutation, { loading: isSaving }] = useMutation<
    importGeneratedCustomSet,
    importGeneratedCustomSetVariables
  >(ImportGeneratedCustomSetMutation, {
    refetchQueries: () => ['buildList'],
  });

  const run = useCallback(
    async (nextInput: BuildDiscoveryQueryInput) => {
      const runId = latestRunId.current + 1;
      latestRunId.current = runId;
      setSubmittedInput({ ...nextInput });
      setDisplayedResult(null);
      setPromotionError(null);
      setSavedBuildCount(0);
      setElapsedSeconds(0);
      try {
        const nextResponse = await buildDiscovery(nextInput);
        if (latestRunId.current !== runId) {
          return;
        }
        setDisplayedResult({
          input: { ...nextInput },
          response: nextResponse,
        });
      } catch {
        if (latestRunId.current === runId) {
          setDisplayedResult(null);
        }
      }
    },
    [buildDiscovery],
  );

  useEffect(() => {
    if (!isGenerating) {
      return undefined;
    }
    const startedAt = Date.now();
    const interval = window.setInterval(
      () => setElapsedSeconds((Date.now() - startedAt) / 1000),
      250,
    );
    return () => window.clearInterval(interval);
  }, [isGenerating, submittedInput]);

  useEffect(() => {
    setSelectedKeys(builds.map(buildDiscoveryResultKey));
  }, [response?.cacheKey, builds.length]);

  const selectedBuilds = useMemo<IndexedBuild[]>(
    () =>
      builds
        .map((build, index) => ({ build, index }))
        .filter(({ build }) =>
          selectedKeys.includes(buildDiscoveryResultKey(build)),
        ),
    [builds, selectedKeys],
  );

  const saveBuilds = useCallback(
    async (
      entries: Array<{ build: BuildDiscoveryBuild; index: number }>,
      openAfterSave: boolean,
    ) => {
      setPromotionError(null);
      setSavedBuildCount(0);
      const ok = await checkAuthentication(client, t);
      if (!ok) {
        return;
      }
      const importContext: BuildDiscoveryImportContext = {
        query: response?.query,
        input: displayedResult?.input ?? queryInput,
      };
      const created: Array<{ id: string }> = [];
      try {
        // Preserve promotion order and stop on the first failure before navigation.
        // eslint-disable-next-line no-restricted-syntax
        for (const { build } of entries) {
          // eslint-disable-next-line no-await-in-loop
          const { data } = await importBuildMutation({
            variables: {
              promotionToken: build.promotionToken,
              name: generatedBuildName(build, importContext),
            },
          });
          const customSet = data?.importGeneratedCustomSet?.customSet;
          if (!customSet) {
            throw new Error('Could not create build.');
          }
          created.push({ id: customSet.id });
        }
        setSavedBuildCount(created.length);
        gtag.event({
          action: 'build_discovery_save_success',
          category: 'Build Discovery',
          label: submittedInput?.element,
          value: created.length,
        });
        if (openAfterSave && created[0]) {
          navigateToNewCustomSet(router, created[0].id);
        }
      } catch (caughtError) {
        setPromotionError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not save generated builds.',
        );
      }
    },
    [
      client,
      displayedResult?.input,
      importBuildMutation,
      queryInput,
      response?.query,
      router,
      submittedInput?.element,
      t,
    ],
  );

  const duration = response?.diagnostics.elapsedMs ?? undefined;
  const displayedElement = (displayedResult?.input.element ??
    DEFAULT_BUILD_DISCOVERY_INPUT.element) as BuildDiscoveryElement;

  return (
    <main
      css={{
        width: '100%',
        maxWidth: 1380,
        margin: '0 auto',
        padding: '12px 14px 40px',
        display: 'grid',
        gap: 18,
        [mq[1]]: { padding: '18px 24px 48px' },
      }}
    >
      <header
        css={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 css={{ margin: 0, fontSize: '1.35rem', fontWeight: 600 }}>
            {t('BUILD_DISCOVERY')}
          </h1>
          <div css={{ color: theme.text?.light, marginTop: 4 }}>
            {t('BUILD_DISCOVERY_SUBTITLE', {
              defaultValue:
                'Generate complete equipment options for your character.',
            })}
          </div>
        </div>
        {submittedInput && (
          <Tooltip title="Run these requirements again">
            <Button
              aria-label="Generate these builds again"
              icon={<ReloadOutlined />}
              loading={isGenerating}
              onClick={() => run(submittedInput)}
            />
          </Tooltip>
        )}
      </header>

      <section
        css={{
          borderTop: `1px solid ${theme.border?.default}`,
          borderBottom: `1px solid ${theme.border?.default}`,
          padding: '16px 0',
          display: 'grid',
          gap: 14,
        }}
      >
        <div>
          <h2 css={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
            Build requirements
          </h2>
          <div
            css={{ color: theme.text?.light, fontSize: '0.7rem', marginTop: 3 }}
          >
            PvM · minimum AP and MP targets
          </div>
        </div>
        <BuildDiscoveryForm
          classOptions={classOptions}
          classesLoading={!classData}
          generating={isGenerating}
          input={input}
          minimumAp={minimumAp}
          minimumMp={minimumMp}
          onChange={(changes) =>
            setInput((current) => ({ ...current, ...changes }))
          }
          onSubmit={() => {
            gtag.event({
              action: 'build_discovery_run',
              category: 'Build Discovery',
              label: `${input.className}:${input.element}`,
              value: input.limit ?? undefined,
            });
            run(input);
          }}
          submitLabel={t('BUILD_DISCOVERY_COOK_CTA', {
            defaultValue: 'Let DofusLab cook',
          })}
        />
      </section>

      {error && <Alert type="error" message={error.message} showIcon />}
      {promotionError && (
        <Alert type="error" message={promotionError} showIcon closable />
      )}
      {savedBuildCount > 0 && (
        <Alert
          type="success"
          showIcon
          message={`${savedBuildCount} generated ${
            savedBuildCount === 1 ? 'build' : 'builds'
          } saved to My Builds.`}
          action={
            <Link href="/my-builds">
              <Button size="small">View builds</Button>
            </Link>
          }
        />
      )}
      {response?.warnings.map((warning) => (
        <Alert key={warning} type="warning" message={warning} showIcon />
      ))}

      {isGenerating && (
        <>
          {submittedInput && <QuerySummary input={submittedInput} />}
          <LoadingExperience elapsedSeconds={elapsedSeconds} />
        </>
      )}

      {!isGenerating && response && builds.length > 0 && (
        <section css={{ display: 'grid', gap: 16 }}>
          <div
            css={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h2 css={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                {t('BUILD_DISCOVERY_RESULT_COUNT', {
                  count: builds.length,
                  defaultValue_one: '{{count}} generated build',
                  defaultValue_other: '{{count}} generated builds',
                })}
              </h2>
              <div css={{ marginTop: 7 }}>
                <QuerySummary input={displayedResult?.input ?? queryInput} />
              </div>
              {typeof duration === 'number' && (
                <div
                  css={{
                    color: theme.text?.light,
                    fontSize: '0.7rem',
                    marginTop: 7,
                  }}
                >
                  Generated in {(duration / 1000).toFixed(1)}s
                </div>
              )}
            </div>
            <div css={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button
                onClick={() =>
                  setSelectedKeys(
                    selectedKeys.length === builds.length
                      ? []
                      : builds.map(buildDiscoveryResultKey),
                  )
                }
              >
                {selectedKeys.length === builds.length ? 'Clear' : 'Select all'}
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                disabled={selectedBuilds.length === 0}
                loading={isSaving}
                onClick={() => saveBuilds(selectedBuilds, false)}
              >
                Save selected ({selectedBuilds.length})
              </Button>
            </div>
          </div>

          <div
            css={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 12,
              [mq[1]]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
              [mq[3]]: {
                gridTemplateColumns: `repeat(${Math.min(
                  builds.length,
                  3,
                )}, minmax(0, 1fr))`,
              },
            }}
          >
            {builds.map((build, index) => {
              const key = buildDiscoveryResultKey(build);
              return (
                <BuildDiscoveryResultCard
                  key={key}
                  build={build}
                  index={index}
                  element={displayedElement}
                  selected={selectedKeys.includes(key)}
                  saving={isSaving}
                  onSelect={(selected) =>
                    setSelectedKeys((current) =>
                      selected
                        ? [...current, key]
                        : current.filter((value) => value !== key),
                    )
                  }
                  onOpen={() => saveBuilds([{ build, index }], true)}
                />
              );
            })}
          </div>

          <section
            css={{
              borderTop: `1px solid ${theme.border?.default}`,
              paddingTop: 16,
              display: 'grid',
              gap: 12,
            }}
          >
            <div>
              <h2 css={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                Compare selected
              </h2>
              <div
                css={{
                  color: theme.text?.light,
                  fontSize: '0.7rem',
                  marginTop: 3,
                }}
              >
                Scroll the tables horizontally on smaller screens.
              </div>
            </div>
            <BuildComparison builds={selectedBuilds} />
          </section>
        </section>
      )}

      {!isGenerating && submittedInput && response && builds.length === 0 && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No build met these requirements"
        >
          <Button onClick={() => setSubmittedInput(null)}>
            Adjust requirements
          </Button>
        </Empty>
      )}
    </main>
  );
}
