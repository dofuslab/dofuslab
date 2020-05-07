/* eslint-disable react/no-array-index-key */

import React from 'react';
import { CardSkeleton } from 'common/wrappers';
import { getSelectorNumCols } from 'common/constants';
import { Media } from './Media';

interface Props {
  multiplier?: number;
  length?: number;
  isClassic: boolean;
}

const getNumLoaders = (
  numCols: number,
  length: number | undefined,
  mult: number,
) => numCols * 2 * mult - ((length || 0) % numCols);

const SkeletonCardsLoader: React.FC<Props> = ({
  multiplier,
  length,
  isClassic,
}) => {
  const numCols = getSelectorNumCols(isClassic);
  const mult = multiplier || 1;
  return (
    <React.Fragment key="frag">
      <Media lessThan="xs">
        {(mediaClassNames) => (
          <>
            {Array(getNumLoaders(numCols[0], length, mult))
              .fill(null)
              .map((_, idx) => (
                <CardSkeleton
                  key={`card-skeleton-${idx}`}
                  className={mediaClassNames}
                />
              ))}
          </>
        )}
      </Media>
      <Media at="xs">
        {(mediaClassNames) => (
          <>
            {Array(getNumLoaders(numCols[1], length, mult))
              .fill(null)
              .map((_, idx) => (
                <CardSkeleton
                  key={`card-skeleton-${idx}`}
                  className={mediaClassNames}
                />
              ))}
          </>
        )}
      </Media>
      <Media at="sm">
        {(mediaClassNames) => (
          <>
            {Array(getNumLoaders(numCols[2], length, mult))
              .fill(null)
              .map((_, idx) => (
                <CardSkeleton
                  key={`card-skeleton-${idx}`}
                  className={mediaClassNames}
                />
              ))}
          </>
        )}
      </Media>
      <Media at="md">
        {(mediaClassNames) => (
          <>
            {Array(getNumLoaders(numCols[3], length, mult))
              .fill(null)
              .map((_, idx) => (
                <CardSkeleton
                  key={`card-skeleton-${idx}`}
                  className={mediaClassNames}
                />
              ))}
          </>
        )}
      </Media>
      <Media at="lg">
        {(mediaClassNames) => (
          <>
            {Array(getNumLoaders(numCols[4], length, mult))
              .fill(null)
              .map((_, idx) => (
                <CardSkeleton
                  key={`card-skeleton-${idx}`}
                  className={mediaClassNames}
                />
              ))}
          </>
        )}
      </Media>
      <Media at="xl">
        {(mediaClassNames) => (
          <>
            {Array(getNumLoaders(numCols[5], length, mult))
              .fill(null)
              .map((_, idx) => (
                <CardSkeleton
                  key={`card-skeleton-${idx}`}
                  className={mediaClassNames}
                />
              ))}
          </>
        )}
      </Media>
      <Media greaterThanOrEqual="xxl">
        {(mediaClassNames) => (
          <>
            {Array(getNumLoaders(numCols[6], length, mult))
              .fill(null)
              .map((_, idx) => (
                <CardSkeleton
                  key={`card-skeleton-${idx}`}
                  className={mediaClassNames}
                />
              ))}
          </>
        )}
      </Media>
    </React.Fragment>
  );
};

export default SkeletonCardsLoader;
