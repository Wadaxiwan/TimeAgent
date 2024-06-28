import { fetchContent } from '@/app/lib/actions';
import React, { useEffect, useState } from 'react';

const keyMappings = {
  "black_list": "黑名单纠错",
  "pol": "政治术语纠错",
  "char": "字符纠错",
  "word": "词语纠错",
  "redund":"语法纠错-冗余",
  "miss":"语法纠错-缺失",
  "order":"语法纠错-乱序",
  "dapei":"搭配纠错",
  "punc":"标点纠错",
  "idm":"成语纠错",
  "org":"机构名纠错",
  "leader":"领导人职称纠错",
  "number":"数字纠错",
  "addr":"地名纠错",
  "name":"人名纠错",
  "grammar_pc":"句式杂糅&语义重复"
};

const valueMappings = {
  "0": "错误位置",
  "1": "错误文本",
  "2": "纠正文本",
  "3": "详细错误类型"
};

interface DisplayJSONProps {
  docID: string;
  triggerReload: number;
}

const DisplayJson: React.FC<DisplayJSONProps> = ({ docID, triggerReload }) => {
  const [jsonData, setJsonData] = useState({});

  useEffect(() => {
    const loadCorrection = async () => {
      try {
        const tmpData = await fetchContent(docID, 'doc_correction');
        setJsonData(JSON.parse(tmpData.content));
      } catch (error) {
        console.error('Failed to fetch correction:', error);
      }
    };

    loadCorrection();
  }, [triggerReload, docID]);

  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-medium">
        Correction Advices
      </label>
      <div className="relative">
        <div className="peer block w-full rounded-md border border-gray-200 p-2 text-sm outline-2 placeholder:text-gray-500 bg-white">
          {Object.keys(jsonData).map((key) => (
            <div key={key} className="p-2">
              <h4 className="font-semibold text-small">{keyMappings[key] || key}</h4>
              <div className="relative p-2 rounded-md text-sm">
                {jsonData[key].length === 0 ? (
                  <div className='bg-gray-50 p-2 rounded-md'>No data</div>
                ) : (
                  jsonData[key].map((item, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded-md">
                      {Object.keys(item).map((subKey) => (
                        <div key={subKey} className="p-1 rounded-md">
                          <strong>{valueMappings[subKey] || subKey}:</strong> {item[subKey]}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisplayJson;
