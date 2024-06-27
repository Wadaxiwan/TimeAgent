// import { fetchContent } from '@/app/lib/actions';
// import React, { useEffect, useState } from 'react';

// interface DisplayJSONProps {
//   docID: string;
//   triggerReload: number; // 用于重新加载的触发器
// }

// const DisplayJson: React.FC<DisplayJSONProps> = (props) => {
//   const [jsonData, setJsonData] = useState({});

//   useEffect(() => {
//     async function loadCorrection() {
//       try {
//         const tmpData = await fetchContent(props.docID, 'correction');
//         setJsonData(JSON.parse(tmpData.content));
//       } catch (error) {
//         console.error('Failed to fetch correction:', error);
//       }
//     }

//     loadCorrection();
//   }, [props.triggerReload]); // 在triggerReload变化时重新执行

//   return (
//     <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//       <h1>Correction Advices</h1>
//       <div style={{
//         backgroundColor: '#f5f5f5',
//         border: '1px solid #ddd',
//         borderRadius: '4px',
//         padding: '20px'
//       }}>
//         {Object.keys(jsonData).map((key) => (
//           <div key={key} style={{ marginBottom: '20px' }}>
//             <h2>{key}</h2>
//             <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
//               {jsonData[key].length === 0 ? (
//                 <li style={{ color: '#888' }}>No data</li>
//               ) : (
//                 jsonData[key].map((item, index) => (
//                   <li key={index} style={{
//                     backgroundColor: '#fff',
//                     border: '1px solid #ccc',
//                     borderRadius: '4px',
//                     padding: '10px',
//                     marginBottom: '10px'
//                   }}>
//                     {Array.isArray(item) ? item.join(', ') : item.toString()}
//                   </li>
//                 ))
//               )}
//             </ul>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default DisplayJson;


import { fetchContent } from '@/app/lib/actions';
import React, { useEffect, useState } from 'react';

// 定义键值对映射
const keyMappings = {
  "black_list": "黑名单纠错",
  "pol": "政治术语纠错",
  "char": "字符纠错",
  "word": "词语纠错",
  "rebund":"语法纠错-冗余",
  "miss":"语法纠错-缺失",
  "order":"语法纠错-乱序",
  "dapei":"搭配纠错",
  "punc":"标点纠错",
  "idm":"成语纠错",
  "org":"机构名纠错",
  "leader":"领导人职称纠错",
  "number":"数字纠错",
  "address":"地名纠错",
  "name":"人名纠错",
  "grammar_pc":"句式杂糅&语义重复"
};

// 定义值中各个部分的中文含义
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

const DisplayJson: React.FC<DisplayJSONProps> = (props) => {
  const [jsonData, setJsonData] = useState({});

  useEffect(() => {
    async function loadCorrection() {
      try {
        const tmpData = await fetchContent(props.docID, 'correction');
        setJsonData(JSON.parse(tmpData.content));
      } catch (error) {
        console.error('Failed to fetch correction:', error);
      }
    }

    loadCorrection();
  }, [props.triggerReload]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Correction Advices</h1>
      <div style={{
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '20px'
      }}>
        {Object.keys(jsonData).map((key) => (
          <div key={key} style={{ marginBottom: '20px' }}>
            <h2>{keyMappings[key] || key}</h2> {/* 显示中文含义 */}
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
              {jsonData[key].length === 0 ? (
                <li style={{ color: '#888' }}>No data</li>
              ) : (
                jsonData[key].map((item, index) => (
                  <li key={index} style={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '10px',
                    marginBottom: '10px'
                  }}>
                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                      {Object.keys(item).map((subKey, subIndex) => (
                        <li key={subIndex} style={{
                          backgroundColor: '#f9f9f9',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          padding: '8px',
                          marginBottom: '5px'
                        }}>
                          {valueMappings[subKey] || subKey}: {item[subKey]}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayJson;

