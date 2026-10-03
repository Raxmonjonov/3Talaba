/**
 * Lug'at tiplari.
 *
 * `Widen` — `as const` obyekti oddiy (kengaytirilgan) string tiplariga aylantiradi,
 * shunda boshqa til lug'ati bir xil tuzilmani majburlaydi.
 */
export type Widen<T> = {
  [K in keyof T]: T[K] extends string ? string : Widen<T[K]>;
};

/** Lug'at ichidagi barcha kalit yollari ("nav.dashboard" ko'rinishida). */
export type Path<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string
        ? K
        : `${K}.${Path<T[K]>}`;
    }[keyof T & string];

export type DictPath<T> = Path<T> & string;