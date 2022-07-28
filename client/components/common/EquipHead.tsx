import { ItemSlot } from 'common/type-aliases';
import { DEFAULT_LANGUAGE } from 'common/i18n-utils';
import { getCustomSetMetaImage, getTitle } from 'common/utils';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

const getCanonicalUrl = (itemSlotId?: string) => {
  return `https://dofuslab.io/equip/${itemSlotId || 'set'}/`;
};

export default function EquipHead({ itemSlot }: { itemSlot?: ItemSlot }) {
  const router = useRouter();
  const locale = router.locale || router.defaultLocale || DEFAULT_LANGUAGE;

  const { t } = useTranslation(['common', 'meta']);

  const name = itemSlot?.name ?? t('SETS');

  return (
    <>
      <title>{getTitle(name)}</title>
      <meta name="title" content={getTitle(name)} />
      <meta
        name="description"
        lang={locale}
        content={t('EQUIP', { slot: name, ns: 'meta' })}
      />
      <meta property="og:title" content={getTitle(name)} />
      <meta
        property="og:description"
        content={t('EQUIP', { slot: name, ns: 'meta' })}
      />
      <meta property="og:url" content={getCanonicalUrl(itemSlot?.id)} />
      <meta property="og:image" content={getCustomSetMetaImage(null)} />
      <meta property="twitter:title" content={getTitle(name)} />
      <meta
        property="twitter:description"
        content={t('EQUIP', { slot: name, ns: 'meta' })}
      />
      <meta property="twitter:url" content={getCanonicalUrl(itemSlot?.id)} />
      <meta property="twitter:image" content={getCustomSetMetaImage(null)} />
    </>
  );
}
