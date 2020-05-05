/* eslint-disable react/no-array-index-key */

import React from 'react';
import { CardSkeleton } from 'common/wrappers';
import { Media } from './Media';

interface Props {
  multiplier?: number;
  length?: number;
}

const SkeletonCardsLoader: React.FC<Props> = ({ multiplier, length }) => {
  const mult = multiplier || 1;
  const mod = (length || 0) % 5;
  return (
    <React.Fragment key="frag">
      <Media lessThan="xs">
        {(mediaClassNames) => (
          <>
            {Array(2)
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
            {Array(4 * mult)
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
            {Array(4 * mult)
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
            {Array(6 * mult)
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
            {Array(8 * mult)
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
            {Array(10 * mult - mod)
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
            {Array(12 * mult)
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
