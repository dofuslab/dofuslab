/** @jsxImportSource @emotion/react */

import { Select, SelectProps } from 'antd';
import { useQuery } from '@apollo/client';

import { useTranslation } from 'next-i18next';
import { classes } from 'graphql/queries/__generated__/classes';
import classesQuery from 'graphql/queries/classes.graphql';
import { antdSelectFilterOption, getFaceImageUrl } from 'common/utils';
import { BuildGender } from '__generated__/globalTypes';

export default function ClassSelect({
  value,
  onChange,
  className,
  size,
  allowNoClass,
  buildGender = BuildGender.MALE,
  allowClear,
}: {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  size?: SelectProps['size'];
  allowNoClass?: boolean;
  buildGender?: BuildGender;
  allowClear?: boolean;
}) {
  const { data } = useQuery<classes>(classesQuery);
  const { t } = useTranslation('common');
  return data ? (
    <Select<string>
      size={size || 'large'}
      className={className}
      showSearch
      filterOption={antdSelectFilterOption}
      value={value}
      onChange={onChange}
      placeholder={t('SELECT_CLASS')}
      allowClear={allowClear}
      onKeyDown={(e) => {
        // prevents triggering SetBuilderKeyboardShortcuts
        e.nativeEvent.stopPropagation();
      }}
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
}
