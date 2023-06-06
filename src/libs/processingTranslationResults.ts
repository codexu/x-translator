import { isEmpty, uniq } from "lodash";

export interface TranslateRes {
  code: number;
  dictResult: DictResult;
  translateResult: TranslateResult[][];
  type: string;
}

interface TranslateResult {
  tgt: string;
  src: string;
  tgtPronounce: string;
}

interface DictResult {
  ec: Ec;
}

interface Ec {
  exam_type: string[];
  word: Word;
}

interface Word {
  usphone: string;
  trs: Tr[];
  'return-phrase': string;
  usspeech: string;
  prototype: string;
}

interface Tr {
  pos: string;
  tran: string;
}

export default function (res: string) {
  const data = JSON.parse(res) as TranslateRes;
  const tran = data?.dictResult?.ec?.word?.trs[0]?.tran.split("；").map((item) => {
    return {
      label: item
        .replace(/（[^）]*）/g, "")
        .replace(/<[^>]*>/g, "")
        .trim(),
    };
  });
  if (tran) {
    return tran;
  } else {
    return [data.translateResult[0][0].tgt].map((item) => ({ label: item }));
  }
}
