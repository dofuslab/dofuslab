/** @jsx jsx */

import { jsx } from '@emotion/core';

import React from 'react';
import { Select } from 'antd';
import { useQuery } from '@apollo/client';

import { useTranslation } from 'i18n';
import { classes } from 'graphql/queries/__generated__/classes';
import classesQuery from 'graphql/queries/classes.graphql';
import { getFaceImageUrl } from 'common/utils';
import { BuildGender } from '__generated__/globalTypes';

export const ClassSelect = React.forwardRef<
  Select<string>,
  {
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    size?: Select['props']['size'];
    allowNoClass?: boolean;
    buildGender?: BuildGender;
    allowClear?: boolean;
  }
>(
  (
    {
      value,
      onChange,
      className,
      size,
      allowNoClass,
      buildGender = BuildGender.MALE,
      allowClear,
    },
    ref,
  ) => {
    const { data } = useQuery<classes>(classesQuery);
    const { t } = useTranslation('common');
    return data ? (
      <Select<string>
        getPopupContainer={(node: HTMLElement) => {
          if (node.parentElement) {
            return node.parentElement;
          }
          return document && document.body;
        }}
        size={size || 'middle'}
        className={className}
        showSearch
        filterOption={(input, option) => {
          return (option?.children[1] as string)
            .toLocaleUpperCase()
            .includes(input.toLocaleUpperCase());
        }}
        value={value}
        onChange={onChange}
        placeholder={t('SELECT_CLASS')}
        ref={ref}
        allowClear={allowClear}
      >
        {allowNoClass && (
          <Select.Option key="NO_CLASS" value="">
            <img
              src={getFaceImageUrl(null)}
              alt={t('NO_CLASS')}
              css={{ width: 20, marginRight: 8 }}
            />
            {t('NO_CLASS')}
          </Select.Option>
        )}
        {[...data.classes]
          .sort(({ name: n1 }, { name: n2 }) => n1.localeCompare(n2))
          .map((dofusClass) => (
            <Select.Option key={dofusClass.id} value={dofusClass.id}>
              <img
                src={getFaceImageUrl(dofusClass, buildGender)}
                alt={dofusClass.name}
                css={{ width: 20, marginRight: 8 }}
              />
              {dofusClass.name}
            </Select.Option>
          ))}
      </Select>
    ) : null;
  },
);
