import YouDaoJS from "youdaojs";

const isChinese = require("is-chinese");
const translator = new YouDaoJS();

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
  ce: Ec;
}

interface Ec {
  exam_type: string[];
  word: Word;
}

interface Word {
  usphone: string;
  trs: Tr[];
  "return-phrase": string;
  usspeech: string;
  prototype: string;
}

interface Tr {
  pos: string;
  tran: string;
  "#tran": string;
}

export default async function (res: string) {
  const data = JSON.parse(res) as TranslateRes;
  // 获取选中的文本，判断是否为中文
  const src = data.translateResult[0][0].src;
  const isChineseWord = isChinese(src);
  // 判断是否是中文，如果是中文，则进行二次翻译，获取更多英文翻译结果
  if (isChineseWord) {
    // 获取翻译结果中的中文词语
    const tran = data?.dictResult?.ce?.word?.trs[0]?.['#tran']
      .split("；")
      .map((item) => (
        item
          .replace(/（[^）]*）/g, "")
          .replace(/<[^>]*>/g, "")
          .replace(/，[^，]*$/, "")
          .trim()
      ))
      .filter((item) => {
        return item !== undefined && item !== null && item !== "";
      });
    if (tran) {
      const result = [];
      for (let i = 0; i < tran.length; i++) {
        const translateResult = await translator.getResult(tran[i], 1, 2);
        result.push({
          label: JSON.parse(translateResult).translateResult[0][0].tgt,
          description: tran[i],
        });
      }
      return result;
    }
    return [data.translateResult[0][0].tgt].map((item) => ({
      label: item,
    }));
  } else {
    const tran = data?.dictResult?.ec?.word?.trs[0]?.tran
      .split("；")
      .map((item) => {
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
      return [data.translateResult[0][0].tgt].map((item) => ({
        label: item,
      }));
    }
  }
}
